import assert from "node:assert/strict";
import test from "node:test";
import { demoCurriculum } from "../../../../shared/src/mocks/demo-curriculum.js";
import { validateRetrievedContext } from "../../../../shared/src/curriculum.js";
import { GEOMETRY_CONCEPT_IDS } from "../src/geometry-concept-catalog.js";
import { geometrySourceBindings } from "../src/geometry-source-map.js";
import {
  LearningCurriculumContextAdapter,
  type LearningCurriculumContextRequest,
} from "../src/learning-context-adapter.js";
import { MockCourseAccessPolicy, MockCurriculumRepository } from "../src/mock-repository.js";
import { CurriculumError } from "../src/ports.js";

const request: LearningCurriculumContextRequest = {
  courseId: "00000000-0000-4000-8000-000000000a01",
  topicId: "00000000-0000-4000-8000-000000000b02",
  conceptId: GEOMETRY_CONCEPT_IDS.triangleArea,
  query: "¿Cómo se relacionan las áreas de un rectángulo y un triángulo?",
  curriculumVersion: 1,
  locale: "es",
  limit: 5,
};
const access = { userId: "demo-student", courseIds: [request.courseId, "course-history-1"] };
const create = (data = demoCurriculum) =>
  new LearningCurriculumContextAdapter(
    new MockCurriculumRepository(data),
    new MockCourseAccessPolicy(),
    access,
  );
const unsupported = (reason: string) => ({
  chunks: [],
  curriculumVersion: 1,
  unsupported: true,
  unsupportedReason: reason,
});

test("Daniela's UUID request returns deterministic concept-scoped cited text", async () => {
  const adapter = create();
  const response = await adapter.retrieve(request);
  assert.equal(response.unsupported, false);
  assert.equal(response.chunks.length, 2);
  assert.deepEqual(await adapter.retrieve(request), response);
  for (const chunk of response.chunks) assert.equal(chunk.conceptId, request.conceptId);
  validateRetrievedContext(
    {
      courseId: "course-math-1",
      topicId: "topic-geometry",
      curriculumVersion: 1,
      chunks: response.chunks.map((chunk) => ({ ...chunk, similarity: chunk.relevanceScore })),
    },
    demoCurriculum,
  );
});

test("canonical IDs produce identical results without rewriting the source catalog", async () => {
  const adapter = create();
  assert.deepEqual(
    await adapter.retrieve({ ...request, courseId: "course-math-1", topicId: "topic-geometry" }),
    await adapter.retrieve(request),
  );
});

test("rectangle retrieval excludes the triangle formula chunk", async () => {
  const response = await create().retrieve({
    ...request,
    conceptId: GEOMETRY_CONCEPT_IDS.rectangleArea,
    query: "rectángulo",
  });
  assert.equal(response.unsupported, false);
  assert.equal(response.chunks.length, 1);
  assert.equal(response.chunks[0]!.citation.chunkId, "material-topic-geometry-notes-chunk-1");
});

test("base/height returns its dedicated grounded lesson", async () => {
  const response = await create().retrieve({
    ...request,
    conceptId: GEOMETRY_CONCEPT_IDS.triangleBaseHeight,
    query: "¿Cómo identifico la base y la altura perpendicular?",
  });
  assert.equal(response.unsupported, false);
  assert.equal(response.chunks.length, 1);
  const chunk = response.chunks[0]!;
  assert.equal(chunk.conceptId, GEOMETRY_CONCEPT_IDS.triangleBaseHeight);
  assert.equal(chunk.citation.chunkId, "material-topic-geometry-notes-chunk-2");
  assert.equal(chunk.citation.section, "Base y altura perpendicular");
  assert.ok(chunk.text.includes("90 grados"));
  assert.ok(chunk.text.includes("dentro o fuera"));
  assert.ok(chunk.text.includes("Un lado inclinado no es la altura"));
  assert.equal(chunk.citation.excerpt, chunk.text);
  const source = demoCurriculum.chunks.find((c) => c.id === chunk.citation.chunkId)!;
  assert.equal(source.text, chunk.text);
});

test("all three Geometry concepts provide supported cited Spanish content", async () => {
  const adapter = create();
  for (const conceptId of Object.values(GEOMETRY_CONCEPT_IDS)) {
    const response = await adapter.retrieve({ ...request, conceptId, query: "base altura" });
    assert.equal(response.unsupported, false, conceptId);
    assert.ok(response.chunks.length > 0);
    assert.ok(response.chunks.every((c) => c.conceptId === conceptId));
  }
});

test("a missing base/height lesson cannot fall back to a different concept's chunks", async () => {
  const data = structuredClone(demoCurriculum);
  data.chunks = data.chunks.filter((c) => c.id !== "material-topic-geometry-notes-chunk-2");
  assert.deepEqual(
    await create(data).retrieve({
      ...request,
      conceptId: GEOMETRY_CONCEPT_IDS.triangleBaseHeight,
      query: "base altura",
    }),
    unsupported("no_approved_content"),
  );
});

