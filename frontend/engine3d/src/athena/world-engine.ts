/**
 * The state-driven world API from the subsystem proposal (section 5.6). The surface
 * handle implements it: the world reacts to `PlanetState`, quests and rewards decided by
 * the platform, and never fetches academic data or computes mastery.
 */
import type {
  Achievement,
  EasterEggDiscoveryResult,
  PlanetState,
  QuestState,
  WorldAccessibilitySettings,
} from "@athena/shared";

export interface AthenaWorldEngine {
  /** Houses, statuses and growth come only from this (teacher-authorised evidence). */
  updatePlanet(state: PlanetState): void;
  /** Quest state for in-world cues; the HTML quest panel stays the source of text. */
  updateQuests(quests: QuestState[]): void;
  /** Celebrate an unlock the world API already granted. */
  showAchievement(achievement: Achievement): void;
  /** Celebrate a discovery the world API already recorded. */
  showEasterEgg(result: EasterEggDiscoveryResult): void;
  /** Reduced motion and volumes apply live; `mode2d`/`highContrast`/`locale` are UI-side. */
  setAccessibility(settings: WorldAccessibilitySettings): void;
  dispose(): void;
}
