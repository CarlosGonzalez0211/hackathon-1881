import assert from "node:assert/strict";
import test from "node:test";
import {
  demoCurriculum,
  houseContentSchema,
  demoCurriculumTopics,
  type HouseContent,
} from "@athena/shared";
import { WorldHouseContentAdapter } from "../src/house-content-adapter.js";
import { MockCurriculumRepository, MockCourseAccessPolicy } from "../src/mock-repository.js";
import { historyMockResources } from "../src/history-resource-catalog.js";
import { CurriculumError } from "../src/ports.js";
const access = { userId: "demo", courseIds: ["course-math-1", "course-history-1"] };
const create = (
  data = demoCurriculum,
  options = { courseId: "course-math-1", locale: "es" as "en" | "es" },
) =>
  new WorldHouseContentAdapter(
    new MockCurriculumRepository(data),
    new MockCourseAccessPolicy(),
    access,
    options,
  );
const history = (locale: "en" | "es", data = demoCurriculum) =>
  new WorldHouseContentAdapter(
    new MockCurriculumRepository(data),
    new MockCourseAccessPolicy(),
    access,
    { courseId: "course-history-1", locale, publishedTopicIds: ["topic-comparing-rights"] },
  );
const code = (expected: string) => (e: unknown) =>
  e instanceof CurriculumError && e.code === expected;

test("World's unchanged method and HouseContent schema accept real TXT materials and inline lesson cards", async () => {
  const client: { getHouseContent(topicId: string): Promise<HouseContent> } = create();
  const content = await client.getHouseContent("topic-geometry");
  assert.deepEqual(houseContentSchema.parse(content), content);
  assert.equal(content.courseId, "course-math-1");
  assert.equal(content.topicId, "topic-geometry");
  assert.equal(content.materials.length, 1);
  assert.equal(content.materials[0]!.filename, "topic-geometry-notes.txt");
  assert.equal(content.materials[0]!.mimeType, "text/plain");
  assert.equal(content.resources.length, 3);
  assert.ok(content.resources.every((r) => r.format === "text"));
  for (const r of content.resources) {
    const chunk = demoCurriculum.chunks.find((c) => r.id === `resource-source-${c.id}`)!;
    assert.ok(r.body!.includes(chunk.text));
    assert.ok(r.body!.includes(`chunkId=${chunk.id}`));
    assert.ok(r.body!.includes(chunk.section));
    assert.ok(r.body!.includes(`materialId=${chunk.materialId}`));
  }
  assert.equal(content.updatedAt, "2026-10-24T00:00:00.000Z");
});

test("both History languages render exact approved scripts, lyrics, and slide outlines through resource bodies", async () => {
  for (const locale of ["en", "es"] as const) {
    const content = await history(locale).getHouseContent("topic-comparing-rights");
    assert.deepEqual(houseContentSchema.parse(content), content);
    assert.equal(content.materials.length, 1);
    const resources = historyMockResources.filter((r) => r.locale === locale);
    assert.equal(content.resources.length, 4); // One source text card plus three authored resources.
    for (const resource of resources) {
      const card = content.resources.find((r) => r.id === resource.id)!;
      assert.ok(card);
      assert.equal(card.format, resource.format);
      assert.ok(card.body!.includes(resource.structuredContent.representation));
      for (const block of resource.structuredContent.blocks) {
        assert.ok(card.body!.includes(block.body));
        for (const citation of block.citations) {
          assert.ok(card.body!.includes(citation.chunkId));
          assert.ok(card.body!.includes(citation.materialId));
          assert.ok(card.body!.includes(citation.excerpt));
        }
      }
    }
    const otherLocale = locale === "en" ? "es" : "en";
    assert.ok(!content.resources.some((r) => r.id.endsWith(`-${otherLocale}`)));
  }
});

