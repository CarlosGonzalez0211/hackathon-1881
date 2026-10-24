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
export const athenaPlacementOverrides: Record<string, AthenaPlacementOverride> = {};

/**
 * Uniformly scale the Athena box to the legacy box's height and place its base centre
 * (x/z centre, min y) on the legacy base centre. Degenerate heights fall back to scale 1.
 */
export function fitToBounds(
  legacyBox: BoxLike,
  athenaBox: BoxLike,
  override: AthenaPlacementOverride = {},
): FitResult {
  const legacyHeight = legacyBox.max.y - legacyBox.min.y;
  const athenaHeight = athenaBox.max.y - athenaBox.min.y;
  const fitted =
    Number.isFinite(legacyHeight) && Number.isFinite(athenaHeight) && athenaHeight > 1e-9
      ? legacyHeight > 1e-9
        ? legacyHeight / athenaHeight
        : 1
      : 1;
  const scale = fitted * (override.scale ?? 1);
  const legacyBase = baseCentre(legacyBox);
  const athenaBase = baseCentre(athenaBox);
  const extra = override.offset ?? [0, 0, 0];
  return {
    scale,
    offset: [
      legacyBase[0] - athenaBase[0] * scale + extra[0],
      legacyBase[1] - athenaBase[1] * scale + extra[1],
      legacyBase[2] - athenaBase[2] * scale + extra[2],
    ],
    rotationY: override.rotationY ?? 0,
  };
}

export function baseCentre(box: BoxLike): Vec3Tuple {
  return [(box.min.x + box.max.x) / 2, box.min.y, (box.min.z + box.max.z) / 2];
}

/** Apply a {@link FitResult} to a `scope.Object3D`. */
export function applyFit(object: LegacyContext, fit: FitResult) {
  object.scale.setScalar(fit.scale);
  object.position.set(...fit.offset);
  if (fit.rotationY) object.rotation.y += fit.rotationY;
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
