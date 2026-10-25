import { GEOMETRY_CONCEPT_IDS } from "./geometry-concept-catalog.js";

/** Authored demo approvals only. A ready material alone is not approval. */
export const geometrySourceBindings = Object.freeze([
  Object.freeze({
    conceptId: GEOMETRY_CONCEPT_IDS.rectangleArea,
    courseId: "course-math-1",
    topicId: "topic-geometry",
    curriculumVersion: 1,
    approvedChunkIds: Object.freeze(["material-topic-geometry-notes-chunk-1"]),
    sufficientForExplanation: true,
  }),
  Object.freeze({
    conceptId: GEOMETRY_CONCEPT_IDS.triangleBaseHeight,
    courseId: "course-math-1",
    topicId: "topic-geometry",
    curriculumVersion: 1,
    approvedChunkIds: Object.freeze(["material-topic-geometry-notes-chunk-2"]),
    sufficientForExplanation: true,
  }),
  Object.freeze({
    conceptId: GEOMETRY_CONCEPT_IDS.triangleArea,
    courseId: "course-math-1",
    topicId: "topic-geometry",
    curriculumVersion: 1,
    approvedChunkIds: Object.freeze([
      "material-topic-geometry-notes-chunk-0",
      "material-topic-geometry-notes-chunk-1",
    ]),
    sufficientForExplanation: true,
  }),
]);
