import assert from "node:assert/strict";
import test from "node:test";
import {
  athenaDemoIds,
  checkpointResultSchema,
  demoDiagnosticSubmission,
  demoLearningIds,
  diagnosticResultSchema,
  studentLearningStateSchema,
  type CheckpointEvidence,
} from "@athena/shared";
import {
  calculateMastery,
  calculateStrategyReward,
  rankRecommendations,
  scheduleRetention,
  selectTeachingStrategy,
  updateKnowledgeProbability,
  updateStrategyPosterior,
} from "@athena/learning";
import { fixedClock, sequentialIdGenerator } from "@athena/platform";
import { createApp } from "../src/app.js";

test("knowledge tracing is advisory and reacts to evidence", () => {
  const correct = updateKnowledgeProbability(0.2, true);
  const incorrect = updateKnowledgeProbability(0.2, false);
  assert.ok(correct > 0.2);
  assert.ok(incorrect < correct);
  assert.throws(() => updateKnowledgeProbability(2, true), /between 0 and 1/);
});

test("mastery ignores hinted attempts and never decreases", () => {
  const base: CheckpointEvidence = {
    id: "evidence-1",
    studentId: athenaDemoIds.students.lucia,
    topicId: athenaDemoIds.topics.geometry,
    conceptId: demoLearningIds.concepts.triangleArea,
    questionId: demoLearningIds.questions.checkpointTriangleArea,
    correct: true,
    score: 1,
    difficulty: 0.6,
    strategy: "visual_decomposition",
    hintCount: 1,
    evidenceEligible: false,
    misconceptionResolved: true,
    submittedAt: "2026-10-24T12:00:00.000Z",
  };
  const ignored = calculateMastery({
    previous: 0.4,
    attempts: [base],
    requiredConceptIds: [demoLearningIds.concepts.triangleArea],
  });
  assert.equal(ignored.next, 0.4);
  assert.deepEqual(ignored.evidenceIds, []);

  const accepted = calculateMastery({
    previous: 0.4,
    attempts: [{ ...base, id: "evidence-2", hintCount: 0, evidenceEligible: true }],
    requiredConceptIds: [demoLearningIds.concepts.triangleArea],
  });
  assert.equal(accepted.next, 1);
  assert.deepEqual(accepted.demonstratedConceptIds, [demoLearningIds.concepts.triangleArea]);
});

test("strategy learning updates its posterior and failed attempts force a different strategy", () => {
  const reward = calculateStrategyReward({
    beforeScore: 0,
    afterScore: 1,
    misconceptionResolved: true,
    retentionPassed: true,
  });
  assert.equal(reward, 1);
  const posterior = updateStrategyPosterior(
    {
      strategy: "worked_example",
      contextKey: "geometry:missing_half:foundation",
      alpha: 1,
      beta: 1,
      observations: 0,
    },
    reward,
  );
  assert.equal(posterior.alpha, 2);
  assert.equal(posterior.observations, 1);

  const random = seededRandom(42);
  const selected = selectTeachingStrategy({
    posteriors: [
      posterior,
      {
        strategy: "visual_decomposition",
        contextKey: posterior.contextKey,
        alpha: 2,
        beta: 1,
        observations: 1,
      },
    ],
    previousStrategy: "worked_example",
    previousAttemptFailed: true,
    random,
  });
  assert.equal(selected, "visual_decomposition");
});

