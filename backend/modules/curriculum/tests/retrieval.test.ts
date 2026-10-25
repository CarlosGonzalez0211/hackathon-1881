import assert from "node:assert/strict";
import test from "node:test";
import { demoCurriculum } from "../../../../shared/src/mocks/demo-curriculum.js";
import { validateRetrievedContext } from "../../../../shared/src/curriculum.js";
import { MockCourseAccessPolicy, MockCurriculumRepository } from "../src/mock-repository.js";
import { CurriculumRetrievalService } from "../src/retrieval-service.js";
import {
  CurriculumError,
  type CurriculumContextPort,
  type CurriculumTopicPort,
} from "../src/ports.js";

const access = { userId: "demo-student", courseIds: ["course-math-1", "course-history-1"] };
const math = {
  courseId: "course-math-1",
  topicId: "topic-geometry",
  curriculumVersion: 1,
  query: "base altura",
};
const history = {
  courseId: "course-history-1",
  topicId: "topic-haitian-revolution",
  curriculumVersion: 1,
  query: "1791 1804",
};
const createService = (data = demoCurriculum) =>
  new CurriculumRetrievalService(new MockCurriculumRepository(data), new MockCourseAccessPolicy());
const errorCode = (code: string) => (error: unknown) =>
  error instanceof CurriculumError && error.code === code;

