import assert from "node:assert/strict";
import test from "node:test";
import { avatarOutfitSources } from "../src/assets/athena-keys.mjs";
import {
  animatedNodeNames,
  isPlainMaterial,
  materialKey,
  mergeStaticMeshes,
} from "../src/athena/merge";
import { graphics } from "./helpers/recovered-graphics";
import type { LegacyContext } from "../src/runtime/legacy-context";

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

function cardQuad(s: LegacyContext, center: number[], wind: number) {
  const geometry = new s.BufferGeometry();
  geometry.setAttribute(
    "position",
    new s.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0], 3),
  );
  geometry.setAttribute("uv", new s.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  geometry.setAttribute(
    "_athena_center",
    new s.Float32BufferAttribute(Array(4).fill(center).flat(), 3),
  );
  geometry.setAttribute(
    "aCardNormal",
    new s.Float32BufferAttribute(Array(4).fill([0, 0, 1]).flat(), 3),
  );
  geometry.setAttribute(
    "_athena_wind",
    new s.Float32BufferAttribute(Array(4).fill([wind, 0.5]).flat(), 2),
  );
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  return geometry;
}

test("merged alpha cards keep their pivots, shading normals and wind data in the merged space", async () => {
  const s = await graphics();
  for (const maps of [{ map: new s.Texture() }, { alphaMap: new s.Texture() }]) {
    const material = new s.MeshStandardMaterial({ name: "leaf_card", side: s.DoubleSide, ...maps });
    const root = new s.Group();
    const a = new s.Mesh(cardQuad(s, [0, 0.5, 0], 0.25), material),
      b = new s.Mesh(cardQuad(s, [0.5, 0, 0], 0.75), material);
    a.position.set(1, 0, 0);
    b.position.set(0, 2, 0);
    b.rotation.y = Math.PI / 2;
    root.add(a, b);
    assert.equal(mergeStaticMeshes(s, root), 2);
    const merged = root.children.find((child: LegacyContext) => child.name === "leaf_card__merged");
    assert.ok(merged, "the two cards merged into one draw call");
    const attributes = merged.geometry.attributes;
    assert.ok(attributes.uv, "uv survives for map or alphaMap alike");
    assert.ok(attributes._athena_center, "_athena_center is kept");
    assert.ok(attributes.aCardNormal, "aCardNormal is kept");
    assert.equal(attributes._athena_wind.itemSize, 2);
    assert.equal(attributes._athena_center.count, 8);
    const point = (attribute: LegacyContext, i: number) => [
      attribute.getX(i),
      attribute.getY(i),
      attribute.getZ(i),
    ];
    const close = (actual: number[], expected: number[]) =>
      expected.forEach((e, k) =>
        assert.ok(Math.abs(actual[k]! - e) < 1e-5, `${actual} vs ${expected}`),
      );
    // The pivot moved with its card: translated for the first, rotated and lifted for the second.
    close(point(attributes._athena_center, 0), [1, 0.5, 0]);
    close(point(attributes._athena_center, 4), [0, 2, -0.5]);
    // Shading normals are directions: rotated only, still unit length.
    close(point(attributes.aCardNormal, 0), [0, 0, 1]);
    close(point(attributes.aCardNormal, 4), [1, 0, 0]);
    assert.equal(attributes._athena_wind.getX(0), 0.25);
    assert.equal(attributes._athena_wind.getX(4), 0.75);
  }
});

test("cards that differ only by their alpha map get different material keys", async () => {
  const s = await graphics();
  const one = new s.MeshStandardMaterial({ name: "card", alphaMap: new s.Texture() });
  const other = new s.MeshStandardMaterial({ name: "card", alphaMap: new s.Texture() });
  assert.notEqual(materialKey(one), materialKey(other));
  assert.equal(materialKey(one), materialKey(one));
});
