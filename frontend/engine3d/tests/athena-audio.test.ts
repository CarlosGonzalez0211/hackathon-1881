import assert from "node:assert/strict";
import test from "node:test";
import { legacyBirds } from "../src/athena/fauna";
import { deliverySlot, isEmojiMesh } from "../src/athena/legacy-slots";
import { athenaAudioMap, audioBusOf, audioDefinition } from "../src/config/audio";

test("every legacy audio slot maps to an Athena WAV from the kit manifest", () => {
  const keys = Object.keys(athenaAudioMap);
  assert.ok(keys.length >= 50, `${keys.length} audio slots`);
  for (const [legacy, athena] of Object.entries(athenaAudioMap)) {
    assert.match(legacy, /^audio\//);
    assert.match(athena, /^audio\/.+\.wav$/, legacy);
  }
  assert.equal(athenaAudioMap["audio/ui/click2"], "audio/ui/click-a.wav");
  // The single warm chime for demonstrated understanding (brand guide 07).
  assert.equal(audioDefinition.athena.understandingShown, "audio/ui/understanding-shown.wav");
});

test("music and the ambient bed share the music bus; the rest are effects", () => {
  assert.equal(audioBusOf("bgmusic"), "music");
  assert.equal(audioBusOf("ambiance-forest"), "music");
  assert.equal(audioBusOf("footsteps"), "effects");
  assert.equal(audioBusOf("quest-complete"), "effects");
  assert.equal(audioDefinition.autoplay, false);
});

test("delivery and emoji slots are recognised", () => {
  assert.equal(deliverySlot("deliveries/note.drc"), "geometries/deliveries/note");
  assert.equal(deliverySlot("npcs/present/fox/fox.drc"), undefined);
  assert.equal(isEmojiMesh("emojis/3.drc"), true);
  assert.equal(isEmojiMesh("emojis/base.drc"), false);
  assert.ok(legacyBirds["birds/1.drc"]!.span > legacyBirds["birds/2.drc"]!.span);
});
