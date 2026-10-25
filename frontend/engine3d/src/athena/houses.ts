/**
 * Task 7: topic houses. Slot `topic-anchor.<n>` shows `athena-house-<status>-v<n % 6>.glb`
 * for the learning status in `PlanetState` (`@athena/shared`, from teacher-authorised
 * evidence; the engine never infers it). A status change crossfades the two models over
 * 0.9 s (`--athena-motion-calm`); with `prefers-reduced-motion` the swap is instant.
 * Topic names stay HTML labels (surface.ts projects `athenaHouseSites`), never textures.
 *
 * Each house stands on a clear, flat patch of the original collision mesh next to its
 * anchor (world/house-sites.ts), door towards the anchor; per-slot `scale`/`offset`/
 * `rotationY` overrides live in placement/athena-placement.ts under `slot:house/<n>`.
 */
import type { HouseState, PlanetState } from "@athena/shared";
import { athenaBrand } from "@athena/brand";
import { houseInteractionAnchors } from "../config/world";
import { ATHENA_WORLD_SCALE } from "../placement/athena-placement";
import type { LegacyContext } from "../runtime/legacy-context";
import { findHouseSite, groundBelow, tangentFrame } from "../world/house-sites";
import type { HouseSite, Vec3 } from "../world/house-sites";
import { colliderOf, combineRaycasts, createColliderRaycast, createVisualRaycast } from "./ground";
import type { AthenaInstallContext } from "./install";
import { loadAthenaModel, prefersReducedMotion } from "./models";

/** Largest kit house (m): 3.9 wide, 3.15 deep, 4.34 tall (variant 5). */
const KIT_HOUSE = { width: 3.9, depth: 3.15, height: 4.34 } as const;
/** Farthest ring tried around an anchor (legacy units). */
const SEARCH_RADIUS = 20;
/**
 * Topic houses render at kit scale × this (legacy units per kit metre would be 1.2): the
 * town is dense, and a 3.9 m house finds a clear plinth beside every anchor.
 */
export const HOUSE_SCALE = 1;
/** Clearance kept around the footprint (legacy units). */
const MARGIN = 0.3;
/** `--athena-motion-calm` (900ms) in seconds. */
export const HOUSE_CROSSFADE = Number.parseFloat(athenaBrand.motion.calm) / 1000;

type HouseStatus = HouseState["status"];

export const houseSlotKey = (slot: number) => `slot:house/${slot}`;
export const houseModelKey = (slot: number, status: HouseStatus) => `slot:house/${slot}/${status}`;

/** A placed house: where it stands and what label/interaction points it exposes. */
export interface AthenaHouseSite extends HouseSite {
  readonly slot: number;
  /** Top of the roof (for the HTML label). */
  readonly top: Vec3;
  /** In front of the door (for the interaction distance). */
  readonly door: Vec3;
}

/** Fallback when no clear patch is found: 4 m to the anchor's side, as is. */
function fallbackSite(anchor: Vec3, raycast: ReturnType<typeof createColliderRaycast>) {
  const up = anchor.map((v) => v / Math.hypot(...anchor)) as unknown as Vec3;
  const [side] = tangentFrame(up);
  const guess: Vec3 = [anchor[0] + side[0] * 4, anchor[1] + side[1] * 4, anchor[2] + side[2] * 4];
  const ground = groundBelow(raycast, guess)?.point ?? guess;
  const toAnchor = [anchor[0] - ground[0], anchor[1] - ground[1], anchor[2] - ground[2]];
  const l = Math.hypot(...toAnchor) || 1;
  return {
    position: ground,
    up,
    forward: toAnchor.map((v) => v / l) as unknown as Vec3,
    distanceToAnchor: l,
    clear: false,
  } satisfies HouseSite;
}

export function installAthenaHouses(ctx: AthenaInstallContext) {
  if (!ctx.enabled) return;
  const { scope } = ctx;
  const createNPCS = scope.presentScene.prototype.createNPCS;
  scope.presentScene.prototype.createNPCS = async function (this: LegacyContext) {
    await createNPCS.call(this);
    try {
      attachHouses(ctx, this);
    } catch (error) {
      console.error("[Athena] topic houses could not be placed", error);
    }
  };
  ctx.onDispose(() => {
    scope.presentScene.prototype.createNPCS = createNPCS;
  });
}

interface Shown {
  status: HouseStatus;
  root: LegacyContext;
}

