import { z } from "zod";

/** Additive Person 1 contracts; existing world/learning contracts remain unchanged. */
const id = z.string().trim().min(1);
const version = z.number().int().positive();
export const curriculumLocaleSchema = z.enum(["en", "es"]);
export const courseSchema = z.object({
  id,
  ownerId: id,
  title: id,
  description: z.string(),
  locale: curriculumLocaleSchema,
  activeVersion: version,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export const topicSchema = z.object({
  id,
  courseId: id,
  curriculumVersion: version,
  title: id,
  description: z.string(),
  order: z.number().int().nonnegative(),
  prerequisiteTopicIds: z.array(id),
  masteryThreshold: z.number().min(0).max(1),
});
export const materialStatusSchema = z.enum([
  "uploaded",
  "extracting",
  "chunking",
  "embedding",
  "ready",
  "failed",
]);
export const materialSchema = z.object({
  id,
  courseId: id,
  topicIds: z.array(id).min(1),
  title: id,
  filename: id,
  mimeType: id,
  // A logical storage key, never evidence that a downloadable file exists.
  storagePath: id,
  status: materialStatusSchema,
  curriculumVersion: version,
  uploadedBy: id,
  uploadedAt: z.string().datetime(),
  error: id.optional(),
  provenance: z.object({
    kind: z.enum(["authored_demo", "professor_upload"]),
    description: id,
    references: z.array(z.object({ title: id, url: z.string().url() })),
  }),
});
export const sourceChunkSchema = z.object({
  id,
  materialId: id,
  courseId: id,
  topicId: id,
  curriculumVersion: version,
  index: z.number().int().nonnegative(),
  locale: curriculumLocaleSchema,
  section: id,
  text: id,
});
export const citationSchema = z
  .object({
    materialId: id,
    materialTitle: id,
    page: z.number().int().positive().optional(),
    section: id.optional(),
    chunkId: id,
    excerpt: id,
  })
  .refine((value) => value.page !== undefined || value.section !== undefined, {
    message: "A source locator is required",
  });
export const retrieveContextInputSchema = z
  .object({
    courseId: id,
    topicId: id,
    curriculumVersion: version,
    query: z.string().trim().min(1).max(2000),
    limit: z.number().int().min(1).max(20).default(5),
  })
  .strict();
export const retrievedContextSchema = z.object({
  courseId: id,
  topicId: id,
  curriculumVersion: version,
  chunks: z.array(
    z.object({
      text: id,
      // Mock lexical coverage in [0, 1]; not a vector similarity measurement.
      similarity: z.number().min(0).max(1),
      citation: citationSchema,
    }),
  ),
});
export const learningFormatSchema = z.enum([
  "text",
  "worked_example",
  "visual_summary",
  "slides",
  "audio",
  "podcast",
  "music",
  "video",
  "reel",
]);
export const generatedResourceSchema = z.object({
  id,
  courseId: id,
  topicId: id,
  curriculumVersion: version,
  format: learningFormatSchema,
  locale: curriculumLocaleSchema,
  theme: id.optional(),
  status: z.enum(["draft", "approved", "rejected"]),
  contentUrl: z.string().url().optional(),
  structuredContent: z.record(z.unknown()),
  citations: z.array(citationSchema).min(1),
});

export const curriculumDatasetSchema = z
  .object({
    courses: z.array(courseSchema),
    topics: z.array(topicSchema),
    materials: z.array(materialSchema),
    chunks: z.array(sourceChunkSchema),
  })
  .superRefine((data, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });
    for (const [name, rows] of Object.entries(data)) {
      if (new Set(rows.map((row) => row.id)).size !== rows.length) fail(`Duplicate ${name} IDs`);
    }
    const courses = new Map(data.courses.map((item) => [item.id, item]));
    const topics = new Map(data.topics.map((item) => [item.id, item]));
    const materials = new Map(data.materials.map((item) => [item.id, item]));
    const orders = new Set<string>();
    for (const topic of data.topics) {
      if (!courses.has(topic.courseId)) fail(`Unknown course: ${topic.courseId}`);
      if (courses.get(topic.courseId)?.activeVersion !== topic.curriculumVersion)
        fail(`Topic version differs from active curriculum: ${topic.id}`);
      const order = JSON.stringify([topic.courseId, topic.curriculumVersion, topic.order]);
      if (orders.has(order)) fail(`Duplicate topic order: ${topic.id}`);
      orders.add(order);
      if (new Set(topic.prerequisiteTopicIds).size !== topic.prerequisiteTopicIds.length)
        fail(`Duplicate prerequisites: ${topic.id}`);
      for (const prerequisiteId of topic.prerequisiteTopicIds) {
        const prerequisite = topics.get(prerequisiteId);
        if (
          !prerequisite ||
          prerequisiteId === topic.id ||
          prerequisite.courseId !== topic.courseId ||
          prerequisite.curriculumVersion !== topic.curriculumVersion
        )
          fail(`Invalid prerequisite: ${topic.id} -> ${prerequisiteId}`);
        else if (prerequisite.order >= topic.order)
          fail(`Prerequisite must precede topic: ${topic.id}`);
      }
    }
    const visiting = new Set<string>();
    const visited = new Set<string>();
    function visit(topicId: string) {
      if (visiting.has(topicId)) {
        fail(`Prerequisite cycle: ${topicId}`);
        return;
      }
      if (visited.has(topicId)) return;
      visiting.add(topicId);
      for (const prerequisite of topics.get(topicId)?.prerequisiteTopicIds ?? [])
        visit(prerequisite);
      visiting.delete(topicId);
      visited.add(topicId);
    }
    for (const topic of data.topics) visit(topic.id);
    for (const material of data.materials) {
      const course = courses.get(material.courseId);
      if (!course || course.activeVersion !== material.curriculumVersion)
        fail(`Invalid material course/version: ${material.id}`);
      if (material.uploadedBy !== course?.ownerId)
        fail(`Material must belong to course professor: ${material.id}`);
      if (new Set(material.topicIds).size !== material.topicIds.length)
        fail(`Duplicate material topics: ${material.id}`);
      for (const topicId of material.topicIds) {
        const topic = topics.get(topicId);
        if (
          !topic ||
          topic.courseId !== material.courseId ||
          topic.curriculumVersion !== material.curriculumVersion
        )
          fail(`Invalid material topic: ${material.id} -> ${topicId}`);
      }
    }
    const indexes = new Set<string>();
    for (const chunk of data.chunks) {
      const material = materials.get(chunk.materialId);
      if (
        !material ||
        material.courseId !== chunk.courseId ||
        material.curriculumVersion !== chunk.curriculumVersion ||
        !material.topicIds.includes(chunk.topicId)
      )
        fail(`Invalid chunk scope: ${chunk.id}`);
      const key = JSON.stringify([chunk.materialId, chunk.index]);
      if (indexes.has(key)) fail(`Duplicate material chunk index: ${chunk.id}`);
      indexes.add(key);
    }
  });

