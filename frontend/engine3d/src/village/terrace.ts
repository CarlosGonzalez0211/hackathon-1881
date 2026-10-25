import type { AthenaInstallContext } from "../athena/install";
import { roundedBox } from "./geometry";
import type { LegacyContext } from "../runtime/legacy-context";
import { mergeStaticMeshes } from "../athena/merge";
import { add, cross, dot, mul, norm, surfacePoint, type Vec } from "./layout";

/** A connected stone foundation meets the curved ground; it never deforms the paths. */
export function createTerrace(
  ctx: AthenaInstallContext,
  up: Vec,
  forward: Vec,
  bounds: { min: Vec; max: Vec },
  scale: number,
) {
  const s = ctx.scope,
    root = new s.Group();
  root.name = "athena-connected-stone-terrace";
  const base = surfacePoint(up),
    baseRadius = Math.hypot(...base),
    side = cross(up, forward);
  const x0 = bounds.min[0] * scale - 0.12,
    x1 = bounds.max[0] * scale + 0.12,
    z0 = bounds.min[2] * scale - 0.12,
    z1 = bounds.max[2] * scale + 0.12;
  const material = new s.MeshStandardMaterial({ color: "#c5bea6", roughness: 1 });
  const floors: {
    up: Vec;
    forward: Vec;
    side: Vec;
    radius: number;
    x0: number;
    x1: number;
    z0: number;
    z1: number;
  }[] = [];
  const world = (x: number, y: number, z: number) =>
    add(base, add(mul(up, y), add(mul(side, x), mul(forward, z))));
  const corner = 0.34;
  const corners: Vec[] = [
    [x0 + corner, 0, z0],
    [x1 - corner, 0, z0],
    [x1, 0, z0 + corner],
    [x1, 0, z1 - corner],
    [x1 - corner, 0, z1],
    [x0 + corner, 0, z1],
    [x0, 0, z1 - corner],
    [x0, 0, z0 + corner],
  ];
  const positions: number[] = [],
    indices: number[] = [];
  for (const [x, , z] of corners) {
    const top = world(x, -0.035, z),
      ground = surfacePoint(norm(top));
    const bottomY = dot(ground, up) - baseRadius - 0.25;
    positions.push(...top, ...world(x, bottomY, z));
  }
  const center = positions.length / 3;
  positions.push(...world((x0 + x1) / 2, -0.035, (z0 + z1) / 2));
  for (let i = 0; i < corners.length; i++) {
    const a = i * 2,
      b = ((i + 1) % corners.length) * 2;
    indices.push(center, b, a, a, b, a + 1, b, b + 1, a + 1);
  }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  root.add(new s.Mesh(geometry, material));
  // Four shallow steps are joined to the front edge of the same foundation.
  const width = Math.min(2.1, x1 - x0 - 0.3);
  const doorGround = dot(surfacePoint(norm(world(0, 0, z1 + 1.15))), up) - baseRadius;
  for (let i = 0; i < 4; i++) {
    const z = z1 + 0.15 + i * 0.3,
      top = -0.035 + ((doorGround + 0.035) * (i + 1)) / 4;
    const ground = dot(surfacePoint(norm(world(0, 0, z))), up) - baseRadius - 0.2;
    const height = Math.max(0.08, top - ground);
    floors.push({
      up,
      forward,
      side,
      radius: baseRadius + top,
      x0: -width / 2,
      x1: width / 2,
      z0: z - 0.16,
      z1: z + 0.16,
    });
    const step = new s.Mesh(roundedBox(s, width, height, 0.32), material);
    step.position.set(...world(0, top - height / 2, z));
    const y = new s.Vector3(...up),
      f = new s.Vector3(...forward),
      x = new s.Vector3(...side);
    step.quaternion.setFromRotationMatrix(new s.Matrix4().makeBasis(x, y, f));
    root.add(step);
  }
  mergeStaticMeshes(s, root, new Set());
  ctx.toon.apply(root);
  root.traverse((part: LegacyContext) => {
    if (part.isMesh && !part.userData.athenaInk) {
      part.castShadow = true;
      part.receiveShadow = true;
    }
  });
  return { root, floors };
}
