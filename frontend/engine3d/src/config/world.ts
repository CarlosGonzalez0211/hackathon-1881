import type { EntityDefinition, WorldDefinition, Vector3Tuple } from "../types";
import { assetCatalog } from "../assets/catalog";
import { npcDefinitions } from "./npcs";
import { terrainGroups } from "./terrain-groups";

const anchorSources: readonly { npc: string; position: Vector3Tuple; rationale: string }[] = [
  {
    npc: "office-worker-2",
    position: [26.2539, 9.70977, 1.39919],
    rationale: "Main square NPC position; nearby building attribution pending.",
  },
  {
    npc: "boss",
    position: [-4.04907, 1.05824, 25.4517],
    rationale:
      "Boss NPC position; quest text describes the red cliff house, building pivot pending.",
  },
  {
    npc: "factory-worker-a",
    position: [4.16546, 4.2699, -23.5919],
    rationale: "Factory worker NPC position; geometry attribution pending.",
  },
  {
    npc: "mountainman",
    position: [-8.17226, 32.3472, -1.76941],
    rationale:
      "Mountain NPC position; quest text describes mountain temple, building pivot pending.",
  },
  {
    npc: "oldwoman",
    position: [23.3711, -16.514, 12.462],
    rationale: "Old woman NPC position; nearby building attribution pending.",
  },
  {
    npc: "chef",
    position: [20.3565, 19.1747, 2.20046],
    rationale: "Shop Keeper NPC position; nearby building attribution pending.",
  },
];
/** Provisional topic anchors, NOT recovered building mesh origins or IDs. */
export const houseInteractionAnchors: readonly EntityDefinition[] = anchorSources.map(
  (anchor, slot) => ({
    id: `topic-anchor.${slot}`,
    kind: "interaction-anchor",
    position: anchor.position,
    collision: "none",
    geometryIdentification: "pending",
    interaction: {
      id: `topic-interaction.${slot}`,
      kind: "topic",
      radius: 2.2,
      slot,
      implementation: "pending",
    },
    provenance: `presentScene.createNPCS: ${anchor.npc}. ${anchor.rationale}`,
  }),
);
const prefix = "geometries.planets.present.";
export const worldDefinition: WorldDefinition = {
  id: "world.athena.provisional",
  terrain: {
    chunks: 10,
    detailLevels: [0, 1, 2, 3],
    lodDistances: [6, 12, 20],
    assetIds: assetCatalog
      .filter((asset) => asset.id.startsWith(prefix) && /full[_-]/.test(asset.path))
      .map((asset) => asset.id),
    collisionAssetIds: assetCatalog
      .filter((asset) => asset.id.startsWith(prefix + "hitmesh_"))
      .map((asset) => asset.id),
    unresolvedCompositeGeometry: true,
  },
  entities: houseInteractionAnchors,
  geometryGroups: terrainGroups,
  characterIds: ["avatar.student", ...npcDefinitions.map((npc) => npc.id)],
  environmentAssetIds: assetCatalog
    .filter((asset) => asset.id.startsWith(prefix) && !/full[_-]|hitmesh_/.test(asset.path))
    .map((asset) => asset.id),
  note: "Terrain and foliage contain batch groups; semantic building/tree boundaries require visual verification. Anchors reference NPC coordinates, not identified buildings. Original source modeling files were unavailable.",
};
export const sceneDefinitions = {
  introduction: {
    id: "scene.introduction",
    assetIds: assetCatalog
      .filter((asset) => /geometries\.planets\.(intro|present\.intro)\./.test(asset.id))
      .map((asset) => asset.id),
  },
  surface: { id: "scene.surface", worldId: worldDefinition.id, physics: true, characters: true },
  orbit: {
    id: "scene.orbit",
    worldId: worldDefinition.id,
    planetCount: 8,
    detailLevel: 3,
    physics: false,
    characters: false,
    sharedCanvas: true,
  },
} as const;
