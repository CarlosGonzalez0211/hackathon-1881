/**
 * Task 6: NPCs and Lumen.
 *
 * Each legacy NPC keeps its spawn point, facing, curve path, distance culling and
 * interaction logic. Its Athena GLB (manifest `npcs/present/<slot>`) is parented under the
 * legacy SkinnedMesh, fitted to the legacy bounds; the legacy geometry is hidden with an
 * empty layer mask (children inherit visibility, not layers). Clips: `idle` by default,
 * `talk` while the legacy NPC talks or the player stands within its talk distance, `walk`
 * for NPCs that follow a curve.
 *
 * Lumen (`new:npc.cat`) is new: it sits beside the next available topic house, snapped to
 * the original collision mesh, and moves when the learning status changes.
 */
import type { HouseState, PlanetState } from "@athena/shared";
import { athenaClipFade } from "../config/characters";
import { houseInteractionAnchors } from "../config/world";
import { applyFit, fitToBounds } from "../placement/athena-placement";
import type { LegacyContext } from "../runtime/legacy-context";
import type { AthenaInstallContext } from "./install";
import { ClipPlayer, loadAthenaModel, localBounds } from "./models";

export const LUMEN_SLOT = "new:npc.cat";
/** Lumen stands this far (m) from the house anchor, along the surface. */
export const LUMEN_OFFSET = 1.4;

export interface NpcAnimationState {
  readonly talking: boolean;
  readonly distanceToPlayer: number;
  readonly talkDistance: number;
  readonly followsCurve: boolean;
}

/** `talk` near the player, `walk` on a curve, else `idle` (falls back to `idle`). */
export function npcClipFor(state: NpcAnimationState, has: (clip: string) => boolean) {
  const near = state.talking || state.distanceToPlayer < state.talkDistance;
  if (near && has("talk")) return "talk";
  if (state.followsCurve && has("walk")) return "walk";
  return "idle";
}

/**
 * House Lumen waits by: the lowest-slot `available` house, else the lowest `in_progress`
 * one, else none (everything locked or done).
 */
export function nextAvailableHouse(state: PlanetState | undefined): HouseState | undefined {
  const houses = [...(state?.houses ?? [])].sort((a, b) => a.slot - b.slot);
  return (
    houses.find((house) => house.status === "available") ??
    houses.find((house) => house.status === "in_progress")
  );
}

export function installAthenaNpcs(ctx: AthenaInstallContext) {
  if (!ctx.enabled) return;
  const { scope } = ctx;
  const init = scope.npc.prototype.init;
  scope.npc.prototype.init = async function (this: LegacyContext) {
    await init.call(this);
    try {
      await attachNpc(ctx, this);
    } catch (error) {
      console.error(`[Athena] NPC swap failed for ${this.options?.modelURL}; legacy kept`, error);
    }
  };
  const createNPCS = scope.presentScene.prototype.createNPCS;
  scope.presentScene.prototype.createNPCS = async function (this: LegacyContext) {
    await createNPCS.call(this);
    try {
      await attachLumen(ctx, this);
    } catch (error) {
      console.error("[Athena] Lumen could not be placed", error);
    }
  };
  ctx.onDispose(() => {
    scope.npc.prototype.init = init;
    scope.presentScene.prototype.createNPCS = createNPCS;
  });
}

