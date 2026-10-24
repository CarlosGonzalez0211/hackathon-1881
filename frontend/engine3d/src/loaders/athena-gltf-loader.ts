/**
 * GLB loading for Athena kit models (built by `scripts/build-athena-assets.mjs`:
 * EXT_meshopt_compression + KHR_mesh_quantization, optional KTX2 textures).
 *
 * Uses the vendored `scope.GLTFLoader` so every object shares the recovered renderer's
 * Three.js class identity — never import npm `three` here. The legacy Draco path
 * (`scope.geometryLoader` / `customDracoLoader`) is untouched and keeps serving `.drc`.
 */
import { MeshoptDecoder } from "meshoptimizer/decoder";
import type { LegacyContext } from "../runtime/legacy-context";

/** Three objects from the recovered runtime (typed loosely, like the rest of the bridge). */
type Object3D = LegacyContext;
type BufferGeometry = LegacyContext;
type AnimationClip = LegacyContext;

export interface AthenaGltfScene {
  /** A fresh clone per call (skeleton-aware when the GLB has skinned meshes). */
  readonly scene: Object3D;
  /** Shared, immutable clips (idle, walk, run, talk, …); bind them with an AnimationMixer. */
  readonly animations: readonly AnimationClip[];
}
export interface GeometryFromGlbOptions {
  /**
   * Bake each mesh's material colour into a `color` attribute when the primitive has no
   * vertex colours, so a single merged geometry keeps the kit's per-part palette.
   * Default true.
   */
  readonly materialColors?: boolean;
}
export interface AthenaGltfLoader {
  /** Raw parsed glTF (cached per URL). Do not mutate `scene`; use `loadSceneFromGlb`. */
  load(url: string): Promise<{ scene: Object3D; animations: AnimationClip[] }>;
  /** Clone of the GLB scene plus its clips. */
  loadSceneFromGlb(url: string): Promise<AthenaGltfScene>;
  /**
   * All meshes merged into one indexed `scope.BufferGeometry`, node transforms baked, with
   * float `position`/`normal`/`uv`/`color` (missing ones filled: normals computed, uv 0,
   * colour from the material). Returns a clone per call, so callers may translate/scale it
   * (as `geometryLoader.batched` overrides do). Multi-material groups are not preserved.
   */
  loadGeometryFromGlb(url: string, options?: GeometryFromGlbOptions): Promise<BufferGeometry>;
  /** Drop cached parses (does not dispose GPU resources of clones already handed out). */
  clear(): void;
}

const KEPT_ATTRIBUTES = ["position", "normal", "uv", "color"] as const;
const ITEM_SIZE: Record<(typeof KEPT_ATTRIBUTES)[number], number> = {
  position: 3,
  normal: 3,
  uv: 2,
  color: 3,
};

function hasSkinnedMesh(root: Object3D) {
  let skinned = false;
  root.traverse((object: Object3D) => {
    if (object.isSkinnedMesh) skinned = true;
  });
  return skinned;
}

/**
 * Skeleton-aware clone (SkeletonUtils.clone). The recovered runtime ships it as
 * `scope.clone`; the fallback re-binds cloned SkinnedMeshes to cloned bones by name.
 */
export function cloneObject(scope: LegacyContext, root: Object3D): Object3D {
  if (!hasSkinnedMesh(root)) return root.clone(true);
  if (typeof scope.clone === "function") return scope.clone(root);
  const copy = root.clone(true);
  const bonesByName = new Map<string, Object3D>();
  copy.traverse((object: Object3D) => {
    if (object.isBone) bonesByName.set(object.name, object);
  });
  copy.traverse((object: Object3D) => {
    if (!object.isSkinnedMesh) return;
    const skeleton = object.skeleton;
    const bones = skeleton.bones.map((bone: Object3D) => bonesByName.get(bone.name) ?? bone);
    object.bind(new scope.Skeleton(bones, skeleton.boneInverses), object.bindMatrix);
  });
  return copy;
}

