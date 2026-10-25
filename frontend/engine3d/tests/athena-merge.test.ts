import assert from "node:assert/strict";
import test from "node:test";
import { avatarOutfitSources } from "../src/assets/athena-keys.mjs";
import { animatedNodeNames, isPlainMaterial, materialKey } from "../src/athena/merge";

const color = (hex: string) => ({
  getHexString: () => hex,
  r: Number.parseInt(hex.slice(0, 2), 16) / 255,
  g: Number.parseInt(hex.slice(2, 4), 16) / 255,
  b: Number.parseInt(hex.slice(4, 6), 16) / 255,
});
const standard = (extra: Record<string, unknown> = {}) => ({
  type: "MeshStandardMaterial",
  name: "wall_f4e9d8",
  color: color("f4e9d8"),
  emissive: color("000000"),
  emissiveIntensity: 1,
  opacity: 1,
  transparent: false,
  side: 0,
  ...extra,
});

test("animated node names come from clip track targets", () => {
  const names = animatedNodeNames([
    { tracks: [{ name: "hip.quaternion" }, { name: "body.position" }] },
    { tracks: [{ name: "symbol.scale" }, { name: "hip.quaternion" }] },
  ]);
  assert.deepEqual([...names].sort(), ["body", "hip", "symbol"]);
});

test("plain materials (flat, opaque, unlit-by-glow) can become vertex colours", () => {
  assert.equal(isPlainMaterial(standard()), true);
  assert.equal(isPlainMaterial(standard({ transparent: true, opacity: 0.4 })), false);
  assert.equal(isPlainMaterial(standard({ side: 2 })), false);
  assert.equal(isPlainMaterial(standard({ map: {} })), false);
  assert.equal(isPlainMaterial(standard({ emissive: color("f2c36b") })), false);
  assert.equal(isPlainMaterial({ type: "ShaderMaterial" }), false);
});

test("material keys separate looks that would render differently", () => {
  assert.equal(materialKey(standard()), materialKey(standard()));
  assert.notEqual(materialKey(standard()), materialKey(standard({ color: color("2f7d7a") })));
  assert.notEqual(materialKey(standard()), materialKey(standard({ transparent: true })));
  assert.equal(materialKey(undefined), undefined);
});

test("the build's first-load budget and the runtime load the same outfit files", () => {
  assert.deepEqual(avatarOutfitSources(), [
    "models/avatar/athena-avatar-hair-bob.glb",
    "models/avatar/athena-avatar-top-poncho.glb",
    "models/avatar/athena-avatar-bottom-trousers.glb",
    "models/avatar/athena-avatar-shoes-boots.glb",
    "models/avatar/athena-avatar-acc-scarf-satchel.glb",
  ]);
});
