/** Fixed UUID-shaped ids shared by every fixture and accepted by the real database schemas. */
const uuid = (suffix: string) => `00000000-0000-4000-8000-${suffix.padStart(12, "0")}`;

export const athenaDemoIds = {
  professorRuiz: uuid("1"),
  course: uuid("a01"),
  class: uuid("c01"),
  students: {
    lucia: uuid("101"),
    mateo: uuid("102"),
    sofia: uuid("103"),
    diego: uuid("104"),
    valeria: uuid("105"),
    andres: uuid("106"),
    camila: uuid("107"),
    nicolas: uuid("108"),
  },
  topics: {
    fractions: uuid("b01"),
    geometry: uuid("b02"),
    functions: uuid("b03"),
    statistics: uuid("b04"),
    probability: uuid("b05"),
    criticalThinking: uuid("b06"),
  },
} as const;

/** One roster for Platform, Learning, World, Analytics, Content and the browser mocks. */
export const athenaDemoStudents = [
  { key: "lucia", id: athenaDemoIds.students.lucia, displayName: "Lucía Torres" },
  { key: "mateo", id: athenaDemoIds.students.mateo, displayName: "Mateo Herrera" },
  { key: "sofia", id: athenaDemoIds.students.sofia, displayName: "Sofía Castro" },
  { key: "diego", id: athenaDemoIds.students.diego, displayName: "Diego Navarro" },
  { key: "valeria", id: athenaDemoIds.students.valeria, displayName: "Valeria Soto" },
  { key: "andres", id: athenaDemoIds.students.andres, displayName: "Andrés Vega" },
  { key: "camila", id: athenaDemoIds.students.camila, displayName: "Camila Rojas" },
  { key: "nicolas", id: athenaDemoIds.students.nicolas, displayName: "Nicolás Pardo" },
] as const;

/**
 * Curriculum still owns legacy string ids internally. `legacyId` is the explicit boundary;
 * every Platform/Content/Learning/World and browser-facing id is the UUID `id`.
 */
export const athenaDemoTopics = [
  {
    key: "fractions",
    id: athenaDemoIds.topics.fractions,
    legacyId: "topic-fractions",
    title: "Fracciones",
    order: 0,
    prerequisiteKeys: [],
  },
  {
    key: "geometry",
    id: athenaDemoIds.topics.geometry,
    legacyId: "topic-geometry",
    title: "Geometría",
    order: 1,
    prerequisiteKeys: ["fractions"],
  },
  {
    key: "functions",
    id: athenaDemoIds.topics.functions,
    legacyId: "topic-functions",
    title: "Funciones",
    order: 2,
    prerequisiteKeys: ["fractions"],
  },
  {
    key: "statistics",
    id: athenaDemoIds.topics.statistics,
    legacyId: "topic-statistics",
    title: "Estadística",
    order: 3,
    prerequisiteKeys: ["geometry"],
  },
  {
    key: "probability",
    id: athenaDemoIds.topics.probability,
    legacyId: "topic-probability",
    title: "Probabilidad",
    order: 4,
    prerequisiteKeys: ["statistics"],
  },
  {
    key: "criticalThinking",
    id: athenaDemoIds.topics.criticalThinking,
    legacyId: "topic-critical-thinking",
    title: "Pensamiento crítico",
    order: 5,
    prerequisiteKeys: ["functions", "probability"],
  },
] as const;

export const athenaDemoCourse = {
  id: athenaDemoIds.course,
  legacyId: "course-math-1",
  title: "Matemáticas I",
  description: "Currículo de demostración: fundamentos y razonamiento matemático.",
  locale: "es" as const,
  activeVersion: 1,
} as const;

export const athenaDemoClass = {
  id: athenaDemoIds.class,
  courseId: athenaDemoIds.course,
  professorId: athenaDemoIds.professorRuiz,
  title: "Matemáticas I – Grupo A",
  term: "2026-2",
  createdAt: "2026-10-24T00:00:00.000Z",
} as const;

export const athenaDemoProfessor = {
  id: athenaDemoIds.professorRuiz,
  displayName: "Prof. Elena Ruiz",
} as const;

export function canonicalDemoTopicId(id: string): string {
  return athenaDemoTopics.find((topic) => topic.id === id || topic.legacyId === id)?.id ?? id;
}

export function legacyDemoTopicId(id: string): string {
  return athenaDemoTopics.find((topic) => topic.id === id || topic.legacyId === id)?.legacyId ?? id;
}
