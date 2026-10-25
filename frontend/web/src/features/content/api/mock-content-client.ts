import {
  athenaDemoIds,
  contentDisplayStatus,
  type ContentChatRequest,
  type ContentChatResponse,
  type ContentFlag,
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

const AT = "2026-10-24T00:00:00.000Z";
const uuid = (suffix: string) => `00000000-0000-4000-8000-${suffix.padStart(12, "0")}`;
const { topics, students } = athenaDemoIds;

const TOPICS: ContentTopic[] = [
  { id: topics.fractions, title: "Fracciones" },
  { id: topics.geometry, title: "Geometría" },
  { id: topics.functions, title: "Funciones" },
  { id: topics.statistics, title: "Estadística" },
];

const base = {
  classId: athenaDemoIds.class,
  courseId: athenaDemoIds.course,
  locale: "es" as const,
  attempts: 1,
  curriculumVersion: 1,
  uploadedBy: athenaDemoIds.professorRuiz,
  createdAt: AT,
  updatedAt: AT,
};

/** Deterministic seed: one ready material, one failed, objectives, a milestone and flags. */
function seed() {
  const materials: ContentMaterial[] = [
    {
      ...base,
      id: uuid("d001"),
      title: "Notas de geometría",
      filename: "notas-geometria.pdf",
      mimeType: "application/pdf",
      byteSize: 182_400,
      sha256: "1".repeat(64),
      topicIds: [topics.geometry],
      status: "ready",
      progress: { embedded: 24, total: 24 },
      searchable: true,
      processedAt: AT,
    },
    {
      ...base,
      id: uuid("d002"),
      title: "Fracciones escaneadas",
      filename: "fracciones-escaneo.pdf",
      mimeType: "application/pdf",
      byteSize: 940_000,
      sha256: "2".repeat(64),
      topicIds: [topics.fractions],
      status: "failed",
      progress: { embedded: 0, total: 0 },
      searchable: false,
      errorCode: "no_extractable_text",
      errorMessage: "The file has no extractable text",
    },
  ];
  const objectives: ContentObjective[] = [
    {
      id: uuid("e001"),
      classId: athenaDemoIds.class,
      topicId: topics.geometry,
      materialId: uuid("d001"),
      code: "GEO-1",
      statement: {
        es: "Calcular el área de triángulos y rectángulos.",
        en: "Compute the area of triangles and rectangles.",
      },
      position: 0,
      updatedAt: AT,
    },
    {
      id: uuid("e002"),
      classId: athenaDemoIds.class,
      topicId: topics.geometry,
      code: "GEO-2",
      statement: {
        es: "Explicar por qué el área del triángulo es la mitad del rectángulo.",
        en: "Explain why a triangle's area is half the rectangle's.",
      },
      position: 1,
      updatedAt: AT,
    },
  ];
  const milestones: ContentMilestone[] = [
    {
      id: uuid("e101"),
      classId: athenaDemoIds.class,
      topicId: topics.geometry,
      title: { es: "Parcial de geometría", en: "Geometry midterm" },
      dueAt: "2026-11-15T00:00:00.000Z",
      position: 0,
      objectiveIds: [uuid("e001"), uuid("e002")],
      updatedAt: AT,
    },
  ];
  const flags: ContentFlag[] = [
    {
      id: uuid("f001"),
      classId: athenaDemoIds.class,
      studentId: students.mateo,
      studentName: "Mateo",
      topicId: topics.geometry,
      category: "graded_work",
      action: "redirected",
      excerpt: "Hazme los ejercicios 3 y 4 de la tarea de áreas",
      locale: "es",
      createdAt: "2026-10-24T15:20:00.000Z",
    },
    {
      id: uuid("f002"),
      classId: athenaDemoIds.class,
      studentId: students.sofia,
      studentName: "Sofía",
      category: "self_harm",
      action: "refused",
      locale: "es",
      createdAt: "2026-10-24T18:05:00.000Z",
    },
  ];
  return { materials, objectives, milestones, flags };
}

const EMBED_PER_STEP = 6;

/**
 * In-browser stand-in for the content API (NEXT_PUBLIC_USE_MOCKS). State lives for the page
 * session; processing advances a few chunks per process() call, like the real bounded steps.
 */
export class MockContentClient implements ContentClient {
  private state = seed();
  private ids = 0x900;

  constructor(private readonly preferences: ContentPreferences = defaultMockPreferences) {}

  async getPreferences() {
    return this.preferences;
  }

  async listTopics() {
    return TOPICS;
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
      ...base,
      classId,
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
              ? "Fragmento simulado del material (modo de demostración)."
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

export const defaultMockPreferences: ContentPreferences = {
  locale: "es",
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontScale: 1,
    dyslexiaFont: false,
    simplifiedLanguage: false,
  },
};

function fold(text: string) {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
