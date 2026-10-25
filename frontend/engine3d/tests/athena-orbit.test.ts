import assert from "node:assert/strict";
import test from "node:test";
import type { PlanetState } from "@athena/shared";
import { demonstratedTopics, planetSlot } from "../src/athena/orbit";
import {
  crowdScale,
  orbitExtent,
  orbitLayout,
  orbitRings,
  orbitSlot,
  planetKinds,
  planetScale,
} from "../src/config/orbit";

test("small classes get one ring each; from five, two students share a ring", () => {
  assert.deepEqual(orbitRings(3), { rings: 3, perRing: 1 });
  assert.deepEqual(orbitRings(8), { rings: 4, perRing: 2 });
  assert.deepEqual(orbitRings(12), { rings: 6, perRing: 2 });
  assert.deepEqual(orbitRings(30), { rings: 8, perRing: 4 });
  const slots = Array.from({ length: 8 }, (_, index) => orbitSlot(index, 8));
  assert.equal(new Set(slots.map((slot) => slot.radius)).size, 4);
  assert.equal(slots[0]!.radius, orbitLayout.baseRadius);
  assert.ok(
    Math.abs(orbitExtent(8) - (orbitLayout.baseRadius + 3 * orbitLayout.radiusStep)) < 1e-9,
  );
  // Students sharing a ring ride the same path on opposite sides.
  const [first, partner] = [slots[0]!, slots[4]!];
  assert.equal(first.ring, partner.ring);
  assert.equal(first.tilt, partner.tilt);
  assert.equal(first.height, partner.height);
  assert.ok(Math.abs(partner.phase - first.phase - Math.PI) < 1e-9);
  // Deterministic: the same roster always draws the same sky.
  assert.deepEqual(orbitSlot(3, 8), orbitSlot(3, 8));
});

test("rings stay wider apart than the largest planets, at any class size", () => {
  for (const count of [1, 4, 8, 12, 20, 30]) {
    const crowd = crowdScale(count);
    assert.ok(crowd >= 0.7 && crowd <= 1);
    // Planet models are unit-radius at scale 1: diameter = 2 × scale.
    assert.ok(orbitLayout.radiusStep > 2 * orbitLayout.scaleMax * crowd);
    const slots = Array.from({ length: count }, (_, index) => orbitSlot(index, count));
    assert.ok(slots.every((slot) => slot.radius <= orbitExtent(count) + 1e-9));
  }
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
