import {
  achievementCatalogue,
  createTeamChallengeRequestSchema,
  createTeamRequestSchema,
  easterEggDiscoveryRequestSchema,
  learningEventSchema,
  teamChallengeAttemptSchema,
  worldInteractionSchema,
  type Achievement,
  type AchievementCode,
  type EasterEggDiscoveryResult,
  type LearningEvent,
  type PlanetState,
  type QuestState,
  type TeamChallengeAttemptResult,
  type TeamChallenge,
  type TeamState,
  type WorldInteractionResult,
  type WorldState,
} from "@athena/shared";
import { badRequest, forbidden, notFound } from "./errors.js";
import { achievementCodesFor, type WorldEvent } from "./rules.js";
import { InMemoryWorldStore } from "./store.js";

export interface WorldServiceOptions {
  store?: InMemoryWorldStore;
  /** Injected clock keeps demos and tests deterministic. */
  now?: () => string;
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/**
 * World, Progression, and Collaboration domain service.
 * Rules: the world never computes or writes mastery, game activity (interactions, Easter eggs,
 * team challenges) never changes house status or progress, and every unlock is idempotent.
 */
export class WorldService {
  readonly store: InMemoryWorldStore;
  private readonly now: () => string;

  constructor(options: WorldServiceOptions = {}) {
    this.store = options.store ?? InMemoryWorldStore.seeded();
    this.now = options.now ?? (() => new Date().toISOString());
  }

  // ---- Read models -------------------------------------------------------

  getPlanet(studentId: string): PlanetState {
    const planet = this.store.planets.get(studentId);
    if (!planet) throw notFound("Student", studentId);
    return clone(planet);
  }

  getClassPlanets(classId: string): PlanetState[] {
    const studentIds = this.store.classStudents.get(classId);
    if (!studentIds) throw notFound("Class", classId);
    return studentIds.flatMap((id) => {
      const planet = this.store.planets.get(id);
      return planet ? [clone(planet)] : [];
    });
  }

  listAchievements(studentId: string): Achievement[] {
    this.assertStudent(studentId);
    return [...this.store.achievements.values()]
      .filter((achievement) => achievement.studentId === studentId)
      .map(clone);
  }

  listQuests(studentId: string): QuestState[] {
    this.assertStudent(studentId);
    return clone(this.store.quests.get(studentId) ?? []);
  }

  getWorld(studentId: string): WorldState {
    const planet = this.getPlanet(studentId);
    return {
      studentId,
      planet,
      achievements: this.listAchievements(studentId),
      quests: this.listQuests(studentId),
      easterEggs: clone([...this.store.easterEggs.values()]),
      discoveredEasterEggCodes: [...this.store.easterEggs.keys()].filter((code) =>
        this.store.discoveries.has(this.store.achievementKey(studentId, code)),
      ),
      accessibility: this.store.accessibilityFor(studentId),
      activeCelebrationIds: [...(this.store.celebrations.get(studentId) ?? [])],
    };
  }

  // ---- Achievements ------------------------------------------------------

  /**
   * Idempotent unlock keyed by (studentId, code). A repeated unlock returns the existing
   * record with `created: false` and never creates a duplicate.
   */
  unlock(input: {
    studentId: string;
    code: AchievementCode;
    evidenceIds: string[];
    sourceEventId?: string;
    at?: string;
  }): { achievement: Achievement; created: boolean } {
    this.assertStudent(input.studentId);
    const key = this.store.achievementKey(input.studentId, input.code);
    const existing = this.store.achievements.get(key);
    if (existing) return { achievement: clone(existing), created: false };
    if (input.evidenceIds.length === 0) throw badRequest("Achievements require evidence");
    const achievement: Achievement = {
      id: `ach-${input.studentId}-${input.code}`,
      studentId: input.studentId,
      code: input.code,
      evidenceIds: [...input.evidenceIds],
      ...(input.sourceEventId ? { sourceEventId: input.sourceEventId } : {}),
      unlockedAt: input.at ?? this.now(),
    };
    this.store.achievements.set(key, achievement);
    const celebrationId = achievementCatalogue.find(
      (definition) => definition.code === input.code,
    )?.celebrationId;
    if (celebrationId) {
      const queue = this.store.celebrations.get(input.studentId) ?? [];
      if (!queue.includes(celebrationId)) queue.push(celebrationId);
      this.store.celebrations.set(input.studentId, queue);
    }
    return { achievement: clone(achievement), created: true };
  }

  /**
   * Entry point for Learning (Person 2) events. Maps facts to unlocks only; it does not touch
   * mastery, house status or planet growth. Duplicate event ids are ignored. Returns the
   * achievements newly unlocked by this event. No event bus exists yet: wire this later.
   */
  handleLearningEvent(input: LearningEvent | unknown): Achievement[] {
    return this.applyEvent(learningEventSchema.parse(input));
  }

  private applyEvent(event: WorldEvent): Achievement[] {
    this.assertStudent(event.studentId);
    if (this.store.processedEventIds.has(event.id)) return [];
    this.store.processedEventIds.add(event.id);
    const codes = achievementCodesFor(event, this.store.ruleContext(event.studentId));
    const evidenceIds = event.evidenceIds.length > 0 ? event.evidenceIds : [event.id];
    return codes.flatMap((code) => {
      const result = this.unlock({
        studentId: event.studentId,
        code,
        evidenceIds,
        sourceEventId: event.id,
        at: event.occurredAt,
      });
      return result.created ? [result.achievement] : [];
    });
  }

  // ---- Easter eggs -------------------------------------------------------

