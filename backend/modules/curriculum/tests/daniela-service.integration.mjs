import assert from "node:assert/strict";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { demoCurriculum, validateRetrievedContext } from "@athena/shared";
import {
  fixedClock,
  sequentialIdGenerator,
  InMemoryDomainEventStore,
  RoleAuthorizationService,
} from "@athena/platform";
import {
  LearningCurriculumContextAdapter,
  MockCurriculumRepository,
  MockCourseAccessPolicy,
  GEOMETRY_CONCEPT_IDS,
} from "../dist/index.js";

const checkout = process.env.DANIELA_INTEGRATION_CHECKOUT;
if (!checkout)
  throw new Error(
    "Run scripts/test-daniela-integration.mjs to prepare Daniela's isolated checkout.",
  );
const learning = await import(
  pathToFileURL(join(checkout, "backend/modules/learning/dist/index.js"))
);
const shared = await import(pathToFileURL(join(checkout, "shared/dist/index.js")));
const { athenaDemoIds: ids, demoLearningIds: learningIds } = shared;
const context = {
  userId: ids.students.lucia,
  role: "student",
  displayName: "Integration student",
  courseIds: [ids.course],
  classIds: [ids.class],
  studentIds: [ids.students.lucia],
};
const base = {
  studentId: context.userId,
  courseId: ids.course,
  topicId: ids.topics.geometry,
  strategy: "guided_questioning",
  curriculumVersion: 1,
};

function setup({ data = demoCurriculum, access = context, tutor } = {}) {
  const repository = new learning.InMemoryLearningRepository();
  const adapter = new LearningCurriculumContextAdapter(
    new MockCurriculumRepository(data),
    new MockCourseAccessPolicy(),
    access,
  );
  const requests = [],
    responses = [],
    tutorCalls = [];
  const provider = tutor ?? new learning.MockTutorProvider();
  const service = new learning.LearningService(
    repository,
    new learning.InMemoryAssessmentRepository(),
    new RoleAuthorizationService(),
    new InMemoryDomainEventStore(),
    fixedClock("2026-10-25T12:00:00.000Z"),
    sequentialIdGenerator(),
    new learning.InMemoryRecommendationCatalog(),
    new learning.MockMisconceptionClassifier(),
    {
      async retrieve(input) {
        requests.push(input);
        const response = await adapter.retrieve(input);
        shared.curriculumContextResponseSchema.parse(response);
        if (!response.unsupported)
          validateRetrievedContext(
            {
              courseId: "course-math-1",
              topicId: "topic-geometry",
              curriculumVersion: 1,
              chunks: response.chunks.map((c) => ({ ...c, similarity: c.relevanceScore ?? 0 })),
            },
            data,
          );
        responses.push(response);
        return response;
      },
    },
    {
      async respond(input) {
        tutorCalls.push(input);
        return provider.respond(input);
      },
    },
  );
  return { service, repository, requests, responses, tutorCalls };
}
function assertCited(message, response) {
  assert.equal(message.unsupported, false);
  assert.ok(message.citations.length);
  assert.deepEqual(
    message.citations,
    response.chunks.map((c) => c.citation),
  );
  assert.deepEqual(message.sourceIds, [...new Set(message.citations.map((c) => c.materialId))]);
}

test("actual LearningService starts cited lessons for all three agreed Geometry concepts", async () => {
  assert.deepEqual(
    new Set(Object.values(learningIds.concepts)),
    new Set(Object.values(GEOMETRY_CONCEPT_IDS)),
  );
  for (const conceptId of Object.values(GEOMETRY_CONCEPT_IDS)) {
    const h = setup();
    const result = shared.learningSessionStartResultSchema.parse(
      await h.service.startLearningSession(context, {
        ...base,
        conceptId,
        objective: "base altura",
        locale: "es",
      }),
    );
    assert.equal(result.session.status, "active");
    assert.equal(h.requests[0].locale, "es");
    assert.ok(h.responses[0].chunks.every((c) => c.conceptId === conceptId));
    assertCited(result.initialMessage, h.responses[0]);
    assert.deepEqual(
      h.tutorCalls[0].evidence,
      h.responses[0].chunks.map(({ text, citation }) => ({ text, citation })),
    );
    assert.equal(await h.repository.getMastery(base.studentId, base.topicId), null);
  }
});

