import assert from "node:assert/strict";
import test from "node:test";
import { demoCurriculum } from "../../../../shared/src/mocks/demo-curriculum.js";
import {
  GEOMETRY_CONCEPT_IDS,
  GEOMETRY_MISCONCEPTION_ID,
  geometryConceptCatalog,
} from "../src/geometry-concept-catalog.js";

test("catalog preserves the three concept identifiers agreed with Daniela", () => {
  assert.deepEqual(
    geometryConceptCatalog.map((concept) => concept.conceptId),
    [
      "math.geometry.rectangle_area",
      "math.geometry.triangle_base_height",
      "math.geometry.triangle_area",
    ],
  );
  assert.equal(new Set(geometryConceptCatalog.map((c) => c.conceptId)).size, 3);
  for (const concept of geometryConceptCatalog) {
    assert.match(concept.conceptId, /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/);
    assert.ok(concept.title.length > 0);
  }
});

test("concept scopes resolve to the existing Mathematics Geometry curriculum version", () => {
  for (const concept of geometryConceptCatalog) {
    const course = demoCurriculum.courses.find((course) => course.id === concept.courseId);
    const topic = demoCurriculum.topics.find((topic) => topic.id === concept.topicId);
    assert.equal(course?.id, "course-math-1");
    assert.equal(topic?.id, "topic-geometry");
    assert.equal(topic?.courseId, course?.id);
    assert.equal(concept.curriculumVersion, 1);
    assert.equal(concept.curriculumVersion, course?.activeVersion);
    assert.equal(concept.curriculumVersion, topic?.curriculumVersion);
  }
});

test("triangle area depends on rectangle area and triangle base/height", () => {
  const triangle = geometryConceptCatalog.find(
    (c) => c.conceptId === GEOMETRY_CONCEPT_IDS.triangleArea,
  )!;
  assert.deepEqual(triangle.prerequisiteConceptIds, [
    GEOMETRY_CONCEPT_IDS.rectangleArea,
    GEOMETRY_CONCEPT_IDS.triangleBaseHeight,
  ]);
  for (const concept of geometryConceptCatalog.slice(0, 2)) {
    assert.deepEqual(concept.prerequisiteConceptIds, []);
  }
});

test("concept prerequisite graph is complete, unique, and acyclic", () => {
  const visited = new Set<string>();
  for (const concept of geometryConceptCatalog) {
    assert.equal(
      new Set(concept.prerequisiteConceptIds).size,
      concept.prerequisiteConceptIds.length,
    );
    for (const prerequisite of concept.prerequisiteConceptIds) {
      // All prerequisites must exist earlier in this topological catalog order.
      assert.ok(visited.has(prerequisite), `Invalid prerequisite for ${concept.conceptId}`);
      const definition = geometryConceptCatalog.find((c) => c.conceptId === prerequisite)!;
      assert.equal(definition.courseId, concept.courseId);
      assert.equal(definition.topicId, concept.topicId);
      assert.equal(definition.curriculumVersion, concept.curriculumVersion);
    }
    visited.add(concept.conceptId);
  }
});

test("mastery requirements match the existing Learning fixture agreement", () => {
  assert.deepEqual(
    geometryConceptCatalog.map((c) => [c.conceptId, c.requiredForMastery]),
    [
      [GEOMETRY_CONCEPT_IDS.rectangleArea, false],
      [GEOMETRY_CONCEPT_IDS.triangleBaseHeight, true],
      [GEOMETRY_CONCEPT_IDS.triangleArea, true],
    ],
  );
  for (const concept of geometryConceptCatalog) {
    assert.equal("mastery" in concept, false);
    assert.equal("studentId" in concept, false);
  }
});

test("concept identifiers and nested prerequisite lists cannot be mutated", () => {
  assert.ok(Object.isFrozen(GEOMETRY_CONCEPT_IDS));
  assert.ok(Object.isFrozen(geometryConceptCatalog));
  for (const concept of geometryConceptCatalog) {
    assert.ok(Object.isFrozen(concept));
    assert.ok(Object.isFrozen(concept.prerequisiteConceptIds));
    assert.equal(Reflect.set(concept, "conceptId", "math.geometry.changed"), false);
    assert.equal(Reflect.set(concept.prerequisiteConceptIds, "0", "math.geometry.changed"), false);
  }
});

test("missing-half misconception stays separate from academic concepts", () => {
  assert.equal(GEOMETRY_MISCONCEPTION_ID, "math.geometry.triangle_area.missing_half");
  assert.ok(GEOMETRY_MISCONCEPTION_ID.startsWith(`${GEOMETRY_CONCEPT_IDS.triangleArea}.`));
  assert.ok(!geometryConceptCatalog.some((c) => c.conceptId === GEOMETRY_MISCONCEPTION_ID));
});
