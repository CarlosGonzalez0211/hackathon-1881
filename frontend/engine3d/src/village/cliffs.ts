import type { AthenaInstallContext } from "../athena/install";
import { loadAthenaModel } from "../athena/models";
import type { LegacyContext } from "../runtime/legacy-context";
import { paintMaterial } from "./look";
import {
  RADIUS,
  add,
  buildingClearance,
  clamp,
  cross,
  direction,
  dot,
  inWelcomeCourtyard,
  mountainHeight,
  mountains,
  mul,
  norm,
  pathDistance,
  surfacePoint,
  surfaceRadius,
  tangent,
  waterDepth,
  type Vec,
} from "./layout";

/**
 * Cliff plateaus on the mountains, the rocks around them, and the floating islets.
 *
 * Everything here is visual only: the shells live where `mountainHeight > 1.25` (already
 * unwalkable, `canOccupy` refuses it), the small stones are decoration with no obstacle, and
 * the islets float far beyond the cloud belt. Nothing registers an obstacle and nothing is
 * placed by a hard-coded position: all of it follows the frozen predicates of `layout.ts`.
 */

const STEP = 0.18;
/** Height above the mountain base where the walkable ground ends (canOccupy). */
const WALL = 1.25;
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
/** Ease-out rise used for the plateau risers: always at or above the linear ramp. */
const ramp = (f: number) => 1 - Math.pow(1 - clamp(f / 0.72, 0, 1), 2);

interface Sun {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}
function sunOf(ctx: AthenaInstallContext): Sun {
  const value = ctx.toon?.lighting?.uAthenaSun?.value;
  return value ? { x: value.x, y: value.y, z: value.z } : { x: 0, y: 0.3, z: 0.95 };
}

/**
 * One merged shell mesh for all five mountains: three or four plateau steps per peak, the
 * lips slightly overhanging, cool stone with strata on the risers, grass caps on the flats,
 * lichen near the summit and a warm tint on the sun side. High tier only.
 */
