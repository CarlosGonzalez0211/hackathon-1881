import { arcDistance, doorDirection, plots, type Vec } from "./layout";

type Target = { kind: "house"; slot: number } | { kind: "npc"; id: string };

/** Topic entrances have priority over nearby guides, including Lumen at the door. */
export function interactionTarget(
  up: Vec,
  houses: readonly { slot: number }[],
  actors: readonly { id: string; up: Vec }[],
): Target | undefined {
  let best = 2.6;
  let target: Target | undefined;
  for (const house of houses) {
    if (!plots[house.slot]) continue;
    const distance = arcDistance(up, doorDirection(house.slot));
    if (distance < best) {
      best = distance;
      target = { kind: "house", slot: house.slot };
    }
  }
  if (target) return target;
  for (const actor of actors) {
    const distance = arcDistance(up, actor.up);
    if (distance < best) {
      best = distance;
      target = { kind: "npc", id: actor.id };
    }
  }
  return target;
}
