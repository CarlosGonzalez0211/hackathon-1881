import { z } from "zod";
import { citationSchema } from "./curriculum.js";
import { idSchema, isoDateSchema } from "./common.js";

/** Proposed GAMEPLAN contracts. Coordinate with the team before treating these as frozen. */
export const houseStatusSchema = z.enum(["locked", "available", "in_progress", "done"]);
export const houseStateSchema = z.object({
  topicId: z.string().min(1),
  title: z.string().min(1),
  slot: z.number().int().nonnegative(),
  status: houseStatusSchema,
  progress: z.number().min(0).max(1),
});
export type HouseState = z.infer<typeof houseStateSchema>;

export const planetStateSchema = z.object({
  studentId: z.string().min(1),
  // Developer-defined identity. This is not a user appearance picker.
  theme: z.object({ palette: z.string().min(1), character: z.string().min(1) }),
  growth: z.number().min(0).max(1),
  houses: z.array(houseStateSchema).superRefine((houses, ctx) => {
    const slots = new Set<number>();
    for (const [index, house] of houses.entries()) {
      if (slots.has(house.slot))
        ctx.addIssue({
          code: "custom",
          path: [index, "slot"],
          message: "A planet slot can contain only one topic",
        });
      slots.add(house.slot);
    }
  }),
});
export type PlanetState = z.infer<typeof planetStateSchema>;

export const aiEventKindSchema = z.enum([
  "chat",
  "podcast",
  "video",
  "summary",
  "hint",
  "quiz_answer",
]);
export const aiEventSchema = z.object({
  studentId: z.string().min(1),
  topicId: z.string().min(1),
  kind: aiEventKindSchema,
  at: z.string().datetime(),
  meta: z.record(z.unknown()),
});
export type AiEvent = z.infer<typeof aiEventSchema>;
const aiUsageSchema = z.object({
  chat: z.number().int().nonnegative(),
  podcast: z.number().int().nonnegative(),
  video: z.number().int().nonnegative(),
  summary: z.number().int().nonnegative(),
  hint: z.number().int().nonnegative(),
  quiz_answer: z.number().int().nonnegative(),
});
const topicProgressSchema = z.object({
  topicId: z.string(),
  title: z.string(),
  progress: z.number().min(0).max(1),
});
export const classSummarySchema = z.object({
  classId: z.string().min(1),
  topics: z.array(topicProgressSchema),
  aiUsage: aiUsageSchema,
  students: z.array(
    z.object({
      studentId: z.string(),
      growth: z.number().min(0).max(1),
      topics: z.array(topicProgressSchema),
      aiUsage: aiUsageSchema,
    }),
  ),
});
export type ClassSummary = z.infer<typeof classSummarySchema>;

/** Adaptive-learning contracts owned by Subsystem 2. */
export const teachingStrategySchema = z.enum([
  "concise_text",
  "deep_explanation",
  "worked_example",
  "visual_decomposition",
  "guided_questioning",
  "practice_first",
  "storytelling",
  "audio_summary",
  "podcast",
  "flashcards",
]);
export type TeachingStrategy = z.infer<typeof teachingStrategySchema>;

export const conceptStatusSchema = z.enum(["mastered", "partial", "struggling", "unassessed"]);
export type ConceptStatus = z.infer<typeof conceptStatusSchema>;

export const diagnosticAnswerSchema = z.object({
  questionId: idSchema,
  answer: z.unknown(),
  confidence: z.number().min(0).max(1).optional(),
});
export type DiagnosticAnswer = z.infer<typeof diagnosticAnswerSchema>;

export const diagnosticSubmissionSchema = z.object({
  studentId: idSchema,
  courseId: idSchema,
  topicId: idSchema,
  answers: z.array(diagnosticAnswerSchema).min(1),
});
export type DiagnosticSubmission = z.infer<typeof diagnosticSubmissionSchema>;

export const conceptResultSchema = z.object({
  conceptId: idSchema,
  conceptTitle: z.string().min(1),
  score: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  status: conceptStatusSchema,
  misconceptionIds: z.array(idSchema),
});
export type ConceptResult = z.infer<typeof conceptResultSchema>;

export const diagnosticResultSchema = z.object({
  attemptId: idSchema,
  studentId: idSchema,
  courseId: idSchema,
  topicId: idSchema,
  concepts: z.array(conceptResultSchema),
  strengths: z.array(z.string()),
  struggles: z.array(z.string()),
  recommendation: z.object({
    topicId: idSchema,
    conceptId: idSchema.optional(),
    reason: z.string().min(1),
    suggestedStrategy: teachingStrategySchema,
  }),
  completedAt: isoDateSchema,
});
export type DiagnosticResult = z.infer<typeof diagnosticResultSchema>;