export function createCliffShells(ctx: AthenaInstallContext, root: LegacyContext, low: boolean) {
  if (low) return undefined;
  const s = ctx.scope;
  const sun = sunOf(ctx);
  const positions: number[] = [];
  const normals: number[] = [];
  const levels: number[] = [];
  const indices: number[] = [];

  mountains.forEach((mountain, mountainIndex) => {
    const side = tangent([1, 0, 0], mountain.up);
    const along = cross(mountain.up, side);
    const halfX = mountain.radius * 0.98;
    const halfZ = mountain.radius * 1.22;
    const nx = Math.ceil((halfX * 2) / STEP);
    const nz = Math.ceil((halfZ * 2) / STEP);
    const stride = nx + 1;
    const count = stride * (nz + 1);
    const a = new Float32Array(count);
    const b = new Float32Array(count);
    const h = new Float32Array(count);
    const base = new Float32Array(count);
    let peak = 0;
    const at = (i: number, j: number): Vec =>
      norm(
        add(
          mountain.up,
          add(mul(side, (-halfX + i * STEP) / RADIUS), mul(along, (-halfZ + j * STEP) / RADIUS)),
        ),
      );
    for (let j = 0; j <= nz; j++)
      for (let i = 0; i <= nx; i++) {
        const k = j * stride + i;
        const up = at(i, j);
        a[k] = -halfX + i * STEP;
        b[k] = -halfZ + j * STEP;
        h[k] = mountainHeight(up);
        base[k] = surfaceRadius(up) - h[k];
        peak = Math.max(peak, h[k]!);
      }
    if (peak < WALL + 1) return;
    // The plateau levels follow a smoothed height field, so a cell-scale ripple in the
    // terrain cannot turn the terrace edges into teeth.
    const smoothed = new Float32Array(h);
    for (let pass = 0; pass < 3; pass++) {
      const source = new Float32Array(smoothed);
      for (let j = 1; j < nz; j++)
        for (let i = 1; i < nx; i++) {
          let sum = 0;
          for (let dj = -1; dj <= 1; dj++)
            for (let di = -1; di <= 1; di++) sum += source[(j + dj) * stride + i + di]!;
          smoothed[j * stride + i] = sum / 9;
        }
    }
    const steps = peak > 7.4 ? 4 : 3;
    const dh = (peak - WALL) / steps;
    // Authored irregularity: a slow undulation moves the terraces off the pure contour lines.
    const warped = (k: number) =>
      // Never below the terrain: the shell must stay outside it or the stairs bite into it.
      Math.max(h[k]!, smoothed[k]!) +
      0.3 *
        (0.5 + 0.5 * Math.sin(a[k]! * 0.7 + mountainIndex * 1.9) * Math.cos(b[k]! * 0.55 - 0.4));
    const first = positions.length / 3;
    const radii = new Float32Array(count);
    const valid = (k: number) => h[k]! > WALL;
    // Grid positions, with the lip pushed a little downhill so each step overhangs.
    for (let j = 0; j <= nz; j++)
      for (let i = 0; i <= nx; i++) {
        const k = j * stride + i;
        const u = valid(k) ? warped(k) : WALL;
        // Never below the first step: a vertex warped under the wall must not jump to a full riser.
        const t = Math.max(0, (u - WALL) / dh);
        const level = Math.floor(t);
        const f = t - level;
        const clampedLevel = clamp(level, 0, steps - 1);
        const rise = level >= steps ? 1 : ramp(f);
        const shell = WALL + dh * (clampedLevel + rise);
        // Outward offset 0.25 .. 0.9 m: higher steps stand further off the slope.
        const offset =
          0.34 +
          0.5 * (clampedLevel / Math.max(1, steps - 1)) +
          0.08 * (1 + Math.sin(a[k]! * 0.9 + b[k]! * 0.7));
        // Downhill direction in grid metres from the warped height field.
        const gi = Math.min(nx, i + 1);
        const gj = Math.min(nz, j + 1);
        const hi = Math.max(0, i - 1);
        const hj = Math.max(0, j - 1);
        const gx = (h[j * stride + gi]! - h[j * stride + hi]!) / ((gi - hi) * STEP);
        const gz = (h[gj * stride + i]! - h[hj * stride + i]!) / ((gj - hj) * STEP);
        const g = Math.hypot(gx, gz) || 1;
        const lip = 0;
        const pa = a[k]! - (gx / g) * lip;
        const pb = b[k]! - (gz / g) * lip;
        const up = norm(add(mountain.up, add(mul(side, pa / RADIUS), mul(along, pb / RADIUS))));
        // Outside the walls the shell sinks under the terrain, so its edge is the line where it
        // emerges from the ground: no rim, no notches along a staircase of cells.
        radii[k] = !valid(k) ? base[k]! + h[k]! - 0.3 : base[k]! + shell + offset;
        positions.push(...mul(up, radii[k]!));
        levels.push(shell, mountainIndex, valid(k) ? 1 : 0);
      }
    const raw = new Float32Array(count * 3);
    // Normals from the height field itself (central differences), not from the triangles:
    // a riser is steeper than a cell is wide, and triangle normals there flicker per cell.
    for (let j = 0; j <= nz; j++)
      for (let i = 0; i <= nx; i++) {
        const k = j * stride + i;
        const i0 = Math.max(0, i - 1),
          i1 = Math.min(nx, i + 1),
          j0 = Math.max(0, j - 1),
          j1 = Math.min(nz, j + 1);
        const da = (radii[j * stride + i1]! - radii[j * stride + i0]!) / ((i1 - i0) * STEP);
        const db = (radii[j1 * stride + i]! - radii[j0 * stride + i]!) / ((j1 - j0) * STEP);
        const up = at(i, j);
        const sideK = tangent(side, up);
        const alongK = cross(up, sideK);
        const n = norm([
          up[0] - da * sideK[0] - db * alongK[0],
          up[1] - da * sideK[1] - db * alongK[1],
          up[2] - da * sideK[2] - db * alongK[2],
        ]);
        raw[k * 3] = n[0];
        raw[k * 3 + 1] = n[1];
        raw[k * 3 + 2] = n[2];
      }
    for (let pass = 0; pass < 2; pass++) {
      const source = new Float32Array(raw);
      for (let j = 1; j < nz; j++)
        for (let i = 1; i < nx; i++) {
          const sum: [number, number, number] = [0, 0, 0];
          for (let dj = -1; dj <= 1; dj++)
            for (let di = -1; di <= 1; di++)
              for (let c = 0; c < 3; c++)
                sum[c] = sum[c]! + source[((j + dj) * stride + i + di) * 3 + c]!;
          const n = norm(sum);
          raw.set(n, (j * stride + i) * 3);
        }
    }
    for (let k = 0; k < count; k++) normals.push(raw[k * 3]!, raw[k * 3 + 1]!, raw[k * 3 + 2]!);
    // Cells whose four corners are unwalkable mountain.
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++) {
        const k00 = j * stride + i;
        const k10 = k00 + 1;
        const k01 = k00 + stride;
        const k11 = k01 + 1;
        if (!(valid(k00) || valid(k10) || valid(k01) || valid(k11))) continue;
        indices.push(first + k00, first + k01, first + k10);
        indices.push(first + k10, first + k01, first + k11);
      }
  });
  if (!indices.length) return undefined;

  // Merge shell and skirt into one geometry. Shell vertices are shared, skirts are not.
  const allPositions = positions;
  const allLevels = levels;
  const allIndices = indices;
  // The surface faces the sky: flip the winding if the first shell triangle faces inward.
  {
    const [i0, i1, i2] = allIndices as [number, number, number];
    const P = (index: number) => allPositions.slice(index * 3, index * 3 + 3) as unknown as Vec;
    const n = cross(add(P(i1), mul(P(i0), -1)), add(P(i2), mul(P(i0), -1)));
    if (dot(n, P(i0)) < 0)
      for (let t = 0; t < indices.length; t += 3) {
        const swap = allIndices[t + 1]!;
        allIndices[t + 1] = allIndices[t + 2]!;
        allIndices[t + 2] = swap;
      }
  }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(allPositions, 3));
  geometry.setAttribute("normal", new s.Float32BufferAttribute(normals, 3));
  geometry.setIndex(allIndices);

  // Vertex colour: cool stone with strata, grass caps, lichen, a warm sun side.
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const colors = new Float32Array(position.count * 3);
  const stoneLow = new s.Color("#6f8491");
  const stoneMid = new s.Color("#b9c4c8");
  const warm = new s.Color("#d9c3a3");
  const grassDeep = new s.Color("#3f7a5b");
  const grassMid = new s.Color("#6ca66e");
  const grassLight = new s.Color("#a8c97a");
  const lichen = new s.Color("#d9d2b0");
  const ink = new s.Color("#2b2936");
  const c = new s.Color();
  const grass = new s.Color();
  const sunLength = Math.hypot(sun.x, sun.y, sun.z) || 1;
  for (let i = 0; i < position.count; i++) {
    const px = position.getX(i);
    const py = position.getY(i);
    const pz = position.getZ(i);
    const length = Math.hypot(px, py, pz) || 1;
    const ux = px / length;
    const uy = py / length;
    const uz = pz / length;
    const nxv = normal.getX(i);
    const nyv = normal.getY(i);
    const nzv = normal.getZ(i);
    const facing = nxv * ux + nyv * uy + nzv * uz;
    const shell = allLevels[i * 3]!;
    const bottom = allLevels[i * 3 + 2] === 0;
    const heightT = clamp((shell - WALL) / 7, 0, 1);
    // Strata: soft horizontal bands that follow the plateau levels.
    const band =
      0.5 + 0.5 * Math.sin(shell * 6.2 + 1.6 * Math.sin(px * 0.35 + pz * 0.27 + py * 0.2));
    c.copy(stoneLow).lerp(stoneMid, 0.3 + 0.45 * band + 0.25 * heightT);
    // Sun side warms the stone.
    const sunSide = clamp((nxv * sun.x + nyv * sun.y + nzv * sun.z) / sunLength, 0, 1);
    c.lerp(warm, 0.28 * sunSide);
    const wash = 0.5 + 0.5 * Math.sin(px * 0.8 + py * 0.3) * Math.sin(pz * 0.7 - py * 0.4);
    grass
      .copy(grassDeep)
      .lerp(grassMid, 0.4 + 0.4 * wash)
      .lerp(grassLight, 0.15 + 0.5 * sunSide * (0.5 + heightT));
    grass.lerp(lichen, smooth(4.9, 5.9, shell) * 0.8);
    c.lerp(grass, smooth(0.8, 0.93, facing));
    if (bottom) c.lerp(ink, 0.22);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute("color", new s.BufferAttribute(colors, 3));
  const mesh = new s.Mesh(
    geometry,
    new s.MeshStandardMaterial({ color: "#ffffff", vertexColors: true, roughness: 1 }),
  );
  mesh.name = "athena-cliff-plateaus";
  mesh.castShadow = true;
  // Steep faces self-shadow into stripes; the shell is lit by the sun term alone.
  mesh.receiveShadow = false;
  mesh.userData.athenaNoInk = true;
  ctx.toon.apply(mesh);
  paintMaterial(mesh.material, "ground");
  // The shell hugs the terrain along its risers: win the depth contest instead of cutting teeth.
  mesh.material.polygonOffset = true;
  mesh.material.polygonOffsetFactor = -2;
  mesh.material.polygonOffsetUnits = -2;
  root.add(mesh);
  ctx.onDispose?.(() => geometry.dispose());
  return mesh;
}

