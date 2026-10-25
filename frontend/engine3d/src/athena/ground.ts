/**
 * Raycasts against the original Messenger collision mesh (`collisionPhysics._collider`),
 * which stays authoritative for gameplay. A double-sided proxy shares its geometry and BVH
 * so rays started inside walls still report them.
 */
import type { LegacyContext } from "../runtime/legacy-context";
import type { Raycast, Vec3 } from "../world/house-sites";

export function colliderOf(scene: LegacyContext): LegacyContext | undefined {
  return scene?.characters?.mesh?._collisionPhysics?._collider ?? undefined;
}

export function createColliderRaycast(scope: LegacyContext, collider: LegacyContext): Raycast {
  const proxy = new scope.collider(
    collider.geometry,
    new scope.MeshBasicMaterial({ side: scope.DoubleSide }),
  );
  proxy.matrixWorld.copy(collider.matrixWorld);
  const raycaster = new scope.Raycaster();
  raycaster.firstHitOnly = true;
  const origin = new scope.Vector3();
  const direction = new scope.Vector3();
  const normal = new scope.Vector3();
  const normalMatrix = new scope.Matrix3().getNormalMatrix(proxy.matrixWorld);
  return (from: Vec3, toward: Vec3, far: number) => {
    raycaster.set(origin.fromArray(from), direction.fromArray(toward).normalize());
    raycaster.far = far;
    const hit = raycaster.intersectObject(proxy, false)[0];
    if (!hit) return undefined;
    normal.copy(hit.face?.normal ?? direction.clone().negate()).applyMatrix3(normalMatrix);
    return {
      point: hit.point.toArray() as Vec3,
      normal: normal.normalize().toArray() as Vec3,
      distance: hit.distance,
    };
  };
}

/**
 * Raycast against the visible legacy world (terrain chunk LOD0) near `centres`. The
 * collision mesh omits thin props (railings, fences, gravestones, awnings), so placement
 * also checks what the player sees. Triangles within `radius` of a centre get a BVH.
 */
export function createVisualRaycast(
  scope: LegacyContext,
  batched: LegacyContext,
  centres: readonly Vec3[],
  radius: number,
): Raycast | undefined {
  const geometry = batched?.geometry;
  const infos: LegacyContext[] = batched?._geometryInfo ?? [];
  if (!geometry?.attributes?.position || !geometry.index || !infos.length) return undefined;
  const position = geometry.attributes.position;
  const index = geometry.index;
  const radiusSq = radius * radius;
  const near = (x: number, y: number, z: number) =>
    centres.some((c) => (x - c[0]) ** 2 + (y - c[1]) ** 2 + (z - c[2]) ** 2 < radiusSq);
  const out: number[] = [];
  for (const info of infos) {
    if (!info || info.active === false || !info.indexCount) continue;
    const sphere = info.boundingSphere;
    if (
      sphere &&
      !centres.some(
        (c) =>
          (sphere.center.x - c[0]) ** 2 +
            (sphere.center.y - c[1]) ** 2 +
            (sphere.center.z - c[2]) ** 2 <
          (radius + sphere.radius) ** 2,
      )
    )
      continue;
    const end = info.indexStart + info.indexCount;
    for (let t = info.indexStart; t + 2 < end; t += 3) {
      const a = index.getX(t);
      const b = index.getX(t + 1);
      const c = index.getX(t + 2);
      const cx = (position.getX(a) + position.getX(b) + position.getX(c)) / 3;
      const cy = (position.getY(a) + position.getY(b) + position.getY(c)) / 3;
      const cz = (position.getZ(a) + position.getZ(b) + position.getZ(c)) / 3;
      if (!near(cx, cy, cz)) continue;
      for (const v of [a, b, c]) out.push(position.getX(v), position.getY(v), position.getZ(v));
    }
  }
  if (!out.length) return undefined;
  const soup = new scope.BufferGeometry();
  soup.setAttribute("position", new scope.BufferAttribute(new Float32Array(out), 3));
  soup.boundsTree = new scope.MeshBVH(soup);
  return createColliderRaycast(scope, { geometry: soup, matrixWorld: batched.matrixWorld });
}

/** Nearest hit of several raycasts. */
export function combineRaycasts(...casts: (Raycast | undefined)[]): Raycast {
  const active = casts.filter((cast): cast is Raycast => !!cast);
  return (origin, direction, far) => {
    let best: ReturnType<Raycast>;
    for (const cast of active) {
      const hit = cast(origin, direction, far);
      if (hit && (!best || hit.distance < best.distance)) best = hit;
    }
    return best;
  };
}
