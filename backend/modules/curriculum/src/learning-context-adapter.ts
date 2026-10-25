import { sourceChunkSchema, validateRetrievedContext, type Citation } from "@athena/shared";
import { geometryConceptCatalog } from "./geometry-concept-catalog.js";
import { geometrySourceBindings } from "./geometry-source-map.js";
import {
  CurriculumError,
  type CourseAccessPolicy,
  type CurriculumAccessContext,
  type CurriculumReadRepository,
} from "./ports.js";
import { CurriculumRetrievalService } from "./retrieval-service.js";

/** Structural mirror of Daniela's edaf75f contract; no shared schema is replaced. */
export interface LearningCurriculumContextRequest {
  courseId: string;
  topicId: string;
  conceptId: string;
  query: string;
  curriculumVersion: number;
  locale?: "en" | "es";
  limit?: number;
}
export type UnsupportedContextReason =
  | "concept_not_found"
  | "no_approved_content"
  | "insufficient_evidence"
  | "curriculum_version_mismatch";
export interface LearningCurriculumContextChunk {
  text: string;
  conceptId: string;
  citation: Citation;
  relevanceScore?: number;
}
export type LearningCurriculumContextResponse =
  | { chunks: LearningCurriculumContextChunk[]; curriculumVersion: number; unsupported: false }
  | {
      chunks: [];
      curriculumVersion: number;
      unsupported: true;
      unsupportedReason: UnsupportedContextReason;
    };

// Explicit fixture aliases. Unknown identifiers never fall back to Mathematics.
const courseAliases: Readonly<Record<string, string>> = Object.freeze({
  "00000000-0000-4000-8000-000000000a01": "course-math-1",
});
const topicAliases: Readonly<Record<string, string>> = Object.freeze({
  "00000000-0000-4000-8000-000000000b01": "topic-fractions",
  "00000000-0000-4000-8000-000000000b02": "topic-geometry",
  "00000000-0000-4000-8000-000000000b03": "topic-functions",
  "00000000-0000-4000-8000-000000000b04": "topic-statistics",
  "00000000-0000-4000-8000-000000000b05": "topic-probability",
  "00000000-0000-4000-8000-000000000b06": "topic-critical-thinking",
});
function alias(mapping: Readonly<Record<string, string>>, id: string): string {
  return Object.hasOwn(mapping, id) ? mapping[id]! : id;
}

/** Shared by Person 1 discovery and retrieval; never creates new aliases. */
export function curriculumCourseId(id: string): string {
  return alias(courseAliases, id);
}
export function curriculumTopicId(id: string): string {
  return alias(topicAliases, id);
}

/** Validate locally until the shared consumer schema is available after synchronization. */
export function parseLearningContextRequest(
  input: LearningCurriculumContextRequest,
): LearningCurriculumContextRequest {
  const allowed = new Set([
    "courseId",
    "topicId",
    "conceptId",
    "query",
    "curriculumVersion",
    "locale",
    "limit",
  ]);
  const segment = "[a-z][a-z0-9]*(?:_[a-z0-9]+)*";
  const pattern = new RegExp(`^${segment}(?:\\.${segment}){2,}$`);
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    Object.keys(input).some((key) => !allowed.has(key)) ||
    typeof input.courseId !== "string" ||
    !input.courseId.length ||
    typeof input.topicId !== "string" ||
    !input.topicId.length ||
    typeof input.conceptId !== "string" ||
    input.conceptId.length < 5 ||
    input.conceptId.length > 160 ||
    !pattern.test(input.conceptId) ||
    typeof input.query !== "string" ||
    !input.query.trim() ||
    input.query.trim().length > 2000 ||
    !Number.isInteger(input.curriculumVersion) ||
    input.curriculumVersion < 1 ||
    (input.locale !== undefined && input.locale !== "en" && input.locale !== "es") ||
    (input.limit !== undefined &&
      (!Number.isInteger(input.limit) || input.limit < 1 || input.limit > 10))
  ) {
    throw new CurriculumError("INVALID_INPUT", "Invalid concept retrieval request");
  }
  return { ...input, query: input.query.trim() };
}

/**
 * Implements Learning's one-argument retrieve shape with trusted access bound by
 * the server composition layer. Never bind identity or grants from the request body.
 */
