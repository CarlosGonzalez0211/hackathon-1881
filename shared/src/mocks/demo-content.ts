import {
  contentFlagSchema,
  contentMaterialSchema,
  contentMilestoneSchema,
  contentObjectiveSchema,
  contentPreferencesSchema,
  contentTopicSchema,
  type ContentFlag,
  type ContentMaterial,
  type ContentMilestone,
  type ContentObjective,
  type ContentPreferences,
  type ContentTopic,
} from "../content.js";
import { athenaDemoIds, athenaDemoTopics } from "./demo-identities.js";
import { demoLearningIds } from "./demo-learning.js";

const AT = "2026-10-24T00:00:00.000Z";
const uuid = (suffix: string) => `00000000-0000-4000-8000-${suffix.padStart(12, "0")}`;
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const demoContentIds = {
  materials: {
    geometryNotes: demoLearningIds.materials.geometryNotes,
    fractionsScan: uuid("e002"),
  },
  chunks: { triangleAreaExplanation: demoLearningIds.chunks.triangleAreaExplanation },
  objectives: { triangleArea: uuid("e201"), triangleExplanation: uuid("e202") },
  milestones: { geometryMidterm: uuid("e301") },
  flags: { gradedWork: uuid("f001"), selfHarm: uuid("f002") },
} as const;

export const demoContentTopics: ContentTopic[] = contentTopicSchema
  .array()
  .parse(athenaDemoTopics.map(({ id, title }) => ({ id, title })));

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

const materials: ContentMaterial[] = contentMaterialSchema.array().parse([
  {
    ...base,
    id: demoContentIds.materials.geometryNotes,
    title: "Notas de geometría",
    filename: "notas-geometria.pdf",
    mimeType: "application/pdf",
    byteSize: 182_400,
    sha256: "1".repeat(64),
    topicIds: [athenaDemoIds.topics.geometry],
    status: "ready",
    progress: { embedded: 1, total: 1 },
    searchable: true,
    processedAt: AT,
  },
  {
    ...base,
    id: demoContentIds.materials.fractionsScan,
    title: "Fracciones escaneadas",
    filename: "fracciones-escaneo.pdf",
    mimeType: "application/pdf",
    byteSize: 940_000,
    sha256: "2".repeat(64),
    topicIds: [athenaDemoIds.topics.fractions],
    status: "failed",
    progress: { embedded: 0, total: 0 },
    searchable: false,
    errorCode: "no_extractable_text",
    errorMessage: "The file has no extractable text",
  },
]);

const objectives: ContentObjective[] = contentObjectiveSchema.array().parse([
  {
    id: demoContentIds.objectives.triangleArea,
    classId: athenaDemoIds.class,
    topicId: athenaDemoIds.topics.geometry,
    materialId: demoContentIds.materials.geometryNotes,
    code: "GEO-1",
    conceptId: demoLearningIds.concepts.triangleArea,
    statement: {
      es: "Calcular el área de triángulos y rectángulos.",
      en: "Compute the area of triangles and rectangles.",
    },
    position: 0,
    updatedAt: AT,
  },
  {
    id: demoContentIds.objectives.triangleExplanation,
    classId: athenaDemoIds.class,
    topicId: athenaDemoIds.topics.geometry,
    code: "GEO-2",
    conceptId: demoLearningIds.concepts.triangleArea,
    statement: {
      es: "Explicar por qué el área del triángulo es la mitad del rectángulo.",
      en: "Explain why a triangle's area is half the rectangle's.",
    },
    position: 1,
    updatedAt: AT,
  },
]);

const milestones: ContentMilestone[] = contentMilestoneSchema.array().parse([
  {
    id: demoContentIds.milestones.geometryMidterm,
    classId: athenaDemoIds.class,
    topicId: athenaDemoIds.topics.geometry,
    title: { es: "Parcial de geometría", en: "Geometry midterm" },
    dueAt: "2026-11-15T00:00:00.000Z",
    position: 0,
    objectiveIds: [
      demoContentIds.objectives.triangleArea,
      demoContentIds.objectives.triangleExplanation,
    ],
    updatedAt: AT,
  },
]);

const flags: ContentFlag[] = contentFlagSchema.array().parse([
  {
    id: demoContentIds.flags.gradedWork,
    classId: athenaDemoIds.class,
    studentId: athenaDemoIds.students.mateo,
    studentName: "Mateo Herrera",
    topicId: athenaDemoIds.topics.geometry,
    category: "graded_work",
    action: "redirected",
    excerpt: "Hazme los ejercicios 3 y 4 de la tarea de áreas",
    locale: "es",
    createdAt: "2026-10-24T15:20:00.000Z",
  },
  {
    id: demoContentIds.flags.selfHarm,
    classId: athenaDemoIds.class,
    studentId: athenaDemoIds.students.sofia,
    studentName: "Sofía Castro",
    category: "self_harm",
    action: "refused",
    locale: "es",
    createdAt: "2026-10-24T18:05:00.000Z",
  },
]);

export const demoContentPreferences: ContentPreferences = contentPreferencesSchema.parse({
  locale: "es",
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontScale: 1,
    dyslexiaFont: false,
    simplifiedLanguage: false,
  },
});

/** The exact professor-facing seed consumed by both browser and API mock stores. */
export function createDemoContentSeed(): {
  materials: ContentMaterial[];
  objectives: ContentObjective[];
  milestones: ContentMilestone[];
  flags: ContentFlag[];
} {
  return clone({ materials, objectives, milestones, flags });
}

/** Shared RAG evidence behind the ready geometry material. */
export const demoContentChunk = {
  id: demoContentIds.chunks.triangleAreaExplanation,
  materialId: demoContentIds.materials.geometryNotes,
  classId: athenaDemoIds.class,
  topicId: athenaDemoIds.topics.geometry,
  conceptId: demoLearningIds.concepts.triangleArea,
  sectionTitle: "Área de triángulos",
  pageStart: 1,
  pageEnd: 1,
  text: "Dos triángulos iguales forman un rectángulo con la misma base y altura. Por eso, el área de un triángulo es base por altura dividido entre dos.",
} as const;
