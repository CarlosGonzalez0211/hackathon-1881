import assert from "node:assert/strict";
import test from "node:test";
import {
  conceptIdSchema,
  curriculumConceptSchema,
  curriculumContextRequestSchema,
  curriculumContextResponseSchema,
  demoCurriculumConcepts,
  demoCurriculumContextRequest,
  demoCurriculumContextResponse,
  demoLearningIds,
} from "../src/index.js";

test("concept ids use stable lowercase dot-separated keys", () => {
  for (const conceptId of Object.values(demoLearningIds.concepts)) {
    assert.equal(conceptIdSchema.parse(conceptId), conceptId);
  }

  for (const invalid of [
    "triangle_area",
    "Math.geometry.triangle_area",
    "math.geometry.triangle-area",
    "math..triangle_area",
    "math.geometry.TriangleArea",
  ]) {
    assert.equal(conceptIdSchema.safeParse(invalid).success, false, invalid);
  }
});

test("the provisional Geometry concept catalog has valid relationships", () => {
  const parsed = demoCurriculumConcepts.map((concept) => curriculumConceptSchema.parse(concept));
  assert.equal(parsed.length, 3);
  assert.deepEqual(
    parsed.find((concept) => concept.conceptId === demoLearningIds.concepts.triangleArea)
      ?.prerequisiteConceptIds,
    [demoLearningIds.concepts.rectangleArea, demoLearningIds.concepts.triangleBaseHeight],
  );

  const selfReferencing = {
    ...parsed[0],
    prerequisiteConceptIds: [parsed[0]!.conceptId],
  };
  assert.equal(curriculumConceptSchema.safeParse(selfReferencing).success, false);
});

test("Learning's curriculum context fixtures are contract-valid", () => {
  assert.deepEqual(
    curriculumContextRequestSchema.parse(demoCurriculumContextRequest),
    demoCurriculumContextRequest,
  );
  assert.deepEqual(
    curriculumContextResponseSchema.parse(demoCurriculumContextResponse),
    demoCurriculumContextResponse,
  );
  assert.equal(demoCurriculumContextResponse.unsupported, false);
  assert.ok(demoCurriculumContextResponse.chunks[0]?.citation.materialTitle.length);
});

test("unsupported curriculum responses must abstain without returning chunks", () => {
  const unsupported = {
    chunks: [],
    curriculumVersion: 1,
    unsupported: true,
    unsupportedReason: "insufficient_evidence",
  } as const;
  assert.deepEqual(curriculumContextResponseSchema.parse(unsupported), unsupported);
  assert.equal(
    curriculumContextResponseSchema.safeParse({
      ...unsupported,
      chunks: demoCurriculumContextResponse.chunks,
    }).success,
    false,
  );
  assert.equal(
    curriculumContextResponseSchema.safeParse({
      chunks: [],
      curriculumVersion: 1,
      unsupported: false,
    }).success,
    false,
  );
});
