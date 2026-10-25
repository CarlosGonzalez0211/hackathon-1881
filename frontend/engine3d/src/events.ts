import type { PlanetState } from "@athena/shared";

/**
 * Engine <-> React boundary (PROPOSAL, see docs/contracts/world-api.md).
 *
 * The engine speaks in slots and ids only: it never knows what a topic means, never fetches
 * data and never decides whether a house can be entered. React (features/world) maps slots
 * to houses, applies the gate and talks to the API.
 */
export type EngineEvent =
  /** The avatar entered (slot) or left (null) a house's interaction radius. */
  | { type: "house_focus"; slot: number | null }
  /** E / Enter near a house, or a click on its marker. */
  | { type: "house_activate"; slot: number }
  /** A status crossfade finished (athena/houses.ts). Lets React time the 2D toast. */
  | { type: "house_transition_played"; slot: number }
  /** Pending: talking to an NPC (Lumen hints go through Learning's /learning/hint). */
  | { type: "npc_activate"; npcId: string }
  /** Pending: the avatar reached an Easter egg anchor (`EasterEgg.locationId`). */
  | { type: "anchor_discovered"; locationId: string };

export type EngineEventListener = (event: EngineEvent) => void;

/**
 * Commands React sends. `update` exists today (SurfaceHandle); the house models already
 * crossfade on status changes from it. `focusHouse` is a request to the engine owner.
 */
export interface EngineCommands {
  update(state: PlanetState): void;
  setPaused(paused: boolean): void;
  setMuted(muted: boolean): void;
  /** Pending: turn the camera / point Lumen at a house ("Ir a esa casa"). */
  focusHouse?(slot: number): void;
}