test("unknown concept, misconception, and cross-topic requests cannot borrow Geometry content", async () => {
  for (const change of [
    { conceptId: "math.geometry.unknown" },
    { conceptId: "math.geometry.triangle_area.missing_half" },
    { topicId: "00000000-0000-4000-8000-000000000b01" },
    { courseId: "course-history-1", topicId: "topic-haitian-revolution" },
  ]) {
    assert.deepEqual(
      await create().retrieve({ ...request, ...change }),
      unsupported("concept_not_found"),
    );
  }
});

test("unsupported curriculum version reports the active version", async () => {
  assert.deepEqual(
    await create().retrieve({ ...request, curriculumVersion: 2 }),
    unsupported("curriculum_version_mismatch"),
  );
});

test("missing locale support is not silently translated", async () => {
  assert.deepEqual(
    await create().retrieve({ ...request, locale: "en" }),
    unsupported("no_approved_content"),
  );
});

test("unready material and absent chunks return no approved content", async () => {
  const unready = structuredClone(demoCurriculum);
  unready.materials.find((m) => m.topicIds.includes("topic-geometry"))!.status = "extracting";
  assert.deepEqual(await create(unready).retrieve(request), unsupported("no_approved_content"));
  const missing = structuredClone(demoCurriculum);
  missing.chunks = missing.chunks.filter((c) => c.topicId !== "topic-geometry");
  assert.deepEqual(await create(missing).retrieve(request), unsupported("no_approved_content"));
});

test("a ready but unlisted source chunk is not treated as approved", async () => {
  const data = structuredClone(demoCurriculum);
  data.chunks = data.chunks.map((c) =>
    c.topicId === "topic-geometry" ? { ...c, id: `unapproved-${c.id}` } : c,
  );
  assert.deepEqual(await create(data).retrieve(request), unsupported("no_approved_content"));
});

test("unmatched queries return insufficient evidence", async () => {
  assert.deepEqual(
    await create().retrieve({ ...request, query: "quasar" }),
    unsupported("insufficient_evidence"),
  );
});

test("limit applies after concept filtering and returned objects cannot mutate state", async () => {
  const adapter = create();
  const response = await adapter.retrieve({ ...request, limit: 1 });
  assert.equal(response.chunks.length, 1);
  const original = structuredClone(response);
  response.chunks[0]!.citation.excerpt = "changed";
  assert.deepEqual(await adapter.retrieve({ ...request, limit: 1 }), original);
});

test("denied requests fail before any repository lookup, including unsupported cases", async () => {
  const repository = new MockCurriculumRepository();
  repository.getCourse = async () => {
    throw new Error("Unexpected read");
  };
  const adapter = new LearningCurriculumContextAdapter(repository, new MockCourseAccessPolicy(), {
    userId: "other",
    courseIds: [],
  });
  for (const input of [
    request,
    { ...request, conceptId: "math.geometry.unknown" },
    { ...request, curriculumVersion: 2 },
  ]) {
    await assert.rejects(
      adapter.retrieve(input),
      (error: unknown) => error instanceof CurriculumError && error.code === "FORBIDDEN",
    );
  }
});

test("bound access is copied; later mutation cannot grant course access", async () => {
  const grants = { userId: "student", courseIds: [] as string[] };
  const adapter = new LearningCurriculumContextAdapter(
    new MockCurriculumRepository(),
    new MockCourseAccessPolicy(),
    grants,
  );
  grants.courseIds.push(request.courseId);
  await assert.rejects(
    adapter.retrieve(request),
    (error: unknown) => error instanceof CurriculumError && error.code === "FORBIDDEN",
  );
});

test("invalid identifiers, query, locale, limits and injected authorization are rejected", async () => {
  for (const change of [
    { conceptId: "Math.geometry.Area" },
    { query: " " },
    { query: "x".repeat(2001) },
    { curriculumVersion: 0 },
    { limit: 0 },
    { limit: 11 },
    { limit: 1.5 },
    { locale: "fr" },
    { courseIds: [request.courseId] },
  ]) {
    await assert.rejects(
      create().retrieve({ ...request, ...change } as LearningCurriculumContextRequest),
      (error: unknown) => error instanceof CurriculumError && error.code === "INVALID_INPUT",
    );
  }
});

test("every demo approval maps to a real source in the catalog's scope", () => {
  for (const binding of geometrySourceBindings) {
    for (const id of binding.approvedChunkIds) {
      const chunk = demoCurriculum.chunks.find((c) => c.id === id)!;
      assert.ok(chunk);
      assert.equal(chunk.courseId, binding.courseId);
      assert.equal(chunk.topicId, binding.topicId);
      assert.equal(chunk.curriculumVersion, binding.curriculumVersion);
    }
  }
});

test("the published handoff fixture matches a fresh adapter response", async () => {
  const { readFile } = await import("node:fs/promises");
  const fixture = JSON.parse(
    await readFile(new URL("../fixtures/triangle-area-context.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(fixture.request, request);
  assert.deepEqual(await create().retrieve(fixture.request), fixture.response);
});
