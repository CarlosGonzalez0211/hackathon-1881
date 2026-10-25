/**
 * Task 9: the teacher's class orbit in Athena art.
 *
 * One planet GLB per kind (default `earth`; a class may pick another) is merged and drawn
 * as InstancedMeshes, one per remaining mesh (land / ocean), so eight students cost a few
 * draw calls. The teacher sun sits at the centre and lights the planets; students ride
 * shared rings (config/orbit.ts) sized for the class, and grow with demonstrated topics
 * only. Orbit paths are one merged ribbon (one loop per ring); stars are one Points draw.
 * Target: ≤ 10 draw calls, ≤ 100k triangles.
 */
import type { PlanetState } from "@athena/shared";
import { crowdScale, orbitLayout, orbitSlot, planetScale } from "../config/orbit";
import type { PlanetKind } from "../config/orbit";
import type { LegacyContext } from "../runtime/legacy-context";
import type { AthenaInstallContext } from "./install";
import { loadAthenaModel, prefersReducedMotion } from "./models";

type Object3D = LegacyContext;

export const SUN_SLOT = "slot:orbit/star";
export const planetSlot = (kind: PlanetKind) => `slot:planet/${kind}`;
const STARFIELD = "models/space/athena-space-starfield.glb";
/** Kit sun: base-centre pivot, body centred ~1.02 m above it. */
const SUN_CENTRE = 1.02;
/** Orbit ribbon width (kit metres) and segments per ring. */
const PATH_WIDTH = 0.025;
const PATH_SEGMENTS = 160;

/** Topics a student has demonstrated: houses whose status is `done`. */
export const demonstratedTopics = (state: PlanetState) =>
  state.houses.filter((house) => house.status === "done").length;

/** Merge opaque meshes into one unlit MeshBasicMaterial with colour + emission baked in. */
export function bakeUnlit(scope: LegacyContext, root: Object3D) {
  root.updateMatrixWorld(true);
  const toRoot = root.matrixWorld.clone().invert();
  const opaque: Object3D[] = [];
  root.traverse((object: Object3D) => {
    if (!object.isMesh) return;
    if (!object.material?.transparent) opaque.push(object);
    else {
      // Halo: unlit, its emission as colour.
      const { color, emissive, opacity, side } = object.material;
      object.material = new scope.MeshBasicMaterial({
        color: (emissive?.getHex?.() ?? 0) > 0 ? emissive : color,
        transparent: true,
        opacity,
        side,
        depthWrite: false,
      });
    }
  });
  if (opaque.length < 1) return;
  const parts = opaque.map((mesh) => {
    const source = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
    const geometry = new scope.BufferGeometry();
    const position = source.attributes.position;
    const array = new Float32Array(position.count * 3);
    for (let i = 0; i < position.count; i++)
      array.set([position.getX(i), position.getY(i), position.getZ(i)], i * 3);
    geometry.setAttribute("position", new scope.BufferAttribute(array, 3));
    const { color, emissive, emissiveIntensity = 1 } = mesh.material;
    const rgb = [0, 1, 2].map((k) =>
      Math.min(
        1,
        ([color?.r, color?.g, color?.b][k] ?? 1) +
          ([emissive?.r, emissive?.g, emissive?.b][k] ?? 0) * emissiveIntensity,
      ),
    );
    const colors = new Float32Array(position.count * 3);
    for (let i = 0; i < position.count; i++) colors.set(rgb, i * 3);
    geometry.setAttribute("color", new scope.BufferAttribute(colors, 3));
    geometry.applyMatrix4(new scope.Matrix4().multiplyMatrices(toRoot, mesh.matrixWorld));
    return geometry;
  });
  const merged = scope.mergeGeometries(parts, false);
  if (!merged) return;
  const mesh = new scope.Mesh(merged, new scope.MeshBasicMaterial({ vertexColors: true }));
  mesh.name = "athena_unlit";
  for (const item of opaque) item.removeFromParent();
  root.add(mesh);
}

export interface AthenaOrbitOptions {
  /** Planet look for the class, or per student. Default `earth`. */
  readonly planetKind?: PlanetKind | ((state: PlanetState, index: number) => PlanetKind);
}