/** Copy an attribute (possibly quantized/normalized/interleaved) into a float array. */
function toFloat(scope: LegacyContext, attribute: LegacyContext, itemSize: number) {
  const count: number = attribute.count;
  const array = new Float32Array(count * itemSize);
  const getters = ["getX", "getY", "getZ", "getW"] as const;
  for (let index = 0; index < count; index++)
    for (let component = 0; component < itemSize; component++)
      array[index * itemSize + component] =
        component < attribute.itemSize ? attribute[getters[component]!](index) : 1;
  return new scope.BufferAttribute(array, itemSize);
}

function meshToGeometry(
  scope: LegacyContext,
  mesh: Object3D,
  options: GeometryFromGlbOptions,
): BufferGeometry {
  const source = mesh.geometry;
  const geometry = new scope.BufferGeometry();
  const count: number = source.attributes.position.count;
  for (const name of KEPT_ATTRIBUTES) {
    const attribute = source.attributes[name];
    if (attribute) geometry.setAttribute(name, toFloat(scope, attribute, ITEM_SIZE[name]));
  }
  if (!geometry.attributes.normal) geometry.computeVertexNormals();
  if (!geometry.attributes.uv)
    geometry.setAttribute("uv", new scope.BufferAttribute(new Float32Array(count * 2), 2));
  if (!geometry.attributes.color) {
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const color = options.materialColors !== false ? material?.color : undefined;
    const rgb = color ? [color.r, color.g, color.b] : [1, 1, 1];
    const array = new Float32Array(count * 3);
    for (let index = 0; index < count; index++) array.set(rgb, index * 3);
    geometry.setAttribute("color", new scope.BufferAttribute(array, 3));
  }
  const index = source.index;
  const indices = index
    ? Uint32Array.from({ length: index.count }, (_, i) => index.getX(i))
    : Uint32Array.from({ length: count }, (_, i) => i);
  geometry.setIndex(new scope.BufferAttribute(indices, 1));
  geometry.applyMatrix4(mesh.matrixWorld);
  return geometry;
}

export function createAthenaGltfLoader(scope: LegacyContext): AthenaGltfLoader {
  const loader = new scope.GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  if (scope.ktx2Loader) loader.setKTX2Loader(scope.ktx2Loader);
  const parses = new Map<string, Promise<{ scene: Object3D; animations: AnimationClip[] }>>();
  const geometries = new Map<string, Promise<BufferGeometry>>();

  const load: AthenaGltfLoader["load"] = (url) => {
    let parse = parses.get(url);
    if (!parse) {
      parse = MeshoptDecoder.ready
        .then(() => loader.loadAsync(url))
        .catch((error: unknown) => {
          parses.delete(url);
          throw error;
        });
      parses.set(url, parse);
    }
    return parse;
  };

  return {
    load,
    async loadSceneFromGlb(url) {
      const gltf = await load(url);
      return { scene: cloneObject(scope, gltf.scene), animations: gltf.animations };
    },
    async loadGeometryFromGlb(url, options = {}) {
      const key = `${url}#${options.materialColors !== false}`;
      let merged = geometries.get(key);
      if (!merged) {
        merged = load(url)
          .then((gltf) => {
            gltf.scene.updateMatrixWorld(true);
            const parts: BufferGeometry[] = [];
            gltf.scene.traverse((object: Object3D) => {
              if (object.isMesh && object.geometry?.attributes?.position)
                parts.push(meshToGeometry(scope, object, options));
            });
            if (!parts.length) throw new Error(`No meshes in ${url}`);
            const geometry = parts.length === 1 ? parts[0] : scope.mergeGeometries(parts, false);
            if (!geometry) throw new Error(`Could not merge meshes in ${url}`);
            for (const part of parts) if (part !== geometry) part.dispose();
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();
            geometry.userData.athenaUrl = url;
            return geometry;
          })
          .catch((error: unknown) => {
            geometries.delete(key);
            throw error;
          });
        geometries.set(key, merged);
      }
      return (await merged).clone();
    },
    clear() {
      parses.clear();
      for (const geometry of geometries.values())
        geometry.then((g: BufferGeometry) => g.dispose()).catch(() => {});
      geometries.clear();
    },
  };
}
