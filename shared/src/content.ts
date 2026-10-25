import { z } from "zod";
import { idSchema, isoDateSchema, localeSchema, uuidSchema } from "./common.js";
import { citationSchema, materialStatusSchema } from "./curriculum.js";
import { aiUsageRecordedPayloadSchema } from "./events.js";

/**
 * Content contracts: class material, objectives, milestones and the class-scoped RAG chat
 * (docs/CONTENT_RAG.md). Proposals for team review, not frozen. Reuses P1's material status and
 * citation shapes instead of redefining them.
 */
export const CONTENT_LIMITS = {
  maxFileBytes: 20 * 1024 * 1024,
  maxChunksPerMaterial: 2_000,
  maxTitleLength: 200,
  maxMessageLength: 2_000,
  maxHistoryTurns: 6,
  maxCitationExcerpt: 300,
  maxFlagExcerpt: 280,
  messagesPerWindow: 20,
  windowSeconds: 600,
  messagesPerDay: 150,
  flagRetentionDays: 90,
} as const;

export const contentMimeTypeSchema = z.enum(["application/pdf", "text/plain", "text/markdown"]);
export type ContentMimeType = z.infer<typeof contentMimeTypeSchema>;

export const sha256HexSchema = z.string().regex(/^[0-9a-f]{64}$/, "Expected a lowercase sha256");

/** Text every student or professor sees, in both languages (world.ts has an unbounded twin). */
export const contentLocalizedTextSchema = z.object({
  es: z.string().trim().min(1).max(1_000),
  en: z.string().trim().min(1).max(1_000),
});
export type ContentLocalizedText = z.infer<typeof contentLocalizedTextSchema>;

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

export const contentMaterialStatusSchema = materialStatusSchema;
export type ContentMaterialStatus = z.infer<typeof contentMaterialStatusSchema>;

/** The four states the UI shows; extracting, chunking and embedding all read as processing. */
export const contentDisplayStatusSchema = z.enum(["uploaded", "processing", "ready", "failed"]);
export type ContentDisplayStatus = z.infer<typeof contentDisplayStatusSchema>;

export function contentDisplayStatus(status: ContentMaterialStatus): ContentDisplayStatus {
  switch (status) {
    case "uploaded":
    case "ready":
    case "failed":
      return status;
    default:
      return "processing";
  }
}

export const contentMaterialErrorCodeSchema = z.enum([
  "unsupported_type",
  "no_extractable_text",
  "too_large",
  "embedding_failed",
  "storage_failed",
  "internal",
]);
export type ContentMaterialErrorCode = z.infer<typeof contentMaterialErrorCodeSchema>;

/** Professor view of a material. Never sent to students (see contentStudentMaterialSchema). */
export const contentMaterialSchema = z.object({
  id: uuidSchema,
  classId: uuidSchema,
  courseId: uuidSchema,
  title: z.string().min(1).max(CONTENT_LIMITS.maxTitleLength),
  filename: z.string().min(1).max(255),
  mimeType: contentMimeTypeSchema,
  byteSize: z.number().int().positive().max(CONTENT_LIMITS.maxFileBytes),
  sha256: sha256HexSchema,
  locale: localeSchema,
  topicIds: z.array(uuidSchema),
  status: contentMaterialStatusSchema,
  progress: z.object({
    embedded: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
  /** True once a complete set of chunks is live; stays true while a re-build runs or fails. */
  searchable: z.boolean(),
  errorCode: contentMaterialErrorCodeSchema.optional(),
  errorMessage: z.string().max(500).optional(),
  attempts: z.number().int().nonnegative(),
  curriculumVersion: z.number().int().positive(),
  uploadedBy: uuidSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
  processedAt: isoDateSchema.optional(),
});
export type ContentMaterial = z.infer<typeof contentMaterialSchema>;

/** What a student may see: ready material only, no storage path, hash, errors or uploader. */
export const contentStudentMaterialSchema = contentMaterialSchema.pick({
  id: true,
  classId: true,
  title: true,
  mimeType: true,
  locale: true,
  topicIds: true,
  processedAt: true,
});
export type ContentStudentMaterial = z.infer<typeof contentStudentMaterialSchema>;

export const createContentMaterialRequestSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  mimeType: contentMimeTypeSchema,
  byteSize: z.number().int().positive().max(CONTENT_LIMITS.maxFileBytes),
  sha256: sha256HexSchema,
  title: z.string().trim().min(1).max(CONTENT_LIMITS.maxTitleLength),
  topicIds: z.array(uuidSchema).max(50).default([]),
  locale: localeSchema,
});
export type CreateContentMaterialRequest = z.infer<typeof createContentMaterialRequestSchema>;