export interface AthenaOrbit {
  readonly root: Object3D;
  /** Planet centre of every student, after the latest `tick`. */
  readonly positions: Map<string, Object3D>;
  /** Planet radius (world units) of every student, after the latest `tick`. */
  readonly radii: Map<string, number>;
  /** Advance orbits/spin (seconds). Static with reduced motion. */
  tick(time: number): void;
  update(states: PlanetState[]): void;
  /** Student id under a raycaster, if any. */
  pick(raycaster: LegacyContext): string | undefined;
  dispose(): void;
}

interface Batch {
  readonly kind: PlanetKind;
  readonly meshes: Object3D[];
  /** Mesh-local matrix inside the planet model (applied per instance). */
  readonly locals: LegacyContext[];
  /** Student ids in instance order. */
  readonly students: string[];
  /** Model radius at scale 1 (half the largest bounding-box side). */
  readonly radius: number;
}

export async function buildAthenaOrbit(
  ctx: AthenaInstallContext,
  initial: PlanetState[],
  options: AthenaOrbitOptions = {},
): Promise<AthenaOrbit> {
  const { scope } = ctx;
  const root = new scope.Group();
  root.name = "athena-orbit";
  const kindOf = (state: PlanetState, index: number): PlanetKind =>
    typeof options.planetKind === "function"
      ? options.planetKind(state, index)
      : (options.planetKind ?? orbitLayout.defaultKind);
  let states = initial;
  // The roster fixes the sky: ring layout and crowding follow the class size.
  const count = states.length;
  const slots = new Map(states.map((state, index) => [state.studentId, orbitSlot(index, count)]));
  const crowd = crowdScale(count);

  // Teacher sun + its light. The sun glows: its opaque parts become one unlit
  // vertex-coloured mesh (colour + emission), no hull; the transparent halo stays.
  const sun = await loadAthenaModel(ctx, SUN_SLOT, { toon: false, merge: false });
  bakeUnlit(scope, sun.root);
  sun.root.position.y = orbitLayout.sunHeight - SUN_CENTRE;
  root.add(sun.root);
  const light = new scope.PointLight("#ffffff", 3, 0, 0);
  light.position.set(0, orbitLayout.sunHeight, 0);
  root.add(light, new scope.AmbientLight(orbitLayout.background, 1.6));

  // Planets: one InstancedMesh per (kind, merged mesh).
  const batches: Batch[] = [];
  const kinds = new Map<PlanetKind, string[]>();
  states.forEach((state, index) => {
    const kind = kindOf(state, index);
    kinds.set(kind, [...(kinds.get(kind) ?? []), state.studentId]);
  });
  for (const [kind, students] of kinds) {
    const model = await loadAthenaModel(ctx, planetSlot(kind), { toon: false });
    model.root.updateMatrixWorld(true);
    const size = new scope.Box3().setFromObject(model.root).getSize(new scope.Vector3());
    const radius = Math.max(size.x, size.y, size.z) / 2 || 1;
    const meshes: Object3D[] = [];
    const locals: LegacyContext[] = [];
    model.root.traverse((object: Object3D) => {
      if (!object.isMesh) return;
      const instanced = new scope.InstancedMesh(object.geometry, object.material, students.length);
      instanced.name = `athena-planets-${kind}-${object.name}`;
      instanced.userData.athenaNoInk = object.userData.athenaNoInk;
      instanced.frustumCulled = false;
      meshes.push(instanced);
      locals.push(object.matrixWorld.clone());
    });
    const group = new scope.Group();
    group.name = `athena-planets-${kind}`;
    group.add(...meshes);
    ctx.toon.apply(group);
    root.add(group);
    batches.push({ kind, meshes, locals, students, radius });
  }

  // Orbit paths: every student's ring as one ribbon mesh.
  const ribbon = (() => {
    const positions: number[] = [];
    const indices: number[] = [];
    const matrix = new scope.Matrix4();
    const euler = new scope.Euler();
    const point = new scope.Vector3();
    const rings = new Map([...slots.values()].map((slot) => [slot.ring, slot]));
    for (const slot of rings.values()) {
      matrix.makeRotationFromEuler(euler.set(slot.tilt, 0, slot.tilt * 0.5));
      matrix.setPosition(0, orbitLayout.sunHeight + slot.height, 0);
      const start = positions.length / 3;
      for (let k = 0; k <= PATH_SEGMENTS; k++) {
        const a = (k / PATH_SEGMENTS) * Math.PI * 2;
        for (const r of [slot.radius - PATH_WIDTH, slot.radius + PATH_WIDTH]) {
          point.set(Math.cos(a) * r, 0, Math.sin(a) * r).applyMatrix4(matrix);
          positions.push(point.x, point.y, point.z);
        }
        if (k < PATH_SEGMENTS) {
          const i = start + k * 2;
          indices.push(i, i + 1, i + 2, i + 1, i + 3, i + 2);
        }
      }
    }
    const geometry = new scope.BufferGeometry();
    geometry.setAttribute("position", new scope.BufferAttribute(new Float32Array(positions), 3));
    geometry.setIndex(indices);
    const mesh = new scope.Mesh(
      geometry,
      new scope.MeshBasicMaterial({
        color: orbitLayout.orbitPath,
        side: scope.DoubleSide,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
    );
    mesh.name = "athena-orbit-paths";
    return mesh;
  })();
  root.add(ribbon);

  // Starfield backdrop (Points, untouched by toon).
  try {
    const stars = await loadAthenaModel(ctx, STARFIELD, { toon: false, merge: false });
    stars.root.scale.setScalar(2.4);
    stars.root.position.y = -2;
    root.add(stars.root);
  } catch (error) {
    console.warn("[Athena] starfield missing; orbit renders without it", error);
  }

  const positions = new Map<string, Object3D>();
  const radii = new Map<string, number>();
  for (const state of states) positions.set(state.studentId, new scope.Vector3());
  const instance = new scope.Matrix4();
  const planet = new scope.Matrix4();
  const tiltMatrix = new scope.Matrix4();
  const spin = new scope.Matrix4();
  const euler = new scope.Euler();
  const scale = new scope.Vector3();
  const tick = (time: number) => {
    const t = prefersReducedMotion() ? 0 : time;
    for (const batch of batches) {
      batch.students.forEach((studentId, index) => {
        const slot = slots.get(studentId)!;
        const state = states.find((item) => item.studentId === studentId);
        const s = planetScale(state ? demonstratedTopics(state) : 0) * crowd;
        radii.set(studentId, s * batch.radius);
        // Outer rings move slower (Kepler-ish), so the class reads as one system.
        const angle = slot.phase + (t * orbitLayout.speed * orbitLayout.baseRadius) / slot.radius;
        tiltMatrix.makeRotationFromEuler(euler.set(slot.tilt, 0, slot.tilt * 0.5));
        const centre = positions.get(studentId)!;
        centre
          .set(Math.cos(angle) * slot.radius, 0, Math.sin(angle) * slot.radius)
          .applyMatrix4(tiltMatrix);
        centre.y += orbitLayout.sunHeight + slot.height;
        planet.compose(
          centre,
          new scope.Quaternion().setFromRotationMatrix(
            spin.makeRotationY(t * orbitLayout.spin + slot.phase),
          ),
          scale.setScalar(s),
        );
        batch.meshes.forEach((mesh, meshIndex) => {
          instance.multiplyMatrices(planet, batch.locals[meshIndex]);
          mesh.setMatrixAt(index, instance);
          mesh.instanceMatrix.needsUpdate = true;
        });
      });
    }
  };
  tick(0);
  return {
    root,
    positions,
    radii,
    tick,
    update(next) {
      states = next;
      tick(prefersReducedMotion() ? 0 : (performance.now() / 1000) % 1e5);
    },
    pick(raycaster) {
      const meshes = batches.flatMap((batch) => batch.meshes);
      const hit = raycaster.intersectObjects(meshes, false)[0];
      if (!hit || hit.instanceId === undefined) return undefined;
      const batch = batches.find((item) => item.meshes.includes(hit.object));
      return batch?.students[hit.instanceId];
    },
    dispose() {
      root.removeFromParent();
    },
  };
}
