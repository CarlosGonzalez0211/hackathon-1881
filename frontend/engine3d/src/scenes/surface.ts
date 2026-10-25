import type { HouseState, PlanetState, QuestState } from "@athena/shared";
import type { AthenaWorldEngine } from "../athena/world-engine";
import type { EngineEventListener } from "../events";

export interface ProjectedHouse {
  slot: number;
  x: number;
  y: number;
  visible: boolean;
  distance: number;
  /**
   * Within the house's interaction radius (anchor or door). The same rule as the E key:
   * the house marker may only be activated when this is true.
   */
  inReach: boolean;
}
export interface EngineStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  planets: number;
}
export interface SurfaceOptions {
  state: PlanetState;
  /** Language for engine-owned accessibility text and touch controls. Defaults to English. */
  locale?: "en" | "es";
  signal?: AbortSignal;
  onHouseClick?: (house: HouseState) => void;
  onProjection?: (houses: ProjectedHouse[]) => void;
  onStats?: (stats: EngineStats) => void;
  onReady?: () => void;
  onOverviewChange?: (overview: boolean) => void;
  /** Open in the planet overview pose (arriving from the class orbit). Default false. */
  overview?: boolean;
  onEvent?: EngineEventListener;
  /** Resolve assets through the Athena manifest first (default true). */
  athenaAssets?: boolean;
}
export interface SurfaceHandle extends AthenaWorldEngine {
  /** Same as `updatePlanet`. */
  update(state: PlanetState): void;
  /** Latest quest state given to `updateQuests`. */
  readonly quests: readonly QuestState[];
  setPaused(paused: boolean): void;
  setOverview(overview: boolean): void;
  focusHouse(slot: number): void;
  setMuted(muted: boolean): void;
  /** Music (score + ambient bed) and effects volumes, 0-1 (brand guide 07). */
  setVolumes(volumes: { music?: number; effects?: number }): void;
  dispose(): void;
  readonly resourceCounts: {
    listeners: number;
    timeouts: number;
    intervals: number;
    frames: number;
    workers: number;
  };
}

export { createSurfaceEngine } from "../village/surface";
