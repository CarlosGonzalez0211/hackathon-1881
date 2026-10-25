import assert from "node:assert/strict";
import test from "node:test";
import { demoCurriculum } from "../../../../shared/src/mocks/demo-curriculum.js";
import { CurriculumTopicCapabilityService } from "../src/topic-capability-service.js";
import { HistoryResourceService } from "../src/history-resource-service.js";
import { MockCurriculumRepository, MockCourseAccessPolicy } from "../src/mock-repository.js";
import { CurriculumError } from "../src/ports.js";
import { learningFormatDefinitions } from "../src/content-capabilities.js";
const input = {
  courseId: "course-history-1",
  topicId: "topic-comparing-rights",
  curriculumVersion: 1,
  locale: "en" as const,
};
const access = { userId: "demo-student", courseIds: ["course-history-1", "course-math-1"] };
const create = (data = demoCurriculum) =>
  new CurriculumTopicCapabilityService(
    new MockCurriculumRepository(data),
    new MockCourseAccessPolicy(),
    access,
  );

test("English and Spanish History discovery advertise only existing representations", async () => {
  for (const locale of ["en", "es"] as const) {
    const result = await create().getTopicCapabilities({ ...input, locale });
    assert.equal("conceptId" in result, false);
    assert.equal(result.locale, locale);
    assert.deepEqual(
      result.formats.map((f) => f.format),
      learningFormatDefinitions.map((f) => f.format),
    );
    assert.deepEqual(
      result.formats.filter((f) => f.available).map((f) => f.format),
      ["text", "slides", "podcast", "music"],
    );
    const expected = {
      text: "text_excerpt",
      slides: "slide_outline",
      podcast: "script",
      music: "lyrics",
    };
    for (const f of result.formats) {
      assert.equal(f.generationAvailable, false);
      assert.equal(f.playableMediaAvailable, false);
      if (f.available) {
        assert.deepEqual(f.availableRepresentations, [expected[f.format as keyof typeof expected]]);
        assert.ok(f.sourceChunkIds.length > 0);
        assert.equal(f.unavailableReason, undefined);
      } else {
        assert.deepEqual(f.availableRepresentations, []);
        assert.deepEqual(f.resourceIds, []);
        assert.deepEqual(f.sourceChunkIds, []);
        assert.equal(f.unavailableReason, "not_authored");
      }
    }
  }
});
test("discovered resources can be read and cite sources in the requested language", async () => {
  const repository = new MockCurriculumRepository();
  const policy = new MockCourseAccessPolicy();
  const service = new CurriculumTopicCapabilityService(repository, policy, access);
  const reader = new HistoryResourceService(repository, policy, access);
  for (const locale of ["en", "es"] as const) {
    const result = await service.getTopicCapabilities({ ...input, locale });
    const resources = await reader.listResources({ ...input, locale });
    for (const format of result.formats) {
      for (const id of format.resourceIds) {
        const resource = resources.find((r) => r.id === id)!;
        assert.ok(resource);
        assert.equal(resource.format, format.format);
        assert.equal(resource.locale, locale);
      }
      for (const id of format.sourceChunkIds) {
        const chunk = demoCurriculum.chunks.find((c) => c.id === id)!;
        assert.equal(chunk.locale, locale);
        assert.equal(chunk.topicId, input.topicId);
        assert.equal(chunk.courseId, input.courseId);
      }
    }
  }
});
test("source-text discovery references chunks without pretending there is a generated text resource", async () => {
  const text = (await create().getTopicCapabilities(input)).formats.find(
    (f) => f.format === "text",
  )!;
  assert.equal(text.available, true);
  assert.deepEqual(text.resourceIds, []);
  assert.ok(text.sourceChunkIds.length > 0);
});
test("missing or unready sources hide affected formats with no_approved_content", async () => {
  for (const mode of ["unready", "missing", "missing-es"]) {
    const data = structuredClone(demoCurriculum);
    if (mode === "unready")
      data.materials.find((m) => m.topicIds.includes(input.topicId))!.status = "failed";
    else
      data.chunks = data.chunks.filter(
        (c) => c.topicId !== input.topicId || (mode === "missing-es" && c.locale !== "es"),
      );
    const result = await create(data).getTopicCapabilities({ ...input, locale: "es" });
    for (const format of result.formats.filter((f) =>
      ["text", "slides", "podcast", "music"].includes(f.format),
    )) {
      assert.equal(format.available, false);
      assert.equal(format.unavailableReason, "no_approved_content");
      assert.deepEqual(format.resourceIds, []);
    }
    if (mode === "missing-es")
      assert.ok((await create(data).getTopicCapabilities(input)).formats.some((f) => f.available));
  }
});
test("other topics and courses do not borrow the History resources", async () => {
  for (const scope of [
    { topicId: "topic-haitian-revolution" },
    { courseId: "course-math-1", topicId: "topic-geometry" },
  ]) {
    const result = await create().getTopicCapabilities({ ...input, ...scope });
    assert.ok(result.formats.every((f) => !f.available && f.unavailableReason === "not_authored"));
  }
});
test("unauthorized callers cannot discover resources or their existence", async () => {
  const repository = new MockCurriculumRepository();
  repository.getCourse = async () => {
    throw new Error("Unexpected lookup");
  };
  const service = new CurriculumTopicCapabilityService(repository, new MockCourseAccessPolicy(), {
    userId: "other",
    courseIds: [],
  });
  await assert.rejects(
    service.getTopicCapabilities(input),
    (e: unknown) => e instanceof CurriculumError && e.code === "FORBIDDEN",
  );
});
test("invalid requests, unknown topics and stale versions preserve explicit domain errors", async () => {
  for (const [change, code] of [
    [{ locale: "fr" }, "INVALID_INPUT"],
    [{ conceptId: "invented" }, "INVALID_INPUT"],
    [{ courseIds: access.courseIds }, "INVALID_INPUT"],
    [{ curriculumVersion: 2 }, "VERSION_MISMATCH"],
    [{ topicId: "missing" }, "NOT_FOUND"],
  ] as const) {
    await assert.rejects(
      create().getTopicCapabilities({ ...input, ...change } as typeof input),
      (e: unknown) => e instanceof CurriculumError && e.code === code,
    );
  }
});
test("corrupted citations cannot be advertised as available", async () => {
  const data = structuredClone(demoCurriculum);
  data.chunks = data.chunks.map((c) =>
    c.topicId === input.topicId ? { ...c, text: "Changed source" } : c,
  );
  await assert.rejects(create(data).getTopicCapabilities(input), /Citation does not resolve/);
});
test("responses are deterministic copies", async () => {
  const service = create();
  const first = await service.getTopicCapabilities(input);
  const expected = structuredClone(first);
  first.formats[0]!.sourceChunkIds.length = 0;
  first.formats.find((f) => f.format === "podcast")!.resourceIds.length = 0;
  assert.deepEqual(await service.getTopicCapabilities(input), expected);
});
