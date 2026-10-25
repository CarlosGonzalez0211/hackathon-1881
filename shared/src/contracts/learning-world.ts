import { z } from "zod";
import {
  DEMO_STUDENT_ID,
  demoCheckpointEvents,
  demoClassPlanets,
  type LearningEvent,
} from "../world.js";

/**
 * P2 Learning <-> World contract. PROPOSAL for team review, not frozen.
 * P2 owns mastery (deterministic, non-decreasing, evidence-based). World only reads it and
 * receives learning events (schemas in world.ts). Spec: docs/contracts/P2-learning-world.md.
 */

const idSchema = z.string().min(1).max(200);
const isoDateSchema = z.string().datetime();

export const topicMasterySchema = z.object({
  topicId: idSchema,
  /** 0..1, computed by Learning from validated evidence only. */
  mastery: z.number().min(0).max(1),
  demonstratedConcepts: z.number().int().nonnegative().optional(),
  totalConcepts: z.number().int().positive().optional(),
  /** Short next step for the house header, e.g. "Practicar el área de triángulos". */
  nextAction: z.string().min(1).optional(),
  updatedAt: isoDateSchema.optional(),
});
export type TopicMastery = z.infer<typeof topicMasterySchema>;

/**
 * `GET /api/learning/student/:studentId/mastery?topicIds=a,b`. Topics without evidence may
 * be omitted (mastery 0). `growth` is optional: when absent World uses mean house progress.
 */
export const studentMasterySnapshotSchema = z.object({
  studentId: idSchema,
  topics: z.array(topicMasterySchema),
  growth: z.number().min(0).max(1).optional(),
});
export type StudentMasterySnapshot = z.infer<typeof studentMasterySnapshotSchema>;

/** `POST /api/learning/session`: opened by the house page Aprender tab. */
export const learningSessionStartRequestSchema = z.object({
  studentId: idSchema,
  topicId: idSchema,
  /** World's cosmetic visit id, for analytics only. */
  entryId: idSchema.optional(),
});
export type LearningSessionStartRequest = z.infer<typeof learningSessionStartRequestSchema>;

export const learningSessionStartSchema = z.object({
  sessionId: idSchema,
  topicId: idSchema,
  /** Learning's teachingStrategy id (proposal 4.2). */
  strategy: z.string().min(1),
  resumed: z.boolean(),
});
export type LearningSessionStart = z.infer<typeof learningSessionStartSchema>;

/** `POST /api/learning/hint`. Lumen and the house page ask; the answer is never revealed. */
export const hintRequestSchema = z.object({
  studentId: idSchema,
  topicId: idSchema,
  sessionId: idSchema.optional(),
  source: z.enum(["lumen", "house"]),
});
export type HintRequest = z.infer<typeof hintRequestSchema>;

export const hintResponseSchema = z.object({
  message: z.string().min(1),
  /** Material citations backing the hint (P1 citation ids). */
  citationIds: z.array(idSchema),
});
export type HintResponse = z.infer<typeof hintResponseSchema>;

// ---------------------------------------------------------------------------
// Demo fixtures
// ---------------------------------------------------------------------------

/** Header detail for Lucía's Geometry house (proposal 5.8). */
export const demoLuciaGeometryDetail: TopicMastery = {
  topicId: "topic-geometry",
  mastery: 0.4,
  demonstratedConcepts: 2,
  totalConcepts: 5,
  nextAction: "Practicar el área de triángulos",
};

/** Mastery snapshots that reproduce `demoClassPlanets` through the World projection. */
export const demoClassMastery: StudentMasterySnapshot[] = demoClassPlanets.map((planet) => ({
  studentId: planet.studentId,
  growth: planet.growth,
  topics: planet.houses
    .filter((house) => house.progress > 0)
    .map((house) =>
      planet.studentId === DEMO_STUDENT_ID && house.topicId === demoLuciaGeometryDetail.topicId
        ? demoLuciaGeometryDetail
        : { topicId: house.topicId, mastery: house.progress },
    ),
}));

/** One deterministic step of the mocked Learning side: new mastery plus its events. */
export interface DemoLearningStep {
  id: string;
  studentId: string;
  mastery: TopicMastery[];
  growth: number;
  events: LearningEvent[];
}

/**
 * Lucía's progression after DEMO_INITIAL (proposal 2.5, 8.2):
 * second checkpoint passed (Geometry 0.40 -> 0.60), then Geometry mastered (0.85), which
 * turns Geometry done and unlocks Estadística.
 */
export const demoLearningScenario: DemoLearningStep[] = [
  {
    id: "SECOND_CHECKPOINT_PASSED",
    studentId: DEMO_STUDENT_ID,
    growth: 0.35,
    mastery: [{ ...demoLuciaGeometryDetail, mastery: 0.6, demonstratedConcepts: 3 }],
    events: demoCheckpointEvents,
  },
  {
    id: "GEOMETRY_MASTERED",
    studentId: DEMO_STUDENT_ID,
    growth: 0.42,
    mastery: [
      {
        ...demoLuciaGeometryDetail,
        mastery: 0.85,
        demonstratedConcepts: 5,
        nextAction: "Repasar cuando quieras",
      },
    ],
    events: [
      {
        id: "evt-mastery-updated-2",
        type: "MasteryUpdated",
        studentId: DEMO_STUDENT_ID,
        topicId: "topic-geometry",
        mastery: 0.85,
        previousMastery: 0.6,
        evidenceIds: ["attempt-checkpoint-3"],
        occurredAt: "2026-10-24T15:20:00.000Z",
      },
    ],
  },
];
