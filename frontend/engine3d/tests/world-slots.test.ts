import assert from "node:assert/strict";
import test from "node:test";
import { WORLD_HOUSE_SLOT_COUNT } from "@athena/shared";
import { houseInteractionAnchors } from "../src/config/world";

test("the engine has exactly one anchor per World house slot, numbered 0..n-1", () => {
  assert.equal(houseInteractionAnchors.length, WORLD_HOUSE_SLOT_COUNT);
  assert.deepEqual(
    houseInteractionAnchors.map((anchor) => anchor.interaction?.slot),
    Array.from({ length: WORLD_HOUSE_SLOT_COUNT }, (_, slot) => slot),
  );
});
