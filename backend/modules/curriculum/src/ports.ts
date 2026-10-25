import type {
  Course,
  Material,
  RetrievedContext,
  RetrieveContextInput,
  SourceChunk,
  Topic,
} from "../../../../shared/src/curriculum.js";

/** Server-derived context. Never construct this from a request's claimed course IDs. */
export interface CurriculumAccessContext {
  readonly userId: string;
  readonly courseIds: readonly string[];
}
export interface CourseAccessPolicy {
  assertCanRead(context: CurriculumAccessContext, courseId: string): Promise<void>;
}
export interface CourseScope {
  courseId: string;
  curriculumVersion: number;
}
export interface TopicScope extends CourseScope {
  topicId: string;
}
/** Internal data access only; callers must use the service to enforce access. */
export interface CurriculumReadRepository {
  getCourse(courseId: string): Promise<Course | null>;
  listTopics(scope: CourseScope): Promise<Topic[]>;
  listMaterials(scope: TopicScope): Promise<Material[]>;
  listChunks(scope: TopicScope): Promise<SourceChunk[]>;
}
export interface CurriculumTopicPort {
  getCourse(courseId: string, access: CurriculumAccessContext): Promise<Course>;
  listTopics(scope: CourseScope, access: CurriculumAccessContext): Promise<Topic[]>;
  listSources(scope: TopicScope, access: CurriculumAccessContext): Promise<Material[]>;
}
export interface CurriculumContextPort {
  retrieve(input: RetrieveContextInput, access: CurriculumAccessContext): Promise<RetrievedContext>;
}
export type CurriculumErrorCode = "INVALID_INPUT" | "FORBIDDEN" | "NOT_FOUND" | "VERSION_MISMATCH";
export class CurriculumError extends Error {
  constructor(
    public readonly code: CurriculumErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CurriculumError";
  }
}