  /** Idempotent discovery. Never changes mastery, house status or planet growth. */
  discoverEasterEgg(code: string, body: unknown): EasterEggDiscoveryResult {
    const { studentId } = easterEggDiscoveryRequestSchema.parse(body);
    if (!this.store.easterEggs.has(code)) throw notFound("Easter egg", code);
    this.assertStudent(studentId);
    const key = this.store.achievementKey(studentId, code);
    const previous = this.store.discoveries.get(key);
    if (previous)
      return {
        code,
        studentId,
        discoveredAt: previous,
        firstDiscovery: false,
        unlockedAchievements: [],
      };
    const discoveredAt = this.now();
    this.store.discoveries.set(key, discoveredAt);
    const discoveryId = `egg-${studentId}-${code}`;
    const unlockedAchievements = this.applyEvent({
      type: "EasterEggDiscovered",
      id: discoveryId,
      studentId,
      code,
      evidenceIds: [discoveryId],
      occurredAt: discoveredAt,
    });
    return { code, studentId, discoveredAt, firstDiscovery: true, unlockedAchievements };
  }

  // ---- Cosmetic interactions ----------------------------------------------

  /** Records a cosmetic interaction. It is never learning evidence. */
  recordInteraction(body: unknown): WorldInteractionResult {
    const interaction = worldInteractionSchema.parse(body);
    this.assertStudent(interaction.studentId);
    const id = this.store.nextId("interaction");
    this.store.interactions.push({ ...interaction, id });
    if (interaction.kind === "accessibility_changed" && interaction.accessibility)
      this.store.accessibility.set(interaction.studentId, {
        ...this.store.accessibilityFor(interaction.studentId),
        ...interaction.accessibility,
      });
    if (interaction.kind === "celebration_seen" && interaction.targetId) {
      const queue = this.store.celebrations.get(interaction.studentId) ?? [];
      this.store.celebrations.set(
        interaction.studentId,
        queue.filter((celebrationId) => celebrationId !== interaction.targetId),
      );
    }
    return { interactionId: id, world: this.getWorld(interaction.studentId) };
  }

  // ---- Teams -------------------------------------------------------------

  createTeam(body: unknown): TeamState {
    const input = createTeamRequestSchema.parse(body);
    const roster = this.store.classStudents.get(input.classId);
    if (!roster) throw notFound("Class", input.classId);
    const outsiders = input.memberIds.filter((id) => !roster.includes(id));
    if (outsiders.length > 0)
      throw badRequest(`Students are not in class ${input.classId}: ${outsiders.join(", ")}`);
    const team = {
      id: this.store.nextId("team"),
      classId: input.classId,
      name: input.name,
      memberIds: [...input.memberIds],
      createdBy: input.createdBy,
      createdAt: this.now(),
    };
    this.store.teams.set(team.id, team);
    return this.getTeam(team.id);
  }

  getTeam(teamId: string): TeamState {
    const team = this.store.teams.get(teamId);
    if (!team) throw notFound("Team", teamId);
    const challenges = [...this.store.challenges.values()].filter((item) => item.teamId === teamId);
    return clone({ ...team, challenges });
  }

  createChallenge(teamId: string, body: unknown): TeamChallenge {
    const team = this.store.teams.get(teamId);
    if (!team) throw notFound("Team", teamId);
    const input = createTeamChallengeRequestSchema.parse(body);
    const challenge: TeamChallenge = {
      id: this.store.nextId("challenge"),
      teamId,
      topicId: input.topicId,
      title: input.title,
      memberIds: [...team.memberIds],
      status: "available",
      sharedProgress: 0,
      requiredSuccesses: input.requiredSuccesses,
      successfulAttemptIds: [],
    };
    this.store.challenges.set(challenge.id, challenge);
    return clone(challenge);
  }

  /**
   * Counts a member's attempt. `success` comes from Learning's evaluation (port pending
   * Person 2). Repeated evidence ids are not double-counted; completed challenges are final.
   */
  attemptChallenge(teamId: string, challengeId: string, body: unknown): TeamChallengeAttemptResult {
    const team = this.store.teams.get(teamId);
    if (!team) throw notFound("Team", teamId);
    const challenge = this.store.challenges.get(challengeId);
    if (!challenge || challenge.teamId !== teamId) throw notFound("Challenge", challengeId);
    const attempt = teamChallengeAttemptSchema.parse(body);
    if (!team.memberIds.includes(attempt.studentId))
      throw forbidden(`Student ${attempt.studentId} is not a member of team ${teamId}`);
    if (challenge.status === "completed")
      return { challenge: clone(challenge), unlockedAchievements: [] };

    challenge.status = "active";
    if (attempt.success && !challenge.successfulAttemptIds.includes(attempt.evidenceId))
      challenge.successfulAttemptIds.push(attempt.evidenceId);
    challenge.sharedProgress = Math.min(
      1,
      challenge.successfulAttemptIds.length / challenge.requiredSuccesses,
    );
    const unlockedAchievements: Achievement[] = [];
    if (challenge.successfulAttemptIds.length >= challenge.requiredSuccesses) {
      challenge.status = "completed";
      challenge.completedAt = attempt.at;
      for (const studentId of challenge.memberIds)
        unlockedAchievements.push(
          ...this.applyEvent({
            type: "TeamChallengeCompleted",
            id: `team-complete-${challenge.id}-${studentId}`,
            studentId,
            teamId,
            challengeId: challenge.id,
            evidenceIds: [...challenge.successfulAttemptIds],
            occurredAt: attempt.at,
          }),
        );
    }
    return { challenge: clone(challenge), unlockedAchievements };
  }

  private assertStudent(studentId: string): void {
    if (!this.store.planets.has(studentId)) throw notFound("Student", studentId);
  }
}
