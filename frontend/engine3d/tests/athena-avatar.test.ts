import assert from "node:assert/strict";
import test from "node:test";
import { avatarClipFor, effectiveWeights, outfitKeys } from "../src/athena/avatar";
import { athenaAvatarClips, athenaAvatarOutfit } from "../src/config/characters";

// Legacy weight order: idle, run, sprint, air, afk1, afk2, afk3.
const weights = (values: Partial<Record<number, number>>) =>
  Array.from({ length: 7 }, (_, index) => values[index] ?? 0);

test("legacy weight layers map to Athena clip names", () => {
  assert.deepEqual(
    [...athenaAvatarClips],
    ["idle", "run", "sprint", "air", "afk1_lookaround", "afk2_stretch", "afk3_sit"],
  );
});

test("the dominant locomotion layer picks the clip", () => {
  assert.equal(avatarClipFor(weights({ 0: 1 }), 0), "idle");
  assert.equal(avatarClipFor(weights({ 0: 0.2, 1: 0.8 }), 0.07), "run");
  assert.equal(avatarClipFor(weights({ 1: 0.3, 2: 0.7 }), 0.1), "sprint");
});

test("slow running reads as walking", () => {
  assert.equal(avatarClipFor(weights({ 1: 1 }), 0.01), "walk");
});

test("air and afk layers mask the locomotion below them", () => {
  assert.equal(avatarClipFor(weights({ 1: 0.9, 3: 0.6 }), 0.07), "air");
  assert.equal(avatarClipFor(weights({ 0: 1, 5: 0.7 }), 0), "afk2_stretch");
  const effective = effectiveWeights(weights({ 0: 1, 4: 1 }));
  assert.equal(effective[0], 0);
  assert.equal(effective[4], 1);
});

test("the developer outfit resolves to part GLBs, accessory included", () => {
  assert.deepEqual(outfitKeys(), [
    "models/avatar/athena-avatar-hair-bob.glb",
    "models/avatar/athena-avatar-top-poncho.glb",
    "models/avatar/athena-avatar-bottom-shorts.glb",
    "models/avatar/athena-avatar-shoes-boots.glb",
    "models/avatar/athena-avatar-acc-scarf-satchel.glb",
  ]);
  assert.equal(athenaAvatarOutfit.hair, "bob");
});
