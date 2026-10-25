import assert from "node:assert/strict";
import test from "node:test";
import type { PlanetState } from "@athena/shared";
import { nextAvailableHouse, npcClipFor } from "../src/athena/npcs";

const all = () => true;
const base = { talking: false, distanceToPlayer: 10, talkDistance: 2.5, followsCurve: false };

test("NPCs idle by default and talk during dialogue or when the player is close", () => {
  assert.equal(npcClipFor(base, all), "idle");
  assert.equal(npcClipFor({ ...base, talking: true }, all), "talk");
  assert.equal(npcClipFor({ ...base, distanceToPlayer: 2 }, all), "talk");
});

test("curve walkers walk; animals without a clip fall back to idle", () => {
  assert.equal(npcClipFor({ ...base, followsCurve: true }, all), "walk");
  const animal = (clip: string) => clip === "idle" || clip === "talk";
  assert.equal(npcClipFor({ ...base, followsCurve: true }, animal), "idle");
  assert.equal(npcClipFor({ ...base, talking: true }, animal), "talk");
});

const house = (slot: number, status: PlanetState["houses"][number]["status"]) => ({
  topicId: `topic-${slot}`,
  title: `Topic ${slot}`,
  slot,
  status,
  progress: 0,
  demonstratedConcepts: 0,
  totalConcepts: 1,
});
const planet = (houses: ReturnType<typeof house>[]) =>
  ({ studentId: "s", growth: 0, stage: 0, houses }) as unknown as PlanetState;

test("Lumen waits by the lowest-slot available house, else the in-progress one", () => {
  const state = planet([house(3, "available"), house(0, "done"), house(2, "available")]);
  assert.equal(nextAvailableHouse(state)?.slot, 2);
  assert.equal(nextAvailableHouse(planet([house(1, "in_progress"), house(0, "done")]))?.slot, 1);
  assert.equal(nextAvailableHouse(planet([house(0, "done"), house(1, "locked")])), undefined);
  assert.equal(nextAvailableHouse(undefined), undefined);
});
