import assert from "node:assert/strict";
import test from "node:test";
import {
  citationSchema,
  curriculumDatasetSchema,
  demoCurriculum,
  generatedResourceSchema,
  retrieveContextInputSchema,
  validateRetrievedContext,
} from "../src/index.js";

test("both demo subjects use the same validated contracts and stable provenance", () => {
  assert.deepEqual(curriculumDatasetSchema.parse(demoCurriculum), demoCurriculum);
  assert.equal(demoCurriculum.courses.length, 2);
  assert.equal(demoCurriculum.topics.length, 12);
  for (const course of demoCurriculum.courses) {
    assert.equal(course.createdAt, "2026-10-24T00:00:00.000Z");
    assert.equal(demoCurriculum.topics.filter((t) => t.courseId === course.id).length, 6);
  }
  for (const material of demoCurriculum.materials) {
    assert.equal(material.provenance.kind, "authored_demo");
    assert.match(material.title, /DEMO/);
    assert.ok(demoCurriculum.chunks.some((c) => c.materialId === material.id));
  }
  assert.ok(
    demoCurriculum.chunks.some((c) => c.courseId === "course-history-1" && c.locale === "es"),
  );
  const geometry = demoCurriculum.chunks.filter((c) => c.topicId === "topic-geometry");
  assert.equal(geometry.length, 3);
  assert.ok(geometry.slice(0, 2).every((c) => c.text.includes("12 cm²")));
  assert.equal(geometry[2]!.section, "Base y altura perpendicular");
});

const invalidDatasets: Array<[string, (data: typeof demoCurriculum) => void]> = [
  [
    "duplicate IDs",
    (d) => {
      d.courses.push(d.courses[0]!);
    },
  ],
  [
    "duplicate orders",
    (d) => {
      d.topics[1]!.order = 0;
    },
  ],
  [
    "missing prerequisite",
    (d) => {
      d.topics[1]!.prerequisiteTopicIds = ["missing"];
    },
  ],
  [
    "self prerequisite",
    (d) => {
      d.topics[1]!.prerequisiteTopicIds = [d.topics[1]!.id];
    },
  ],
  [
    "cross-course prerequisite",
    (d) => {
      d.topics[1]!.prerequisiteTopicIds = ["topic-historical-evidence"];
    },
  ],
  [
    "duplicate prerequisite",
    (d) => {
      d.topics[1]!.prerequisiteTopicIds.push("topic-fractions");
    },
  ],
  [
    "cycle",
    (d) => {
      d.topics[0]!.prerequisiteTopicIds = ["topic-geometry"];
    },
  ],
  [
    "wrong topic version",
    (d) => {
      d.topics[1]!.curriculumVersion = 2;
    },
  ],
  [
    "missing course",
    (d) => {
      d.topics[1]!.courseId = "missing";
    },
  ],
  [
    "cross-course material",
    (d) => {
      d.materials[0]!.topicIds = ["topic-historical-evidence"];
    },
  ],
  [
    "wrong material version",
    (d) => {
      d.materials[0]!.curriculumVersion = 2;
    },
  ],
  [
    "wrong instructor",
    (d) => {
      d.materials[0]!.uploadedBy = "other-professor";
    },
  ],
  [
    "missing chunk material",
    (d) => {
      d.chunks[0]!.materialId = "missing";
    },
  ],
  [
    "cross-topic chunk",
    (d) => {
      d.chunks[0]!.topicId = "topic-geometry";
    },
  ],
  [
    "wrong chunk version",
    (d) => {
      d.chunks[0]!.curriculumVersion = 2;
    },
  ],
  [
    "duplicate chunk index",
    (d) => {
      d.chunks[2]!.index = d.chunks[1]!.index;
    },
  ],
];
for (const [name, mutate] of invalidDatasets) {
  test(`dataset rejects ${name}`, () => {
    const data = structuredClone(demoCurriculum);
    mutate(data);
    assert.equal(curriculumDatasetSchema.safeParse(data).success, false);
  });
}

test("retrieval inputs constrain queries, limits, versions and reject claimed authorization", () => {
  const input = {
    courseId: "course-math-1",
    topicId: "topic-geometry",
    curriculumVersion: 1,
    query: "área",
  };
  assert.equal(retrieveContextInputSchema.parse(input).limit, 5);
  for (const change of [
    { query: " " },
    { query: "x".repeat(2001) },
    { limit: 0 },
    { limit: 21 },
    { curriculumVersion: 0 },
    { allowedCourseIds: ["course-history-1"] },
  ]) {
    assert.equal(retrieveContextInputSchema.safeParse({ ...input, ...change }).success, false);
  }
});

test("citations resolve to exact scoped content; forged citations fail", () => {
  const chunk = demoCurriculum.chunks[1]!;
  const material = demoCurriculum.materials.find((m) => m.id === chunk.materialId)!;
  const context = {
    courseId: chunk.courseId,
    topicId: chunk.topicId,
    curriculumVersion: 1,
    chunks: [
      {
        text: chunk.text,
        similarity: 1,
        citation: {
          materialId: material.id,
          materialTitle: material.title,
          section: chunk.section,
          chunkId: chunk.id,
          excerpt: chunk.text,
        },
      },
    ],
  };
  assert.deepEqual(validateRetrievedContext(context, demoCurriculum), context);
  for (const changes of [
    { excerpt: "invented fact" },
    { chunkId: "missing" },
    { materialTitle: "forged" },
    { section: "invented" },
    { page: 10 },
    { materialId: demoCurriculum.materials[0]!.id },
  ]) {
    const forged = structuredClone(context);
    Object.assign(forged.chunks[0]!.citation, changes);
    assert.throws(() => validateRetrievedContext(forged, demoCurriculum));
  }
  assert.throws(() =>
    validateRetrievedContext({ ...context, courseId: "course-history-1" }, demoCurriculum),
  );
  const changed = structuredClone(context);
  changed.chunks[0]!.text = "Altered content";
  assert.throws(() => validateRetrievedContext(changed, demoCurriculum));
  assert.equal(
    citationSchema.safeParse({ ...context.chunks[0]!.citation, section: undefined }).success,
    false,
  );
  assert.equal(
    generatedResourceSchema.safeParse({
      id: "resource",
      courseId: chunk.courseId,
      topicId: chunk.topicId,
      curriculumVersion: 1,
      format: "podcast",
      locale: "en",
      status: "draft",
      structuredContent: {},
      citations: [],
    }).success,
    false,
  );
});

test("TXT lessons match the typed source chunks and use plain-text metadata", async () => {
  const { readFile } = await import("node:fs/promises");
  for (const material of demoCurriculum.materials) {
    assert.equal(material.mimeType, "text/plain");
    assert.ok(material.filename.endsWith(".txt"));
    assert.ok(material.storagePath.endsWith(".txt"));
    const chunks = demoCurriculum.chunks.filter((chunk) => chunk.materialId === material.id);
    const expected = [
      material.title,
      "",
      material.provenance.description,
      "",
      ...chunks.flatMap((chunk) => [`[${chunk.locale}] ${chunk.section}`, chunk.text, ""]),
    ].join("\n");
    const url = new URL(`../src/mocks/curriculum/content/${material.filename}`, import.meta.url);
    assert.equal(await readFile(url, "utf8"), expected);
  }
});