export type Course = z.infer<typeof courseSchema>;
export type Topic = z.infer<typeof topicSchema>;
export type Material = z.infer<typeof materialSchema>;
export type SourceChunk = z.infer<typeof sourceChunkSchema>;
export type Citation = z.infer<typeof citationSchema>;
export type RetrieveContextInput = z.input<typeof retrieveContextInputSchema>;
export type RetrievedContext = z.infer<typeof retrievedContextSchema>;
export type GeneratedResource = z.infer<typeof generatedResourceSchema>;
export type CurriculumDataset = z.infer<typeof curriculumDatasetSchema>;

/** Validates semantic citation links in addition to their wire shape. */
export function validateRetrievedContext(
  input: unknown,
  dataset: CurriculumDataset,
): RetrievedContext {
  const context = retrievedContextSchema.parse(input);
  const topic = dataset.topics.find((item) => item.id === context.topicId);
  if (
    !topic ||
    topic.courseId !== context.courseId ||
    topic.curriculumVersion !== context.curriculumVersion
  )
    throw new Error("Retrieved context scope is invalid");
  for (const result of context.chunks) {
    const chunk = dataset.chunks.find((item) => item.id === result.citation.chunkId);
    const material = dataset.materials.find((item) => item.id === result.citation.materialId);
    if (
      !chunk ||
      !material ||
      material.status !== "ready" ||
      chunk.materialId !== material.id ||
      chunk.courseId !== context.courseId ||
      chunk.topicId !== context.topicId ||
      chunk.curriculumVersion !== context.curriculumVersion ||
      material.courseId !== context.courseId ||
      material.curriculumVersion !== context.curriculumVersion ||
      !material.topicIds.includes(context.topicId) ||
      result.text !== chunk.text ||
      !chunk.text.includes(result.citation.excerpt) ||
      result.citation.materialTitle !== material.title ||
      result.citation.section !== chunk.section ||
      result.citation.page !== undefined
    )
      throw new Error("Citation does not resolve to a ready source in the requested scope");
  }
  return context;
}
