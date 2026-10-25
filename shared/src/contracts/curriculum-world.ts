import { z } from "zod";
import { topicSchema } from "../curriculum.js";

/**
 * P1 Curriculum <-> World contract. PROPOSAL for team review, not frozen.
 * P1 owns the producer side (routes, storage, ingest) and may extend these shapes; World
 * reads only the fields below. Spec: docs/contracts/P1-curriculum-world.md.
 */

const idSchema = z.string().min(1).max(200);
const isoDateSchema = z.string().datetime();

/**
 * `GET /api/courses/:courseId/topics?published=true` item: P1's `topicSchema`
 * (shared/src/curriculum.ts) plus visibility. `order` is unique per course
 * (`unique(course_id, display_order)`) and becomes the house slot.
 */
export const curriculumTopicSummarySchema = topicSchema
  .pick({
    id: true,
    courseId: true,
    title: true,
    order: true,
    prerequisiteTopicIds: true,
    masteryThreshold: true,
  })
  .extend({
    /** Students only see published topics. Publishing requires at least one ready material. */
    published: z.boolean(),
  });
export type CurriculumTopicSummary = z.infer<typeof curriculumTopicSummarySchema>;

/** `POST /api/topics/:topicId/publish` body. 409 when no material is `ready`. */
export const topicPublishRequestSchema = z.object({ publish: z.boolean() });
export type TopicPublishRequest = z.infer<typeof topicPublishRequestSchema>;

/** Proposal 3.2 statuses; the house page lists only `ready` materials. */
export const houseMaterialStatusSchema = z.enum([
  "uploaded",
  "extracting",
  "chunking",
  "embedding",
  "ready",
  "failed",
]);

/** Proposal 3.2 learning formats (subset World may render as resource cards). */
export const houseResourceFormatSchema = z.enum([
  "text",
  "worked_example",
  "visual_summary",
  "slides",
  "audio",
  "podcast",
  "music",
  "video",
  "reel",
]);

/**
 * `GET /api/topics/:topicId/sources`: what the house page Material tab shows.
 * 403 for a student not enrolled in the course or an unpublished topic; P1 enforces it.
 */
export const houseContentSchema = z.object({
  topicId: idSchema,
  courseId: idSchema,
  title: z.string().min(1),
  /** Short professor-authored introduction shown at the top of the tab. */
  summary: z.string().optional(),
  materials: z.array(
    z.object({
      id: idSchema,
      title: z.string().min(1),
      filename: z.string().min(1),
      mimeType: z.string().min(1),
      status: houseMaterialStatusSchema,
      /** Short-lived signed URL (P1 storage). Absent in mocks. */
      url: z.string().url().optional(),
      pageCount: z.number().int().positive().optional(),
    }),
  ),
  /** Approved generated resources (summaries, podcasts...). */
  resources: z.array(
    z.object({
      id: idSchema,
      format: houseResourceFormatSchema,
      title: z.string().min(1),
      url: z.string().url().optional(),
      /** Inline text for `text`/`worked_example`/`visual_summary` resources. */
      body: z.string().optional(),
    }),
  ),
  updatedAt: isoDateSchema,
});
export type HouseContent = z.infer<typeof houseContentSchema>;

/** Events P1 emits. World recomputes on read, so these only trigger refreshes/analytics. */
const curriculumEventBase = { id: idSchema, courseId: idSchema, occurredAt: isoDateSchema };
export const curriculumEventSchema = z.discriminatedUnion("type", [
  z.object({ ...curriculumEventBase, type: z.literal("TopicPublished"), topicId: idSchema }),
  z.object({ ...curriculumEventBase, type: z.literal("TopicUnpublished"), topicId: idSchema }),
  z.object({
    ...curriculumEventBase,
    type: z.literal("MaterialProcessed"),
    materialId: idSchema,
    topicIds: z.array(idSchema),
    status: z.enum(["ready", "failed"]),
  }),
]);
export type CurriculumEvent = z.infer<typeof curriculumEventSchema>;