test("actual LearningService retrieves question-ID-only hints for each Geometry concept", async () => {
  for (const [conceptId, questionId] of [
    [GEOMETRY_CONCEPT_IDS.rectangleArea, learningIds.questions.checkpointRectangleArea],
    [GEOMETRY_CONCEPT_IDS.triangleBaseHeight, learningIds.questions.checkpointTriangleBaseHeight],
    [GEOMETRY_CONCEPT_IDS.triangleArea, learningIds.questions.checkpointTriangleArea],
  ]) {
    const h = setup();
    const result = shared.hintResultSchema.parse(
      await h.service.requestHint(context, { ...base, conceptId, questionId, currentAnswer: "" }),
    );
    assert.equal(h.requests[0].query, `Hint for question ${questionId}`);
    assert.equal(h.tutorCalls[0].mode, "hint");
    assertCited(result.message, h.responses[0]);
    assert.equal(result.revealsAnswer, false);
    assert.doesNotMatch(result.message.content, /\b12\b|\b24\b/);
    assert.equal(await h.repository.getMastery(base.studentId, base.topicId), null);
  }
});

test("follow-up messages use the same concept and preserve source citations", async () => {
  const h = setup();
  const started = await h.service.startLearningSession(context, {
    ...base,
    conceptId: GEOMETRY_CONCEPT_IDS.triangleArea,
    objective: "base altura",
    locale: "es",
  });
  const reply = await h.service.sendSessionMessage(
    context,
    started.session.id,
    "rectángulo triángulo área",
  );
  assert.equal(h.requests[1].conceptId, GEOMETRY_CONCEPT_IDS.triangleArea);
  assertCited(reply, h.responses[1]);
});

test("unsupported concept, locale, query and version stop before the tutor provider", async () => {
  for (const [change, reason] of [
    [{ conceptId: "math.geometry.unknown" }, "concept_not_found"],
    [{ locale: "en" }, "no_approved_content"],
    [{ objective: "quasar" }, "insufficient_evidence"],
    [{ curriculumVersion: 2 }, "curriculum_version_mismatch"],
  ]) {
    const h = setup();
    const result = await h.service.startLearningSession(context, {
      ...base,
      conceptId: GEOMETRY_CONCEPT_IDS.triangleArea,
      objective: "base altura",
      locale: "es",
      ...change,
    });
    assert.equal(result.initialMessage.unsupported, true);
    assert.equal(h.responses[0].unsupportedReason, reason);
    assert.deepEqual(result.initialMessage.citations, []);
    assert.equal(h.tutorCalls.length, 0);
  }
});

test("unready material and denied Person 1 access cannot produce grounded tutor evidence", async () => {
  const data = structuredClone(demoCurriculum);
  data.materials.find((m) => m.topicIds.includes("topic-geometry")).status = "failed";
  const h = setup({ data });
  const input = { ...base, conceptId: GEOMETRY_CONCEPT_IDS.triangleArea, objective: "base altura" };
  assert.equal(
    (await h.service.startLearningSession(context, input)).initialMessage.unsupported,
    true,
  );
  assert.equal(h.tutorCalls.length, 0);
  const denied = setup({ access: { userId: context.userId, courseIds: [] } });
  await assert.rejects(denied.service.startLearningSession(context, input), /access|denied/i);
  assert.equal(denied.tutorCalls.length, 0);
});

test("Learning rejects a mismatched hint concept before retrieval and rejects invented citation IDs", async () => {
  const h = setup();
  await assert.rejects(
    h.service.requestHint(context, {
      ...base,
      conceptId: GEOMETRY_CONCEPT_IDS.rectangleArea,
      questionId: learningIds.questions.checkpointTriangleArea,
    }),
    /does not match/,
  );
  assert.equal(h.requests.length, 0);
  const malicious = setup({
    tutor: {
      async respond(input) {
        return {
          content: "Unsupported citation",
          unsupported: false,
          citations: [{ ...input.evidence[0].citation, chunkId: "invented-chunk" }],
        };
      },
    },
  });
  await assert.rejects(
    malicious.service.startLearningSession(context, {
      ...base,
      conceptId: GEOMETRY_CONCEPT_IDS.triangleArea,
      objective: "base altura",
    }),
    /outside the retrieved context/,
  );
});
