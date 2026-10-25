import assert from "node:assert/strict";
import test from "node:test";
import { canopiesOf, foliageKind, FOLIAGE_DISTANCE } from "../src/athena/foliage";

const attribute = (values: number[][]) => ({
  count: values.length,
  getX: (i: number) => values[i]![0]!,
  getY: (i: number) => values[i]![1]!,
  getZ: (i: number) => values[i]![2]!,
});

test("leaf vertices group into one canopy per centr_tree", () => {
  const positions = [
    [0, 30, 0],
    [1, 31, 0],
    [10, 30, 0],
    [10.4, 30.3, 0.2],
  ];
  const centres = [
    [0.5, 30.5, 0],
    [0.5, 30.5, 0],
    [10.2, 30.1, 0],
    [10.2, 30.1, 0],
  ];
  const canopies = canopiesOf([
    { attributes: { position: attribute(positions), centr_tree: attribute(centres) } },
  ]);
  assert.equal(canopies.length, 2);
  const big = canopies.find((c) => c.size[0] > 0.9)!;
  assert.deepEqual(big.centre, [0.5, 30.5, 0]);
});

test("foliage kind follows canopy size and shape", () => {
  assert.equal(foliageKind({ centre: [0, 0, 0], size: [0.4, 0.5, 0.3], height: 0.5 }), "bush");
  assert.equal(foliageKind({ centre: [0, 0, 0], size: [3, 2.6, 3.5], height: 2.7 }), "round");
  assert.equal(foliageKind({ centre: [0, 0, 0], size: [1.5, 3.2, 1.4], height: 3 }), "spire");
  assert.equal(FOLIAGE_DISTANCE, 35);
});
