// Deterministic camera shots for the render review (docs/art/ART_DIRECTION.md section 9).
// Plain JS shared by the surface engine (`?shot=<id>`, see surface.ts) and the Node harness
// (`scripts/render-review.mjs`), so ids and poses never drift. Types: `shots.d.mts`.
//
// A shot places the student and the camera, nothing else:
// - `up`      where the student stands: `[lon, lat]`, `{ door, back }` (that many metres in
//             front of the door of a house slot) or `{ npc }` (2.2 m in front of that actor,
//             resolved at runtime because NPCs settle themselves around obstacles).
// - `heading` a `[lon, lat]` point the student faces. Door shots face their house and NPC
//             shots face the actor by default; otherwise it falls back to the arrival facing.
// - `eye` / `look` camera and look-at offsets in metres along (side, up, ahead) measured from
//             the student's feet: side is the student's right, ahead its facing.
// - `fov`, `overview`, `time` (frozen clock in seconds, default 0) and `houses` (status
//             overrides per slot; the rest keep the session state).

// Same curve as `mainLatitude` in layout.ts (the shared main loop); layout is TypeScript so
// it cannot be imported here.
const mainLatitude = (lon) => 0.1 * Math.sin(lon * 3) + 0.04 * Math.sin(lon * 7);

// Default chase camera of the live game (surface.ts): 1.35 m up, 3.9 m behind, looking 6 m ahead.
const CHASE = { eye: [0, 1.35, -3.9], look: [0, 1.15, 6] };
// Standing in front of a house door: wider and higher so the whole facade and roof read.
const FACADE = { eye: [-2.6, 1.8, -2.4], look: [0, 2.8, 8.2] };

/** @type {readonly import("./shots.d.mts").Shot[]} */
export const SHOTS = Object.freeze([
  {
    // spawnDirection, facing the welcome plaza (welcomeCenter)
    id: "plaza-arrival",
    up: [-0.18, mainLatitude(-0.18)],
    heading: [-0.35, mainLatitude(-0.35)],
    ...CHASE,
  },
  { id: "house-locked", up: { door: 3, back: 3.2 }, ...FACADE, houses: { 3: "locked" } },
  { id: "house-available", up: { door: 1, back: 3.2 }, ...FACADE, houses: { 1: "available" } },
  { id: "house-in-progress", up: { door: 2, back: 3.2 }, ...FACADE, houses: { 2: "in_progress" } },
  { id: "house-done", up: { door: 0, back: 3.2 }, ...FACADE, houses: { 0: "done" }, time: 0.6 },
  {
    // on the path at the edge of the densest grove (groves[2] in scene.ts: ~30 trees within 7 m
    // and no building in sight; groves[3], west of the plaza, is mostly a house and a path)
    id: "grove",
    up: [1.58, -0.93],
    heading: [2, -0.7],
    eye: [0, 1.9, -3.6],
    look: [0, 2.2, 6],
  },
  {
    // shore of lakes[0] with its crystal cluster, looking over the water
    id: "lake-crystals",
    up: [-0.9, -1.04],
    heading: [-0.85, -0.75],
    eye: [0, 1.5, -3.6],
    look: [0, 1.0, 6],
  },
  {
    // bridges[0] (the river crossing on the plaza meridian), 5.5 m before the deck
    id: "bridge",
    up: [-0.3, 0.847 - 5.5 / 22],
    heading: [-0.3, 0.847],
    eye: [0, 1.5, -3.6],
    look: [0, 0.8, 6],
  },
  {
    // mountains[4], from the meadow at its foot. mountains[1] (the brief's pick) sits behind
    // the river, the greenhouse and a dense forest and never reads from the main loop.
    id: "mountain-cliff",
    up: [-2.8, -0.6],
    heading: [-2.8, -1.1],
    eye: [0, 3.2, -4.5],
    look: [0, 4.5, 12],
  },
  {
    id: "npc-closeup",
    up: { npc: "mentor-elena" },
    eye: [0.7, 1.45, -1.8],
    look: [0, 1.25, 2.2],
    fov: 50,
  },
  {
    // front three-quarter portrait of the avatar, to judge the character on its own
    id: "avatar-portrait",
    up: [-0.18, mainLatitude(-0.18)],
    heading: [0.3, mainLatitude(-0.18)],
    fov: 40,
    eye: [1.6, 1.35, 2.4],
    look: [0, 1.0, 0],
  },
  {
    // the V key: the whole globe from above the arrival
    id: "overview-globe",
    up: [-0.18, mainLatitude(-0.18)],
    heading: [-0.35, mainLatitude(-0.35)],
    overview: true,
    eye: [0, 48, -25],
    look: [0, 0, 0],
  },
]);

/** The shot named by `?shot=<id>` in a location search string, if any. */
export function readShot(search) {
  const id = new URLSearchParams(search ?? "").get("shot");
  return id ? SHOTS.find((shot) => shot.id === id) : undefined;
}