test("recommendations respect prerequisites and retention uses spaced intervals", () => {
  const recommendations = rankRecommendations({
    masteryByTopic: { fractions: 0.9 },
    candidates: [
      {
        topicId: "geometry",
        prerequisiteTopicIds: ["fractions"],
        knowledgeGap: 0.8,
        misconceptionSeverity: 1,
        retentionUrgency: 0.2,
      },
      {
        topicId: "statistics",
        prerequisiteTopicIds: ["probability"],
        knowledgeGap: 1,
        misconceptionSeverity: 1,
        retentionUrgency: 1,
      },
    ],
  });
  assert.deepEqual(
    recommendations.map((value) => value.topicId),
    ["geometry"],
  );

  const first = scheduleRetention({
    studentId: athenaDemoIds.students.lucia,
    conceptId: demoLearningIds.concepts.triangleArea,
    recalledSuccessfully: true,
    now: new Date("2026-10-24T12:00:00.000Z"),
  });
  const second = scheduleRetention({
    studentId: first.studentId,
    conceptId: first.conceptId,
    recalledSuccessfully: true,
    previousSuccessfulRecallStreak: first.successfulRecallStreak,
    now: new Date(first.dueAt),
  });
  assert.equal(first.intervalDays, 1);
  assert.equal(second.intervalDays, 3);
});

test("diagnostic, failed checkpoint and successful checkpoint form the learning foundation", async () => {
  const app = await createApp({
    logger: false,
    platform: {
      clock: fixedClock("2026-10-24T12:00:00.000Z"),
      ids: sequentialIdGenerator(500),
    },
  });
  try {
    const diagnosticResponse = await app.inject({
      method: "POST",
      url: "/api/learning/diagnostic",
      payload: demoDiagnosticSubmission,
    });
    assert.equal(diagnosticResponse.statusCode, 200, diagnosticResponse.body);
    const diagnostic = diagnosticResultSchema.parse(diagnosticResponse.json());
    assert.equal(diagnostic.concepts[0]?.status, "struggling");
    assert.deepEqual(diagnostic.concepts[0]?.misconceptionIds, [
      demoLearningIds.misconceptions.triangleMissingHalf,
    ]);

    const failedResponse = await app.inject({
      method: "POST",
      url: "/api/learning/attempt",
      payload: {
        studentId: athenaDemoIds.students.lucia,
        courseId: athenaDemoIds.course,
        topicId: athenaDemoIds.topics.geometry,
        conceptId: demoLearningIds.concepts.triangleArea,
        questionId: demoLearningIds.questions.checkpointTriangleArea,
        answer: 60,
        strategy: "worked_example",
        hintCount: 0,
      },
    });
    assert.equal(failedResponse.statusCode, 200, failedResponse.body);
    const failed = checkpointResultSchema.parse(failedResponse.json());
    assert.equal(failed.evidence.correct, false);
    assert.equal(failed.mastery.mastery, 0);
    assert.equal(failed.strategyChanged, true);
    assert.notEqual(failed.recommendedStrategy, "worked_example");

    const passedResponse = await app.inject({
      method: "POST",
      url: "/api/learning/attempt",
      payload: {
        studentId: athenaDemoIds.students.lucia,
        courseId: athenaDemoIds.course,
        topicId: athenaDemoIds.topics.geometry,
        conceptId: demoLearningIds.concepts.triangleArea,
        questionId: demoLearningIds.questions.checkpointTriangleArea,
        answer: 30,
        strategy: "visual_decomposition",
        hintCount: 0,
      },
    });
    assert.equal(passedResponse.statusCode, 200, passedResponse.body);
    const passed = checkpointResultSchema.parse(passedResponse.json());
    assert.equal(passed.evidence.correct, true);
    assert.equal(passed.mastery.mastery, 0.65);
    assert.deepEqual(passed.activeMisconceptionIds, []);
    assert.equal(passed.retention?.intervalDays, 1);

    const stateResponse = await app.inject({
      method: "GET",
      url: `/api/learning/student/${athenaDemoIds.students.lucia}/state`,
    });
    assert.equal(stateResponse.statusCode, 200, stateResponse.body);
    const state = studentLearningStateSchema.parse(stateResponse.json());
    assert.equal(state.diagnostics.length, 1);
    assert.equal(state.mastery[0]?.mastery, 0.65);
    assert.equal(state.knowledge[0]?.evidenceCount, 3);
    assert.equal(state.retention.length, 1);
  } finally {
    await app.close();
  }
});

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}