test("Person 2 can consume both ports for both subjects without credentials", async () => {
  const service = createService();
  const catalog: CurriculumTopicPort = service;
  const context: CurriculumContextPort = service;
  for (const input of [math, history]) {
    assert.equal((await catalog.getCourse(input.courseId, access)).activeVersion, 1);
    const topics = await catalog.listTopics(input, access);
    assert.deepEqual(
      topics.map((t) => t.order),
      [0, 1, 2, 3, 4, 5],
    );
    assert.ok(topics.some((t) => t.id === input.topicId));
    assert.equal((await catalog.listSources(input, access)).length, 1);
    const result = await context.retrieve(input, access);
    assert.equal(result.chunks.length, 2);
    assert.deepEqual(validateRetrievedContext(result, demoCurriculum), result);
    assert.deepEqual(await context.retrieve(input, access), result);
  }
});
test("retrieval handles Spanish accents and en/es history content", async () => {
  const service = createService();
  assert.ok((await service.retrieve({ ...math, query: "triángulo" }, access)).chunks.length > 0);
  const result = await service.retrieve(
    { ...history, query: "rebelión personas esclavizadas" },
    access,
  );
  assert.ok(result.chunks.some((c) => c.text.includes("personas esclavizadas")));
});
test("unmatched or stop-word-only queries return no fabricated context", async () => {
  for (const query of ["quantum", "the and of", "¿?!"]) {
    assert.deepEqual((await createService().retrieve({ ...math, query }, access)).chunks, []);
  }
});
test("result limit is enforced and deterministic", async () => {
  const service = createService();
  const one = await service.retrieve({ ...math, limit: 1 }, access);
  const all = await service.retrieve(math, access);
  assert.equal(one.chunks.length, 1);
  assert.deepEqual(one.chunks, all.chunks.slice(0, 1));
});
test("access is denied before repository reads", async () => {
  const repository = new MockCurriculumRepository();
  repository.getCourse = async () => {
    throw new Error("Must not read");
  };
  const service = new CurriculumRetrievalService(repository, new MockCourseAccessPolicy());
  for (const context of [
    { userId: "", courseIds: access.courseIds },
    { userId: "other", courseIds: [] },
  ]) {
    await assert.rejects(service.retrieve(math, context), errorCode("FORBIDDEN"));
    await assert.rejects(service.listTopics(math, context), errorCode("FORBIDDEN"));
    await assert.rejects(service.listSources(math, context), errorCode("FORBIDDEN"));
  }
});
test("all catalog operations deny unknown or unauthorized course access", async () => {
  const service = createService();
  await assert.rejects(
    service.getCourse("course-math-1", { userId: "other", courseIds: [] }),
    errorCode("FORBIDDEN"),
  );
  await assert.rejects(
    service.getCourse("missing", { userId: "demo", courseIds: ["missing"] }),
    errorCode("NOT_FOUND"),
  );
  await assert.rejects(service.getCourse(" ", access), errorCode("INVALID_INPUT"));
});
test("retrieval rejects invalid inputs, cross-course topics and stale versions", async () => {
  const service = createService();
  await assert.rejects(
    service.retrieve({ ...math, query: " " }, access),
    errorCode("INVALID_INPUT"),
  );
  await assert.rejects(
    service.retrieve({ ...math, limit: 21 }, access),
    errorCode("INVALID_INPUT"),
  );
  await assert.rejects(
    service.retrieve({ ...math, curriculumVersion: 2 }, access),
    errorCode("VERSION_MISMATCH"),
  );
  await assert.rejects(
    service.retrieve({ ...math, topicId: history.topicId }, access),
    errorCode("NOT_FOUND"),
  );
  await assert.rejects(
    service.retrieve({ ...math, topicId: "missing" }, access),
    errorCode("NOT_FOUND"),
  );
});
test("no material is returned before it is ready", async () => {
  for (const status of ["uploaded", "extracting", "chunking", "embedding", "failed"] as const) {
    const data = structuredClone(demoCurriculum);
    data.materials.find((m) => m.topicIds.includes(math.topicId))!.status = status;
    const service = createService(data);
    assert.deepEqual(await service.listSources(math, access), []);
    assert.deepEqual((await service.retrieve(math, access)).chunks, []);
  }
});
test("repository and service return copies and isolate input fixture mutation", async () => {
  const data = structuredClone(demoCurriculum);
  const service = createService(data);
  data.chunks.length = 0;
  const first = await service.retrieve(math, access);
  const original = structuredClone(first);
  first.chunks[0]!.citation.excerpt = "changed";
  first.chunks.length = 0;
  assert.deepEqual(await service.retrieve(math, access), original);
  const course = await service.getCourse(math.courseId, access);
  course.title = "changed";
  assert.equal((await service.getCourse(math.courseId, access)).title, "Matemáticas I");
  const topics = await service.listTopics(math, access);
  topics[0]!.prerequisiteTopicIds.push("changed");
  assert.deepEqual((await service.listTopics(math, access))[0]!.prerequisiteTopicIds, []);
  const sources = await service.listSources(math, access);
  sources[0]!.status = "failed";
  assert.equal((await service.listSources(math, access))[0]!.status, "ready");
});
test("service defensively excludes provider data outside course/topic/version", async () => {
  const repository = new MockCurriculumRepository();
  repository.listChunks = async () =>
    structuredClone([
      ...demoCurriculum.chunks,
      { ...demoCurriculum.chunks[1]!, id: "stale", curriculumVersion: 2 },
    ]);
  repository.listMaterials = async () => structuredClone(demoCurriculum.materials);
  const service = new CurriculumRetrievalService(repository, new MockCourseAccessPolicy());
  const result = await service.retrieve(math, access);
  assert.equal(result.chunks.length, 2);
  assert.ok(result.chunks.every((c) => c.citation.materialId.includes("topic-geometry")));
});

test("catalog scopes normalize IDs consistently and reject malformed versions", async () => {
  const service = createService();
  const padded = { ...math, courseId: ` ${math.courseId} `, topicId: ` ${math.topicId} ` };
  assert.equal((await service.listTopics(padded, access)).length, 6);
  assert.equal((await service.listSources(padded, access)).length, 1);
  await assert.rejects(
    service.listTopics({ ...math, curriculumVersion: 0 }, access),
    errorCode("INVALID_INPUT"),
  );
  await assert.rejects(
    service.listSources({ ...math, topicId: " " }, access),
    errorCode("INVALID_INPUT"),
  );
});
