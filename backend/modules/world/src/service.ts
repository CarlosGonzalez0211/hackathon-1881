import {
  achievementCatalogue,
  createTeamChallengeRequestSchema,
  createTeamRequestSchema,
  diffHouses,
  easterEggDiscoveryRequestSchema,
  houseEntryMode,
  houseEntryRequestSchema,
  learningEventSchema,
  missingPrerequisiteIds,
  projectPlanet,
  buildWorldLayout,
  teamChallengeAttemptSchema,
  worldInteractionSchema,
  type Achievement,
  type AchievementCode,
  type CurriculumTopicSummary,
  type EasterEggDiscoveryResult,
  type HouseEntryResult,
  type HouseTransition,
  type LearningEvent,
  type LearningEventIngestResult,
  type PlanetProjection,
  type PlanetState,
  type StudentMasterySnapshot,
  type QuestState,
  type TeamChallengeAttemptResult,
  type TeamChallenge,
  type TeamState,
  type WorldInteractionResult,
  type WorldLayout,
  type WorldView,
} from "@athena/shared";
import { badRequest, forbidden, notFound } from "./errors.js";
import { createMockWorldPorts } from "./mock-ports.js";
import type { Enrollment, WorldPorts } from "./ports.js";
import { achievementCodesFor, type WorldEvent } from "./rules.js";
import { InMemoryWorldStore } from "./store.js";

export interface WorldServiceOptions {
  store?: InMemoryWorldStore;
  /** Injected clock keeps demos and tests deterministic. */
  now?: () => string;
  /** Curriculum, Learning and Enrollment readers. Defaults to the demo mocks. */
  ports?: WorldPorts;
}

/** Everything one projection read: who, which course, what topics and mastery. */
interface StudentProjection extends PlanetProjection {
  enrollment: Enrollment;
  topics: CurriculumTopicSummary[];
  mastery: StudentMasterySnapshot;
  /** Transitions detected by this read (also queued until acknowledged). */
  newTransitions: HouseTransition[];
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/**
 * World, Progression, and Collaboration domain service.
 * Rules: the world never computes or writes mastery, game activity (interactions, Easter eggs,
 * team challenges) never changes house status or progress, and every unlock is idempotent.
 */
export class WorldService {
  readonly store: InMemoryWorldStore;
  readonly ports: WorldPorts;
  private readonly now: () => string;

  constructor(options: WorldServiceOptions = {}) {
    this.store = options.store ?? InMemoryWorldStore.seeded();
    this.ports = options.ports ?? createMockWorldPorts();
    this.now = options.now ?? (() => new Date().toISOString());
  }

  // ---- Projection (Curriculum topics + Learning mastery -> planet) ---------

  /**
   * Projects the student's planet and records status changes against what the student was
   * last shown. The first read only sets the baseline. Never writes mastery or topics.
   */
  async project(studentId: string): Promise<StudentProjection> {
    const enrollment = await this.ports.enrollment.getEnrollment(studentId);
    if (!enrollment) throw notFound("Student", studentId);
    const topics = await this.ports.curriculum.listTopics(enrollment.courseId);
    const mastery = await this.ports.mastery.getStudentMastery(
      studentId,
      topics.map((topic) => topic.id),
    );
    const projection = projectPlanet({ studentId, topics, mastery });
    const shown = [...projection.planet.houses, ...projection.overflowTopics];
    const seen = this.store.seenHouses.get(studentId);
    const newTransitions: HouseTransition[] = seen
      ? diffHouses(seen, shown).map(({ house, from }) => {
          const causeEventId = this.store.lastLearningEvent.get(`${studentId}:${house.topicId}`);
          return {
            id: this.store.nextId("transition"),
            studentId,
            topicId: house.topicId,
            title: house.title,
            slot: house.slot,
            from,
            to: house.status,
            ...(causeEventId ? { causeEventId } : {}),
            at: this.now(),
          };
        })
      : [];
    this.store.seenHouses.set(studentId, clone(shown));
    if (newTransitions.length > 0)
      this.store.transitions.set(studentId, [
        ...(this.store.transitions.get(studentId) ?? []),
        ...newTransitions,
      ]);
    return { ...projection, enrollment, topics, mastery, newTransitions };
  }

  // ---- Read models -------------------------------------------------------

  async getPlanet(studentId: string): Promise<PlanetState> {
    return (await this.project(studentId)).planet;
  }

  async getClassPlanets(classId: string): Promise<PlanetState[]> {
    const studentIds = await this.ports.enrollment.listStudents(classId);
    if (!studentIds) throw notFound("Class", classId);
    const planets: PlanetState[] = [];
    for (const id of studentIds) planets.push(await this.getPlanet(id));
    return planets;
  }

