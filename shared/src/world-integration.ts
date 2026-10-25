import { z } from "zod";
import {
  houseStateSchema,
  houseStatusSchema,
  type HouseState,
  type PlanetState,
} from "./learning.js";
import type { CurriculumTopicSummary } from "./contracts/curriculum-world.js";
import {
  topicMasterySchema,
  type StudentMasterySnapshot,
  type TopicMastery,
} from "./contracts/learning-world.js";
import { achievementSchema, worldStateSchema } from "./world.js";

/**
 * World integration seams (Subsystem 3). PROPOSAL for team review, not frozen.
 * World owns topic -> house placement, house status projection, entry gating and the
 * transitions it shows. It reads Curriculum (P1) topics and Learning (P2) mastery and never
 * writes either. See docs/WORLD_INTEGRATION.md and docs/contracts/world-api.md.
 */

const idSchema = z.string().min(1).max(200);
const isoDateSchema = z.string().datetime();

/** Topic houses on a planet. Must equal the engine's `houseInteractionAnchors.length`. */
export const WORLD_HOUSE_SLOT_COUNT = 6;

/** Developer-defined identity kept for PlanetState compatibility. Not a user picker. */
export const worldTheme = { palette: "athena-default", character: "messenger-provisional" };

// ---------------------------------------------------------------------------
// Entering a house
// ---------------------------------------------------------------------------

export const houseEntryRequestSchema = z.object({ studentId: idSchema, topicId: idSchema });
export type HouseEntryRequest = z.infer<typeof houseEntryRequestSchema>;

/** How the house page opens: fresh, resume where the student was, or review a done topic. */
export const houseEntryModeSchema = z.enum(["enter", "resume", "review"]);
export type HouseEntryMode = z.infer<typeof houseEntryModeSchema>;

export const missingPrerequisiteSchema = z.object({
  topicId: idSchema,
  title: z.string().min(1),
  status: houseStatusSchema,
  /** Slot of the prerequisite house, absent when it only lives in the 2D list. */
  slot: z.number().int().nonnegative().optional(),
});
export type MissingPrerequisite = z.infer<typeof missingPrerequisiteSchema>;

export const houseEntryResultSchema = z.discriminatedUnion("granted", [
  z.object({
    granted: z.literal(true),
    /** Cosmetic visit id. Learning may attach it to a session for analytics, never evidence. */
    entryId: idSchema,
    mode: houseEntryModeSchema,
    house: houseStateSchema,
    courseId: idSchema,
    /** Learning's detail for the header (concepts, next action) when available. */
    mastery: topicMasterySchema.optional(),
  }),
  z.object({
    granted: z.literal(false),
    reason: z.enum(["locked", "not_published"]),
    house: houseStateSchema.optional(),
    missingPrerequisites: z.array(missingPrerequisiteSchema),
  }),
]);
export type HouseEntryResult = z.infer<typeof houseEntryResultSchema>;

/** The single client/server rule for what activating a house does. */
export function houseEntryMode(status: HouseState["status"]): HouseEntryMode | undefined {
  switch (status) {
    case "available":
      return "enter";
    case "in_progress":
      return "resume";
    case "done":
      return "review";
    case "locked":
      return undefined;
  }
}

// ---------------------------------------------------------------------------
// Transitions (what changed since the student last saw their planet)
// ---------------------------------------------------------------------------

export const houseTransitionSchema = z.object({
  id: idSchema,
  studentId: idSchema,
  topicId: idSchema,
  title: z.string().min(1),
  slot: z.number().int().nonnegative(),
  /** `absent` when a newly published topic appears on the planet. */
  from: z.union([houseStatusSchema, z.literal("absent")]),
  to: houseStatusSchema,
  /** Latest learning event for the topic, when World knows which one caused the change. */
  causeEventId: idSchema.optional(),
  at: isoDateSchema,
});
export type HouseTransition = z.infer<typeof houseTransitionSchema>;

/**
 * `GET /world/:studentId` response: WorldState plus integration fields. Additive, so a
 * WorldState parser still accepts it.
 */
export const worldViewSchema = worldStateSchema.extend({
  overflowTopics: z.array(houseStateSchema),
  /** Unseen status changes; acknowledge each with a `transition_seen` interaction. */
  pendingTransitions: z.array(houseTransitionSchema),
});
export type WorldView = z.infer<typeof worldViewSchema>;

/** Response of the Learning -> World event sink (`POST /world/events`). */
export const learningEventIngestResultSchema = z.object({
  unlockedAchievements: z.array(achievementSchema),
  transitions: z.array(houseTransitionSchema),
});
export type LearningEventIngestResult = z.infer<typeof learningEventIngestResultSchema>;

// ---------------------------------------------------------------------------
// Layout (professor-facing: where each published topic lands)
// ---------------------------------------------------------------------------

export const worldLayoutSchema = z.object({
  courseId: idSchema,
  slotCount: z.number().int().positive(),
  slots: z.array(
    z.object({
      slot: z.number().int().nonnegative(),
      topicId: idSchema.nullable(),
      title: z.string().min(1).nullable(),
    }),
  ),
  /** Published topics whose order exceeds the slot count: shown only in the 2D list. */
  overflow: z.array(z.object({ topicId: idSchema, title: z.string().min(1), order: z.number() })),
});
export type WorldLayout = z.infer<typeof worldLayoutSchema>;

