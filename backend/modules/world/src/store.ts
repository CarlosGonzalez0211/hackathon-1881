import {
  defaultWorldAccessibilitySettings,
  demoClassPlanets,
  demoEasterEggs,
  demoLuciaQuests,
  demoRoster,
  type Achievement,
  type AchievementCode,
  type EasterEgg,
  type PlanetState,
  type QuestState,
  type Team,
  type TeamChallenge,
  type WorldAccessibilitySettings,
  type WorldInteraction,
} from "@athena/shared";
import type { RuleContext } from "./rules.js";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/**
 * In-memory world state seeded with the shared demo fixtures.
 * Persistence (Supabase tables from proposal 5.4) is pending Person 4.
 */
export class InMemoryWorldStore {
  readonly planets = new Map<string, PlanetState>();
  readonly classStudents = new Map<string, string[]>();
  readonly quests = new Map<string, QuestState[]>();
  readonly easterEggs = new Map<string, EasterEgg>();
  /** Keyed `${studentId}:${code}`: one unlock per student and achievement. */
  readonly achievements = new Map<string, Achievement>();
  /** Keyed `${studentId}:${code}` -> discoveredAt. */
  readonly discoveries = new Map<string, string>();
  readonly accessibility = new Map<string, WorldAccessibilitySettings>();
  readonly celebrations = new Map<string, string[]>();
  readonly ruleContexts = new Map<string, RuleContext>();
  readonly processedEventIds = new Set<string>();
  readonly interactions: (WorldInteraction & { id: string })[] = [];
  readonly teams = new Map<string, Team>();
  readonly challenges = new Map<string, TeamChallenge>();
  private sequence = 0;

  static seeded(): InMemoryWorldStore {
    const store = new InMemoryWorldStore();
    for (const planet of demoClassPlanets) store.planets.set(planet.studentId, clone(planet));
    store.classStudents.set(
      demoRoster.classId,
      demoRoster.students.map((student) => student.id),
    );
    for (const quest of demoLuciaQuests) {
      const list = store.quests.get(quest.studentId) ?? [];
      list.push(clone(quest));
      store.quests.set(quest.studentId, list);
    }
    for (const egg of demoEasterEggs) store.easterEggs.set(egg.code, clone(egg));
    return store;
  }

  /** Deterministic ids for tests and demos. */
  nextId(prefix: string): string {
    this.sequence += 1;
    return `${prefix}-${this.sequence}`;
  }

  achievementKey(studentId: string, code: AchievementCode | string): string {
    return `${studentId}:${code}`;
  }

  ruleContext(studentId: string): RuleContext {
    let context = this.ruleContexts.get(studentId);
    if (!context) {
      context = { pendingStrategyTopics: new Set() };
      this.ruleContexts.set(studentId, context);
    }
    return context;
  }

  accessibilityFor(studentId: string): WorldAccessibilitySettings {
    return this.accessibility.get(studentId) ?? { ...defaultWorldAccessibilitySettings };
  }
}
