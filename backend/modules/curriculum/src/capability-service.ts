import { geometryConceptCatalog, GEOMETRY_CONCEPT_IDS } from "./geometry-concept-catalog.js";
import { geometrySourceBindings } from "./geometry-source-map.js";
import {
  curriculumCourseId,
  curriculumTopicId,
  parseLearningContextRequest,
} from "./learning-context-adapter.js";
import {
  learningFormatDefinitions,
  type CapabilityUnavailableReason,
  type CurriculumCapabilityPort,
  type CurriculumCapabilityRequest,
  type CurriculumCapabilityResponse,
} from "./content-capabilities.js";
import {
  CurriculumError,
  type CourseAccessPolicy,
  type CurriculumAccessContext,
  type CurriculumReadRepository,
} from "./ports.js";
import { CurriculumRetrievalService } from "./retrieval-service.js";

export class CurriculumCapabilityService implements CurriculumCapabilityPort {
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
  async getCapabilities(input: CurriculumCapabilityRequest): Promise<CurriculumCapabilityResponse> {
    const keys = new Set(["courseId", "topicId", "conceptId", "curriculumVersion", "locale"]);
    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input) ||
      Object.keys(input).some((key) => !keys.has(key)) ||
      !["en", "es"].includes(input.locale)
    )
      throw new CurriculumError("INVALID_INPUT", "Invalid capability request");
    const request = parseLearningContextRequest({ ...input, query: "capability discovery" });
    const courseId = curriculumCourseId(request.courseId);
    const topicId = curriculumTopicId(request.topicId);
    let version = request.curriculumVersion;
    let unavailable: CapabilityUnavailableReason | undefined;
    try {
      version = (await this.service.getCourse(courseId, this.access)).activeVersion;
    } catch (error) {
      if (error instanceof CurriculumError && error.code === "NOT_FOUND")
        unavailable = "concept_not_found";
      else throw error;
    }
    if (!unavailable && version !== request.curriculumVersion)
      unavailable = "curriculum_version_mismatch";
    const concept = geometryConceptCatalog.find(
      (c) =>
        c.conceptId === request.conceptId &&
        c.courseId === courseId &&
        c.topicId === topicId &&
        c.curriculumVersion === version,
    );
    if (!unavailable && !concept) unavailable = "concept_not_found";
    const binding = geometrySourceBindings.find(
      (b) =>
        b.conceptId === concept?.conceptId &&
        b.courseId === courseId &&
        b.topicId === topicId &&
        b.curriculumVersion === version,
    );
    let chunks: string[] = [];
    if (!unavailable && binding) {
      const scope = { courseId, topicId, curriculumVersion: version };
      const readyIds = new Set(
        (await this.service.listSources(scope, this.access)).map((m) => m.id),
      );
      const approved = new Set<string>(binding.approvedChunkIds);
      chunks = (await this.repository.listChunks(scope))
        .filter(
          (c) =>
            c.courseId === courseId &&
            c.topicId === topicId &&
            c.curriculumVersion === version &&
            c.locale === input.locale &&
            readyIds.has(c.materialId) &&
            approved.has(c.id),
        )
        .map((c) => c.id)
        .sort();
      if (!chunks.length) unavailable = "no_approved_content";
      else if (!binding.sufficientForExplanation) unavailable = "insufficient_evidence";
    } else if (!unavailable) unavailable = "no_approved_content";

    return {
      contractVersion: 1,
      courseId: input.courseId,
      topicId: input.topicId,
      conceptId: input.conceptId,
      curriculumVersion: version,
      locale: input.locale,
      formats: learningFormatDefinitions.map(({ format }) => {
        // Existing authored calculation, not a newly generated resource.
        const workedExampleIds =
          concept?.conceptId === GEOMETRY_CONCEPT_IDS.triangleArea
            ? chunks.filter((id) => id === "material-topic-geometry-notes-chunk-0")
            : [];
        const sourceChunkIds = unavailable
          ? []
          : format === "text"
            ? chunks
            : format === "worked_example"
              ? workedExampleIds
              : [];
        const available = sourceChunkIds.length > 0;
        return {
          format,
          available,
          availableRepresentations: available ? ["text_excerpt"] : [],
          sourceChunkIds,
          generationAvailable: false,
          playableMediaAvailable: false,
          ...(available ? {} : { unavailableReason: unavailable ?? "not_authored" }),
        };
      }),
    };
  }
}
