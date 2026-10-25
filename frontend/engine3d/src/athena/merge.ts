/**
 * Draw-call budget (surface ≤ 120 calls). Kit GLBs are built from many small meshes, one
 * material each (a house is ~300 meshes, a character ~100). Before toon shading:
 *
 * - "Plain" parts (opaque, flat colour, no texture, no emission) bake their material colour
 *   into vertex colours and merge into ONE mesh per size class: tiny parts (< 12 cm, kit
 *   rule) get no ink hull, the rest share one hull.
 *   - Static models (no clips): one `Mesh` in the root's space.
 *   - Node-animated models (characters, emotes, birds): one `SkinnedMesh` whose bones are
 *     the animated nodes themselves; each vertex is weighted 100% to its rigid node, so the
 *     kit's node clips keep driving every part.
 * - Everything else (transparent glass, emissive glow, textured) merges per rigid node and
 *   material look.
 */
import { MIN_OUTLINE_SIZE } from "../materials/athena-toon-material";
import type { LegacyContext } from "../runtime/legacy-context";

type Object3D = LegacyContext;

/** Node names animated by any clip (`body.position`, `wing_l.quaternion` → body, wing_l). */
export function animatedNodeNames(clips: readonly LegacyContext[]) {
  const names = new Set<string>();
  for (const clip of clips)
    for (const track of clip.tracks as readonly { name: string }[]) {
      const dot = track.name.lastIndexOf(".");
      names.add(dot > 0 ? track.name.slice(0, dot) : track.name);
    }
  return names;
}

/** Meshes with equal keys render identically and may share one draw call. */
export function materialKey(material: LegacyContext) {
  if (!material || Array.isArray(material)) return undefined;
  return [
    material.type,
    material.name,
    material.color?.getHexString?.(),
    material.emissive?.getHexString?.(),
    material.emissiveIntensity,
    material.opacity,
    material.transparent,
    material.side,
    material.vertexColors,
    material.map?.uuid ?? "",
  ].join("|");
}

/**
 * Opaque, untextured, non-emissive standard material: its look is just a colour, so it can
 * become a vertex colour. Double-sided parts stay separate (their culling differs).
 */
export function isPlainMaterial(material: LegacyContext) {
  if (!material || Array.isArray(material)) return false;
  const emissive = material.emissive;
  const glowing =
    !!material.emissiveMap ||
    (!!emissive && material.emissiveIntensity > 0 && emissive.r + emissive.g + emissive.b > 0);
  return (
    /^Mesh(Standard|Physical|Lambert|Phong)Material$/.test(material.type ?? "") &&
    !material.map &&
    !material.alphaMap &&
    !material.transparent &&
    (material.opacity ?? 1) >= 1 &&
    material.side !== 2 /* DoubleSide */ &&
    !glowing
  );
}

function toFloatAttribute(scope: LegacyContext, attribute: LegacyContext, itemSize: number) {
  const count: number = attribute.count;
  const array = new Float32Array(count * itemSize);
  const getters = ["getX", "getY", "getZ", "getW"] as const;
  for (let index = 0; index < count; index++)
    for (let component = 0; component < itemSize; component++)
      array[index * itemSize + component] =
        component < attribute.itemSize ? attribute[getters[component]!](index) : 1;
  return new scope.BufferAttribute(array, itemSize);
}

interface GeometryOptions {
  /** Bake the material colour (× any vertex colour) into `color`. */
  readonly bakeColor?: boolean;
  /** Bone index for every vertex (adds skinIndex/skinWeight). */
  readonly bone?: number;
}

