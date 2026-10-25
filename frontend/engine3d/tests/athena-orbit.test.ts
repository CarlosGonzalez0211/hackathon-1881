import assert from "node:assert/strict";
import test from "node:test";
import type { PlanetState } from "@athena/shared";
import { demonstratedTopics, planetSlot } from "../src/athena/orbit";
import { orbitLayout, orbitSlot, planetKinds, planetScale } from "../src/config/orbit";

test("every student gets their own orbit radius, tilt, height and phase", () => {
  const slots = Array.from({ length: 8 }, (_, index) => orbitSlot(index));
  assert.equal(new Set(slots.map((slot) => slot.radius)).size, 8);
  assert.equal(slots[0]!.radius, 2);
  assert.ok(Math.abs(slots[7]!.radius - (2 + 7 * 1.15)) < 1e-9);
  assert.deepEqual(
    slots.map((slot) => slot.tilt),
    [...orbitLayout.tilts],
  );
  // Deterministic: the same class order always draws the same sky.
  assert.deepEqual(orbitSlot(3), orbitSlot(3));
});

test("planets grow with demonstrated topics only, within bounds", () => {
  assert.equal(planetScale(0), orbitLayout.scaleBase);
  assert.ok(planetScale(3) > planetScale(1));
  assert.equal(planetScale(100), orbitLayout.scaleMax);
  assert.equal(planetScale(-2), orbitLayout.scaleBase);
  const state = {
    houses: [
      { status: "done" },
      { status: "in_progress" },
      { status: "done" },
      { status: "locked" },
    ],
  } as unknown as PlanetState;
  assert.equal(demonstratedTopics(state), 2);
});

test("planet kinds map to kit slots, earth by default", () => {
  assert.equal(orbitLayout.defaultKind, "earth");
  assert.equal(planetSlot("ringed"), "slot:planet/ringed");
  assert.equal(planetKinds.length, 8);
});