/** Same file in the same class returns the existing material; its topics are unioned. */
export const createContentMaterialResponseSchema = z.discriminatedUnion("duplicate", [
  z.object({
    duplicate: z.literal(false),
    material: contentMaterialSchema,
    uploadUrl: z.string().url(),
  }),
  z.object({ duplicate: z.literal(true), material: contentMaterialSchema }),
]);
export type CreateContentMaterialResponse = z.infer<typeof createContentMaterialResponseSchema>;

export const updateContentMaterialRequestSchema = z
  .object({
    title: z.string().trim().min(1).max(CONTENT_LIMITS.maxTitleLength).optional(),
    topicIds: z.array(uuidSchema).max(50).optional(),
  })
  .refine((body) => body.title !== undefined || body.topicIds !== undefined, {
    message: "Nothing to update",
  });
export type UpdateContentMaterialRequest = z.infer<typeof updateContentMaterialRequestSchema>;

export const contentDownloadResponseSchema = z.object({
  url: z.string().url(),
  expiresAt: isoDateSchema,
});
export type ContentDownloadResponse = z.infer<typeof contentDownloadResponseSchema>;

// ---------------------------------------------------------------------------
// Objectives and milestones
// ---------------------------------------------------------------------------

export const contentObjectiveSchema = z.object({
  id: uuidSchema,
  classId: uuidSchema,
  topicId: uuidSchema,
  materialId: uuidSchema.optional(),
  code: z.string().trim().min(1).max(32),
  statement: contentLocalizedTextSchema,
  /** Learning concept key, used by the Learning retrieval adapter to filter by concept. */
  conceptId: z.string().min(5).max(160).optional(),
  position: z.number().int().nonnegative(),
  updatedAt: isoDateSchema,
});
export type ContentObjective = z.infer<typeof contentObjectiveSchema>;

/** Upsert by client-generated id. A stale expectedUpdatedAt is rejected with 409. */
export const upsertContentObjectiveRequestSchema = contentObjectiveSchema
  .omit({ id: true, classId: true, updatedAt: true })
  .extend({ expectedUpdatedAt: isoDateSchema.optional() });
export type UpsertContentObjectiveRequest = z.infer<typeof upsertContentObjectiveRequestSchema>;

export const contentMilestoneSchema = z.object({
  id: uuidSchema,
  classId: uuidSchema,
  topicId: uuidSchema.optional(),
  title: contentLocalizedTextSchema,
  dueAt: isoDateSchema.optional(),
  position: z.number().int().nonnegative(),
  objectiveIds: z.array(uuidSchema).max(100),
  updatedAt: isoDateSchema,
});
export type ContentMilestone = z.infer<typeof contentMilestoneSchema>;

export const upsertContentMilestoneRequestSchema = contentMilestoneSchema
  .omit({ id: true, classId: true, updatedAt: true })
  .extend({ expectedUpdatedAt: isoDateSchema.optional() });
export type UpsertContentMilestoneRequest = z.infer<typeof upsertContentMilestoneRequestSchema>;

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

/**
 * Only the student's own previous turns are accepted. Tutor turns held by the client could be
 * forged to claim earlier approval or fake sources, so the contract does not carry them.
 */
export const contentChatRequestSchema = z.object({
  message: z.string().trim().min(1).max(CONTENT_LIMITS.maxMessageLength),
  topicId: uuidSchema.optional(),
  history: z
    .array(
      z.object({
        role: z.literal("student"),
        content: z.string().trim().min(1).max(CONTENT_LIMITS.maxMessageLength),
      }),
    )
    .max(CONTENT_LIMITS.maxHistoryTurns)
    .default([]),
});
export type ContentChatRequest = z.infer<typeof contentChatRequestSchema>;

/** Outcomes the chat returns with 200. Rate limits and failures are HTTP errors instead. */
export const contentChatOutcomeSchema = z.enum(["answered", "abstained", "redirected", "refused"]);
export type ContentChatOutcome = z.infer<typeof contentChatOutcomeSchema>;

/** Every outcome recorded for a call, including the ones that never reached the tutor. */
export const contentAiCallOutcomeSchema = z.enum([
  ...contentChatOutcomeSchema.options,
  "rate_limited",
  "error",
]);
export type ContentAiCallOutcome = z.infer<typeof contentAiCallOutcomeSchema>;