/** Float, indexed copy in `matrix` space with only the attributes the target needs. */
function normalizedGeometry(
  scope: LegacyContext,
  mesh: Object3D,
  matrix: LegacyContext,
  { bakeColor = false, bone }: GeometryOptions = {},
) {
  const source = mesh.geometry;
  const material = mesh.material;
  const count: number = source.attributes.position.count;
  const geometry = new scope.BufferGeometry();
  geometry.setAttribute("position", toFloatAttribute(scope, source.attributes.position, 3));
  if (source.attributes.normal)
    geometry.setAttribute("normal", toFloatAttribute(scope, source.attributes.normal, 3));
  if (bakeColor) {
    const color = material.color ?? { r: 1, g: 1, b: 1 };
    const colors = new Float32Array(count * 3);
    const own = material.vertexColors ? source.attributes.color : undefined;
    for (let i = 0; i < count; i++) {
      colors[i * 3] = color.r * (own ? own.getX(i) : 1);
      colors[i * 3 + 1] = color.g * (own ? own.getY(i) : 1);
      colors[i * 3 + 2] = color.b * (own ? own.getZ(i) : 1);
    }
    geometry.setAttribute("color", new scope.BufferAttribute(colors, 3));
  } else {
    if (material.vertexColors && source.attributes.color)
      geometry.setAttribute("color", toFloatAttribute(scope, source.attributes.color, 3));
    if (material.map && source.attributes.uv)
      geometry.setAttribute("uv", toFloatAttribute(scope, source.attributes.uv, 2));
  }
  if (source.attributes._athena_style)
    geometry.setAttribute(
      "_athena_style",
      toFloatAttribute(scope, source.attributes._athena_style, 1),
    );
  if (source.attributes._athena_weave)
    geometry.setAttribute(
      "_athena_weave",
      toFloatAttribute(scope, source.attributes._athena_weave, 2),
    );
  if (bone !== undefined) {
    const indices = new Uint16Array(count * 4);
    const weights = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      indices[i * 4] = bone;
      weights[i * 4] = 1;
    }
    geometry.setAttribute("skinIndex", new scope.BufferAttribute(indices, 4));
    geometry.setAttribute("skinWeight", new scope.BufferAttribute(weights, 4));
  }
  const index = source.index;
  geometry.setIndex(
    new scope.BufferAttribute(
      index
        ? Uint32Array.from({ length: index.count }, (_, i) => index.getX(i))
        : Uint32Array.from({ length: count }, (_, i) => i),
      1,
    ),
  );
  if (!geometry.attributes.normal) geometry.computeVertexNormals();
  geometry.applyMatrix4(matrix);
  return geometry;
}

function worldDiagonal(scope: LegacyContext, mesh: Object3D) {
  const geometry = mesh.geometry;
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const size = geometry.boundingBox.getSize(new scope.Vector3());
  const scale = mesh.getWorldScale(new scope.Vector3());
  return Math.hypot(size.x * scale.x, size.y * scale.y, size.z * scale.z);
}

/** Drop a merged-away mesh, keeping any child nodes where they are. */
function detach(item: Object3D) {
  for (const child of [...item.children]) item.parent.attach(child);
  item.removeFromParent();
}

/** Nearest ancestor-or-self that a clip animates, else `root`. */
function rigidAnchor(object: Object3D, root: Object3D, animated: ReadonlySet<string>) {
  let anchor = object;
  while (anchor && anchor !== root && !animated.has(anchor.name)) anchor = anchor.parent;
  return anchor ?? root;
}

/**
 * Merge `root`'s meshes (see module comment). Returns how many meshes were replaced.
 * Call before toon shading; merged meshes keep a MeshStandardMaterial for the toon pass.
 */