interface Placement {
  up: Vec;
  scale: number;
  yaw: number;
}

/** Instance every mesh part of a kit model at the given placements (one draw per part). */
export async function instanceKit(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  key: string,
  placements: readonly Placement[],
  { shadows = true, lift = -0.02 }: { shadows?: boolean; lift?: number } = {},
) {
  if (!placements.length) return;
  const s = ctx.scope;
  const model = await loadAthenaModel(ctx, key);
  if (ctx.lifecycle.disposed) return;
  model.root.updateMatrixWorld(true);
  const transform = new s.Object3D();
  const matrix = new s.Matrix4();
  const basis = new s.Matrix4();
  model.root.traverse((part: LegacyContext) => {
    if (!part.isMesh || part.isSkinnedMesh) return;
    const batch = new s.InstancedMesh(part.geometry, part.material, placements.length);
    batch.name = `village-${key.split("/").pop()}-${part.name}`;
    batch.castShadow = shadows && !part.userData.athenaInk;
    batch.receiveShadow = !part.userData.athenaInk;
    placements.forEach(({ up, scale, yaw }, i) => {
      transform.position.set(...surfacePoint(up, lift));
      const forward = tangent([Math.sin(yaw), 0.7, Math.cos(yaw)], up);
      const y = new s.Vector3(...up);
      const z = new s.Vector3(...forward);
      const x = new s.Vector3().crossVectors(y, z).normalize();
      transform.quaternion.setFromRotationMatrix(basis.makeBasis(x, y, z));
      transform.scale.setScalar(scale);
      transform.updateMatrix();
      matrix.multiplyMatrices(transform.matrix, part.matrixWorld);
      batch.setMatrixAt(i, matrix);
    });
    batch.instanceMatrix.needsUpdate = true;
    batch.computeBoundingSphere();
    root.add(batch);
  });
}

