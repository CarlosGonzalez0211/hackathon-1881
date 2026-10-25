import { z } from "zod";
import { idSchema, isoDateSchema, localeSchema } from "./common.js";

/** Curriculum contracts (P1 owns this file). Platform provided the initial proposal only. */
export const materialStatusSchema = z.enum([
  "uploaded",
  "extracting",
  "chunking",
  "embedding",
  "ready",
  "failed",
]);

export const courseSchema = z.object({
  id: idSchema,
  ownerId: idSchema,
  title: z.string().min(1),
  description: z.string(),
  locale: localeSchema,
  activeVersion: z.number().int().positive(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type Course = z.infer<typeof courseSchema>;

export const topicSchema = z.object({
  id: idSchema,
  courseId: idSchema,
  title: z.string().min(1),
  description: z.string(),
  order: z.number().int().nonnegative(),
  prerequisiteTopicIds: z.array(idSchema),
  masteryThreshold: z.number().min(0).max(1),
});
export type Topic = z.infer<typeof topicSchema>;

export const materialSchema = z.object({
  id: idSchema,
  courseId: idSchema,
  topicIds: z.array(idSchema),
  filename: z.string(),
  mimeType: z.string(),
  storagePath: z.string(),
  status: materialStatusSchema,
  curriculumVersion: z.number().int().positive(),
  uploadedBy: idSchema,
  uploadedAt: isoDateSchema,
  error: z.string().optional(),
});
export type Material = z.infer<typeof materialSchema>;

export const citationSchema = z.object({
  materialId: idSchema,
  materialTitle: z.string(),
  page: z.number().int().positive().optional(),
  section: z.string().optional(),
  chunkId: idSchema,
  excerpt: z.string(),
});
export type Citation = z.infer<typeof citationSchema>;