async function attachNpc(ctx: AthenaInstallContext, npc: LegacyContext) {
  const { scope } = ctx;
  const legacy = npc.mesh;
  // `modelURL` is relative to the geometry loader (`npcs/present/fox/fox.drc`).
  const resolved = ctx.resolve(String(npc.options.modelURL ?? ""), "geometries");
  if (!legacy || resolved?.kind !== "glb") return;
  const model = await loadAthenaModel(ctx, resolved.entry.source);
  if (ctx.lifecycle.disposed) return;
  if (!legacy.geometry.boundingBox) legacy.geometry.computeBoundingBox();
  const athenaBox = localBounds(scope, model.root);
  const slot = resolved.entry.source;
  const fit = fitToBounds(legacy.geometry.boundingBox, athenaBox, ctx.placement.overrides[slot]);
  ctx.placement.debugBounds(slot, legacy.geometry.boundingBox, athenaBox, fit);
  const fitted = new scope.Group();
  fitted.name = `athena-${legacy.name}`;
  fitted.add(model.root);
  applyFit(fitted, fit);
  legacy.add(fitted);
  legacy.layers.disableAll();
  const player = new ClipPlayer(scope, model.root, model.animations, athenaClipFade);
  player.play("idle", 0);
  // Desynchronise NPCs that share a clip.
  player.mixer.update(Math.random() * 4);
  const has = (clip: string) => player.has(clip);
  const update = () => {
    if (!legacy.visible) return;
    player.play(
      npcClipFor(
        {
          talking: !!legacy._talkAnimationPlaying,
          distanceToPlayer: legacy._distanceToCharacter ?? Infinity,
          talkDistance: legacy._talkDistance ?? npc.options.talkDistance ?? 2.5,
          followsCurve: !!legacy._curve,
        },
        has,
      ),
    );
    player.update(Math.min(scope.renderInfo.delta ?? 16, 100) / 1000);
  };
  npc.scene.beforeRenderCbs.push(update);
  ctx.onDispose(() => {
    const index = npc.scene?.beforeRenderCbs?.indexOf(update) ?? -1;
    if (index >= 0) npc.scene.beforeRenderCbs.splice(index, 1);
    player.dispose();
  });
}

async function attachLumen(ctx: AthenaInstallContext, scene: LegacyContext) {
  const { scope } = ctx;
  const model = await loadAthenaModel(ctx, LUMEN_SLOT);
  if (ctx.lifecycle.disposed) return;
  const lumen = new scope.Group();
  lumen.name = "athena-lumen";
  lumen.add(model.root);
  const override = ctx.placement.overrides[LUMEN_SLOT];
  model.root.scale.setScalar(override?.scale ?? 1);
  model.root.rotation.y = override?.rotationY ?? 0;
  const player = new ClipPlayer(scope, model.root, model.animations, athenaClipFade);
  player.play("idle", 0);
  let placedFor: string | undefined;
  const up = new scope.Vector3();
  const tangent = new scope.Vector3();
  const anchor = new scope.Vector3();
  const forward = new scope.Vector3();
  const side = new scope.Vector3();
  const basis = new scope.Matrix4();
  const place = (house: HouseState | undefined) => {
    const key = house ? `${house.slot}:${house.status}` : "none";
    if (key === placedFor) return;
    placedFor = key;
    const source = house
      ? houseInteractionAnchors.find((item) => item.interaction?.slot === house.slot)
      : undefined;
    lumen.visible = !!source;
    if (!source) return;
    anchor.fromArray(source.position);
    up.copy(anchor).normalize();
    // Step sideways along the surface so Lumen sits beside the door, not inside it.
    tangent.set(0, 1, 0).cross(up);
    if (tangent.lengthSq() < 1e-6) tangent.set(1, 0, 0);
    tangent.normalize();
    lumen.position.copy(anchor).addScaledVector(tangent, LUMEN_OFFSET);
    const collider = scene.characters?.mesh?._collisionPhysics?._collider;
    if (collider) ctx.placement.snapToGround(scope, lumen, [collider]);
    // Stand on the local surface (+Y = planet normal) facing the house anchor (+Z).
    up.copy(lumen.position).normalize();
    forward.subVectors(anchor, lumen.position);
    forward.addScaledVector(up, -forward.dot(up)).normalize();
    side.crossVectors(up, forward).normalize();
    lumen.quaternion.setFromRotationMatrix(basis.makeBasis(side, up, forward));
    lumen.updateMatrixWorld(true);
  };
  scene.add(lumen);
  const update = () => {
    place(nextAvailableHouse(scene.userData.planetState as PlanetState | undefined));
    if (!lumen.visible) return;
    const playerPosition = scene.characters?.mesh?._localObject?.position;
    player.play(
      npcClipFor(
        {
          talking: false,
          distanceToPlayer: playerPosition ? playerPosition.distanceTo(lumen.position) : Infinity,
          talkDistance: 2.5,
          followsCurve: false,
        },
        (clip) => player.has(clip),
      ),
    );
    player.update(Math.min(scope.renderInfo.delta ?? 16, 100) / 1000);
  };
  scene.beforeRenderCbs.push(update);
  scene.athenaLumen = lumen;
  ctx.onDispose(() => {
    const index = scene.beforeRenderCbs?.indexOf(update) ?? -1;
    if (index >= 0) scene.beforeRenderCbs.splice(index, 1);
    player.dispose();
    lumen.removeFromParent();
  });
}