export class LearningCurriculumContextAdapter {
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
      courseIds: Object.freeze(access.courseIds.map((id) => alias(courseAliases, id))),
    });
  }

  async retrieve(
    input: LearningCurriculumContextRequest,
  ): Promise<LearningCurriculumContextResponse> {
    const request = parseLearningContextRequest(input);
    const courseId = alias(courseAliases, request.courseId);
    const topicId = alias(topicAliases, request.topicId);
    let currentVersion = request.curriculumVersion;
    const unsupported = (
      unsupportedReason: UnsupportedContextReason,
    ): LearningCurriculumContextResponse => ({
      chunks: [],
      curriculumVersion: currentVersion,
      unsupported: true,
      unsupportedReason,
    });
    // Authorization runs before course/concept/source existence is disclosed.
    try {
      const course = await this.service.getCourse(courseId, this.access);
      currentVersion = course.activeVersion;
    } catch (error) {
      if (error instanceof CurriculumError && error.code === "NOT_FOUND")
        return unsupported("concept_not_found");
      throw error;
    }
    if (request.curriculumVersion !== currentVersion)
      return unsupported("curriculum_version_mismatch");
    const concept = geometryConceptCatalog.find(
      (item) =>
        item.conceptId === request.conceptId &&
        item.courseId === courseId &&
        item.topicId === topicId &&
        item.curriculumVersion === currentVersion,
    );
    if (!concept) return unsupported("concept_not_found");
    const binding = geometrySourceBindings.find(
      (item) =>
        item.conceptId === concept.conceptId &&
        item.courseId === courseId &&
        item.topicId === topicId &&
        item.curriculumVersion === currentVersion,
    );
    if (!binding) return unsupported("no_approved_content");
    const scope = { courseId, topicId, curriculumVersion: currentVersion };
    const materials = await this.service.listSources(scope, this.access);
    const readyIds = new Set(materials.map((item) => item.id));
    const approvedIds = new Set<string>(binding.approvedChunkIds);
    const candidates = sourceChunkSchema
      .array()
      .parse(await this.repository.listChunks(scope))
      .filter(
        (item) =>
          approvedIds.has(item.id) &&
          readyIds.has(item.materialId) &&
          item.courseId === courseId &&
          item.topicId === topicId &&
          item.curriculumVersion === currentVersion &&
          (request.locale === undefined || item.locale === request.locale),
      );
    if (candidates.length === 0) return unsupported("no_approved_content");
    if (!binding.sufficientForExplanation) return unsupported("insufficient_evidence");
    // Learning sends this exact intent without content-bearing query terms.
    // The question ID is opaque: only the validated concept determines evidence.
    if (/^Hint for question [A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/.test(request.query)) {
      const topic = (await this.service.listTopics(scope, this.access)).find(
        (t) => t.id === topicId,
      );
      if (!topic) return unsupported("concept_not_found");
      const evidence = validateRetrievedContext(
        {
          ...scope,
          chunks: [...candidates]
            .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
            .slice(0, request.limit ?? 5)
            .map((chunk) => ({
              text: chunk.text,
              // Validation helper expects a score; no lexical relevance score is exposed.
              similarity: 0,
              citation: {
                materialId: chunk.materialId,
                materialTitle: materials.find((m) => m.id === chunk.materialId)!.title,
                chunkId: chunk.id,
                section: chunk.section,
                excerpt: chunk.text,
              },
            })),
        },
        { courses: [], topics: [topic], materials, chunks: candidates },
      );
      return {
        chunks: evidence.chunks.map(({ text, citation }) => ({
          text,
          citation,
          conceptId: concept.conceptId,
        })),
        curriculumVersion: currentVersion,
        unsupported: false,
      };
    }
    const candidateIds = new Set(candidates.map((item) => item.id));
    // Rank all topic chunks, then scope to the approved concept before applying the caller's limit.
    const context = await this.service.retrieve(
      { ...scope, query: request.query, limit: 20 },
      this.access,
    );
    const chunks = context.chunks
      .filter((item) => candidateIds.has(item.citation.chunkId))
      .slice(0, request.limit ?? 5)
      .map((item) => ({
        text: item.text,
        conceptId: concept.conceptId,
        citation: item.citation,
        relevanceScore: item.similarity,
      }));
    if (!chunks.length) return unsupported("insufficient_evidence");
    return { chunks, curriculumVersion: currentVersion, unsupported: false };
  }
}
