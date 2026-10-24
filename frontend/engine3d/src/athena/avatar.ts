/**
 * Task 5: the student avatar becomes `athena-avatar-base.glb` + part GLBs grafted by node
 * name, driven by one AnimationMixer.
 *
 * The legacy character stays authoritative for gameplay: its controller, capsule physics,
 * camera follow and blend weights are untouched. Only its batched skinned mesh is hidden,
 * and the Athena rig follows `_localObject` every frame, so movement, collision and camera
 * feel identical. Legacy weights (idle, run, sprint, air, afk1-3) pick the dominant clip,
 * crossfaded over 0.2 s; slow movement plays `walk`.
 */
import { athenaAvatarClips, athenaAvatarOutfit, athenaClipFade } from "../config/characters";
import { applyFit, fitToBounds } from "../placement/athena-placement";
import type { LegacyContext } from "../runtime/legacy-context";
import type { AthenaInstallContext } from "./install";
import { ClipPlayer, graftByNodeName, loadAthenaModel, localBounds } from "./models";

/** Below this horizontal speed (legacy units/frame) a running blend plays `walk`. */
const WALK_SPEED = 0.03;
export const AVATAR_SLOT = "slot:avatar/base";

/**
 * Effective weight of each legacy layer, as `characterBatchedSkinnedMesh._updateAnimations`
 * applies them (higher layers — air, afk — mask the locomotion below them).
 */
export function effectiveWeights(weights: readonly number[]) {
  return weights.map((weight, index) => {
    let above = 0;
    for (let higher = weights.length - 1; higher > Math.max(2, index); higher--)
      above += weights[higher]!;
    return weight * (1 - Math.min(1, Math.max(0, above)));
  });
}

/** Clip for the strongest legacy layer; running slowly reads as walking. */
export function avatarClipFor(weights: readonly number[], horizontalSpeed: number) {
  const effective = effectiveWeights(weights);
  let best = 0;
  for (let index = 1; index < effective.length; index++)
    if (effective[index]! > effective[best]!) best = index;
  const clip = athenaAvatarClips[best] ?? "idle";
  return clip === "run" && horizontalSpeed < WALK_SPEED ? "walk" : clip;
}

export function outfitKeys(outfit = athenaAvatarOutfit) {
  return [
    `models/avatar/athena-avatar-hair-${outfit.hair}.glb`,
    `models/avatar/athena-avatar-top-${outfit.top}.glb`,
    `models/avatar/athena-avatar-bottom-${outfit.bottom}.glb`,
    `models/avatar/athena-avatar-shoes-${outfit.shoes}.glb`,
    ...outfit.accessories.map((name) => `models/avatar/athena-avatar-acc-${name}.glb`),
  ];
}

async function buildAvatar(ctx: AthenaInstallContext) {
  const [base, ...parts] = await Promise.all([
    loadAthenaModel(ctx, AVATAR_SLOT, { toon: false }),
    ...outfitKeys().map((key) =>
      loadAthenaModel(ctx, key, { toon: false }).catch((error) => {
        console.warn(`[Athena] avatar part missing, skipped: ${key}`, error);
        return undefined;
      }),
    ),
  ]);
  for (const part of parts) if (part) graftByNodeName(ctx.scope, base.root, part.root);
  // Toon after grafting so every part gets its hull in the final hierarchy.
  ctx.toon.apply(base.root);
  return base;
}

export function installAthenaAvatar(ctx: AthenaInstallContext) {
  if (!ctx.enabled) return;
  const { scope } = ctx;
  const init = scope.characters.prototype.init;
  scope.characters.prototype.init = async function (this: LegacyContext) {
    await init.call(this);
    try {
      await attachAvatar(ctx, this);
    } catch (error) {
      console.error("[Athena] avatar swap failed; legacy avatar kept", error);
    }
  };
  ctx.onDispose(() => {
    scope.characters.prototype.init = init;
  });
}

async function attachAvatar(ctx: AthenaInstallContext, characters: LegacyContext) {
  const { scope } = ctx;
  const model = await buildAvatar(ctx);
  const legacy = characters.mesh;
  if (!legacy || ctx.lifecycle.disposed) return;
  const follower = new scope.Group();
  follower.name = "athena-avatar";
  follower.matrixAutoUpdate = false;
  const fitted = new scope.Group();
  fitted.add(model.root);
  follower.add(fitted);
  const athenaBox = localBounds(scope, model.root);
  const player = new ClipPlayer(scope, model.root, model.animations, athenaClipFade);
  player.play("idle", 0);

  let placed = false;
  const local = legacy._localObject;
  const update = () => {
    if (!placed) {
      // The legacy model geometry streams in from a worker; fit once its bounds exist.
      const legacyBox = legacy._geometryInfo?.[local.batchedIndex ?? 0]?.boundingBox;
      if (!legacyBox) return;
      const slot = AVATAR_SLOT;
      const fit = fitToBounds(legacyBox, athenaBox, ctx.placement.overrides[slot]);
      ctx.placement.debugBounds(slot, legacyBox, athenaBox, fit);
      applyFit(fitted, fit);
      characters.scene.add(follower);
      // `visible` is restored by render passes; an empty layer mask hides it from every
      // camera (shadow cameras included) while its controller keeps running.
      legacy.layers.disableAll();
      placed = true;
    }
    follower.matrix.copy(local.matrix);
    follower.matrixWorldNeedsUpdate = true;
    const weights = local.animationProps?.weights;
    if (weights?.length) player.play(avatarClipFor(weights, local.velocityHorizontal ?? 0));
    player.update(Math.min(scope.renderInfo.delta ?? 16, 100) / 1000);
  };
  characters.scene.beforeRenderCbs.push(update);
  characters.athenaAvatar = { follower, player };
  scope.events$1.on("character_emoji_display", onEmote, characters);
  function onEmote(geometryIndex: unknown) {
    // Emote geometry 0 is `athena-emote-wave` (slot:emote/0): the avatar waves along.
    if (geometryIndex === 0) player.playOnce("emote_wave");
  }
  ctx.onDispose(() => {
    scope.events$1.off("character_emoji_display", onEmote, characters);
    const index = characters.scene?.beforeRenderCbs?.indexOf(update) ?? -1;
    if (index >= 0) characters.scene.beforeRenderCbs.splice(index, 1);
    player.dispose();
    follower.removeFromParent();
  });
}
