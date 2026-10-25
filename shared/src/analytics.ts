import { z } from "zod";
import { idSchema } from "./common.js";

/**
 * Analytics contracts (Platform owner). AI usage is descriptive evidence shown beside
 * mastery; it never feeds mastery or growth. The earlier ClassSummary in learning.ts is kept
 * until the team reconciles it with classAnalyticsSchema.
 */
export const aiUsageCountsSchema = z.object({
  chat: z.number().int().nonnegative(),
  podcast: z.number().int().nonnegative(),
  video: z.number().int().nonnegative(),
  summary: z.number().int().nonnegative(),
  hint: z.number().int().nonnegative(),
  quiz_answer: z.number().int().nonnegative(),
});
export type AiUsageCounts = z.infer<typeof aiUsageCountsSchema>;
export const emptyAiUsage = (): AiUsageCounts => ({
  chat: 0,
  podcast: 0,
  video: 0,
  summary: 0,
  hint: 0,
  quiz_answer: 0,
});

export const topicAnalyticsSchema = z.object({
  topicId: idSchema,
  title: z.string(),
  averageMastery: z.number().min(0).max(1),
  masteredStudents: z.number().int().nonnegative(),
  strugglingStudents: z.number().int().nonnegative(),
  commonMisconceptions: z.array(
    z.object({ code: z.string(), label: z.string(), studentCount: z.number().int().nonnegative() }),
  ),
});
export type TopicAnalytics = z.infer<typeof topicAnalyticsSchema>;

export const interventionStatusSchema = z.enum(["open", "acknowledged", "resolved"]);
export type InterventionStatus = z.infer<typeof interventionStatusSchema>;
export const interventionSchema = z.object({
  id: idSchema,
  studentId: idSchema,
  topicId: idSchema,
  severity: z.enum(["low", "medium", "high"]),
  reason: z.string(),
  recommendedAction: z.string(),
  status: interventionStatusSchema,
});
export type Intervention = z.infer<typeof interventionSchema>;

export const interventionStatusUpdateSchema = z.object({ status: interventionStatusSchema });
export type InterventionStatusUpdate = z.infer<typeof interventionStatusUpdateSchema>;

export const studentAnalyticsSchema = z.object({
  studentId: idSchema,
  displayName: z.string(),
  growth: z.number().min(0).max(1),
  averageMastery: z.number().min(0).max(1),
  openInterventions: z.number().int().nonnegative(),
  aiUsage: aiUsageCountsSchema,
});
export type StudentAnalytics = z.infer<typeof studentAnalyticsSchema>;

export const classAnalyticsSchema = z.object({
  classId: idSchema,
  courseId: idSchema,
  topics: z.array(topicAnalyticsSchema),
  aiUsage: aiUsageCountsSchema,
  interventions: z.array(interventionSchema),
  students: z.array(studentAnalyticsSchema),
});
export type ClassAnalytics = z.infer<typeof classAnalyticsSchema>;
