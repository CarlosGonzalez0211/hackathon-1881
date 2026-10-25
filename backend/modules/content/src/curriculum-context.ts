import {
  CONTENT_LIMITS,
  curriculumContextRequestSchema,
  curriculumContextResponseSchema,
  type AuthContext,
  type CurriculumContextRequest,
  type CurriculumContextResponse,
} from "@athena/shared";
import type { ClassCatalog, EnrollmentRegistry } from "@athena/platform";
import type {
  ChunkRepository,
  CurriculumCatalogPort,
  EmbeddingProvider,
  MaterialRepository,
  ObjectiveRecord,
  VersionedRepository,
} from "./ports.js";

export interface ContentCurriculumContextDeps {
  classes: ClassCatalog;
  enrollments: EnrollmentRegistry;
  catalog: CurriculumCatalogPort;
  materials: MaterialRepository;
  chunks: ChunkRepository;
  embeddings: EmbeddingProvider;
  objectives: VersionedRepository<ObjectiveRecord>;
  minSimilarity?: number;
}

const excerpt = (text: string) => {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= CONTENT_LIMITS.maxCitationExcerpt
    ? clean
    : `${clean.slice(0, CONTENT_LIMITS.maxCitationExcerpt - 1).trimEnd()}…`;
};

/**
 * Learning-facing retrieval over Content's class-scoped index. Learning authorizes the action;
 * this adapter independently derives the student's class from server-owned catalogs and rosters.
 */
export class ContentCurriculumContext {
  constructor(private readonly deps: ContentCurriculumContextDeps) {}

  async retrieve(
    raw: CurriculumContextRequest,
    context: AuthContext,
  ): Promise<CurriculumContextResponse> {
    const input = curriculumContextRequestSchema.parse(raw);
    const currentVersion = await this.deps.catalog.activeVersion(input.courseId);
    const unsupported = (
      unsupportedReason:
        | "concept_not_found"
        | "no_approved_content"
        | "insufficient_evidence"
        | "curriculum_version_mismatch",
    ) =>
      curriculumContextResponseSchema.parse({
        chunks: [],
        curriculumVersion: currentVersion,
        unsupported: true,
        unsupportedReason,
      });

    if (input.curriculumVersion !== currentVersion) {
      return unsupported("curriculum_version_mismatch");
    }
    if (
      context.role !== "admin" &&
      (!context.studentIds.includes(input.studentId) || !context.courseIds.includes(input.courseId))
    ) {
      return unsupported("no_approved_content");
    }

    const classId = await this.resolveClass(context, input.studentId, input.courseId);
    if (!classId) return unsupported("no_approved_content");

    const objectives = (await this.deps.objectives.list(classId)).filter(
      (objective) => objective.topicId === input.topicId && objective.conceptId === input.conceptId,
    );
    if (objectives.length === 0) return unsupported("concept_not_found");

    const allTopicMaterials = (await this.deps.materials.listByClass(classId)).filter(
      (material) =>
        material.activeGeneration !== undefined &&
        material.curriculumVersion === currentVersion &&
        material.topicIds.includes(input.topicId),
    );
    const explicitlyLinked = new Set(
      objectives.flatMap((objective) => (objective.materialId ? [objective.materialId] : [])),
    );
    const approvedMaterials =
      explicitlyLinked.size > 0
        ? allTopicMaterials.filter((material) => explicitlyLinked.has(material.id))
        : allTopicMaterials;
    if (approvedMaterials.length === 0) return unsupported("no_approved_content");

    const approvedIds = new Set(approvedMaterials.map((material) => material.id));
    const query = await this.deps.embeddings.embedQuery(input.query);
    const matches = (
      await this.deps.chunks.match({
        classId,
        query,
        model: this.deps.embeddings.model,
        topicId: input.topicId,
        limit: 20,
        minSimilarity: this.deps.minSimilarity ?? 0.2,
      })
    )
      .filter((match) => approvedIds.has(match.materialId))
      .filter((match) => match.pageStart !== undefined || match.sectionTitle !== undefined)
      .slice(0, input.limit ?? 5);
    if (matches.length === 0) return unsupported("insufficient_evidence");

    return curriculumContextResponseSchema.parse({
      chunks: matches.map((match) => ({
        text: match.content,
        conceptId: input.conceptId,
        relevanceScore: match.similarity,
        citation: {
          materialId: match.materialId,
          materialTitle: match.materialTitle,
          page: match.pageStart,
          section: match.sectionTitle,
          chunkId: match.chunkId,
          excerpt: excerpt(match.content),
        },
      })),
      curriculumVersion: currentVersion,
      unsupported: false,
    });
  }

  private async resolveClass(context: AuthContext, studentId: string, courseId: string) {
    const candidates = (await this.deps.classes.listFor(context)).filter(
      (item) => item.courseId === courseId,
    );
    const matching: string[] = [];
    for (const item of candidates) {
      const roster = await this.deps.enrollments.roster(item.id);
      if (roster?.some((student) => student.studentId === studentId)) matching.push(item.id);
    }
    return matching.length === 1 ? matching[0] : null;
  }
}