function attachHouses(ctx: AthenaInstallContext, scene: LegacyContext) {
  const { scope } = ctx;
  const collider = colliderOf(scene);
  if (!collider) throw new Error("collision mesh not ready");
  // Clearance against collision (walls, terrain) and visible geometry (railings, fences).
  const raycast = combineRaycasts(
    createColliderRaycast(scope, collider),
    createVisualRaycast(
      scope,
      scene.terrain?.mesh,
      houseInteractionAnchors.map((anchor) => anchor.position),
      SEARCH_RADIUS + KIT_HOUSE.width * ATHENA_WORLD_SCALE,
    ),
  );
  const sites = new Map<number, AthenaHouseSite>();
  const groups = new Map<number, LegacyContext>();
  for (const anchor of houseInteractionAnchors) {
    const slot = anchor.interaction!.slot!;
    const override = ctx.placement.overrides[houseSlotKey(slot)] ?? {};
    const scale = HOUSE_SCALE * (override.scale ?? 1);
    const rejected: Record<string, number> = {};
    const searched = findHouseSite(anchor.position, raycast, {
      halfWidth: (KIT_HOUSE.width * scale) / 2 + MARGIN,
      halfDepth: (KIT_HOUSE.depth * scale) / 2 + MARGIN,
      height: KIT_HOUSE.height * scale,
      radii: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, SEARCH_RADIUS],
      // Terraced town: the nearest flat plot may be a level up or down from the anchor.
      maxStep: 4,
      steps: 32,
      onReject: (reason) => (rejected[reason] = (rejected[reason] ?? 0) + 1),
    });
    if (!searched?.clear)
      console.warn(
        `[Athena] no fully clear site for house slot ${slot}; using the least obstructed`,
        rejected,
      );
    const found = searched ?? fallbackSite(anchor.position, raycast);
    const offset = override.offset ?? [0, 0, 0];
    const position: Vec3 = [
      found.position[0] + offset[0],
      found.position[1] + offset[1],
      found.position[2] + offset[2],
    ];
    const { up, forward } = found;
    const along = (s: number, v: Vec3): Vec3 => [
      position[0] + v[0] * s,
      position[1] + v[1] * s,
      position[2] + v[2] * s,
    ];
    const site: AthenaHouseSite = {
      ...found,
      position,
      slot,
      top: along(KIT_HOUSE.height * scale, up),
      door: along((KIT_HOUSE.depth * scale) / 2 + 0.6, forward),
    };
    sites.set(slot, site);
    // Group frame: +Y planet normal, +Z door (towards the anchor), then the override yaw.
    const group = new scope.Group();
    group.name = `athena-house-${slot}`;
    const side = new scope.Vector3().crossVectors(
      new scope.Vector3(...up),
      new scope.Vector3(...forward),
    );
    group.quaternion.setFromRotationMatrix(
      new scope.Matrix4().makeBasis(
        side.normalize(),
        new scope.Vector3(...up),
        new scope.Vector3(...forward),
      ),
    );
    group.rotateY(override.rotationY ?? 0);
    group.position.set(...position);
    group.scale.setScalar(scale);
    scene.add(group);
    groups.set(slot, group);
    if (found.distanceToAnchor > 0)
      console.info(
        `[Athena] house slot ${slot} at ${found.distanceToAnchor.toFixed(1)} m from its anchor`,
      );
  }
  scene.userData.athenaHouseSites = sites;

  const shown = new Map<number, Shown>();
  const pending = new Map<number, HouseStatus>();
  const fades: { from?: LegacyContext; to: LegacyContext; start: number }[] = [];
  const show = async (house: HouseState) => {
    const group = groups.get(house.slot);
    if (!group || pending.get(house.slot) === house.status) return;
    pending.set(house.slot, house.status);
    try {
      const model = await loadAthenaModel(ctx, houseModelKey(house.slot, house.status));
      if (ctx.lifecycle.disposed || pending.get(house.slot) !== house.status) return;
      const previous = shown.get(house.slot);
      group.add(model.root);
      shown.set(house.slot, { status: house.status, root: model.root });
      if (!previous || prefersReducedMotion()) {
        previous?.root.removeFromParent();
        return;
      }
      ctx.toon.setOpacity(model.root, 0);
      fades.push({ from: previous.root, to: model.root, start: performance.now() });
    } catch (error) {
      pending.delete(house.slot);
      console.error(`[Athena] house ${house.slot} (${house.status}) failed to load`, error);
    }
  };
  let lastState: PlanetState | undefined;
  const update = () => {
    const state = scene.userData.planetState as PlanetState | undefined;
    if (state && state !== lastState) {
      lastState = state;
      for (const house of state.houses)
        if (shown.get(house.slot)?.status !== house.status) void show(house);
    }
    const now = performance.now();
    for (let index = fades.length - 1; index >= 0; index--) {
      const fade = fades[index]!;
      const t = Math.min(1, (now - fade.start) / (HOUSE_CROSSFADE * 1000));
      ctx.toon.setOpacity(fade.to, t);
      if (fade.from) ctx.toon.setOpacity(fade.from, 1 - t);
      if (t >= 1) {
        fade.from?.removeFromParent();
        fades.splice(index, 1);
      }
    }
  };
  scene.beforeRenderCbs.push(update);
  ctx.onDispose(() => {
    const index = scene.beforeRenderCbs?.indexOf(update) ?? -1;
    if (index >= 0) scene.beforeRenderCbs.splice(index, 1);
    for (const group of groups.values()) group.removeFromParent();
    delete scene.userData.athenaHouseSites;
  });
}
