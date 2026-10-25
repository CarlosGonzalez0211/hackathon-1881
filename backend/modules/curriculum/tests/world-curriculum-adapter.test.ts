import assert from "node:assert/strict";
import test from "node:test";
import {
  athenaDemoIds,
  demoCurriculum,
  demoCurriculumTopics,
  demoClassMastery,
  demoClassPlanets,
  demoWorldTopics,
  curriculumTopicSummarySchema,
  projectPlanet,
  WORLD_HOUSE_SLOT_COUNT,
} from "@athena/shared";
// Test the actual built consumer; do not edit World or add a production dependency.
import {
  WorldService,
  createMockWorldPorts,
  type CurriculumTopicPort as ActualWorldPort,
} from "../../world/dist/index.js";
import { WorldCurriculumTopicAdapter } from "../src/world-curriculum-adapter.js";
import { MockCurriculumRepository, MockCourseAccessPolicy } from "../src/mock-repository.js";
import { CurriculumError } from "../src/ports.js";
const access = { userId: "demo", courseIds: ["course-math-1", "course-history-1", "missing"] };
const publishedMath = demoCurriculumTopics.map((t) => t.id);
const create = (data = demoCurriculum, options = {}) =>
  new WorldCurriculumTopicAdapter(
    new MockCurriculumRepository(data),
    new MockCourseAccessPolicy(),
    access,
    options,
  );
const AT = "2026-10-24T15:30:00.000Z";

test("adapter exactly matches the shipped Mathematics World catalog and slots", async () => {
  const port: ActualWorldPort = create();
  const topics = await port.listTopics("course-math-1");
  assert.deepEqual(topics, demoCurriculumTopics);
  assert.equal(topics.length, WORLD_HOUSE_SLOT_COUNT);
  assert.deepEqual(
    topics.map((t) => t.order),
    [0, 1, 2, 3, 4, 5],
  );
  topics.forEach((t) => assert.deepEqual(curriculumTopicSummarySchema.parse(t), t));
});

test("every existing demo planet is unchanged when projected from the adapter", async () => {
  const topics = await create().listTopics(athenaDemoIds.course);
  assert.deepEqual(topics, demoWorldTopics);
  for (const expected of demoClassPlanets) {
    const mastery = demoClassMastery.find((m) => m.studentId === expected.studentId)!;
    const projected = projectPlanet({ studentId: expected.studentId, topics, mastery });
    assert.deepEqual(projected.planet, expected);
    assert.deepEqual(projected.overflowTopics, []);
  }
});

test("actual WorldService preserves planets, entry gates and progression with injected Person 1 port", async () => {
  const ports = createMockWorldPorts();
  const consumerPorts = { ...ports, curriculum: create() };
  const world = new WorldService({ ports: consumerPorts, now: () => AT });
  const baseline = new WorldService({ ports, now: () => AT });
  assert.deepEqual(
    await world.getPlanet(athenaDemoIds.students.lucia),
    await baseline.getPlanet(athenaDemoIds.students.lucia),
  );
  assert.deepEqual(
    await world.getClassPlanets(athenaDemoIds.class),
    await baseline.getClassPlanets(athenaDemoIds.class),
  );
  assert.deepEqual(
    await world.getWorldLayout(athenaDemoIds.course),
    await baseline.getWorldLayout(athenaDemoIds.course),
  );
  for (const topicId of [
    athenaDemoIds.topics.geometry,
    athenaDemoIds.topics.functions,
    athenaDemoIds.topics.statistics,
  ]) {
    assert.deepEqual(
      await world.enterHouse({ studentId: athenaDemoIds.students.lucia, topicId }),
      await baseline.enterHouse({ studentId: athenaDemoIds.students.lucia, topicId }),
    );
  }
  ports.mastery.set(athenaDemoIds.students.lucia, [
    { topicId: athenaDemoIds.topics.geometry, mastery: 0.85 },
  ]);
  const after = await world.getPlanet(athenaDemoIds.students.lucia);
  assert.deepEqual(after, await baseline.getPlanet(athenaDemoIds.students.lucia));
  assert.equal(
    after.houses.find((h) => h.topicId === athenaDemoIds.topics.statistics)!.status,
    "available",
  );
});

test("compatibility view is explicit and does not rewrite the underlying curriculum graph", async () => {
  const plain = await create(demoCurriculum, { preserveMathematicsDemo: false }).listTopics(
    "course-math-1",
  );
  assert.deepEqual(plain.find((t) => t.id === "topic-statistics")!.prerequisiteTopicIds, [
    "topic-functions",
  ]);
  const compatible = await create().listTopics("course-math-1");
  assert.deepEqual(compatible.find((t) => t.id === "topic-statistics")!.prerequisiteTopicIds, [
    "topic-geometry",
  ]);
  assert.deepEqual(
    demoCurriculum.topics.find((t) => t.id === "topic-statistics")!.prerequisiteTopicIds,
    ["topic-functions"],
  );
});