test("responses invent no download URLs, PDF pages, media files or structured contract fields", async () => {
  for (const content of [
    await create().getHouseContent("topic-geometry"),
    await history("en").getHouseContent("topic-comparing-rights"),
  ]) {
    assert.deepEqual(Object.keys(content).sort(), [
      "courseId",
      "materials",
      "resources",
      "title",
      "topicId",
      "updatedAt",
    ]);
    for (const m of content.materials) {
      assert.equal(m.url, undefined);
      assert.equal(m.pageCount, undefined);
      assert.equal(m.status, "ready");
    }
    assert.ok(content.resources.every((r) => r.url === undefined && !!r.body));
  }
});

test("all default Mathematics houses have content without pulling in History resources", async () => {
  const client = create();
  for (const topic of demoCurriculumTopics) {
    const content = await client.getHouseContent(topic.id);
    assert.equal(content.topicId, topic.id);
    assert.ok(content.resources.length > 0);
    assert.ok(content.resources.every((r) => r.format === "text" && !r.id.includes("history")));
  }
});

test("History is available by default but still requires ready materials", async () => {
  const content = await create(demoCurriculum, {
    courseId: "course-history-1",
    locale: "en",
  }).getHouseContent("topic-comparing-rights");
  assert.equal(content.resources.length, 4);
  const data = structuredClone(demoCurriculum);
  data.materials.find((m) => m.topicIds.includes("topic-comparing-rights"))!.status = "extracting";
  await assert.rejects(
    history("en", data).getHouseContent("topic-comparing-rights"),
    code("FORBIDDEN"),
  );
});

test("unknown and cross-course topics fail without fallback", async () => {
  await assert.rejects(create().getHouseContent("missing"), code("NOT_FOUND"));
  await assert.rejects(create().getHouseContent("topic-comparing-rights"), code("NOT_FOUND"));
  await assert.rejects(history("es").getHouseContent("topic-geometry"), code("NOT_FOUND"));
});

test("authorization is checked before content or publication lookup", async () => {
  const repository = new MockCurriculumRepository();
  repository.getCourse = async () => {
    throw new Error("Unexpected read");
  };
  const adapter = new WorldHouseContentAdapter(
    repository,
    new MockCourseAccessPolicy(),
    { userId: "other", courseIds: [] },
    { courseId: "course-math-1", locale: "es" },
  );
  await assert.rejects(adapter.getHouseContent("topic-geometry"), code("FORBIDDEN"));
});

test("unavailable source language returns empty content instead of silent translation", async () => {
  const content = await create(demoCurriculum, {
    courseId: "course-math-1",
    locale: "en",
  }).getHouseContent("topic-geometry");
  assert.deepEqual(content.materials, []);
  assert.deepEqual(content.resources, []);
});

test("missing source chunks hide stale authored resources", async () => {
  const data = structuredClone(demoCurriculum);
  data.chunks = data.chunks.filter((c) => c.topicId !== "topic-comparing-rights");
  const content = await history("en", data).getHouseContent("topic-comparing-rights");
  assert.deepEqual(content.resources, []);
  assert.deepEqual(content.materials, []);
});

test("changed source text invalidates History citations rather than displaying stale resources", async () => {
  const data = structuredClone(demoCurriculum);
  data.chunks = data.chunks.map((c) =>
    c.topicId === "topic-comparing-rights" ? { ...c, text: "Changed source" } : c,
  );
  await assert.rejects(
    history("en", data).getHouseContent("topic-comparing-rights"),
    /Citation does not resolve/,
  );
});

test("invalid scope and topic inputs are rejected", async () => {
  assert.throws(
    () => create(demoCurriculum, { courseId: " ", locale: "es" }),
    code("INVALID_INPUT"),
  );
  assert.throws(
    () => create(demoCurriculum, { courseId: "course-math-1", locale: "fr" as "es" }),
    code("INVALID_INPUT"),
  );
  await assert.rejects(create().getHouseContent(" "), code("INVALID_INPUT"));
});

test("reads are deterministic copies and cannot mutate source fixtures", async () => {
  const client = history("es");
  const first = await client.getHouseContent("topic-comparing-rights");
  const expected = structuredClone(first);
  first.resources[0]!.body = "changed";
  first.materials.length = 0;
  assert.deepEqual(await client.getHouseContent("topic-comparing-rights"), expected);
});
