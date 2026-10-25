/**
 * Task 8 (foliage): Messenger's tree canopies (`tree-leaves_<n>` batches, built by the
 * legacy `grass` class) are replaced by instanced Athena canopies at the same places.
 *
 * Every leaf vertex carries `centr_tree`, its plant's centre, so each canopy is recovered
 * exactly. Small clumps (potted plants, vines) become `athena-bush`, crowns become the
 * round tree's canopy, tall narrow crowns the spire's. Each instance is centred on the
 * legacy canopy, scaled to its size and stood on the local planet normal, so density and
 * silhouette rhythm match. Trunks belong to the merged terrain batches and stay (see
 * docs/MIGRATION.md); one InstancedMesh per kind keeps this to a few draw calls.
 */
import { MeshoptSimplifier } from "meshoptimizer/simplifier";
import type { LegacyContext } from "../runtime/legacy-context";
import type { AthenaInstallContext } from "./install";
import { athenaUrl } from "./models";

type Object3D = LegacyContext;

export interface Canopy {
  readonly centre: readonly [number, number, number];
  /** Axis-aligned size of the legacy canopy (legacy units). */
  readonly size: readonly [number, number, number];
  /** Extent along the planet normal. */
  readonly height: number;
}
export type FoliageKind = "bush" | "round" | "spire";
/** Triangle budget per instance: 214 canopies × hull × shadow pass must stay cheap. */
export const foliageTriangles: Record<FoliageKind, number> = { bush: 200, round: 360, spire: 360 };
/** Canopies farther than this from the player are not drawn (legacy VISIBILITY_THRESHOLD). */
export const FOLIAGE_DISTANCE = 35;
export const foliageSources: Record<FoliageKind, string> = {
  bush: "models/nature/athena-bush.glb",
  round: "models/nature/athena-tree-round.glb",
  spire: "models/nature/athena-tree-spire.glb",
};

/** Bush for clumps under 0.9 units, spire for crowns 1.4× taller than wide, else round. */
export function foliageKind(canopy: Canopy): FoliageKind {
  const width = Math.max(canopy.size[0], canopy.size[1], canopy.size[2]);
  const across = Math.min(...canopy.size);
  if (width < 0.9) return "bush";
  return canopy.height > 1.4 * across && canopy.height > 2 ? "spire" : "round";
}

interface Attribute {
  readonly count: number;
  getX(i: number): number;
  getY(i: number): number;
  getZ(i: number): number;
}

/** Group leaf vertices by `centr_tree` into canopies. */
export function canopiesOf(
  geometries: readonly { attributes: { position: Attribute; centr_tree?: Attribute } }[],
): Canopy[] {
  const trees = new Map<string, { min: number[]; max: number[]; rmin: number; rmax: number }>();
  for (const geometry of geometries) {
    const position = geometry.attributes.position;
    const centre = geometry.attributes.centr_tree;
    if (!centre) continue;
    for (let i = 0; i < position.count; i++) {
      const key = `${centre.getX(i).toFixed(2)},${centre.getY(i).toFixed(2)},${centre.getZ(i).toFixed(2)}`;
      let tree = trees.get(key);
      if (!tree)
        trees.set(
          key,
          (tree = { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9], rmin: 1e9, rmax: -1e9 }),
        );
      const v = [position.getX(i), position.getY(i), position.getZ(i)];
      for (let a = 0; a < 3; a++) {
        tree.min[a] = Math.min(tree.min[a]!, v[a]!);
        tree.max[a] = Math.max(tree.max[a]!, v[a]!);
      }
      const r = Math.hypot(v[0]!, v[1]!, v[2]!);
      tree.rmin = Math.min(tree.rmin, r);
      tree.rmax = Math.max(tree.rmax, r);
    }
  }
  return [...trees.values()].map((tree) => ({
    centre: tree.min.map((v, a) => (v + tree.max[a]!) / 2) as unknown as Canopy["centre"],
    size: tree.min.map((v, a) => tree.max[a]! - v) as unknown as Canopy["size"],
    height: tree.rmax - tree.rmin,
  }));
}

/** Leaf-only, vertex-coloured geometry of a kit plant (bark/trunk dropped). */
async function canopyGeometry(ctx: AthenaInstallContext, source: string, triangles: number) {
  const { scope } = ctx;
  const url = athenaUrl(ctx, source);
  if (!url) throw new Error(`not built: ${source}`);
  const { scene } = await ctx.gltf.loadSceneFromGlb(url);
  scene.updateMatrixWorld(true);
  const parts: Object3D[] = [];
  scene.traverse((object: Object3D) => {
    if (!object.isMesh || /^(bark|trunk|stem)/.test(object.material?.name ?? "")) return;
    const geometry = new scope.BufferGeometry();
    const position = object.geometry.attributes.position;
    const count = position.count;
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++)
      array.set([position.getX(i), position.getY(i), position.getZ(i)], i * 3);
    geometry.setAttribute("position", new scope.BufferAttribute(array, 3));
    const color = object.material.color;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) colors.set([color.r, color.g, color.b], i * 3);
    geometry.setAttribute("color", new scope.BufferAttribute(colors, 3));
    const index = object.geometry.index;
    if (index) geometry.setIndex(Array.from({ length: index.count }, (_, i) => index.getX(i)));
    geometry.applyMatrix4(object.matrixWorld);
    parts.push(geometry);
  });
  const indexed = parts.map((part) => (part.index ? part : indexAll(scope, part)));
  const merged = scope.mergeGeometries(indexed, false);
  if (!merged) throw new Error(`no canopy in ${source}`);
  await MeshoptSimplifier.ready;
  const [simplified] = MeshoptSimplifier.simplify(
    Uint32Array.from(merged.index.array as ArrayLike<number>),
    merged.attributes.position.array as Float32Array,
    3,
    Math.min(merged.index.count, triangles * 3),
    0.08,
    ["Prune"],
  );
  merged.setIndex(new scope.BufferAttribute(simplified, 1));
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  return merged;
}