// ---------------------------------------------------------------------------
// Presenter-only demo controls (disabled in production)
// ---------------------------------------------------------------------------

export const demoWorldStepRequestSchema = z.object({ studentId: idSchema.optional() });
export const demoWorldStepResultSchema = z.object({
  /** Step just applied, or null when the scenario was already finished. */
  step: z.string().nullable(),
  remaining: z.number().int().nonnegative(),
});
export type DemoWorldStepResult = z.infer<typeof demoWorldStepResultSchema>;

// ---------------------------------------------------------------------------
// Pure projection: Curriculum topics + Learning mastery -> PlanetState
// ---------------------------------------------------------------------------

export interface PlanetProjectionInput {
  studentId: string;
  topics: readonly CurriculumTopicSummary[];
  mastery: StudentMasterySnapshot;
  slotCount?: number;
}

export interface PlanetProjection {
  planet: PlanetState;
  /** Published topics beyond the slot count (slot = order, no 3D anchor). */
  overflowTopics: HouseState[];
}

const round2 = (value: number) => Math.round(value * 100) / 100;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function masteryOf(snapshot: StudentMasterySnapshot, topicId: string): TopicMastery | undefined {
  return snapshot.topics.find((item) => item.topicId === topicId);
}

/**
 * Status rules, in order:
 * - mastery >= the topic's threshold -> done
 * - mastery > 0 -> in_progress (evidence exists, so a house never re-locks)
 * - any prerequisite below its own threshold, or not published -> locked
 * - otherwise available
 * World never computes mastery; it only compares values Learning reported.
 */
export function houseStatusFor(
  topic: CurriculumTopicSummary,
  published: ReadonlyMap<string, CurriculumTopicSummary>,
  snapshot: StudentMasterySnapshot,
): HouseState["status"] {
  const mastery = clamp01(masteryOf(snapshot, topic.id)?.mastery ?? 0);
  if (mastery >= topic.masteryThreshold) return "done";
  if (mastery > 0) return "in_progress";
  return missingPrerequisiteIds(topic, published, snapshot).length > 0 ? "locked" : "available";
}

export function missingPrerequisiteIds(
  topic: CurriculumTopicSummary,
  published: ReadonlyMap<string, CurriculumTopicSummary>,
  snapshot: StudentMasterySnapshot,
): string[] {
  return topic.prerequisiteTopicIds.filter((id) => {
    const prerequisite = published.get(id);
    if (!prerequisite) return true;
    return (masteryOf(snapshot, id)?.mastery ?? 0) < prerequisite.masteryThreshold;
  });
}

export function projectPlanet(input: PlanetProjectionInput): PlanetProjection {
  const slotCount = input.slotCount ?? WORLD_HOUSE_SLOT_COUNT;
  const topics = input.topics
    .filter((topic) => topic.published)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const published = new Map(topics.map((topic) => [topic.id, topic]));
  const toHouse = (topic: CurriculumTopicSummary): HouseState => ({
    topicId: topic.id,
    title: topic.title,
    slot: topic.order,
    status: houseStatusFor(topic, published, input.mastery),
    progress: clamp01(masteryOf(input.mastery, topic.id)?.mastery ?? 0),
  });
  const houses = topics.filter((topic) => topic.order < slotCount).map(toHouse);
  const overflowTopics = topics.filter((topic) => topic.order >= slotCount).map(toHouse);
  const all = [...houses, ...overflowTopics];
  const growth =
    input.mastery.growth ??
    (all.length === 0
      ? 0
      : round2(all.reduce((sum, house) => sum + house.progress, 0) / all.length));
  return {
    planet: { studentId: input.studentId, theme: { ...worldTheme }, growth, houses },
    overflowTopics,
  };
}

/** Status changes between two projections, keyed by topic. */
export function diffHouses(
  previous: readonly HouseState[],
  next: readonly HouseState[],
): { house: HouseState; from: HouseTransition["from"] }[] {
  const before = new Map(previous.map((house) => [house.topicId, house.status]));
  return next.flatMap((house) => {
    const from = before.get(house.topicId) ?? "absent";
    return from === house.status ? [] : [{ house, from }];
  });
}

export function buildWorldLayout(
  courseId: string,
  topics: readonly CurriculumTopicSummary[],
  slotCount = WORLD_HOUSE_SLOT_COUNT,
): WorldLayout {
  const published = topics.filter((topic) => topic.published);
  return {
    courseId,
    slotCount,
    slots: Array.from({ length: slotCount }, (_, slot) => {
      const topic = published.find((item) => item.order === slot);
      return { slot, topicId: topic?.id ?? null, title: topic?.title ?? null };
    }),
    overflow: published
      .filter((topic) => topic.order >= slotCount)
      .sort((a, b) => a.order - b.order)
      .map((topic) => ({ topicId: topic.id, title: topic.title, order: topic.order })),
  };
}
