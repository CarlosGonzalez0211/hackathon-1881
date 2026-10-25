import { athenaDemoIds } from "./demo-identities.js";
import { classAnalyticsSchema, emptyAiUsage, type ClassAnalytics } from "../analytics.js";

/** Minimal opening-state fixture (Platform owns). The full class story arrives with projections. */
export const demoClassAnalytics: ClassAnalytics = classAnalyticsSchema.parse({
  classId: athenaDemoIds.class,
  courseId: athenaDemoIds.course,
  topics: [],
  aiUsage: emptyAiUsage(),
  interventions: [],
  students: [],
});

const { students: s, topics: t } = athenaDemoIds;
const usage = (chat: number, podcast: number, video: number, summary: number, hint: number) => ({
  chat,
  podcast,
  video,
  summary,
  hint,
  quiz_answer: 0,
});
const sumUsage = (...items: ReturnType<typeof usage>[]) =>
  items.reduce((a, b) => ({
    chat: a.chat + b.chat,
    podcast: a.podcast + b.podcast,
    video: a.video + b.video,
    summary: a.summary + b.summary,
    hint: a.hint + b.hint,
    quiz_answer: 0,
  }));
const studentUsage = [
  usage(6, 1, 2, 3, 4),
  usage(2, 0, 1, 1, 1),
  usage(5, 2, 1, 2, 6),
  usage(1, 0, 0, 0, 0),
  usage(8, 1, 3, 4, 9),
  usage(3, 0, 1, 1, 2),
  usage(4, 1, 0, 2, 3),
  usage(2, 0, 1, 0, 5),
];

/**
 * Mid-semester class story for the educator dashboard (Platform owns). Same shape the event
 * projection produces. Students show different needs: Diego needs help with geometry, Andrés
 * leans on hints, Sofía is ahead.
 */
export const demoClassAnalyticsMidSemester: ClassAnalytics = classAnalyticsSchema.parse({
  classId: athenaDemoIds.class,
  courseId: athenaDemoIds.course,
  topics: [
    {
      topicId: t.fractions,
      title: "Fracciones",
      averageMastery: 0.82,
      masteredStudents: 6,
      strugglingStudents: 0,
      commonMisconceptions: [],
    },
    {
      topicId: t.geometry,
      title: "Geometría",
      averageMastery: 0.46,
      masteredStudents: 2,
      strugglingStudents: 4,
      commonMisconceptions: [
        { code: "area-perimeter", label: "Confunde área con perímetro", studentCount: 4 },
        { code: "angle-units", label: "Mezcla grados y radianes", studentCount: 2 },
      ],
    },
    {
      topicId: t.functions,
      title: "Funciones",
      averageMastery: 0.61,
      masteredStudents: 3,
      strugglingStudents: 2,
      commonMisconceptions: [
        {
          code: "function-as-equation",
          label: "Ve la función solo como una ecuación",
          studentCount: 3,
        },
      ],
    },
    {
      topicId: t.statistics,
      title: "Estadística",
      averageMastery: 0.58,
      masteredStudents: 2,
      strugglingStudents: 2,
      commonMisconceptions: [
        { code: "mean-median", label: "Usa la media cuando hay valores atípicos", studentCount: 3 },
      ],
    },
    {
      topicId: t.probability,
      title: "Probabilidad",
      averageMastery: 0.39,
      masteredStudents: 1,
      strugglingStudents: 5,
      commonMisconceptions: [
        { code: "gamblers-fallacy", label: "Falacia del apostador", studentCount: 5 },
      ],
    },
    {
      topicId: t.criticalThinking,
      title: "Pensamiento crítico",
      averageMastery: 0.7,
      masteredStudents: 4,
      strugglingStudents: 1,
      commonMisconceptions: [],
    },
  ],
  aiUsage: sumUsage(...studentUsage),
  interventions: [
    {
      id: `${s.diego}:${t.geometry}`,
      studentId: s.diego,
      topicId: t.geometry,
      severity: "high",
      reason:
        "Diego Navarro tiene 22% de dominio en Geometría y bajó en los últimos dos puntos de control.",
      recommendedAction:
        "Repasar área y perímetro con material visual antes del próximo punto de control.",
      status: "open",
    },
    {
      id: `${s.andres}:${t.probability}`,
      studentId: s.andres,
      topicId: t.probability,
      severity: "high",
      reason:
        "Andrés Vega tiene 18% de dominio en Probabilidad y usa pistas en casi cada pregunta.",
      recommendedAction: "Trabajar eventos independientes con ejemplos concretos, sin pistas.",
      status: "open",
    },
    {
      id: `${s.valeria}:${t.probability}`,
      studentId: s.valeria,
      topicId: t.probability,
      severity: "medium",
      reason: "Valeria Soto tiene 41% de dominio en Probabilidad.",
      recommendedAction: "Revisar la falacia del apostador en una actividad en pareja.",
      status: "acknowledged",
    },
    {
      id: `${s.camila}:${t.statistics}`,
      studentId: s.camila,
      topicId: t.statistics,
      severity: "medium",
      reason: "Camila Rojas tiene 44% de dominio en Estadística.",
      recommendedAction: "Comparar media y mediana con datos que incluyan valores atípicos.",
      status: "open",
    },
  ],
  students: [
    {
      studentId: s.lucia,
      displayName: "Lucía Torres",
      growth: 0.34,
      averageMastery: 0.74,
      openInterventions: 0,
      aiUsage: studentUsage[0]!,
    },
    {
      studentId: s.mateo,
      displayName: "Mateo Herrera",
      growth: 0.22,
      averageMastery: 0.66,
      openInterventions: 0,
      aiUsage: studentUsage[1]!,
    },
    {
      studentId: s.sofia,
      displayName: "Sofía Castro",
      growth: 0.41,
      averageMastery: 0.88,
      openInterventions: 0,
      aiUsage: studentUsage[2]!,
    },
    {
      studentId: s.diego,
      displayName: "Diego Navarro",
      growth: 0.04,
      averageMastery: 0.38,
      openInterventions: 1,
      aiUsage: studentUsage[3]!,
    },
    {
      studentId: s.valeria,
      displayName: "Valeria Soto",
      growth: 0.18,
      averageMastery: 0.52,
      openInterventions: 1,
      aiUsage: studentUsage[4]!,
    },
    {
      studentId: s.andres,
      displayName: "Andrés Vega",
      growth: 0.06,
      averageMastery: 0.33,
      openInterventions: 1,
      aiUsage: studentUsage[5]!,
    },
    {
      studentId: s.camila,
      displayName: "Camila Rojas",
      growth: 0.27,
      averageMastery: 0.57,
      openInterventions: 1,
      aiUsage: studentUsage[6]!,
    },
    {
      studentId: s.nicolas,
      displayName: "Nicolás Pardo",
      growth: 0.3,
      averageMastery: 0.69,
      openInterventions: 0,
      aiUsage: studentUsage[7]!,
    },
  ],
});