export const checkpointSubmissionSchema = z.object({
  studentId: idSchema,
  courseId: idSchema,
  topicId: idSchema,
  conceptId: idSchema,
  questionId: idSchema,
  answer: z.unknown(),
  strategy: teachingStrategySchema,
  hintCount: z.number().int().nonnegative().default(0),
});
export type CheckpointSubmission = z.infer<typeof checkpointSubmissionSchema>;

export const checkpointEvidenceSchema = z.object({
  id: idSchema,
  studentId: idSchema,
  topicId: idSchema,
  conceptId: idSchema,
  questionId: idSchema,
  correct: z.boolean(),
  score: z.number().min(0).max(1),
  difficulty: z.number().min(0).max(1),
  strategy: teachingStrategySchema,
  hintCount: z.number().int().nonnegative(),
  evidenceEligible: z.boolean(),
  misconceptionResolved: z.boolean(),
  submittedAt: isoDateSchema,
});
export type CheckpointEvidence = z.infer<typeof checkpointEvidenceSchema>;

export const studentTopicMasterySchema = z.object({
  studentId: idSchema,
  topicId: idSchema,
  mastery: z.number().min(0).max(1),
  demonstratedConceptIds: z.array(idSchema),
  evidenceIds: z.array(idSchema),
  confidence: z.number().min(0).max(1),
  updatedAt: isoDateSchema,
});
export type StudentTopicMastery = z.infer<typeof studentTopicMasterySchema>;

export const strategyPosteriorSchema = z.object({
  strategy: teachingStrategySchema,
  contextKey: z.string().min(1),
  alpha: z.number().positive(),
  beta: z.number().positive(),
  observations: z.number().int().nonnegative(),
});
export type StrategyPosterior = z.infer<typeof strategyPosteriorSchema>;

export const strategyObservationSchema = z.object({
  id: idSchema,
  studentId: idSchema,
  topicId: idSchema,
  conceptId: idSchema,
  strategy: teachingStrategySchema,
  contextKey: z.string().min(1),
  beforeScore: z.number().min(0).max(1),
  afterScore: z.number().min(0).max(1),
  misconceptionResolved: z.boolean(),
  retentionPassed: z.boolean().optional(),
  reward: z.number().min(0).max(1),
  observedAt: isoDateSchema,
});
export type StrategyObservation = z.infer<typeof strategyObservationSchema>;

export const conceptKnowledgeStateSchema = z.object({
  studentId: idSchema,
  conceptId: idSchema,
  probabilityKnown: z.number().min(0).max(1),
  evidenceCount: z.number().int().nonnegative(),
  updatedAt: isoDateSchema,
});
export type ConceptKnowledgeState = z.infer<typeof conceptKnowledgeStateSchema>;

export const retentionScheduleSchema = z.object({
  studentId: idSchema,
  conceptId: idSchema,
  successfulRecallStreak: z.number().int().nonnegative(),
  intervalDays: z.number().int().positive(),
  dueAt: isoDateSchema,
});
export type RetentionSchedule = z.infer<typeof retentionScheduleSchema>;

export const checkpointResultSchema = z.object({
  evidence: checkpointEvidenceSchema,
  mastery: studentTopicMasterySchema,
  activeMisconceptionIds: z.array(idSchema),
  recommendedStrategy: teachingStrategySchema,
  strategyChanged: z.boolean(),
  retention: retentionScheduleSchema.optional(),
});
export type CheckpointResult = z.infer<typeof checkpointResultSchema>;

export const tutorMessageSchema = z.object({
  id: idSchema,
  sessionId: idSchema,
  role: z.enum(["student", "tutor"]),
  content: z.string().min(1),
  strategy: teachingStrategySchema.optional(),
  citations: z.array(citationSchema),
  unsupported: z.boolean().default(false),
  createdAt: isoDateSchema,
});
export type TutorMessage = z.infer<typeof tutorMessageSchema>;

export const studentLearningStateSchema = z.object({
  studentId: idSchema,
  diagnostics: z.array(diagnosticResultSchema),
  mastery: z.array(studentTopicMasterySchema),
  knowledge: z.array(conceptKnowledgeStateSchema),
  activeMisconceptionIds: z.array(idSchema),
  retention: z.array(retentionScheduleSchema),
});
export type StudentLearningState = z.infer<typeof studentLearningStateSchema>;
