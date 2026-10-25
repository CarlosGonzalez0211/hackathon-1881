/**
 * Person 1's immutable Geometry catalog. Field names match Daniela's proposed
 * CurriculumConcept consumer shape. No assessment, mastery calculation, or writes.
 */
export interface CurriculumConceptDefinition {
  readonly conceptId: string;
  readonly courseId: string;
  readonly topicId: string;
  readonly title: string;
  readonly prerequisiteConceptIds: readonly string[];
  readonly requiredForMastery: boolean;
  readonly curriculumVersion: number;
}

export const GEOMETRY_CONCEPT_IDS = Object.freeze({
  rectangleArea: "math.geometry.rectangle_area",
  triangleBaseHeight: "math.geometry.triangle_base_height",
  triangleArea: "math.geometry.triangle_area",
});

/** Shared vocabulary only; Person 2 owns detection and resolution. Not a concept. */
export const GEOMETRY_MISCONCEPTION_ID = "math.geometry.triangle_area.missing_half";

const scope = { courseId: "course-math-1", topicId: "topic-geometry", curriculumVersion: 1 };
const definitions: CurriculumConceptDefinition[] = [
  {
    ...scope,
    conceptId: GEOMETRY_CONCEPT_IDS.rectangleArea,
    title: "Área de rectángulos",
    prerequisiteConceptIds: [],
    requiredForMastery: false,
  },
  {
    ...scope,
    conceptId: GEOMETRY_CONCEPT_IDS.triangleBaseHeight,
    title: "Base y altura de un triángulo",
    prerequisiteConceptIds: [],
    requiredForMastery: true,
  },
  {
    ...scope,
    conceptId: GEOMETRY_CONCEPT_IDS.triangleArea,
    title: "Área de triángulos",
    prerequisiteConceptIds: [
      GEOMETRY_CONCEPT_IDS.rectangleArea,
      GEOMETRY_CONCEPT_IDS.triangleBaseHeight,
    ],
    requiredForMastery: true,
  },
];

/** Prerequisites first. This list is metadata, not a student's current mastery. */
export const geometryConceptCatalog: readonly CurriculumConceptDefinition[] = Object.freeze(
  definitions.map((concept) =>
    Object.freeze({
      ...concept,
      prerequisiteConceptIds: Object.freeze([...concept.prerequisiteConceptIds]),
    }),
  ),
);
