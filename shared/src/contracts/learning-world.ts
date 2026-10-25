import { z } from "zod";
import { idSchema, isoDateSchema } from "../common.js";

export const topicMasterySchema = z.object({
  topicId: idSchema,
  mastery: z.number().min(0).max(1),
  demonstratedConcepts: z.number().int().nonnegative().optional(),
  totalConcepts: z.number().int().positive().optional(),
  nextAction: z.string().min(1).optional(),
  updatedAt: isoDateSchema.optional(),
});
export type TopicMastery = z.infer<typeof topicMasterySchema>;

export const studentMasterySnapshotSchema = z.object({
  studentId: idSchema,
  topics: z.array(topicMasterySchema),
  growth: z.number().min(0).max(1).optional(),
});
export type StudentMasterySnapshot = z.infer<typeof studentMasterySnapshotSchema>;

export const worldLearningSessionStartRequestSchema = z.object({
  studentId: idSchema,
  topicId: idSchema,
  entryId: idSchema.optional(),
});
export type WorldLearningSessionStartRequest = z.infer<
  typeof worldLearningSessionStartRequestSchema
>;

export const worldLearningSessionStartSchema = z.object({
  sessionId: idSchema,
  topicId: idSchema,
  strategy: z.string().min(1),
  resumed: z.boolean(),
});
export type WorldLearningSessionStart = z.infer<typeof worldLearningSessionStartSchema>;

export const worldHintRequestSchema = z.object({
  studentId: idSchema,
  topicId: idSchema,
  sessionId: idSchema.optional(),
  source: z.enum(["lumen", "house"]),
});
export type WorldHintRequest = z.infer<typeof worldHintRequestSchema>;

export const worldHintResponseSchema = z.object({
  message: z.string().min(1),
  citationIds: z.array(idSchema),
});
export type WorldHintResponse = z.infer<typeof worldHintResponseSchema>;

const learningEventBase = {
  id: idSchema,
  studentId: idSchema,
  topicId: idSchema,
  occurredAt: isoDateSchema,
  evidenceIds: z.array(idSchema),
};

export const worldLearningEventSchema = z.discriminatedUnion("type", [
  z.object({
    ...learningEventBase,
    type: z.literal("MasteryUpdated"),
    mastery: z.number().min(0).max(1),
    previousMastery: z.number().min(0).max(1).optional(),
  }),
  z.object({
    ...learningEventBase,
    type: z.literal("MisconceptionResolved"),
    misconceptionId: idSchema,
  }),
  z.object({
    ...learningEventBase,
    type: z.literal("StrategyChanged"),
    fromStrategy: z.string().min(1),
    toStrategy: z.string().min(1),
  }),
  z.object({
    ...learningEventBase,
    type: z.literal("RetentionCheckPassed"),
    conceptId: idSchema.optional(),
  }),
]);
export type WorldLearningEvent = z.infer<typeof worldLearningEventSchema>;

export const worldLearningEventIngestResultSchema = z.object({
  unlockedAchievements: z.array(z.unknown()).default([]),
  transitions: z.array(z.unknown()).default([]),
});
export type WorldLearningEventIngestResult = z.infer<typeof worldLearningEventIngestResultSchema>;
