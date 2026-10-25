import { z } from "zod";
import { idSchema, localeSchema } from "./common.js";
import { citationSchema } from "./curriculum.js";

/**
 * Learning's proposed consumer contract for curriculum concepts and grounded context.
 * P1 remains authoritative for the catalog and retrieval implementation.
 */
const conceptIdSegment = "[a-z][a-z0-9]*(?:_[a-z0-9]+)*";
const conceptIdPattern = new RegExp(`^${conceptIdSegment}(?:\\.${conceptIdSegment}){2,}$`);

export const conceptIdSchema = z
  .string()
  .min(5)
  .max(160)
  .regex(
    conceptIdPattern,
    "Concept ids must be lowercase dot-separated keys such as math.geometry.triangle_area",
  );
export type ConceptId = z.infer<typeof conceptIdSchema>;

export const curriculumConceptSchema = z
  .object({
    conceptId: conceptIdSchema,
    courseId: idSchema,
    topicId: idSchema,
    title: z.string().min(1),
    description: z.string().min(1).optional(),
    prerequisiteConceptIds: z.array(conceptIdSchema).default([]),
    requiredForMastery: z.boolean(),
    curriculumVersion: z.number().int().positive(),
  })
  .superRefine((concept, ctx) => {
    if (concept.prerequisiteConceptIds.includes(concept.conceptId)) {
      ctx.addIssue({
        code: "custom",
        path: ["prerequisiteConceptIds"],
        message: "A concept cannot be its own prerequisite",
      });
    }
    if (new Set(concept.prerequisiteConceptIds).size !== concept.prerequisiteConceptIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["prerequisiteConceptIds"],
        message: "Prerequisite concept ids must be unique",
      });
    }
  });
export type CurriculumConcept = z.infer<typeof curriculumConceptSchema>;

export const curriculumContextRequestSchema = z.object({
  /** Server-authorized learner whose class scopes Content retrieval. */
  studentId: idSchema,
  courseId: idSchema,
  topicId: idSchema,
  conceptId: conceptIdSchema,
  query: z.string().trim().min(1).max(2_000),
  curriculumVersion: z.number().int().positive(),
  locale: localeSchema.optional(),
  limit: z.number().int().min(1).max(10).optional(),
});
export type CurriculumContextRequest = z.infer<typeof curriculumContextRequestSchema>;

export const curriculumContextChunkSchema = z.object({
  text: z.string().min(1),
  conceptId: conceptIdSchema,
  citation: citationSchema,
  relevanceScore: z.number().min(0).max(1).optional(),
});
export type CurriculumContextChunk = z.infer<typeof curriculumContextChunkSchema>;

export const unsupportedCurriculumReasonSchema = z.enum([
  "concept_not_found",
  "no_approved_content",
  "insufficient_evidence",
  "curriculum_version_mismatch",
]);
export type UnsupportedCurriculumReason = z.infer<typeof unsupportedCurriculumReasonSchema>;

const supportedCurriculumContextSchema = z.object({
  chunks: z.array(curriculumContextChunkSchema).min(1),
  curriculumVersion: z.number().int().positive(),
  unsupported: z.literal(false),
});

const unsupportedCurriculumContextSchema = z.object({
  chunks: z.array(curriculumContextChunkSchema).length(0),
  curriculumVersion: z.number().int().positive(),
  unsupported: z.literal(true),
  unsupportedReason: unsupportedCurriculumReasonSchema,
});

export const curriculumContextResponseSchema = z.discriminatedUnion("unsupported", [
  supportedCurriculumContextSchema,
  unsupportedCurriculumContextSchema,
]);
export type CurriculumContextResponse = z.infer<typeof curriculumContextResponseSchema>;
