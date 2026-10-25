import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { generatedResourceSchema } from "../../../../shared/src/curriculum.js";
import { demoCurriculum } from "../../../../shared/src/mocks/demo-curriculum.js";
import { historyMockResources } from "../src/history-resource-catalog.js";
import { HistoryResourceService } from "../src/history-resource-service.js";
import { MockCurriculumRepository, MockCourseAccessPolicy } from "../src/mock-repository.js";
import { CurriculumError } from "../src/ports.js";
const request = {
  courseId: "course-history-1",
  topicId: "topic-comparing-rights",
  curriculumVersion: 1,
  locale: "en" as const,
};
const access = { userId: "demo", courseIds: ["course-history-1", "course-math-1"] };
const create = (data = demoCurriculum) =>
  new HistoryResourceService(
    new MockCurriculumRepository(data),
    new MockCourseAccessPolicy(),
    access,
  );

test("six reusable contract-valid History resources cover three formats in both languages", () => {
  assert.equal(historyMockResources.length, 6);
  assert.equal(new Set(historyMockResources.map((r) => r.id)).size, 6);
  for (const locale of ["en", "es"]) {
    assert.deepEqual(
      historyMockResources.filter((r) => r.locale === locale).map((r) => r.format),
      ["podcast", "music", "slides"],
    );
  }
  for (const resource of historyMockResources) {
    assert.deepEqual(generatedResourceSchema.parse(resource), resource);
    assert.equal(resource.contentUrl, undefined);
    assert.equal(resource.structuredContent.playable, false);
    assert.equal(resource.structuredContent.provenance, "authored_demo");
    assert.equal(
      resource.structuredContent.representation,
      resource.format === "podcast"
        ? "script"
        : resource.format === "music"
          ? "lyrics"
          : "slide_outline",
    );
  }
});
test("every academic block is an exact source excerpt with matching scope and locale", () => {
  for (const resource of historyMockResources) {
    assert.deepEqual(
      resource.citations,
      resource.structuredContent.blocks.flatMap((b) => b.citations),
    );
    for (const block of resource.structuredContent.blocks) {
      if (block.kind === "framing") {
        assert.deepEqual(block.citations, []);
        continue;
      }
      assert.ok(block.citations.length > 0);
      for (const citation of block.citations) {
        const chunk = demoCurriculum.chunks.find((c) => c.id === citation.chunkId)!;
        const material = demoCurriculum.materials.find((m) => m.id === citation.materialId)!;
        assert.ok(chunk.text.includes(citation.excerpt));
        assert.equal(block.body, citation.excerpt);
        assert.equal(chunk.materialId, material.id);
        assert.equal(citation.materialTitle, material.title);
        assert.equal(citation.section, chunk.section);
        assert.equal(citation.page, undefined);
        assert.equal(chunk.courseId, resource.courseId);
        assert.equal(chunk.topicId, resource.topicId);
        assert.equal(chunk.curriculumVersion, resource.curriculumVersion);
        assert.equal(chunk.locale, resource.locale);
      }
    }
  }
});
test("TXT resource copies match typed content and include source locators", async () => {
  for (const r of historyMockResources) {
    const c = r.structuredContent;
    const expected = [
      `[AUTHORED DEMO] ${c.title}`,
      `Format: ${r.format}; representation: ${c.representation}; locale: ${r.locale}`,
      "Script/outline only. No playable media or presentation file.",
      "",
      ...c.blocks.flatMap((b) => [
        `${b.label}: ${b.body}`,
        ...b.citations.map(
          (x) => `Source: ${x.materialId}; ${x.section}; ${x.chunkId}; excerpt: ${x.excerpt}`,
        ),
        "",
      ]),
    ].join("\n");
    assert.equal(
      await readFile(new URL(`../fixtures/history-resources/${r.id}.txt`, import.meta.url), "utf8"),
      expected,
    );
  }
});
test("resource reads respect locale, version, and topic; return deterministic copies", async () => {
  const service = create();
  for (const locale of ["en", "es"] as const) {
    const result = await service.listResources({ ...request, locale });
    assert.equal(result.length, 3);
    assert.ok(result.every((r) => r.locale === locale));
    const original = structuredClone(result);
    result[0]!.structuredContent.blocks[0]!.body = "changed";
    assert.deepEqual(await service.listResources({ ...request, locale }), original);
  }
  assert.deepEqual(
    await service.listResources({
      ...request,
      courseId: "course-math-1",
      topicId: "topic-geometry",
    }),
    [],
  );
  await assert.rejects(
    service.listResources({ ...request, curriculumVersion: 2 }),
    (e: unknown) => e instanceof CurriculumError && e.code === "VERSION_MISMATCH",
  );
});
test("unready or absent source materials cannot serve approved resource fixtures", async () => {
  for (const mode of ["unready", "missing"]) {
    const data = structuredClone(demoCurriculum);
    if (mode === "unready")
      data.materials.find((m) => m.topicIds.includes(request.topicId))!.status = "failed";
    else data.chunks = data.chunks.filter((c) => c.topicId !== request.topicId);
    assert.deepEqual(await create(data).listResources(request), []);
  }
});
test("source corruption is rejected instead of serving stale or invented citations", async () => {
  const data = structuredClone(demoCurriculum);
  data.chunks = data.chunks.map((c) =>
    c.topicId === request.topicId ? { ...c, text: "Changed source" } : c,
  );
  await assert.rejects(create(data).listResources(request), /Citation does not resolve/);
});
test("access denial precedes repository reads", async () => {
  const repository = new MockCurriculumRepository();
  repository.getCourse = async () => {
    throw new Error("Unexpected lookup");
  };
  const service = new HistoryResourceService(repository, new MockCourseAccessPolicy(), {
    userId: "other",
    courseIds: [],
  });
  await assert.rejects(
    service.listResources(request),
    (e: unknown) => e instanceof CurriculumError && e.code === "FORBIDDEN",
  );
});
test("invalid locale, scope and injected authorization are rejected", async () => {
  for (const change of [
    { locale: "fr" },
    { curriculumVersion: 0 },
    { topicId: " " },
    { courseIds: access.courseIds },
  ]) {
    await assert.rejects(
      create().listResources({ ...request, ...change } as typeof request),
      (e: unknown) => e instanceof CurriculumError && e.code === "INVALID_INPUT",
    );
  }
});
