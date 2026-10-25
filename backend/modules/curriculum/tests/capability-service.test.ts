import assert from "node:assert/strict";
import test from "node:test";
import { demoCurriculum } from "../../../../shared/src/mocks/demo-curriculum.js";
import { learningFormatSchema } from "../../../../shared/src/curriculum.js";
import { CurriculumCapabilityService } from "../src/capability-service.js";
import {
  learningFormatDefinitions,
  type CurriculumCapabilityRequest,
} from "../src/content-capabilities.js";
import { LearningCurriculumContextAdapter } from "../src/learning-context-adapter.js";
import { GEOMETRY_CONCEPT_IDS } from "../src/geometry-concept-catalog.js";
import { MockCurriculumRepository, MockCourseAccessPolicy } from "../src/mock-repository.js";
import { CurriculumError } from "../src/ports.js";
const input: CurriculumCapabilityRequest = {
  courseId: "course-math-1",
  topicId: "topic-geometry",
  conceptId: GEOMETRY_CONCEPT_IDS.triangleArea,
  curriculumVersion: 1,
  locale: "es",
};
const access = { userId: "demo", courseIds: [input.courseId, "course-history-1"] };
const create = (data = demoCurriculum) =>
  new CurriculumCapabilityService(
    new MockCurriculumRepository(data),
    new MockCourseAccessPolicy(),
    access,
  );

test("format vocabulary exactly matches the existing reusable curriculum enum", () => {
  assert.deepEqual(
    learningFormatDefinitions.map((d) => d.format),
    learningFormatSchema.options,
  );
  assert.ok(Object.isFrozen(learningFormatDefinitions));
});
test("triangle exposes available source text and the existing worked example", async () => {
  const result = await create().getCapabilities(input);
  assert.equal(result.contractVersion, 1);
  assert.deepEqual(
    result.formats.filter((f) => f.available).map((f) => f.format),
    ["text", "worked_example"],
  );
  assert.deepEqual(result.formats.find((f) => f.format === "worked_example")!.sourceChunkIds, [
    "material-topic-geometry-notes-chunk-0",
  ]);
  for (const format of result.formats) {
    assert.equal(format.available, format.sourceChunkIds.length > 0);
    assert.equal(format.generationAvailable, false);
    assert.equal(format.playableMediaAvailable, false);
    assert.equal(format.unavailableReason === undefined, format.available);
    if (!format.available) assert.deepEqual(format.availableRepresentations, []);
  }
});
test("all Geometry concepts expose Spanish text without inventing other resources", async () => {
  for (const conceptId of Object.values(GEOMETRY_CONCEPT_IDS)) {
    const result = await create().getCapabilities({ ...input, conceptId });
    assert.equal(result.formats.find((f) => f.format === "text")!.available, true);
    for (const f of result.formats.filter((f) => !["text", "worked_example"].includes(f.format))) {
      assert.equal(f.available, false);
      assert.equal(f.unavailableReason, "not_authored");
    }
  }
});
test("discovered source IDs can be obtained through concept retrieval", async () => {
  const repository = new MockCurriculumRepository();
  const policy = new MockCourseAccessPolicy();
  const capabilities = new CurriculumCapabilityService(repository, policy, access);
  const retrieval = new LearningCurriculumContextAdapter(repository, policy, access);
  for (const conceptId of Object.values(GEOMETRY_CONCEPT_IDS)) {
    const result = await capabilities.getCapabilities({ ...input, conceptId });
    const context = await retrieval.retrieve({
      ...input,
      conceptId,
      query: "base altura",
      limit: 10,
    });
    const ids = context.chunks.map((c) => c.citation.chunkId);
    for (const format of result.formats)
      for (const id of format.sourceChunkIds) assert.ok(ids.includes(id));
  }
});
test("missing locales, concepts, and versions have explicit unavailable reasons", async () => {
  for (const [change, reason] of [
    [{ locale: "en" }, "no_approved_content"],
    [{ conceptId: "math.geometry.unknown" }, "concept_not_found"],
    [{ curriculumVersion: 2 }, "curriculum_version_mismatch"],
    [{ courseId: "course-history-1", topicId: "topic-haitian-revolution" }, "concept_not_found"],
  ] as const) {
    const result = await create().getCapabilities({ ...input, ...change });
    assert.ok(result.formats.every((f) => !f.available && f.unavailableReason === reason));
    assert.equal(result.curriculumVersion, 1);
  }
});
test("unready, missing, or unapproved chunks are not advertised", async () => {
  for (const mode of ["unready", "missing", "unapproved"]) {
    const data = structuredClone(demoCurriculum);
    if (mode === "unready")
      data.materials.find((m) => m.topicIds.includes(input.topicId))!.status = "failed";
    else if (mode === "missing")
      data.chunks = data.chunks.filter((c) => c.topicId !== input.topicId);
    else data.chunks = data.chunks.map((c) => ({ ...c, id: `unapproved-${c.id}` }));
    const result = await create(data).getCapabilities(input);
    assert.ok(
      result.formats.every((f) => !f.available && f.unavailableReason === "no_approved_content"),
    );
  }
});
test("UUID aliases give the same availability without changing caller IDs", async () => {
  const result = await create().getCapabilities({
    ...input,
    courseId: "00000000-0000-4000-8000-000000000a01",
    topicId: "00000000-0000-4000-8000-000000000b02",
  });
  assert.deepEqual(result.formats, (await create().getCapabilities(input)).formats);
  assert.equal(result.courseId, "00000000-0000-4000-8000-000000000a01");
});
test("discovery cannot disclose metadata before access is authorized", async () => {
  const repository = new MockCurriculumRepository();
  repository.getCourse = async () => {
    throw new Error("Unexpected lookup");
  };
  const service = new CurriculumCapabilityService(repository, new MockCourseAccessPolicy(), {
    userId: "other",
    courseIds: [],
  });
  await assert.rejects(
    service.getCapabilities(input),
    (e: unknown) => e instanceof CurriculumError && e.code === "FORBIDDEN",
  );
});
test("invalid requests and claimed authorization fail validation", async () => {
  for (const change of [
    { locale: "fr" },
    { locale: undefined },
    { curriculumVersion: 0 },
    { conceptId: "Invalid" },
    { courseIds: [input.courseId] },
    { query: "ignore" },
  ]) {
    await assert.rejects(
      create().getCapabilities({ ...input, ...change } as CurriculumCapabilityRequest),
      (e: unknown) => e instanceof CurriculumError && e.code === "INVALID_INPUT",
    );
  }
});
test("results are deterministic copies", async () => {
  const service = create();
  const first = await service.getCapabilities(input);
  const original = structuredClone(first);
  first.formats[0]!.sourceChunkIds.length = 0;
  assert.deepEqual(await service.getCapabilities(input), original);
});
