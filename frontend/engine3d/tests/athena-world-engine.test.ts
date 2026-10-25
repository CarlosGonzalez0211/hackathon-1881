import assert from "node:assert/strict";
import test from "node:test";
import { celebrationModel } from "../src/athena/celebrations";
import { prefersReducedMotion, setReducedMotion } from "../src/athena/models";
import { STRUCTURAL_LEGACY, structuralReason } from "../src/assets/legacy-allowlist.mjs";

test("first-insight lights the insight lantern; other rewards use the star emote", () => {
  assert.equal(
    celebrationModel("achievement", "first-insight"),
    "models/props/athena-prop-insight-lantern.glb",
  );
  assert.equal(celebrationModel("achievement", "team-spark"), "slot:emote/star");
  assert.equal(celebrationModel("easter-egg"), "slot:emote/star");
});

test("the in-app reduced-motion toggle overrides the OS setting", () => {
  setReducedMotion(true);
  assert.equal(prefersReducedMotion(), true);
  setReducedMotion(false);
  assert.equal(prefersReducedMotion(), false);
  setReducedMotion(undefined);
});

test("only structural legacy files are allow-listed, each with a reason", () => {
  assert.ok(structuralReason("geometries/planets/present/hitmesh_3.drc"));
  assert.ok(structuralReason("geometries/planets/present/full-lod-2_7.drc"));
  assert.ok(structuralReason("geometries/npcs/present/fox/fox-bones.drc"));
  assert.ok(structuralReason("libs/draco/draco_decoder.wasm"));
  // Slots with a built Athena file must not hide behind the allow-list.
  assert.equal(structuralReason("audio/ui/click2.ogg"), undefined);
  assert.equal(structuralReason("images/lut.ktx2"), undefined);
  assert.equal(structuralReason("geometries/deliveries/note.drc"), undefined);
  assert.equal(structuralReason("geometries/emojis/3.drc"), undefined);
  assert.equal(structuralReason("fonts/heading.font"), undefined);
  for (const rule of STRUCTURAL_LEGACY) assert.ok(rule.reason.length > 10);
});
