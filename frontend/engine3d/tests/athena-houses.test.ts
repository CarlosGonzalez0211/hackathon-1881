import assert from "node:assert/strict";
import test from "node:test";
import { HOUSE_CROSSFADE, houseModelKey, houseSlotKey } from "../src/athena/houses";
import { findHouseSite, groundBelow } from "../src/world/house-sites";
import type { Raycast, Vec3 } from "../src/world/house-sites";

/**
 * A flat world near the north pole of a big planet: ground is the plane y = R (normals
 * +Y), so "up" ≈ +Y everywhere in the test area. Optional axis-aligned boxes are obstacles.
 */
const R = 1000;
interface Box {
  readonly min: Vec3;
  readonly max: Vec3;
}
function world(boxes: readonly Box[] = []): Raycast {
  return (origin, direction, far) => {
    const hits: { t: number; normal: Vec3 }[] = [];
    if (direction[1] < 0) {
      const t = (R - origin[1]) / direction[1];
      if (t >= 0) hits.push({ t, normal: [0, 1, 0] });
    }
    for (const box of boxes) {
      let t0 = 0;
      let t1 = far;
      let ok = true;
      for (let axis = 0; axis < 3 && ok; axis++) {
        const d = direction[axis]!;
        const o = origin[axis]!;
        if (Math.abs(d) < 1e-12) ok = o >= box.min[axis]! && o <= box.max[axis]!;
        else {
          let a = (box.min[axis]! - o) / d;
          let b = (box.max[axis]! - o) / d;
          if (a > b) [a, b] = [b, a];
          t0 = Math.max(t0, a);
          t1 = Math.min(t1, b);
          ok = t0 <= t1;
        }
      }
      if (ok) hits.push({ t: t0, normal: [0, 1, 0] });
    }
    const hit = hits.filter((h) => h.t <= far).sort((a, b) => a.t - b.t)[0];
    if (!hit) return undefined;
    return {
      point: origin.map((v, i) => v + direction[i]! * hit.t) as unknown as Vec3,
      normal: hit.normal,
      distance: hit.t,
    };
  };
}
const options = { halfWidth: 2, halfDepth: 1.6, height: 4.3, radii: [4, 6, 8], steps: 8 };
const anchor: Vec3 = [0, R, 0];

test("houses crossfade over --athena-motion-calm and use per-slot manifest keys", () => {
  assert.equal(HOUSE_CROSSFADE, 0.9);
  assert.equal(houseModelKey(3, "in_progress"), "slot:house/3/in_progress");
  assert.equal(houseSlotKey(5), "slot:house/5");
});

test("groundBelow finds the surface under a point", () => {
  const hit = groundBelow(world(), [3, R + 1, 2]);
  assert.ok(hit);
  assert.ok(Math.abs(hit.point[1] - R) < 1e-9);
});

test("an open plain yields a clear site on the first ring, door towards the anchor", () => {
  const site = findHouseSite(anchor, world(), options);
  assert.ok(site?.clear);
  assert.ok(Math.abs(site.distanceToAnchor - 4) < 1e-6);
  // forward points from the house back to the anchor
  const toAnchor = anchor.map((v, i) => v - site.position[i]!);
  const along = toAnchor.reduce((sum, v, i) => sum + v * site.forward[i]!, 0);
  assert.ok(along > 3.9);
});

test("obstacles push the house to a farther, clear ring", () => {
  // A wall ring between 3 and 5 m around the anchor blocks the inner rings.
  const walls: Box[] = [
    { min: [-5, R, -5], max: [5, R + 3, -3] },
    { min: [-5, R, 3], max: [5, R + 3, 5] },
    { min: [-5, R, -5], max: [-3, R + 3, 5] },
    { min: [3, R, -5], max: [5, R + 3, 5] },
  ];
  const site = findHouseSite(anchor, world(walls), options);
  assert.ok(site?.clear);
  assert.ok(site.distanceToAnchor >= 8 - 1e-6, `at ${site.distanceToAnchor}`);
});

test("a low rail through the footprint rejects the spot", () => {
  // 1 m tall rail crossing the 4 m ring on +X; the house moves elsewhere.
  const rail: Box = { min: [3.5, R, -3], max: [4.5, R + 1, 3] };
  const site = findHouseSite(anchor, world([rail]), { ...options, steps: 4 });
  assert.ok(site?.clear);
  assert.ok(site.position[0] < 3, `x = ${site.position[0]}`);
});

test("when nothing is clear the least obstructed spot is returned, flagged", () => {
  // 0.6 m pillars every 2.5 m (offset so the anchor stands between them): every footprint
  // contains one, but candidate centres fall between them. (Slimmer poles can slip between
  // the footprint rays; see house-sites.ts.)
  const pillars: Box[] = [];
  for (let x = -18.75; x <= 20; x += 2.5)
    for (let z = -18.75; z <= 20; z += 2.5)
      pillars.push({ min: [x - 0.3, R, z - 0.3], max: [x + 0.3, R + 3, z + 0.3] });
  const site = findHouseSite(anchor, world(pillars), options);
  assert.ok(site);
  assert.equal(site.clear, false);
});
