import { topicSchema, validateRetrievedContext } from "@athena/shared";
import { historyMockResources, type HistoryMockResource } from "./history-resource-catalog.js";
import { curriculumCourseId, curriculumTopicId } from "./learning-context-adapter.js";
import { CurriculumRetrievalService } from "./retrieval-service.js";
import {
  CurriculumError,
  type CourseAccessPolicy,
  type CurriculumAccessContext,
  type CurriculumReadRepository,
} from "./ports.js";

export interface HistoryResourceRequest {
  courseId: string;
  topicId: string;
  curriculumVersion: number;
  locale: "en" | "es";
}
/** Topic-level resources: History does not need fabricated concept IDs. */
export class HistoryResourceService {
  private readonly service: CurriculumRetrievalService;
  private readonly access: CurriculumAccessContext;
  constructor(
    private readonly repository: CurriculumReadRepository,
    policy: CourseAccessPolicy,
    access: CurriculumAccessContext,
  ) {
    this.service = new CurriculumRetrievalService(repository, policy);
    this.access = Object.freeze({
      userId: access.userId,
      courseIds: Object.freeze(access.courseIds.map(curriculumCourseId)),
    });
  }
  async listResources(input: HistoryResourceRequest): Promise<HistoryMockResource[]> {
    const allowed = new Set(["courseId", "topicId", "curriculumVersion", "locale"]);
    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input) ||
      Object.keys(input).some((key) => !allowed.has(key)) ||
      !["en", "es"].includes(input.locale)
    )
      throw new CurriculumError("INVALID_INPUT", "Invalid resource request");
    const parsed = topicSchema
      .pick({ courseId: true, curriculumVersion: true })
      .extend({ topicId: topicSchema.shape.id })
      .safeParse(input);
    if (!parsed.success) throw new CurriculumError("INVALID_INPUT", "Invalid resource scope");
    const scope = {
      courseId: curriculumCourseId(parsed.data.courseId),
      topicId: curriculumTopicId(parsed.data.topicId),
      curriculumVersion: parsed.data.curriculumVersion,
    };
    const topics = await this.service.listTopics(scope, this.access);
    const topic = topics.find((t) => t.id === scope.topicId);
    if (!topic) throw new CurriculumError("NOT_FOUND", "Topic not found in requested curriculum");
    const materials = await this.service.listSources(scope, this.access);
    const chunks = await this.repository.listChunks(scope);
    const resources = historyMockResources.filter(
      (r) =>
        r.courseId === scope.courseId &&
        r.topicId === scope.topicId &&
        r.curriculumVersion === scope.curriculumVersion &&
        r.locale === input.locale &&
        r.status === "approved" &&
        r.citations.every((citation) => {
          const chunk = chunks.find((c) => c.id === citation.chunkId);
          return (
            chunk &&
            chunk.locale === input.locale &&
            materials.some((m) => m.id === citation.materialId)
          );
        }),
    );
    for (const resource of resources) {
      validateRetrievedContext(
        {
          ...scope,
          chunks: resource.citations.map((citation) => ({
            text: chunks.find((c) => c.id === citation.chunkId)!.text,
            similarity: 1,
            citation,
          })),
        },
        { courses: [], topics: [topic], materials, chunks },
      );
    }
    return structuredClone(resources);
  }
}
