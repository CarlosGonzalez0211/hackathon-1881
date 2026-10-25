import { arcDistance, doorDirection, plots, type Vec } from "./layout";

type Target = { kind: "house"; slot: number } | { kind: "npc"; id: string };

const DOOR_REACH = 2.6;
const NPC_REACH = 2.9;

/**
 * The nearest thing within reach wins, so neighbours standing near a doorway stay
 * talkable. Lumen is the exception: it waits beside the next topic's door and must never
 * hide that entrance, so a door in reach always beats Lumen.
 */
export function interactionTarget(
  up: Vec,
  houses: readonly { slot: number }[],
  actors: readonly { id: string; up: Vec }[],
): Target | undefined {
  let door: { slot: number; distance: number } | undefined;
  for (const house of houses) {
    if (!plots[house.slot]) continue;
    const distance = arcDistance(up, doorDirection(house.slot));
    if (distance < DOOR_REACH && (!door || distance < door.distance))
      door = { slot: house.slot, distance };
  }
  let npc: { id: string; distance: number } | undefined;
  for (const actor of actors) {
    const distance = arcDistance(up, actor.up);
    if (distance < NPC_REACH && (!npc || distance < npc.distance)) npc = { id: actor.id, distance };
  }
  if (door && (!npc || npc.id === "lumen" || door.distance <= npc.distance))
    return { kind: "house", slot: door.slot };
  return npc ? { kind: "npc", id: npc.id } : undefined;
}