/** Golden-angle points over the globe: stable, evenly spread, independent of activity. */
function* spiral(count: number) {
  for (let i = 0; i < count; i++)
    yield { i, up: direction(i * 2.399963, Math.asin(1 - (2 * (i + 0.5)) / count)) };
}

/**
 * Rocks. `rocks` is the existing boulder set (`scatter(.., 52)`), which the scene keeps as
 * obstacles: it is drawn as the new moss-capped rock cluster. Around it, all non-blocking
 * decoration: talus under the cliffs (0.7 < mountainHeight < 1.25), flat stones along the path
 * edge (1.45 < pathDistance < 1.9, at most 0.18 m tall) and pebbles at the shorelines
 * (0.02 < waterDepth < 0.12).
 */
export function createRockScatter(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  low: boolean,
  rocks: readonly Vec[],
) {
  const optional = (promise: Promise<unknown>) =>
    promise.catch((error) =>
      console.warn("[Athena] optional village decoration unavailable", error),
    );
  const talus: Placement[] = [];
  const edge: Placement[] = [];
  const shore: Placement[] = [];
  const limits = low ? { talus: 26, edge: 70, shore: 50 } : { talus: 90, edge: 220, shore: 160 };
  for (const { i, up } of spiral(low ? 5200 : 9000)) {
    if (talus.length >= limits.talus && edge.length >= limits.edge && shore.length >= limits.shore)
      break;
    const mh = mountainHeight(up);
    const water = waterDepth(up);
    if (mh > 0.7 && mh < 1.25 && water < 0.05 && talus.length < limits.talus) {
      if (i % 3 === 0) talus.push({ up, scale: 0.34 + 0.07 * (i % 6), yaw: i * 1.7 });
      continue;
    }
    if (water > 0.02 && water < 0.12 && shore.length < limits.shore) {
      if (i % 2 === 0) shore.push({ up, scale: 0.14 + 0.025 * (i % 5), yaw: i * 2.3 });
      continue;
    }
    if (mh > 0.2 || water > 0.01 || edge.length >= limits.edge) continue;
    const path = pathDistance(up);
    if (path > 1.45 && path < 1.9 && !inWelcomeCourtyard(up) && buildingClearance(up) > 0.9)
      if (i % 2 === 0) edge.push({ up, scale: 0.26 + 0.03 * (i % 4), yaw: i * 0.9 });
  }
  const tasks = [
    instanceKit(
      ctx,
      root,
      "models/nature/athena-rock-set.glb",
      rocks.map((up, i) => ({ up, scale: 0.7 * (0.85 + (i % 7) * 0.045), yaw: i * 2.4 })),
    ),
    instanceKit(ctx, root, "models/nature/athena-rock-boulder.glb", talus),
    instanceKit(ctx, root, "models/nature/athena-rock-pebble.glb", edge, { shadows: false }),
    instanceKit(ctx, root, "models/nature/athena-rock-pebble.glb", shore, { shadows: false }),
  ];
  return Promise.all(tasks.map(optional));
}

