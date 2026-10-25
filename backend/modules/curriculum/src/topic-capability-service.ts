import {
  learningFormatDefinitions,
  type CurriculumTopicCapabilityPort,
  type CurriculumTopicCapabilityRequest,
  type CurriculumTopicCapabilityResponse,
  type ContentRepresentation,
} from "./content-capabilities.js";
import { HistoryResourceService } from "./history-resource-service.js";
import { historyMockResources } from "./history-resource-catalog.js";
import { curriculumCourseId, curriculumTopicId } from "./learning-context-adapter.js";
import type {
  CourseAccessPolicy,
  CurriculumAccessContext,
  CurriculumReadRepository,
} from "./ports.js";

/** Additive topic resource discovery. Geometry's concept discovery stays unchanged. */
export class CurriculumTopicCapabilityService implements CurriculumTopicCapabilityPort {
  private readonly resources: HistoryResourceService;
  constructor(
    repository: CurriculumReadRepository,
    policy: CourseAccessPolicy,
    access: CurriculumAccessContext,
  ) {
    this.resources = new HistoryResourceService(repository, policy, access);
  }
  async getTopicCapabilities(
    input: CurriculumTopicCapabilityRequest,
  ): Promise<CurriculumTopicCapabilityResponse> {
    // Resource reads validate inputs, authorize first, and verify every source citation.
    const resources = await this.resources.listResources(input);
    const expected = historyMockResources.filter(
      (r) =>
        r.courseId === curriculumCourseId(input.courseId.trim()) &&
        r.topicId === curriculumTopicId(input.topicId.trim()) &&
        r.curriculumVersion === input.curriculumVersion &&
        r.locale === input.locale &&
        r.status === "approved",
    );
    const unique = (ids: string[]) => [...new Set(ids)].sort();
    const sourceTextIds = unique(resources.flatMap((r) => r.citations.map((c) => c.chunkId)));
    return {
      contractVersion: 1,
      courseId: input.courseId,
      topicId: input.topicId,
      curriculumVersion: input.curriculumVersion,
      locale: input.locale,
      formats: learningFormatDefinitions.map(({ format }) => {
        const matches = resources.filter((r) => r.format === format);
        const sourceChunkIds =
          format === "text"
            ? [...sourceTextIds]
            : unique(matches.flatMap((r) => r.citations.map((c) => c.chunkId)));
        const available = sourceChunkIds.length > 0;
        const availableRepresentations: ContentRepresentation[] = !available
          ? []
          : format === "text"
            ? ["text_excerpt"]
            : [...new Set(matches.map((r) => r.structuredContent.representation))];
        const hasAuthoredResource =
          format === "text" ? expected.length > 0 : expected.some((r) => r.format === format);
        return {
          format,
          available,
          availableRepresentations,
          sourceChunkIds,
          resourceIds: matches.map((r) => r.id).sort(),
          generationAvailable: false,
          playableMediaAvailable: false,
          ...(available
            ? {}
            : {
                unavailableReason: hasAuthoredResource
                  ? ("no_approved_content" as const)
                  : ("not_authored" as const),
              }),
        };
      }),
    };
  }
}
