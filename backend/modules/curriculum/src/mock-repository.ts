import {
  curriculumDatasetSchema,
  type CurriculumDataset,
} from "../../../../shared/src/curriculum.js";
import { demoCurriculum } from "../../../../shared/src/mocks/demo-curriculum.js";
import {
  CurriculumError,
  type CourseAccessPolicy,
  type CourseScope,
  type CurriculumAccessContext,
  type CurriculumReadRepository,
  type TopicScope,
} from "./ports.js";

/** Offline teaching/demo policy, NOT authentication or a production enrollment check. */
export class MockCourseAccessPolicy implements CourseAccessPolicy {
  async assertCanRead(context: CurriculumAccessContext, courseId: string): Promise<void> {
    if (
      !context ||
      typeof context.userId !== "string" ||
      !context.userId.trim() ||
      !Array.isArray(context.courseIds) ||
      !context.courseIds.includes(courseId)
    ) {
      throw new CurriculumError("FORBIDDEN", "Course access denied");
    }
  }
}

export class MockCurriculumRepository implements CurriculumReadRepository {
  private readonly data: CurriculumDataset;
  constructor(data: CurriculumDataset = demoCurriculum) {
    this.data = curriculumDatasetSchema.parse(structuredClone(data));
  }
  async getCourse(courseId: string) {
    return structuredClone(this.data.courses.find((item) => item.id === courseId) ?? null);
  }
  async listTopics(scope: CourseScope) {
    return structuredClone(
      this.data.topics
        .filter(
          (item) =>
            item.courseId === scope.courseId && item.curriculumVersion === scope.curriculumVersion,
        )
        .sort((a, b) => a.order - b.order),
    );
  }
  async listMaterials(scope: TopicScope) {
    return structuredClone(
      this.data.materials.filter(
        (item) =>
          item.courseId === scope.courseId &&
          item.curriculumVersion === scope.curriculumVersion &&
          item.topicIds.includes(scope.topicId),
      ),
    );
  }
  async listChunks(scope: TopicScope) {
    return structuredClone(
      this.data.chunks.filter(
        (item) =>
          item.courseId === scope.courseId &&
          item.topicId === scope.topicId &&
          item.curriculumVersion === scope.curriculumVersion,
      ),
    );
  }
}
