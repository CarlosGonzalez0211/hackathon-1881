import assert from "node:assert/strict";
import test from "node:test";
import { houseModelFile, houseModelVariantCount } from "../src/tokens";

test("houseModelFile wraps variants and treats non-finite ones as 0", () => {
  assert.equal(houseModelFile("done", 0), "athena-house-done-v0.glb");
  assert.equal(houseModelFile("done", houseModelVariantCount + 1), "athena-house-done-v1.glb");
  assert.equal(
    houseModelFile("locked", -1),
    `athena-house-locked-v${houseModelVariantCount - 1}.glb`,
  );
  assert.equal(houseModelFile("available", 2.9), "athena-house-available-v2.glb");
  for (const variant of [NaN, Infinity, -Infinity])
    assert.equal(houseModelFile("done", variant), "athena-house-done-v0.glb", String(variant));
});