// ---------------------------------------------------------------------------
// Demo fixtures (proposal 2.2). Prerequisites chosen so the projection reproduces the
// demo planets: Geometría unlocks Estadística; Funciones needs only Fracciones.
// ---------------------------------------------------------------------------

export const DEMO_COURSE_ID = "course-math-1";
const DEMO_AT = "2026-10-24T15:00:00.000Z";

const topic = (
  id: string,
  title: string,
  order: number,
  prerequisiteTopicIds: string[],
): CurriculumTopicSummary => ({
  id,
  courseId: DEMO_COURSE_ID,
  title,
  order,
  prerequisiteTopicIds,
  masteryThreshold: 0.8,
  published: true,
});

export const demoCurriculumTopics: CurriculumTopicSummary[] = [
  topic("topic-fractions", "Fracciones", 0, []),
  topic("topic-geometry", "Geometría", 1, ["topic-fractions"]),
  topic("topic-functions", "Funciones", 2, ["topic-fractions"]),
  topic("topic-statistics", "Estadística", 3, ["topic-geometry"]),
  topic("topic-probability", "Probabilidad", 4, ["topic-statistics"]),
  topic("topic-critical-thinking", "Pensamiento crítico", 5, [
    "topic-functions",
    "topic-probability",
  ]),
];

const content = (
  topicId: string,
  title: string,
  summary: string,
  materials: HouseContent["materials"],
  resources: HouseContent["resources"] = [],
): HouseContent => ({
  topicId,
  courseId: DEMO_COURSE_ID,
  title,
  summary,
  materials,
  resources,
  updatedAt: DEMO_AT,
});

const pdf = (id: string, title: string, filename: string, pageCount: number) => ({
  id,
  title,
  filename,
  mimeType: "application/pdf",
  status: "ready" as const,
  pageCount,
});

/** What each house shows in mock mode. Keyed by topic id. */
export const demoHouseContent: Record<string, HouseContent> = {
  "topic-fractions": content(
    "topic-fractions",
    "Fracciones",
    "Partes de un todo, fracciones equivalentes y operaciones básicas.",
    [pdf("material-fractions-notes", "Unidad 1: Fracciones", "Fracciones-Unidad-1.pdf", 12)],
  ),
  "topic-geometry": content(
    "topic-geometry",
    "Geometría",
    "Áreas y perímetros de figuras planas. Empezamos por la relación entre el rectángulo y el triángulo.",
    [
      pdf("material-geometry-notes", "Unidad 2: Geometría", "Geometria-Unidad-2.pdf", 18),
      pdf("material-geometry-exercises", "Ejercicios de áreas", "Geometria-Ejercicios.pdf", 6),
    ],
    [
      {
        id: "resource-triangle-area",
        format: "visual_summary",
        title: "Un triángulo es medio rectángulo",
        body: "Dibuja un rectángulo de base b y altura h y trázale una diagonal: obtienes dos triángulos iguales. Por eso el área del triángulo es (b × h) / 2.",
      },
    ],
  ),
  "topic-functions": content(
    "topic-functions",
    "Funciones",
    "Qué es una función, dominio, rango y funciones lineales.",
    [pdf("material-functions-notes", "Unidad 3: Funciones", "Funciones-Unidad-3.pdf", 15)],
  ),
  "topic-statistics": content(
    "topic-statistics",
    "Estadística",
    "Media, mediana, moda y gráficos de frecuencias.",
    [pdf("material-statistics-notes", "Unidad 4: Estadística", "Estadistica-Unidad-4.pdf", 14)],
  ),
  "topic-probability": content(
    "topic-probability",
    "Probabilidad",
    "Experimentos aleatorios y probabilidad de eventos simples.",
    [pdf("material-probability-notes", "Unidad 5: Probabilidad", "Probabilidad-Unidad-5.pdf", 10)],
  ),
  "topic-critical-thinking": content(
    "topic-critical-thinking",
    "Pensamiento crítico",
    "Retos que combinan funciones, estadística y probabilidad.",
    [pdf("material-critical-notes", "Reto final", "Pensamiento-Critico.pdf", 8)],
  ),
};
