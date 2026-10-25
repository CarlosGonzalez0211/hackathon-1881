import {
  athenaDemoCourse,
  canonicalDemoTopicId,
  curriculumTopicSummarySchema,
  demoCurriculumTopics,
  demoCurriculum,
  DEMO_COURSE_ID,
  type CurriculumTopicSummary,
} from "@athena/shared";
import {
  CurriculumError,
  type CurriculumAccessContext,
  type CurriculumReadRepository,
  type CourseAccessPolicy,
} from "./ports.js";
import { CurriculumRetrievalService } from "./retrieval-service.js";

/** Structural match for World's read-only port; no runtime World dependency. */
export interface WorldCurriculumTopicPort {
  listTopics(courseId: string): Promise<CurriculumTopicSummary[]>;
}
export interface WorldCurriculumAdapterOptions {
  /** Explicit demo publication intent, still subject to ready-material checks. */
  publishedTopicIds?: readonly string[];
  /** Preserve the shipped Mathematics unlock graph without rewriting source fixtures. */
  preserveMathematicsDemo?: boolean;
}

export class WorldCurriculumTopicAdapter implements WorldCurriculumTopicPort {
  private readonly service: CurriculumRetrievalService;
  private readonly access: CurriculumAccessContext;
  private readonly published: ReadonlySet<string>;
  private readonly preserveMathematicsDemo: boolean;
  constructor(
    repository: CurriculumReadRepository,
    policy: CourseAccessPolicy,
    access: CurriculumAccessContext,
    options: WorldCurriculumAdapterOptions = {},
  ) {
    this.service = new CurriculumRetrievalService(repository, policy);
    const courseIds = new Set(access.courseIds);
    if (courseIds.has(athenaDemoCourse.id)) courseIds.add(athenaDemoCourse.legacyId);
    this.access = Object.freeze({
      userId: access.userId,
      courseIds: Object.freeze([...courseIds]),
    });
    this.published = new Set(
      options.publishedTopicIds ?? [
        ...demoCurriculumTopics.filter((t) => t.published).map((t) => t.id),
        ...demoCurriculum.topics.filter((t) => t.courseId === "course-history-1").map((t) => t.id),
      ],
    );
    this.preserveMathematicsDemo = options.preserveMathematicsDemo ?? true;
  }
  async listTopics(courseId: string): Promise<CurriculumTopicSummary[]> {
    const canonicalOutput = courseId === athenaDemoCourse.id;
    const sourceCourseId = canonicalOutput ? athenaDemoCourse.legacyId : courseId;
    let course;
    try {
      course = await this.service.getCourse(sourceCourseId, this.access);
    } catch (error) {
      if (error instanceof CurriculumError && error.code === "NOT_FOUND") return [];
      throw error;
    }
    const scope = { courseId: course.id, curriculumVersion: course.activeVersion };
    const topics = await this.service.listTopics(scope, this.access);
    const summaries: CurriculumTopicSummary[] = [];
    for (const topic of topics) {
      const baseline =
        this.preserveMathematicsDemo && course.id === DEMO_COURSE_ID
          ? demoCurriculumTopics.find((t) => t.id === topic.id)
          : undefined;
      const ready = this.published.has(topic.id)
        ? await this.service.listSources({ ...scope, topicId: topic.id }, this.access)
        : [];
      summaries.push(
        curriculumTopicSummarySchema.parse({
          id: canonicalOutput ? canonicalDemoTopicId(topic.id) : topic.id,
          courseId: canonicalOutput ? athenaDemoCourse.id : topic.courseId,
          title: topic.title,
          order: topic.order,
          prerequisiteTopicIds: (baseline
            ? [...baseline.prerequisiteTopicIds]
            : [...topic.prerequisiteTopicIds]
          ).map((id) => (canonicalOutput ? canonicalDemoTopicId(id) : id)),
          masteryThreshold: topic.masteryThreshold,
          published: this.published.has(topic.id) && ready.length > 0,
        }),
      );
    }
    // Fail rather than pass an invalid compatibility projection to World.
    const byId = new Map(summaries.map((t) => [t.id, t]));
    if (
      byId.size !== summaries.length ||
      new Set(summaries.map((t) => t.order)).size !== summaries.length
    )
      throw new Error("World curriculum requires unique topic IDs and orders");
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (id: string): void => {
      if (visiting.has(id)) throw new Error("World curriculum prerequisite cycle");
      if (visited.has(id)) return;
      const topic = byId.get(id);
      if (!topic) throw new Error("World curriculum prerequisite is missing from the course");
      visiting.add(id);
      for (const prerequisite of topic.prerequisiteTopicIds) visit(prerequisite);
      visiting.delete(id);
      visited.add(id);
    };
    for (const topic of summaries) visit(topic.id);
    return summaries;
  }
}
