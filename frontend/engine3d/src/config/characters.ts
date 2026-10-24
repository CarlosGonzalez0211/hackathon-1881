import type { CharacterDefinition } from "../types";

const accessoryGroup = (prefix: string, count: number) =>
  Array.from(
    { length: count },
    (_, index) => `geometries.avatar.accessories.${prefix}${index + 1}.drc`,
  );
export const avatarDefinition: CharacterDefinition = {
  id: "avatar.student",
  label: "Student",
  modelAssetId: "geometries.avatar.accessories.base.drc",
  bonesAssetId: "geometries.avatar.avatar-bones.drc",
  animations: ["idle", "run", "sprint", "air", "afk1", "afk2", "afk3"].map((role) => ({
    id: `avatar.${role}`,
    assetId: `geometries.avatar.avatar-${role}.drc`,
    speed: 1,
    loop: true,
    role,
  })),
  accessories: {
    base: ["geometries.avatar.accessories.base.drc"],
    hair: accessoryGroup("hair", 7),
    top: accessoryGroup("top", 9),
    bottom: accessoryGroup("bottom", 7),
    shoes: accessoryGroup("shoes", 7),
  },
  position: [-10, 36, 14],
  sourceSymbol: "DEFAULT_FILES / ACCESSORIES / planet.characterInitialOptions",
};
/** Developer-authored appearance. No end-user appearance controls are exposed. */
export const defaultAvatarAccessories = ["base", "hair1", "top1", "bottom1", "shoes1"] as const;
// Actual original keyboard-to-geometry mapping; numbers are not semantic emotion names.
const geometryByKey = [4, 2, 0, 1, 8, 5, 6, 7, 9, 3] as const;
export const emoteDefinitions = geometryByKey.map((geometryIndex, key) => ({
  id: `emote.${key}`,
  key: String(key),
  geometryIndex,
  modelAssetId: `geometries.emojis.${geometryIndex + 1}.drc`,
  iconAssetId: `images.ui.emojis.${key}.icon`,
  sourceSymbol: "EMOJI_MAP",
  rateLimitSeconds: 0.35,
}));
export const actionDefinitions = {
  move: {
    keys: ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"],
    sourceSymbol: "characterController",
  },
  jump: {
    keys: ["Space"],
    animationId: "avatar.air",
    soundAssetId: "audio.character.jump-start.ogg",
  },
  sprint: { keys: ["ShiftLeft", "ShiftRight"], animationId: "avatar.sprint" },
  interact: { keys: ["KeyE", "Enter"], event: "athena:house-interact" },
  emote: {
    keys: [
      "Digit0",
      "Digit1",
      "Digit2",
      "Digit3",
      "Digit4",
      "Digit5",
      "Digit6",
      "Digit7",
      "Digit8",
      "Digit9",
    ],
    event: "character_emoji_display",
  },
} as const;

/**
 * Athena avatar (task 5). Developer-owned outfit, not a student skin system: there is no
 * appearance UI. Each part is `models/avatar/athena-avatar-<group>-<variant>.glb`.
 */
export const athenaAvatarOutfit = {
  hair: "bob",
  top: "poncho",
  bottom: "shorts",
  shoes: "boots",
  accessories: ["scarf-satchel"],
} as const;
/**
 * Legacy blend-weight index (`animationProps.weights`: DEFAULT_FILES.animationFiles order)
 * → clip embedded in `athena-avatar-base.glb`.
 */
export const athenaAvatarClips = [
  "idle",
  "run",
  "sprint",
  "air",
  "afk1_lookaround",
  "afk2_stretch",
  "afk3_sit",
] as const;
/** Crossfade between avatar/NPC clips (seconds). */
export const athenaClipFade = 0.2;
