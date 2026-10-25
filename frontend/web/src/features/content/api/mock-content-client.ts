import {
  athenaDemoIds,
  createDemoContentSeed,
  contentDisplayStatus,
  demoContentChunk,
  demoContentPreferences,
  demoContentTopics,
  type ContentChatRequest,
  type ContentChatResponse,
  type ContentMaterial,
  type ContentMilestone,
  type ContentObjective,
  type ContentPreferences,
  type CreateContentMaterialRequest,
  type CreateContentMaterialResponse,
  type UpdateContentMaterialRequest,
  type UpsertContentMilestoneRequest,
  type UpsertContentObjectiveRequest,
} from "@athena/shared";
import { ContentApiError, type ContentClient, type ContentTopic } from "./types";

const uuid = (suffix: string) => `00000000-0000-4000-8000-${suffix.padStart(12, "0")}`;
const EMBED_PER_STEP = 6;

/**
 * In-browser stand-in for the content API (NEXT_PUBLIC_USE_MOCKS). State lives for the page
 * session; processing advances a few chunks per process() call, like the real bounded steps.
 */
export class MockContentClient implements ContentClient {
  private state = createDemoContentSeed();
  private ids = 0x900;

  constructor(private readonly preferences: ContentPreferences = demoContentPreferences) {}

  async getPreferences() {
    return this.preferences;
  }

  async listTopics() {
    return structuredClone(demoContentTopics) as ContentTopic[];
  }

  async listMaterials() {
    return structuredClone(this.state.materials);
  }

