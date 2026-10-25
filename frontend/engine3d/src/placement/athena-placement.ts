/**
 * Fitting Athena kit models (meters, +Y up, base-centre pivot) into slots that were
 * authored for legacy Messenger geometry.
 *
 * `fitToBounds` is pure (no Three dependency) and works on any `{min,max}` box, e.g. a
 * `scope.Box3`. `snapToGround` needs the runtime's `scope.Raycaster` and is the only
 * non-pure helper. Per-slot tweaks go in `athenaPlacementOverrides`.
 */
import type { LegacyContext } from "../runtime/legacy-context";

export type Vec3Tuple = readonly [number, number, number];
export interface PointLike {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}
export interface BoxLike {
  readonly min: PointLike;
  readonly max: PointLike;
}
/** Hand-tuned correction for one slot, applied on top of the automatic fit. */
export interface AthenaPlacementOverride {
  /** Multiplies the fitted scale. */
  readonly scale?: number;
  /** World-space offset added after fitting (meters, legacy space). */
  readonly offset?: Vec3Tuple;
  /** Extra rotation about +Y in radians. */
  readonly rotationY?: number;
}
export interface FitResult {
  /** Uniform scale to apply to the Athena object. */
  readonly scale: number;
  /** Position for the Athena object's origin so its base centre sits on the legacy one. */
  readonly offset: Vec3Tuple;
  readonly rotationY: number;
}

/**
 * Overrides keyed by manifest key (`slot:house/0/done`, `geometries/npcs/present/fox/fox`,
 * …). Empty for now; later tasks add entries as they swap slots.
 */
export const athenaPlacementOverrides: Record<string, AthenaPlacementOverride> = {
  // Topic houses (athena/houses.ts). Slot 3 sits on the narrow summit by the temple and
  // slot 5 on the crowded shop street: a smaller house finds a clear plinth there.
  "slot:house/3": { scale: 0.8 },
  "slot:house/5": { scale: 0.8 },
};

/**
 * Legacy world units per kit metre. The kit is authored in metres around a 1.2 m student;
 * the legacy avatar/NPC fits land at 1.14–1.26 (avatar 1.26), so new Athena objects with no
 * legacy counterpart (Lumen, topic houses, props) use 1.2 to keep the kit's proportions.
 */
export const ATHENA_WORLD_SCALE = 1.2;

/** Smallest scale an override may produce (negative/zero overrides would mirror or vanish). */
export const MIN_OVERRIDE_SCALE = 1e-6;

const finite = (point: PointLike) =>
  Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z);
/** A box with finite corners and `min <= max` on every axis (zero-size boxes are valid). */
export function isUsableBox(box: BoxLike) {
  return (
    finite(box.min) &&
    finite(box.max) &&
    box.min.x <= box.max.x &&
    box.min.y <= box.max.y &&
    box.min.z <= box.max.z
  );
}
const finiteOr = (value: number | undefined, fallback: number) =>
  value !== undefined && Number.isFinite(value) ? value : fallback;

/**
 * Uniformly scale the Athena box to the legacy box's height and place its base centre
 * (x/z centre, min y) on the legacy base centre, accounting for `rotationY` about the
 * object origin (the kit's base-centre pivot), so `applyFit` lands the base exactly.
 * Degenerate heights fall back to scale 1. When either box is empty or non-finite the fit
 * is scale 1 at the legacy base centre if that is finite, else at the origin. Override
 * scales are made positive (`abs`, at least {@link MIN_OVERRIDE_SCALE}).
 */