/**
 * Three to seven floating islets beyond the cloud belt (`RADIUS + 16 .. 24` on the same
 * tilted ring as the cloud banks), each a rock with a grass cap, one tiny spire and a
 * waterfall thread. High tier only, purely visual. They bob very slowly; reduced motion
 * freezes them (the scene passes time 0).
 */
export async function createIslets(ctx: AthenaInstallContext, root: LegacyContext, low: boolean) {
  if (low) return { tick() {} };
  const s = ctx.scope;
  const model = await loadAthenaModel(ctx, "models/nature/athena-islet.glb");
  if (ctx.lifecycle.disposed) return { tick() {} };
  model.root.updateMatrixWorld(true);
  const group = new s.Group();
  group.name = "athena-floating-islets";
  const tilt = 0.42;
  const ring: { angle: number; reach: number; scale: number; yaw: number; lift: number }[] = [
    { angle: Math.PI - 0.52, reach: 21, scale: 1.7, yaw: 0.6, lift: 1.5 },
    { angle: Math.PI - 0.12, reach: 17, scale: 1.25, yaw: 2.1, lift: 3.2 },
    { angle: Math.PI + 0.36, reach: 23, scale: 2.1, yaw: 4.0, lift: 0.4 },
    { angle: 0.7, reach: 19, scale: 1.5, yaw: 1.2, lift: 2.0 },
    { angle: 2.0, reach: 24, scale: 2.3, yaw: 3.3, lift: -1.0 },
    { angle: 4.35, reach: 18, scale: 1.4, yaw: 5.2, lift: 2.6 },
  ];
  const parts: { batch: LegacyContext; matrices: LegacyContext[] }[] = [];
  const transform = new s.Object3D();
  const matrix = new s.Matrix4();
  model.root.traverse((part: LegacyContext) => {
    if (!part.isMesh || part.isSkinnedMesh) return;
    const batch = new s.InstancedMesh(part.geometry, part.material, ring.length);
    batch.name = `village-islet-${part.name}`;
    batch.castShadow = false;
    batch.receiveShadow = false;
    const matrices: LegacyContext[] = [];
    ring.forEach(({ angle, reach, scale, yaw, lift }, i) => {
      const v: Vec = [
        Math.cos(angle),
        Math.sin(angle) * Math.sin(tilt),
        Math.sin(angle) * Math.cos(tilt),
      ];
      const position = mul(v, RADIUS + reach);
      transform.position.set(position[0], position[1] + lift, position[2]);
      transform.rotation.set(0.12 * Math.sin(i * 1.7), yaw, 0.1 * Math.cos(i * 2.3));
      transform.scale.setScalar(scale);
      transform.updateMatrix();
      const placed = new s.Matrix4().multiplyMatrices(transform.matrix, part.matrixWorld);
      matrices.push(placed);
      batch.setMatrixAt(i, placed);
    });
    batch.instanceMatrix.needsUpdate = true;
    batch.computeBoundingSphere();
    batch.frustumCulled = false;
    group.add(batch);
    parts.push({ batch, matrices });
  });
  root.add(group);
  const bob = new s.Matrix4();
  return {
    tick(time: number) {
      group.rotation.y = time * 0.004;
      for (const { batch, matrices } of parts) {
        matrices.forEach((placed, i) => {
          bob.makeTranslation(0, Math.sin(time * 0.35 + i * 1.9) * 0.35, 0);
          matrix.multiplyMatrices(bob, placed);
          batch.setMatrixAt(i, matrix);
        });
        batch.instanceMatrix.needsUpdate = true;
      }
    },
  };
}