export const contentCitationSchema = citationSchema.extend({
  excerpt: z.string().max(CONTENT_LIMITS.maxCitationExcerpt),
});
export type ContentCitation = z.infer<typeof contentCitationSchema>;

export const contentChatResponseSchema = z
  .object({
    outcome: contentChatOutcomeSchema,
    /** Uses [1], [2] markers that index into citations. */
    answer: z.string().min(1),
    citations: z.array(contentCitationSchema).max(10),
    locale: localeSchema,
    /** Topics to try instead, offered when the material does not cover the question. */
    suggestedTopicIds: z.array(uuidSchema).max(10).default([]),
    preview: z.boolean().default(false),
  })
  .refine((body) => body.outcome !== "answered" || body.citations.length > 0, {
    message: "An answered response must cite at least one source",
    path: ["citations"],
  });
export type ContentChatResponse = z.infer<typeof contentChatResponseSchema>;

export const contentRateLimitErrorSchema = z.object({
  error: z.string(),
  retryAfterSeconds: z.number().int().positive(),
});
export type ContentRateLimitError = z.infer<typeof contentRateLimitErrorSchema>;

// ---------------------------------------------------------------------------
// Guardrails
// ---------------------------------------------------------------------------

export const contentFlagCategorySchema = z.enum([
  "graded_work",
  "prompt_injection",
  "off_topic",
  "unsafe",
  "self_harm",
]);
export type ContentFlagCategory = z.infer<typeof contentFlagCategorySchema>;

export const contentFlagActionSchema = z.enum(["refused", "redirected"]);
export type ContentFlagAction = z.infer<typeof contentFlagActionSchema>;

/** Approved defaults (docs/CONTENT_RAG.md section 6). report = shown in the professor inbox. */
export const contentGuardrailPolicy: Record<
  ContentFlagCategory,
  { action: ContentFlagAction; report: boolean; keepExcerpt: boolean }
> = {
  graded_work: { action: "redirected", report: true, keepExcerpt: true },
  prompt_injection: { action: "refused", report: true, keepExcerpt: true },
  off_topic: { action: "redirected", report: false, keepExcerpt: false },
  unsafe: { action: "refused", report: true, keepExcerpt: true },
  self_harm: { action: "refused", report: true, keepExcerpt: false },
};

export const contentFlagSchema = z
  .object({
    id: uuidSchema,
    classId: uuidSchema,
    studentId: uuidSchema,
    studentName: z.string().min(1),
    topicId: uuidSchema.optional(),
    category: contentFlagCategorySchema,
    action: contentFlagActionSchema,
    excerpt: z.string().max(CONTENT_LIMITS.maxFlagExcerpt).optional(),
    locale: localeSchema,
    createdAt: isoDateSchema,
    reviewedAt: isoDateSchema.optional(),
    reviewedBy: uuidSchema.optional(),
  })
  .refine((flag) => flag.category !== "self_harm" || flag.excerpt === undefined, {
    message: "Self-harm flags never store the student's words",
    path: ["excerpt"],
  });
export type ContentFlag = z.infer<typeof contentFlagSchema>;

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/** Same facts as P1's MaterialProcessed in contracts/curriculum-world.ts, as a payload. */
export const contentMaterialUploadedPayloadSchema = z.object({
  materialId: idSchema,
  topicIds: z.array(idSchema),
});
export const contentMaterialProcessedPayloadSchema = z.object({
  materialId: idSchema,
  topicIds: z.array(idSchema),
  status: z.enum(["ready", "failed"]),
});

/**
 * AiUsageRecorded payload for content chat. Adds optional fields to the shared payload, so
 * analytics, which parses only `kind`, keeps working unchanged.
 */
export const contentAiUsagePayloadSchema = aiUsageRecordedPayloadSchema.extend({
  outcome: contentChatOutcomeSchema,
  flagCategory: contentFlagCategorySchema.optional(),
});
export type ContentAiUsagePayload = z.infer<typeof contentAiUsagePayloadSchema>;

// ---------------------------------------------------------------------------
// Generated formats: seam only, nothing generates these yet.
// ---------------------------------------------------------------------------

export const contentFormatSchema = z.enum([
  "podcast",
  "slides",
  "graphic",
  "summary",
  "flashcards",
]);
export type ContentFormat = z.infer<typeof contentFormatSchema>;
