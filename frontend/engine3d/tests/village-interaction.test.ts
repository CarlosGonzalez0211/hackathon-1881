import assert from "node:assert/strict";
import test from "node:test";
import { interactionTarget } from "../src/village/interaction";
import { advance, doorDirection, plots } from "../src/village/layout";

test("topic entrances win even when an NPC is closer than the building", () => {
  for (const plot of plots) {
    const up = advance(doorDirection(plot.slot), plot.forward, 2).up;
    assert.deepEqual(interactionTarget(up, [{ slot: plot.slot }], [{ id: "lumen", up }]), {
      kind: "house",
      slot: plot.slot,
    });
  }
});
test("NPCs remain interactive outside the doorway reach and nearest NPC wins", () => {
  const plot = plots[0]!;
  const up = advance(doorDirection(0), plot.forward, 3).up;
  assert.deepEqual(
    interactionTarget(
      up,
      [{ slot: 0 }],
      [
        { id: "elena", up: advance(up, plot.forward, 2).up },
        { id: "lumen", up },
      ],
    ),
    { kind: "npc", id: "lumen" },
  );
});
test("distant buildings and NPCs cannot be activated", () => {
  const plot = plots[0]!;
  const up = advance(doorDirection(0), plot.forward, 3).up;
  assert.equal(
    interactionTarget(up, [{ slot: 0 }, { slot: 99 }], [{ id: "lumen", up: doorDirection(0) }]),
    undefined,
  );
});
