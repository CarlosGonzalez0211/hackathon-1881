import assert from "node:assert/strict";
import test from "node:test";
import {
  applyFit,
  baseCentre,
  fitToBounds,
  isAthenaDebug,
  MIN_OVERRIDE_SCALE,
} from "../src/placement/athena-placement";

const box = (min: [number, number, number], max: [number, number, number]) => ({
  min: { x: min[0], y: min[1], z: min[2] },
  max: { x: max[0], y: max[1], z: max[2] },
});
const EMPTY = {
  min: { x: Infinity, y: Infinity, z: Infinity },
  max: { x: -Infinity, y: -Infinity, z: -Infinity },
};

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
  assert.equal(fitToBounds(EMPTY, athena).scale, 1);
});

test("fitToBounds keeps finite offsets for empty or non-finite boxes", () => {
  const athena = box([-1, 0, -1], [1, 2, 1]);
  const legacy = box([9, 4, -3], [11, 7, -1]);
  // Empty legacy box: nothing finite to anchor to -> origin, scale 1.
  let fit = fitToBounds(EMPTY, athena);
  assert.equal(fit.scale, 1);
  assert.deepEqual(fit.offset, [0, 0, 0]);
  // Empty Athena box (e.g. no meshes): anchor at the finite legacy base centre.
  fit = fitToBounds(legacy, EMPTY);
  assert.equal(fit.scale, 1);
  close(fit.offset, [10, 4, -2]);
  // NaN corners and an override offset.
  const nan = box([NaN, 0, 0], [1, 1, 1]);
  fit = fitToBounds(nan, athena, { offset: [1, 2, 3] });
  assert.equal(fit.scale, 1);
  close(fit.offset, [1, 2, 3]);
  fit = fitToBounds(legacy, nan, { scale: 2 });
  assert.equal(fit.scale, 2);
  close(fit.offset, [10, 4, -2]);
  for (const result of [fitToBounds(EMPTY, EMPTY), fitToBounds(nan, nan)])
    assert.ok(result.offset.every(Number.isFinite) && Number.isFinite(result.scale));
});

test("fitToBounds clamps override scales to a positive value", () => {
  const athena = box([-1, 0, -1], [1, 2, 1]);
  const legacy = box([-1, 0, -1], [1, 4, 1]);
  assert.equal(fitToBounds(legacy, athena, { scale: -0.5 }).scale, 1);
  assert.equal(fitToBounds(legacy, athena, { scale: 0 }).scale, 2 * MIN_OVERRIDE_SCALE);
  assert.equal(fitToBounds(legacy, athena, { scale: NaN }).scale, 2);
});

test("fitToBounds accounts for rotation about the base pivot", () => {
  // Off-centre Athena base (2, 1, 0), same height as the legacy slot.
  const athena = box([1, 1, -1], [3, 2, 1]);
  const legacy = box([4, 0, 4], [6, 1, 6]); // base centre (5, 0, 5)
  for (const rotationY of [0, Math.PI / 2, Math.PI, 1.234]) {
    const fit = fitToBounds(legacy, athena, { rotationY });
    // Transform the Athena base centre exactly like Object3D (scale, rotate Y, translate).
    const [x, y, z] = baseCentre(athena).map((value) => value * fit.scale) as [
      number,
      number,
      number,
    ];
    const cos = Math.cos(rotationY);
    const sin = Math.sin(rotationY);
    close(
      [x * cos + z * sin + fit.offset[0], y + fit.offset[1], -x * sin + z * cos + fit.offset[2]],
      baseCentre(legacy),
    );
  }
});

test("applyFit is absolute and idempotent", () => {
  const calls: string[] = [];
  const object = {
    scale: { value: 3, setScalar: (value: number) => (object.scale.value = value) },
    position: {
      value: [9, 9, 9] as number[],
      set: (...value: number[]) => (object.position.value = value),
    },
    rotation: { x: 0.1, y: 5, z: 0.2 },
    updateMatrixWorld: () => calls.push("update"),
  };
  const fit = fitToBounds(box([4, 0, 4], [6, 1, 6]), box([1, 1, -1], [3, 2, 1]), {
    rotationY: Math.PI / 2,
  });
  applyFit(object, fit);
  const once = JSON.stringify(object);
  applyFit(object, fit);
  assert.equal(JSON.stringify(object), once);
  assert.equal(object.rotation.y, Math.PI / 2);
  assert.equal(object.rotation.x, 0.1);
  assert.equal(object.scale.value, fit.scale);
  assert.deepEqual(object.position.value, [...fit.offset]);
  assert.equal(calls.length, 2);
});

test("athenaDebug URL flags are parsed as a comma list", () => {
  assert.equal(isAthenaDebug("bounds", "?athenaDebug=bounds"), true);
  assert.equal(isAthenaDebug("bounds", "?x=1&athenaDebug=toon,bounds"), true);
  assert.equal(isAthenaDebug("bounds", "?athenaDebug=toon"), false);
  assert.equal(isAthenaDebug("bounds", ""), false);
});