function indexAll(scope: LegacyContext, geometry: Object3D) {
  geometry.setIndex(
    new scope.BufferAttribute(
      Uint32Array.from({ length: geometry.attributes.position.count }, (_, i) => i),
      1,
    ),
  );
  return geometry;
}

export function installAthenaFoliage(ctx: AthenaInstallContext) {
  if (!ctx.enabled) return;
  const { scope } = ctx;
  const init = scope.grass.prototype.init;
  scope.grass.prototype.init = async function (this: LegacyContext) {
    await init.call(this);
    try {
      await replaceCanopies(ctx, this);
    } catch (error) {
      console.error("[Athena] foliage swap failed; legacy leaves kept", error);
    }
  };
  ctx.onDispose(() => {
    scope.grass.prototype.init = init;
  });
}

async function replaceCanopies(ctx: AthenaInstallContext, grass: LegacyContext) {
  const { scope } = ctx;
  const low = scope.client$1?.lowMemoryDevice ? "low/" : "";
  // Cached by the loader: the same geometries the legacy BatchedMesh was built from.
  const geometries = (
    await Promise.all(
      Array.from({ length: 5 }, (_, n) =>
        scope.geometryLoader.batched(`planets/present/${low}tree-leaves_${n}.drc`),
      ),
    )
  ).flat();
  const canopies = canopiesOf(geometries);
  const byKind = new Map<FoliageKind, Canopy[]>();
  for (const canopy of canopies) {
    const kind = foliageKind(canopy);
    byKind.set(kind, [...(byKind.get(kind) ?? []), canopy]);
  }
  const group = new scope.Group();
  group.name = "athena-foliage";
  const matrix = new scope.Matrix4();
  const up = new scope.Vector3();
  const side = new scope.Vector3();
  const forward = new scope.Vector3();
  const quaternion = new scope.Quaternion();
  const turn = new scope.Quaternion();
  const scale = new scope.Vector3();
  const offset = new scope.Vector3();
  for (const [kind, list] of byKind) {
    const geometry = await canopyGeometry(ctx, foliageSources[kind], foliageTriangles[kind]);
    const box = geometry.boundingBox;
    const kitSize = box.getSize(new scope.Vector3());
    const kitCentre = box.getCenter(new scope.Vector3());
    const mesh = new scope.InstancedMesh(
      geometry,
      new scope.MeshStandardMaterial({ vertexColors: true, name: `athena_foliage_${kind}` }),
      list.length,
    );
    mesh.name = `athena-foliage-${kind}`;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const matrices: LegacyContext[] = [];
    list.forEach((canopy, index) => {
      up.fromArray(canopy.centre).normalize();
      side.set(0, 1, 0).cross(up);
      if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
      side.normalize();
      forward.crossVectors(side, up).normalize();
      quaternion.setFromRotationMatrix(matrix.makeBasis(side, up, forward));
      // Deterministic yaw so neighbouring plants do not look stamped.
      turn.setFromAxisAngle(new scope.Vector3(0, 1, 0), (index * 2.399) % (Math.PI * 2));
      quaternion.multiply(turn);
      const width = Math.max(canopy.size[0], canopy.size[1], canopy.size[2]);
      const s = Math.max(
        Math.min(width / Math.max(kitSize.x, kitSize.z), canopy.height / kitSize.y) || 1,
        0.05,
      );
      scale.setScalar(s);
      // Kit canopy centre → legacy canopy centre.
      offset.copy(kitCentre).multiplyScalar(s).applyQuaternion(quaternion);
      matrix.compose(new scope.Vector3().fromArray(canopy.centre).sub(offset), quaternion, scale);
      matrices.push(matrix.clone());
    });
    mesh.userData.canopies = list;
    mesh.userData.matrices = matrices;
    group.add(mesh);
  }
  ctx.toon.apply(group);
  grass.scene.add(group);
  // Only canopies near the player are drawn: visible instances are packed at the front.
  const player = () => grass.scene.characters?.mesh?._localObject?.position;
  const centre = new scope.Vector3();
  let last = -Infinity;
  const cull = () => {
    const now = performance.now();
    if (now - last < 250) return;
    last = now;
    const at = player();
    if (!at) return;
    group.traverse((mesh: Object3D) => {
      if (!mesh.isInstancedMesh || !mesh.userData.canopies) return;
      let count = 0;
      mesh.userData.canopies.forEach((canopy: Canopy, index: number) => {
        if (centre.fromArray(canopy.centre).distanceTo(at) > FOLIAGE_DISTANCE) return;
        mesh.setMatrixAt(count++, mesh.userData.matrices[index]);
      });
      mesh.count = count;
      mesh.instanceMatrix.needsUpdate = true;
      for (const hull of mesh.children) if (hull.isInstancedMesh) hull.count = count;
    });
  };
  grass.scene.beforeRenderCbs.push(cull);
  // Hidden from every camera, shadows included; its update loop keeps running harmlessly.
  grass.mesh.layers.disableAll();
  console.info(`[Athena] foliage: ${canopies.length} canopies as ${byKind.size} instanced kinds`);
  ctx.onDispose(() => {
    const index = grass.scene.beforeRenderCbs?.indexOf(cull) ?? -1;
    if (index >= 0) grass.scene.beforeRenderCbs.splice(index, 1);
    group.removeFromParent();
  });
}