  /** Where each published topic of a course lands (professor-facing). */
  async getWorldLayout(courseId: string): Promise<WorldLayout> {
    const topics = await this.ports.curriculum.listTopics(courseId);
    if (topics.length === 0) throw notFound("Course", courseId);
    return buildWorldLayout(courseId, topics);
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

  async getWorld(studentId: string): Promise<WorldView> {
    const { planet, overflowTopics } = await this.project(studentId);
    return {
      studentId,
      planet,
      overflowTopics,
      pendingTransitions: clone(this.store.transitions.get(studentId) ?? []),
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

  /**
   * Learning -> World sink (`POST /world/events`). Learning has already stored the new
   * mastery, so after the unlocks World re-projects and reports the house transitions.
   */
  async ingestLearningEvent(input: LearningEvent | unknown): Promise<LearningEventIngestResult> {
    const event = learningEventSchema.parse(input);
    const unlockedAchievements = this.applyEvent(event);
    const { newTransitions } = await this.project(event.studentId);
    return { unlockedAchievements, transitions: newTransitions };
  }

  private applyEvent(event: WorldEvent): Achievement[] {
    this.assertStudent(event.studentId);
    const eventKey = `${event.studentId}:${event.id}`;
    if (this.store.processedEventIds.has(eventKey)) return [];
    this.store.processedEventIds.add(eventKey);
    if ("topicId" in event)
      this.store.lastLearningEvent.set(`${event.studentId}:${event.topicId}`, event.id);
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
  async recordInteraction(body: unknown): Promise<WorldInteractionResult> {
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
    if (interaction.kind === "transition_seen" && interaction.targetId)
      this.store.transitions.set(
        interaction.studentId,
        (this.store.transitions.get(interaction.studentId) ?? []).filter(
          (transition) => transition.id !== interaction.targetId,
        ),
      );
    return { interactionId: id, world: await this.getWorld(interaction.studentId) };
  }

  // ---- Houses ------------------------------------------------------------

  /**
   * A student activates a house (3D door or 2D list). The server re-checks the gate the
   * client already applied, records a cosmetic `house_opened` visit and tells the house page
   * how to open. A visit is never learning evidence and never changes status.
   */
  async enterHouse(body: unknown): Promise<HouseEntryResult> {
    const { studentId, topicId } = houseEntryRequestSchema.parse(body);
    const { planet, overflowTopics, topics, mastery, enrollment } = await this.project(studentId);
    const house = [...planet.houses, ...overflowTopics].find((item) => item.topicId === topicId);
    if (!house) {
      if (!topics.some((topic) => topic.id === topicId)) throw notFound("Topic", topicId);
      return { granted: false, reason: "not_published", missingPrerequisites: [] };
    }
    const mode = houseEntryMode(house.status);
    if (!mode) {
      const published = new Map(
        topics.filter((topic) => topic.published).map((topic) => [topic.id, topic]),
      );
      const topic = published.get(topicId)!;
      const all = [...planet.houses, ...overflowTopics];
      return {
        granted: false,
        reason: "locked",
        house,
        missingPrerequisites: missingPrerequisiteIds(topic, published, mastery).map((id) => {
          const prerequisite = all.find((item) => item.topicId === id);
          return {
            topicId: id,
            title: prerequisite?.title ?? topics.find((item) => item.id === id)?.title ?? id,
            status: prerequisite?.status ?? "locked",
            // Only 3D houses have a slot to walk to; overflow topics live in the 2D list.
            ...(prerequisite && planet.houses.includes(prerequisite)
              ? { slot: prerequisite.slot }
              : {}),
          };
        }),
      };
    }
    const entryId = this.store.nextId("entry");
    this.store.interactions.push({
      id: entryId,
      studentId,
      kind: "house_opened",
      targetId: topicId,
      at: this.now(),
    });
    const detail = mastery.topics.find((item) => item.topicId === topicId);
    return {
      granted: true,
      entryId,
      mode,
      house,
      courseId: enrollment.courseId,
      ...(detail ? { mastery: detail } : {}),
    };
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
   * Completion needs `requiredSuccesses` successes from at least
   * min(requiredSuccesses, memberCount) distinct members, so one member cannot carry the
   * team; `team-spark` unlocks only for members who contributed a successful attempt.
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
    const contributors =
      this.store.challengeContributors.get(challenge.id) ?? new Map<string, string>();
    this.store.challengeContributors.set(challenge.id, contributors);
    if (attempt.success && !challenge.successfulAttemptIds.includes(attempt.evidenceId)) {
      challenge.successfulAttemptIds.push(attempt.evidenceId);
      contributors.set(attempt.evidenceId, attempt.studentId);
    }
    const contributorIds = challenge.memberIds.filter((id) =>
      [...contributors.values()].includes(id),
    );
    const requiredMembers = Math.min(challenge.requiredSuccesses, challenge.memberIds.length);
    challenge.sharedProgress = Math.min(
      1,
      challenge.successfulAttemptIds.length / challenge.requiredSuccesses,
      contributorIds.length / requiredMembers,
    );
    const unlockedAchievements: Achievement[] = [];
    if (
      challenge.successfulAttemptIds.length >= challenge.requiredSuccesses &&
      contributorIds.length >= requiredMembers
    ) {
      challenge.status = "completed";
      challenge.completedAt = attempt.at;
      for (const studentId of contributorIds)
        unlockedAchievements.push(
          ...this.applyEvent({
            type: "TeamChallengeCompleted",
            id: `team-complete-${challenge.id}`,
            studentId,
            teamId,
            challengeId: challenge.id,
            evidenceIds: challenge.successfulAttemptIds.filter(
              (evidenceId) => contributors.get(evidenceId) === studentId,
            ),
            occurredAt: attempt.at,
          }),
        );
    }
    return { challenge: clone(challenge), unlockedAchievements };
  }

  private assertStudent(studentId: string): void {
    if (!this.store.studentIds.has(studentId)) throw notFound("Student", studentId);
  }
}
