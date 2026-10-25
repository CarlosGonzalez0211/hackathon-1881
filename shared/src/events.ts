import { z } from "zod";
import { idSchema, isoDateSchema } from "./common.js";

/**
 * Domain events are the integration seam between subsystems (proposal section 7).
 * Events carry ids and facts, never whole domain objects. Every state-changing event
 * has a stable id so handlers can be idempotent.
 */
export const DOMAIN_EVENT_TYPES = [
  "MaterialUploaded",
  "MaterialProcessed",
  "DiagnosticCompleted",
  "CheckpointCompleted",
  "MasteryUpdated",
  "AchievementUnlocked",
  "TeamChallengeCompleted",
  "AiUsageRecorded",
] as const;
export const domainEventTypeSchema = z.enum(DOMAIN_EVENT_TYPES);
export type DomainEventType = z.infer<typeof domainEventTypeSchema>;

export const domainEventSchema = z.object({
  id: idSchema,
  /** Schema version so consumers can reject events they do not understand. */
  version: z.number().int().positive().default(1),
  type: domainEventTypeSchema,
  aggregateType: z.string().min(1),
  aggregateId: idSchema,
  actorId: idSchema.optional(),
  classId: idSchema.optional(),
  courseId: idSchema.optional(),
  studentId: idSchema.optional(),
  occurredAt: isoDateSchema,
  payload: z.record(z.unknown()),
});
export type DomainEvent = z.infer<typeof domainEventSchema>;

export const eventQuerySchema = z.object({
  type: domainEventTypeSchema.optional(),
  classId: idSchema.optional(),
  studentId: idSchema.optional(),
  since: isoDateSchema.optional(),
});
export type EventQuery = z.infer<typeof eventQuerySchema>;

/**
 * Payload proposals for the events analytics projects. Producers (Learning, AI) should emit
 * these shapes; the projection ignores events whose payload does not parse.
 */
const unitInterval = z.number().min(0).max(1);
export const masteryUpdatedPayloadSchema = z.object({
  topicId: idSchema,
  previous: unitInterval,
  next: unitInterval,
  /** Misconception codes observed in the answers that moved this mastery. */
  misconceptions: z.array(z.object({ code: z.string(), label: z.string() })).default([]),
});
export type MasteryUpdatedPayload = z.infer<typeof masteryUpdatedPayloadSchema>;

export const aiUsageRecordedPayloadSchema = z.object({
  kind: z.enum(["chat", "podcast", "video", "summary", "hint", "quiz_answer"]),
});
export type AiUsageRecordedPayload = z.infer<typeof aiUsageRecordedPayloadSchema>;