export function fitToBounds(
  legacyBox: BoxLike,
  athenaBox: BoxLike,
  override: AthenaPlacementOverride = {},
): FitResult {
  const overrideScale = Math.max(Math.abs(finiteOr(override.scale, 1)), MIN_OVERRIDE_SCALE);
  const rotationY = finiteOr(override.rotationY, 0);
  const extra = (override.offset ?? [0, 0, 0]).map((value) => finiteOr(value, 0));
  const legacyBase = baseCentre(legacyBox);
  if (!isUsableBox(legacyBox) || !isUsableBox(athenaBox)) {
    const anchor = legacyBase.every(Number.isFinite) ? legacyBase : [0, 0, 0];
    return {
      scale: overrideScale,
      offset: [anchor[0]! + extra[0]!, anchor[1]! + extra[1]!, anchor[2]! + extra[2]!],
      rotationY,
    };
  }
  const legacyHeight = legacyBox.max.y - legacyBox.min.y;
  const athenaHeight = athenaBox.max.y - athenaBox.min.y;
  const fitted = athenaHeight > 1e-9 && legacyHeight > 1e-9 ? legacyHeight / athenaHeight : 1;
  const scale = fitted * overrideScale;
  // Where the Athena base centre ends up relative to the origin after scale + rotation.
  const [bx, by, bz] = baseCentre(athenaBox).map((value) => value * scale) as [
    number,
    number,
    number,
  ];
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  const rotated = [bx * cos + bz * sin, by, -bx * sin + bz * cos];
  return {
    scale,
    offset: [
      legacyBase[0] - rotated[0]! + extra[0]!,
      legacyBase[1] - rotated[1]! + extra[1]!,
      legacyBase[2] - rotated[2]! + extra[2]!,
    ],
    rotationY,
  };
}

export function baseCentre(box: BoxLike): Vec3Tuple {
  return [(box.min.x + box.max.x) / 2, box.min.y, (box.min.z + box.max.z) / 2];
}

/**
 * Apply a {@link FitResult} to a `scope.Object3D`. Absolute (idempotent): scale, position
 * and the Y rotation are set, not accumulated; X/Z rotation is left as is.
 */
export function applyFit(object: LegacyContext, fit: FitResult) {
  object.scale.setScalar(fit.scale);
  object.position.set(...fit.offset);
  object.rotation.y = fit.rotationY;
  object.updateMatrixWorld(true);
}

export interface SnapToGroundOptions {
  /**
   * `"radial"` (default): the ground is towards `center` — the surface world is a small
   * planet, so "down" differs per position. `"down"`: cast along -Y.
   */
  readonly mode?: "radial" | "down";
  readonly center?: Vec3Tuple;
  /** How far above the object the ray starts (meters). Default 50. */
  readonly height?: number;
  /** Also rotate the object so its +Y matches the local up. Default false. */
  readonly align?: boolean;
}

/**
 * Move `object` onto the first hit among `raycastTargets` along local "down".
 * Returns the hit (Three `Intersection`) or `undefined` when nothing was hit.
 */
export function snapToGround(
  scope: LegacyContext,
  object: LegacyContext,
  raycastTargets: readonly LegacyContext[],
  options: SnapToGroundOptions = {},
) {
  const position = object.getWorldPosition(new scope.Vector3());
  const up =
    options.mode === "down"
      ? new scope.Vector3(0, 1, 0)
      : position
          .clone()
          .sub(new scope.Vector3(...(options.center ?? [0, 0, 0])))
          .normalize();
  if (up.lengthSq() === 0) up.set(0, 1, 0);
  const origin = position.clone().addScaledVector(up, options.height ?? 50);
  const raycaster = new scope.Raycaster(origin, up.clone().negate());
  const [hit] = raycaster.intersectObjects([...raycastTargets], true);
  if (!hit) return undefined;
  const local = object.parent ? object.parent.worldToLocal(hit.point.clone()) : hit.point.clone();
  object.position.copy(local);
  if (options.align) object.quaternion.setFromUnitVectors(new scope.Vector3(0, 1, 0), up);
  object.updateMatrixWorld(true);
  return hit;
}

/** True when the page URL has `?athenaDebug=<flag>` (comma-separated flags allowed). */
export function isAthenaDebug(flag: string, search = globalThis.location?.search ?? "") {
  const value = new URLSearchParams(search).get("athenaDebug");
  return !!value && value.split(",").includes(flag);
}

const round = (value: number) => Math.round(value * 1000) / 1000;
const describe = (box: BoxLike) => ({
  min: [box.min.x, box.min.y, box.min.z].map(round),
  max: [box.max.x, box.max.y, box.max.z].map(round),
  size: [box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z].map(round),
});

/** With `?athenaDebug=bounds`, log legacy vs Athena bounds and the fit for one slot. */
export function debugBounds(slot: string, legacyBox: BoxLike, athenaBox: BoxLike, fit?: FitResult) {
  if (!isAthenaDebug("bounds")) return;
  console.info(`[Athena] bounds ${slot}`, {
    legacy: describe(legacyBox),
    athena: describe(athenaBox),
    fit: fit ?? fitToBounds(legacyBox, athenaBox, athenaPlacementOverrides[slot]),
  });
}
