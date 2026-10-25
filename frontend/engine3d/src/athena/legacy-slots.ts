/**
 * Legacy slots with nothing left to show, so they stop downloading Messenger files:
 *
 * - Delivery items (`deliveries/*.drc`, quest give/receive objects) load the kit's
 *   `items/` meshes instead (task 10). Quests are a stub in this build, so the object stays
 *   hidden until the quest system arrives.
 * - Emoji meshes (`emojis/<n>.drc`): Athena emotes replace what they drew (fauna.ts), so
 *   the legacy emoji batch gets a single-triangle placeholder.
 * - Avatar accessories: only the default outfit's legacy parts load (the legacy capsule
 *   and blend weights still need the base rig); the customisation set is not shown.
 * - Speech-bubble fonts (`*.font`, MSDF): NPC texts are empty in Athena (no simulated
 *   tutor), so bubbles never draw; the glyph loader returns blank textures instead.
 */
import { defaultAvatarAccessories } from "../config/characters";
import type { LegacyContext } from "../runtime/legacy-context";
import type { AthenaInstallContext } from "./install";

export const deliverySlot = (relative: string) =>
  /^deliveries\/[\w-]+\.drc$/.test(relative)
    ? `geometries/${relative.replace(/\.drc$/, "")}`
    : undefined;
export const isEmojiMesh = (relative: string) => /^emojis\/\d+\.drc$/.test(relative);

export function installAthenaLegacySlots(ctx: AthenaInstallContext) {
  if (!ctx.enabled) return;
  const { scope } = ctx;
  const load = scope.geometryLoader.load.bind(scope.geometryLoader);
  scope.geometryLoader.load = async (relative: string, ...args: unknown[]) => {
    if (isEmojiMesh(relative)) return placeholder(scope);
    const key = deliverySlot(relative);
    const resolved = key ? ctx.resolve(key) : undefined;
    if (resolved?.kind === "glb")
      try {
        return await ctx.gltf.loadGeometryFromGlb(resolved.url);
      } catch (error) {
        console.warn(`[Athena] delivery ${relative} kept legacy`, error);
      }
    return load(relative, ...args);
  };
  const accessories = scope.ACCESSORIES;
  if (accessories) {
    const keep = new Set<string>(defaultAvatarAccessories);
    scope.ACCESSORIES = Object.fromEntries(
      Object.entries(accessories as Record<string, string[]>).map(([group, parts]) => [
        group,
        parts.filter((part) => keep.has(part)),
      ]),
    );
  }
  const loadTexture = scope.glyphLoader.loadTexture.bind(scope.glyphLoader);
  scope.glyphLoader.loadTexture = (path: string, type: string, ...args: unknown[]) => {
    if (!/\.font$/.test(path)) return loadTexture(path, type, ...args);
    // Same shapes as the glyph loader's own error fallback.
    return Promise.resolve(
      type === "curve"
        ? new scope.DataTexture(null, 1, 1, scope.RGBAFormat, scope.HalfFloatType)
        : new scope.DataTexture(null, 1, 1, scope.RGIntegerFormat, scope.UnsignedShortType),
    );
  };
  ctx.onDispose(() => {
    scope.geometryLoader.load = load;
    if (accessories) scope.ACCESSORIES = accessories;
    scope.glyphLoader.loadTexture = loadTexture;
  });
}

function placeholder(scope: LegacyContext) {
  const geometry = new scope.BufferGeometry();
  geometry.setAttribute("position", new scope.BufferAttribute(new Float32Array(9), 3));
  geometry.setAttribute("normal", new scope.BufferAttribute(new Float32Array(9), 3));
  geometry.setAttribute("uv", new scope.BufferAttribute(new Float32Array(6), 2));
  geometry.setIndex(new scope.BufferAttribute(new Uint32Array([0, 1, 2]), 1));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
