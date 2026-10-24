import assert from "node:assert/strict";
import test from "node:test";
import { baseCentre, fitToBounds, isAthenaDebug } from "../src/placement/athena-placement";

const box = (min: [number, number, number], max: [number, number, number]) => ({
  min: { x: min[0], y: min[1], z: min[2] },
  max: { x: max[0], y: max[1], z: max[2] },
});
const close = (actual: readonly number[], expected: readonly number[]) =>
  actual.forEach((value, index) =>
    assert.ok(Math.abs(value - expected[index]!) < 1e-9, `${actual} ≈ ${expected}`),
  );

test("fitToBounds scales to the legacy height and lands the base centre on the legacy one", () => {
  // Athena model: 2 m tall, base-centre pivot at the origin.
  const athena = box([-0.5, 0, -0.5], [0.5, 2, 0.5]);
  // Legacy slot: 3 units tall, base centre at (10, 4, -2).
  const legacy = box([9, 4, -3], [11, 7, -1]);
  const fit = fitToBounds(legacy, athena);
  assert.equal(fit.scale, 1.5);
  close(fit.offset, [10, 4, -2]);
  assert.equal(fit.rotationY, 0);
});

test("fitToBounds compensates an off-centre Athena pivot", () => {
  const athena = box([1, 1, 1], [3, 2, 3]); // base centre (2, 1, 2), height 1
  const legacy = box([0, 0, 0], [2, 2, 2]); // base centre (1, 0, 1), height 2
  const fit = fitToBounds(legacy, athena);
  assert.equal(fit.scale, 2);
  close(fit.offset, [1 - 2 * 2, 0 - 1 * 2, 1 - 2 * 2]);
  // The fitted Athena base centre equals the legacy base centre.
  close(
    baseCentre(athena).map((value, index) => value * fit.scale + fit.offset[index]!),
    baseCentre(legacy),
  );
});

test("fitToBounds applies overrides and survives degenerate boxes", () => {
  const athena = box([-1, 0, -1], [1, 2, 1]);
  const legacy = box([-1, 0, -1], [1, 4, 1]);
  const fit = fitToBounds(legacy, athena, { scale: 0.5, offset: [0, 0.25, 1], rotationY: Math.PI });
  assert.equal(fit.scale, 1);
  close(fit.offset, [0, 0.25, 1]);
  assert.equal(fit.rotationY, Math.PI);
  // Flat Athena geometry (e.g. a decal) or empty legacy bounds keep scale 1.
  assert.equal(fitToBounds(legacy, box([0, 0, 0], [1, 0, 1])).scale, 1);
  assert.equal(fitToBounds(box([0, 0, 0], [0, 0, 0]), athena).scale, 1);
  const empty = {
    min: { x: Infinity, y: Infinity, z: Infinity },
    max: { x: -Infinity, y: -Infinity, z: -Infinity },
  };
  assert.equal(fitToBounds(empty, athena).scale, 1);
});

test("athenaDebug URL flags are parsed as a comma list", () => {
  assert.equal(isAthenaDebug("bounds", "?athenaDebug=bounds"), true);
  assert.equal(isAthenaDebug("bounds", "?x=1&athenaDebug=toon,bounds"), true);
  assert.equal(isAthenaDebug("bounds", "?athenaDebug=toon"), false);
  assert.equal(isAthenaDebug("bounds", ""), false);
});