export function mergeStaticMeshes(
  scope: LegacyContext,
  root: Object3D,
  animated: ReadonlySet<string> = new Set(),
) {
  root.updateMatrixWorld(true);
  const plain: Object3D[] = [];
  const other: Object3D[] = [];
  root.traverse((object: Object3D) => {
    if (!object.isMesh || object.isSkinnedMesh || object.isInstancedMesh) return;
    if (object.userData.athenaInk || !object.geometry?.attributes?.position) return;
    // AnimationMixer must retain directly animated meshes (mouth/eyes), including
    // their transforms and hierarchy. Removing them also invalidates rigid bone binds.
    if (animated.has(object.name)) return;
    (isPlainMaterial(object.material) ? plain : other).push(object);
  });
  let removed = 0;
  const toRoot = root.matrixWorld.clone().invert();
  const relative = new scope.Matrix4();

  // 1. Plain parts → one (skinned) vertex-coloured mesh per size class.
  const skinned = animated.size > 0;
  const bones: Object3D[] = [];
  const boneIndex = new Map<Object3D, number>();
  const boneOf = (mesh: Object3D) => {
    const anchor = rigidAnchor(mesh, root, animated);
    let index = boneIndex.get(anchor);
    if (index === undefined) {
      index = bones.length;
      bones.push(anchor);
      boneIndex.set(anchor, index);
    }
    return index;
  };
  const classes = new Map<"large" | "small", Object3D[]>();
  for (const mesh of plain) {
    const size = worldDiagonal(scope, mesh) < MIN_OUTLINE_SIZE ? "small" : "large";
    classes.set(size, [...(classes.get(size) ?? []), mesh]);
  }
  const built: Object3D[] = [];
  for (const [size, meshes] of classes) {
    if (meshes.length < 2 && !skinned) continue;
    const parts = meshes.map((mesh) =>
      normalizedGeometry(scope, mesh, relative.multiplyMatrices(toRoot, mesh.matrixWorld), {
        bakeColor: true,
        bone: skinned ? boneOf(mesh) : undefined,
      }),
    );
    const geometry = scope.mergeGeometries(parts, false);
    for (const part of parts) part.dispose();
    if (!geometry) continue;
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    const material = new scope.MeshStandardMaterial({
      name: `athena_vc_${size}`,
      vertexColors: true,
    });
    const mesh = skinned
      ? new scope.SkinnedMesh(geometry, material)
      : new scope.Mesh(geometry, material);
    mesh.name = `athena_${size}${skinned ? "_skinned" : ""}`;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (size === "small") mesh.userData.athenaNoInk = true;
    built.push(mesh);
    for (const item of meshes) {
      detach(item);
      removed++;
    }
  }
  if (built.length) {
    for (const mesh of built) root.add(mesh);
    root.updateMatrixWorld(true);
    if (skinned) {
      const skeleton = new scope.Skeleton(bones);
      for (const mesh of built) {
        mesh.bind(skeleton);
        // Bind-pose sphere, padded for limb swing (clips stay within the rig's reach).
        mesh.computeBoundingSphere?.();
        if (mesh.boundingSphere) mesh.boundingSphere.radius *= 1.25;
      }
    }
  }

  // 2. Everything else → per rigid node and material look.
  const buckets = new Map<Object3D, Map<string, Object3D[]>>();
  for (const object of other) {
    if (animated.has(object.name)) continue;
    const look = materialKey(object.material);
    if (!look) continue;
    const small = worldDiagonal(scope, object) < MIN_OUTLINE_SIZE;
    const key = `${look}|${small ? "small" : "large"}`;
    const anchor = rigidAnchor(object.parent, root, animated);
    let byKey = buckets.get(anchor);
    if (!byKey) buckets.set(anchor, (byKey = new Map()));
    byKey.set(key, [...(byKey.get(key) ?? []), object]);
  }
  for (const [anchor, byKey] of buckets) {
    const toAnchor = anchor.matrixWorld.clone().invert();
    for (const meshes of byKey.values()) {
      if (meshes.length < 2) continue;
      const parts = meshes.map((mesh) =>
        normalizedGeometry(scope, mesh, relative.multiplyMatrices(toAnchor, mesh.matrixWorld)),
      );
      const merged = scope.mergeGeometries(parts, false);
      for (const part of parts) part.dispose();
      if (!merged) continue;
      merged.computeBoundingBox();
      merged.computeBoundingSphere();
      const first = meshes[0]!;
      const mesh = new scope.Mesh(merged, first.material);
      mesh.name = `${first.material.name || "merged"}__merged`;
      mesh.castShadow = meshes.some((item: Object3D) => item.castShadow);
      mesh.receiveShadow = meshes.some((item: Object3D) => item.receiveShadow);
      if (meshes.every((item: Object3D) => worldDiagonal(scope, item) < MIN_OUTLINE_SIZE))
        mesh.userData.athenaNoInk = true;
      anchor.add(mesh);
      for (const item of meshes) {
        detach(item);
        removed++;
      }
    }
  }
  root.updateMatrixWorld(true);
  return removed;
}
