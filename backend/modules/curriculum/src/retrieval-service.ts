import {
  courseSchema,
  materialSchema,
  retrieveContextInputSchema,
  sourceChunkSchema,
  topicSchema,
  validateRetrievedContext,
  type RetrieveContextInput,
} from "@athena/shared";
import {
  CurriculumError,
  type CourseAccessPolicy,
  type CourseScope,
  type CurriculumAccessContext,
  type CurriculumContextPort,
  type CurriculumReadRepository,
  type CurriculumTopicPort,
  type TopicScope,
} from "./ports.js";

// Explicitly lexical mock retrieval. No embedding/model/provider/network calls.
const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "by",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "the",
  "to",
  "was",
  "with",
  "al",
  "de",
  "del",
  "el",
  "en",
  "es",
  "la",
  "las",
  "los",
  "por",
  "que",
  "un",
  "una",
  "y",
]);
function tokens(text: string): Set<string> {
  return new Set(
    (
      text
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .match(/[\p{L}\p{N}]+/gu) ?? []
    ).filter((word) => !stopWords.has(word)),
  );
}
const scopeSchema = topicSchema.pick({ courseId: true, curriculumVersion: true });

export class CurriculumRetrievalService implements CurriculumTopicPort, CurriculumContextPort {
  constructor(
    private readonly repository: CurriculumReadRepository,
    private readonly accessPolicy: CourseAccessPolicy,
  ) {}

  async getCourse(courseId: string, access: CurriculumAccessContext) {
    const parsed = courseSchema.shape.id.safeParse(courseId);
    if (!parsed.success) throw new CurriculumError("INVALID_INPUT", "A course ID is required");
    await this.accessPolicy.assertCanRead(access, parsed.data);
    const course = await this.repository.getCourse(parsed.data);
    if (!course) throw new CurriculumError("NOT_FOUND", "Course not found");
    const result = courseSchema.parse(course);
    if (result.id !== parsed.data) throw new Error("Repository returned a different course");
    return result;
  }
  private async courseForVersion(scope: CourseScope, access: CurriculumAccessContext) {
    const parsed = scopeSchema.safeParse(scope);
    if (!parsed.success) throw new CurriculumError("INVALID_INPUT", "Invalid course scope");
    const course = await this.getCourse(parsed.data.courseId, access);
    if (course.activeVersion !== parsed.data.curriculumVersion)
      throw new CurriculumError("VERSION_MISMATCH", "Requested curriculum version is not active");
    return course;
  }
  async listTopics(scope: CourseScope, access: CurriculumAccessContext) {
    const parsed = scopeSchema.safeParse(scope);
    if (!parsed.success) throw new CurriculumError("INVALID_INPUT", "Invalid course scope");
    const canonical = parsed.data;
    await this.courseForVersion(canonical, access);
    return topicSchema
      .array()
      .parse(await this.repository.listTopics(canonical))
      .filter(
        (topic) =>
          topic.courseId === canonical.courseId &&
          topic.curriculumVersion === canonical.curriculumVersion,
      )
      .sort((a, b) => a.order - b.order);
  }
  private async topicForScope(scope: TopicScope, access: CurriculumAccessContext) {
    const parsed = courseSchema.shape.id.safeParse(scope.topicId);
    if (!parsed.success) throw new CurriculumError("INVALID_INPUT", "A topic ID is required");
    const topics = await this.listTopics(scope, access);
    const topic = topics.find((item) => item.id === parsed.data);
    if (!topic) throw new CurriculumError("NOT_FOUND", "Topic not found in requested curriculum");
    return topic;
  }
  async listSources(scope: TopicScope, access: CurriculumAccessContext) {
    const topic = await this.topicForScope(scope, access);
    const canonical = {
      courseId: topic.courseId,
      topicId: topic.id,
      curriculumVersion: topic.curriculumVersion,
    };
    return materialSchema
      .array()
      .parse(await this.repository.listMaterials(canonical))
      .filter(
        (material) =>
          material.status === "ready" &&
          material.courseId === canonical.courseId &&
          material.curriculumVersion === canonical.curriculumVersion &&
          material.topicIds.includes(canonical.topicId),
      );
  }
  async retrieve(input: RetrieveContextInput, access: CurriculumAccessContext) {
    const parsed = retrieveContextInputSchema.safeParse(input);
    if (!parsed.success)
      throw new CurriculumError("INVALID_INPUT", "Invalid curriculum retrieval input");
    const scope = parsed.data;
    const topic = await this.topicForScope(scope, access);
    const materials = await this.listSources(scope, access);
    const readyIds = new Set(materials.map((material) => material.id));
    const chunks = sourceChunkSchema
      .array()
      .parse(await this.repository.listChunks(scope))
      .filter(
        (chunk) =>
          chunk.courseId === scope.courseId &&
          chunk.topicId === scope.topicId &&
          chunk.curriculumVersion === scope.curriculumVersion &&
          readyIds.has(chunk.materialId),
      );
    const queryTokens = tokens(scope.query);
    const ranked = chunks
      .map((chunk) => {
        const content = tokens(`${chunk.section} ${chunk.text}`);
        const matches = [...queryTokens].filter((word) => content.has(word)).length;
        return { chunk, score: queryTokens.size ? matches / queryTokens.size : 0 };
      })
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score || (a.chunk.id < b.chunk.id ? -1 : a.chunk.id > b.chunk.id ? 1 : 0),
      );
    const context = {
      courseId: scope.courseId,
      topicId: scope.topicId,
      curriculumVersion: scope.curriculumVersion,
      chunks: ranked.slice(0, scope.limit).map(({ chunk, score }) => ({
        text: chunk.text,
        similarity: score,
        citation: {
          materialId: chunk.materialId,
          materialTitle: materials.find((item) => item.id === chunk.materialId)!.title,
          section: chunk.section,
          chunkId: chunk.id,
          excerpt: chunk.text,
        },
      })),
    };
    return validateRetrievedContext(context, { courses: [], topics: [topic], materials, chunks });
  }
}
