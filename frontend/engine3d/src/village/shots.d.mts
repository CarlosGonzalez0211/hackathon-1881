import type { PlanetState } from "@athena/shared";

/** Where the student stands. See the header of `shots.mjs`. */
export type ShotPlace =
  | readonly [lon: number, lat: number]
  | { readonly door: number; readonly back: number }
  | { readonly npc: string };

/** Metres along (student's right, up, facing). */
export type ShotOffset = readonly [side: number, up: number, ahead: number];

export type ShotHouseStatus = PlanetState["houses"][number]["status"];

export interface Shot {
  readonly id: string;
  readonly up: ShotPlace;
  /** A `[lon, lat]` point the student faces. */
  readonly heading?: readonly [lon: number, lat: number];
  readonly eye: ShotOffset;
  readonly look: ShotOffset;
  readonly fov?: number;
  /** The aerial view (V): the standard overview camera is used and `eye`/`look` are ignored. */
  readonly overview?: boolean;
  /** Frozen clock in seconds for cloth, water, lamps and sky (default 0). */
  readonly time?: number;
  /** Status overrides per house slot; other houses keep the session state. */
  readonly houses?: Readonly<Record<number, ShotHouseStatus>>;
}

export declare const SHOTS: readonly Shot[];
export declare function readShot(search: string): Shot | undefined;