  async createMaterial(
    classId: string,
    body: CreateContentMaterialRequest,
  ): Promise<CreateContentMaterialResponse> {
    const existing = this.state.materials.find(
      (item) => item.classId === classId && item.sha256 === body.sha256,
    );
    if (existing) {
      existing.topicIds = [...new Set([...existing.topicIds, ...body.topicIds])];
      return { duplicate: true, material: structuredClone(existing) };
    }
    const material: ContentMaterial = {
      classId,
      courseId: athenaDemoIds.course,
      id: this.nextId(),
      title: body.title,
      filename: body.filename,
      mimeType: body.mimeType,
      byteSize: body.byteSize,
      sha256: body.sha256,
      locale: body.locale,
      topicIds: body.topicIds,
      status: "uploaded",
      progress: { embedded: 0, total: 0 },
      searchable: false,
      attempts: 0,
      curriculumVersion: 1,
      uploadedBy: athenaDemoIds.professorRuiz,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.materials.push(material);
    return {
      duplicate: false,
      material: structuredClone(material),
      uploadUrl: `https://mock.invalid/upload/${material.id}`,
    };
  }

  async uploadFile() {}

  async completeUpload(materialId: string) {
    return structuredClone(this.material(materialId));
  }

  async processMaterial(materialId: string) {
    const material = this.material(materialId);
    if (material.status === "uploaded" || material.status === "failed") {
      const total = Math.max(1, Math.ceil(material.byteSize / 3_200));
      Object.assign(material, {
        status: "embedding",
        attempts: material.attempts + 1,
        progress: { embedded: 0, total: Math.min(total, 2_000) },
        errorCode: undefined,
        errorMessage: undefined,
      });
    } else if (contentDisplayStatus(material.status) === "processing") {
      const embedded = Math.min(
        material.progress.total,
        material.progress.embedded + EMBED_PER_STEP,
      );
      material.progress = { ...material.progress, embedded };
      if (embedded === material.progress.total) {
        Object.assign(material, {
          status: "ready",
          searchable: true,
          processedAt: new Date().toISOString(),
        });
      }
    }
    material.updatedAt = new Date().toISOString();
    return structuredClone(material);
  }

  async updateMaterial(materialId: string, body: UpdateContentMaterialRequest) {
    const material = this.material(materialId);
    if (body.title !== undefined) material.title = body.title;
    if (body.topicIds) material.topicIds = [...new Set(body.topicIds)];
    return structuredClone(material);
  }

  async deleteMaterial(materialId: string) {
    this.material(materialId);
    this.state.materials = this.state.materials.filter((item) => item.id !== materialId);
  }

  async downloadUrl(materialId: string) {
    this.material(materialId);
    return { url: "about:blank", expiresAt: new Date(Date.now() + 60_000).toISOString() };
  }

  async listObjectives() {
    return structuredClone(this.state.objectives);
  }

  async upsertObjective(classId: string, id: string, body: UpsertContentObjectiveRequest) {
    const { expectedUpdatedAt, ...fields } = body;
    const existing = this.state.objectives.find((item) => item.id === id);
    if (expectedUpdatedAt !== undefined && existing?.updatedAt !== expectedUpdatedAt) {
      throw new ContentApiError(409, "The objective changed; reload it");
    }
    if (
      this.state.objectives.some(
        (item) => item.id !== id && item.topicId === body.topicId && item.code === body.code,
      )
    ) {
      throw new ContentApiError(409, `Objective code already used in this topic: ${body.code}`);
    }
    const saved: ContentObjective = { ...fields, id, classId, updatedAt: new Date().toISOString() };
    this.state.objectives = [...this.state.objectives.filter((item) => item.id !== id), saved];
    return structuredClone(saved);
  }

  async deleteObjective(_classId: string, id: string) {
    this.state.objectives = this.state.objectives.filter((item) => item.id !== id);
    for (const milestone of this.state.milestones) {
      milestone.objectiveIds = milestone.objectiveIds.filter((objectiveId) => objectiveId !== id);
    }
  }

  async listMilestones() {
    return structuredClone(this.state.milestones);
  }

  async upsertMilestone(classId: string, id: string, body: UpsertContentMilestoneRequest) {
    const { expectedUpdatedAt, ...fields } = body;
    const existing = this.state.milestones.find((item) => item.id === id);
    if (expectedUpdatedAt !== undefined && existing?.updatedAt !== expectedUpdatedAt) {
      throw new ContentApiError(409, "The milestone changed; reload it");
    }
    const saved: ContentMilestone = { ...fields, id, classId, updatedAt: new Date().toISOString() };
    this.state.milestones = [...this.state.milestones.filter((item) => item.id !== id), saved];
    return structuredClone(saved);
  }

  async deleteMilestone(_classId: string, id: string) {
    this.state.milestones = this.state.milestones.filter((item) => item.id !== id);
  }

  async listFlags() {
    return structuredClone(this.state.flags);
  }

  async reviewFlag(flagId: string) {
    const flag = this.state.flags.find((item) => item.id === flagId);
    if (!flag) throw new ContentApiError(404, `Flag not found: ${flagId}`);
    Object.assign(flag, {
      reviewedAt: new Date().toISOString(),
      reviewedBy: athenaDemoIds.professorRuiz,
    });
    return structuredClone(flag);
  }

  /** Cites the first ready material when the question shares a word with it; else abstains. */
  async chat(_classId: string, body: ContentChatRequest): Promise<ContentChatResponse> {
    const locale = this.preferences.locale;
    const ready = this.state.materials.filter((item) => item.searchable);
    const words = new Set(fold(body.message).match(/[a-z0-9]{4,}/g) ?? []);
    const hit = ready.find((item) =>
      (fold(item.title).match(/[a-z0-9]{4,}/g) ?? []).some((w) => words.has(w)),
    );
    const topicIds = [...new Set(ready.flatMap((item) => item.topicIds))];
    if (!hit) {
      return {
        outcome: "abstained",
        answer:
          locale === "es"
            ? "El material de esta clase no cubre esa pregunta. Prueba con uno de estos temas o pregúntale a tu profesor."
            : "The class material doesn't cover that question. Try one of these topics or ask your professor.",
        citations: [],
        locale,
        suggestedTopicIds: topicIds,
        preview: true,
      };
    }
    return {
      outcome: "answered",
      answer:
        locale === "es"
          ? `Según el material de la clase: así lo explica «${hit.title}» [1]`
          : `According to the class material: this is how "${hit.title}" explains it [1]`,
      citations: [
        {
          materialId: hit.id,
          materialTitle: hit.title,
          page: 1,
          chunkId: uuid("c001"),
          excerpt:
            locale === "es"
              ? demoContentChunk.text
              : "Simulated excerpt from the material (demo mode).",
        },
      ],
      locale,
      suggestedTopicIds: [],
      preview: true,
    };
  }

  private material(id: string) {
    const material = this.state.materials.find((item) => item.id === id);
    if (!material) throw new ContentApiError(404, `Material not found: ${id}`);
    return material;
  }

  private nextId() {
    this.ids += 1;
    return uuid(this.ids.toString(16));
  }
}

function fold(text: string) {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
