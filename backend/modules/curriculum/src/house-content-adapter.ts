import {
  courseSchema,
  houseContentSchema,
  sourceChunkSchema,
  validateRetrievedContext,
  type Citation,
  type HouseContent,
} from "@athena/shared";
import { HistoryResourceService } from "./history-resource-service.js";
import { CurriculumRetrievalService } from "./retrieval-service.js";
import {
  WorldCurriculumTopicAdapter,
  type WorldCurriculumAdapterOptions,
} from "./world-curriculum-adapter.js";
import {
  CurriculumError,
  type CurriculumAccessContext,
  type CurriculumReadRepository,
  type CourseAccessPolicy,
} from "./ports.js";

/** Same method shape as World's existing CurriculumContentClient. */
export interface WorldCurriculumContentClient {
  getHouseContent(topicId: string): Promise<HouseContent>;
}
export interface HouseContentAdapterOptions extends WorldCurriculumAdapterOptions {
  /** Bound by trusted composition because World's method only takes a topic ID. */
  courseId: string;
  locale: "en" | "es";
}
function sourceReference(citation: Citation, locale: "en" | "es"): string {
  return `${locale === "es" ? "Fuente" : "Source"}: ${citation.materialTitle} | ${citation.section} | materialId=${citation.materialId} | chunkId=${citation.chunkId}`;
}

export class WorldHouseContentAdapter implements WorldCurriculumContentClient {
  private readonly service: CurriculumRetrievalService;
  private readonly topics: WorldCurriculumTopicAdapter;
  private readonly resources: HistoryResourceService;
  private readonly access: CurriculumAccessContext;
  private readonly courseId: string;
  private readonly locale: "en" | "es";
  constructor(
    private readonly repository: CurriculumReadRepository,
    policy: CourseAccessPolicy,
    access: CurriculumAccessContext,
    options: HouseContentAdapterOptions,
  ) {
    const id = courseSchema.shape.id.safeParse(options.courseId);
    if (!id.success || !["en", "es"].includes(options.locale))
      throw new CurriculumError("INVALID_INPUT", "Invalid house content scope");
    this.courseId = id.data;
    this.locale = options.locale;
    this.access = Object.freeze({
      userId: access.userId,
      courseIds: Object.freeze([...access.courseIds]),
    });
    this.service = new CurriculumRetrievalService(repository, policy);
    this.topics = new WorldCurriculumTopicAdapter(repository, policy, this.access, options);
    this.resources = new HistoryResourceService(repository, policy, this.access);
  }
  async getHouseContent(topicId: string): Promise<HouseContent> {
    const id = courseSchema.shape.id.safeParse(topicId);
    if (!id.success) throw new CurriculumError("INVALID_INPUT", "A topic ID is required");
    const course = await this.service.getCourse(this.courseId, this.access);
    const visibleTopic = (await this.topics.listTopics(course.id)).find((t) => t.id === id.data);
    if (!visibleTopic) throw new CurriculumError("NOT_FOUND", "Topic not found in this course");
    if (!visibleTopic.published)
      throw new CurriculumError("FORBIDDEN", "Topic is unpublished or has no ready material");
    const scope = {
      courseId: course.id,
      topicId: id.data,
      curriculumVersion: course.activeVersion,
    };
    const topic = (await this.service.listTopics(scope, this.access)).find(
      (t) => t.id === id.data,
    )!;
    const readyMaterials = await this.service.listSources(scope, this.access);
    if (!readyMaterials.length)
      throw new CurriculumError("FORBIDDEN", "Topic has no ready material");
    const txt = readyMaterials.filter((m) => m.mimeType === "text/plain");
    const readyIds = new Set(txt.map((m) => m.id));
    const chunks = sourceChunkSchema
      .array()
      .parse(await this.repository.listChunks(scope))
      .filter(
        (c) =>
          c.courseId === course.id &&
          c.topicId === id.data &&
          c.curriculumVersion === course.activeVersion &&
          c.locale === this.locale &&
          readyIds.has(c.materialId),
      )
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const context = validateRetrievedContext(
      {
        ...scope,
        chunks: chunks.map((chunk) => ({
          text: chunk.text,
          similarity: 1,
          citation: {
            materialId: chunk.materialId,
            materialTitle: txt.find((m) => m.id === chunk.materialId)!.title,
            chunkId: chunk.id,
            section: chunk.section,
            excerpt: chunk.text,
          },
        })),
      },
      { courses: [course], topics: [topic], materials: txt, chunks },
    );
    const materials = txt.filter((m) => chunks.some((c) => c.materialId === m.id));
    const authored = await this.resources.listResources({ ...scope, locale: this.locale });
    const sourceCards: HouseContent["resources"] = context.chunks.map(({ text, citation }) => ({
      id: `resource-source-${citation.chunkId}`,
      format: "text",
      title: citation.section!,
      body: `${text}\n\n${sourceReference(citation, this.locale)}`,
    }));
    const resourceCards: HouseContent["resources"] = authored.map((r) => ({
      id: r.id,
      format: r.format,
      title: r.structuredContent.title,
      body: [
        `[DEMO: ${r.structuredContent.representation}; ${this.locale === "es" ? "sin archivo multimedia" : "no media file"}]`,
        ...r.structuredContent.blocks.map((b) =>
          [
            `${b.label}: ${b.body}`,
            ...b.citations.map(
              (c) =>
                `${sourceReference(c, this.locale)} | ${this.locale === "es" ? "Extracto" : "Excerpt"}: ${c.excerpt}`,
            ),
          ].join("\n"),
        ),
      ].join("\n\n"),
    }));
    // Fixed source timestamps keep fixture reads deterministic. No invented media links.
    const updatedAt = [course.updatedAt, ...materials.map((m) => m.uploadedAt)].sort().at(-1)!;
    return houseContentSchema.parse({
      topicId: id.data,
      courseId: course.id,
      title: topic.title,
      materials: materials.map((m) => ({
        id: m.id,
        title: m.title,
        filename: m.filename,
        mimeType: m.mimeType,
        status: m.status,
      })),
      resources: [...sourceCards, ...resourceCards],
      updatedAt,
    });
  }
}