test("History is published by default and stays separate from Mathematics", async () => {
  const adapter = create();
  const before = await adapter.listTopics("course-math-1");
  const history = await adapter.listTopics("course-history-1");
  assert.equal(history.length, 6);
  assert.ok(history.every((t) => t.courseId === "course-history-1" && t.published));
  assert.deepEqual(await adapter.listTopics("course-math-1"), before);
  const ids = demoCurriculum.topics
    .filter((t) => t.courseId === "course-history-1")
    .map((t) => t.id);
  const optIn = await create(demoCurriculum, { publishedTopicIds: ids }).listTopics(
    "course-history-1",
  );
  assert.ok(optIn.every((t) => t.published));
});

test("publication intent requires at least one ready material", async () => {
  const data = structuredClone(demoCurriculum);
  data.materials.find((m) => m.topicIds.includes("topic-geometry"))!.status = "extracting";
  const topics = await create(data).listTopics("course-math-1");
  assert.equal(topics.find((t) => t.id === "topic-geometry")!.published, false);
  assert.equal(topics.find((t) => t.id === "topic-fractions")!.published, true);
  assert.ok(
    (await create(demoCurriculum, { publishedTopicIds: [] }).listTopics("course-math-1")).every(
      (t) => !t.published,
    ),
  );
});

test("new ready topics use World's existing overflow support without moving the six houses", async () => {
  const data = structuredClone(demoCurriculum);
  data.topics.push({
    ...data.topics[0]!,
    id: "topic-extra",
    title: "Extra",
    order: 6,
    prerequisiteTopicIds: [],
  });
  data.topics.push({
    ...data.topics[0]!,
    id: "topic-draft",
    title: "Draft",
    order: 7,
    prerequisiteTopicIds: [],
  });
  data.materials.push({ ...data.materials[0]!, id: "material-extra", topicIds: ["topic-extra"] });
  const adapter = create(data, {
    publishedTopicIds: [...publishedMath, "topic-extra", "topic-draft"],
  });
  const ports = createMockWorldPorts();
  const world = new WorldService({ ports: { ...ports, curriculum: adapter }, now: () => AT });
  const view = await world.getWorld(athenaDemoIds.students.lucia);
  assert.deepEqual(
    view.planet.houses.map((h) => [h.topicId, h.slot]),
    demoWorldTopics.map((t) => [t.id, t.order]),
  );
  assert.deepEqual(
    view.overflowTopics.map((h) => [h.topicId, h.slot]),
    [["topic-extra", 6]],
  );
  assert.equal(
    (await adapter.listTopics("course-math-1")).find((t) => t.id === "topic-draft")!.published,
    false,
  );
});

test("unknown authorized courses return empty while denied lookups never read the repository", async () => {
  assert.deepEqual(await create().listTopics("missing"), []);
  const repository = new MockCurriculumRepository();
  repository.getCourse = async () => {
    throw new Error("Unexpected read");
  };
  const adapter = new WorldCurriculumTopicAdapter(repository, new MockCourseAccessPolicy(), {
    userId: "other",
    courseIds: [],
  });
  await assert.rejects(
    adapter.listTopics("course-math-1"),
    (e: unknown) => e instanceof CurriculumError && e.code === "FORBIDDEN",
  );
});

test("invalid course IDs are rejected and results cannot mutate catalog or publication intent", async () => {
  const publication = [...publishedMath];
  const adapter = create(demoCurriculum, { publishedTopicIds: publication });
  publication.length = 0;
  const first = await adapter.listTopics("course-math-1");
  assert.ok(first.every((t) => t.published));
  first[0]!.prerequisiteTopicIds.push("changed");
  first[0]!.published = false;
  assert.deepEqual(await adapter.listTopics("course-math-1"), demoCurriculumTopics);
  await assert.rejects(
    adapter.listTopics(" "),
    (e: unknown) => e instanceof CurriculumError && e.code === "INVALID_INPUT",
  );
});

test("invalid provider orders and prerequisite graphs never reach World", async () => {
  for (const mode of ["duplicate-order", "missing", "cycle"]) {
    const repository = new MockCurriculumRepository();
    const original = repository.listTopics.bind(repository);
    repository.listTopics = async (scope) => {
      const topics = await original(scope);
      if (mode === "duplicate-order") topics[1]!.order = topics[0]!.order;
      else topics[0]!.prerequisiteTopicIds = [mode === "missing" ? "not-in-course" : topics[1]!.id];
      return topics;
    };
    const adapter = new WorldCurriculumTopicAdapter(
      repository,
      new MockCourseAccessPolicy(),
      access,
    );
    await assert.rejects(adapter.listTopics("course-history-1"), /unique topic|prerequisite/);
  }
});
