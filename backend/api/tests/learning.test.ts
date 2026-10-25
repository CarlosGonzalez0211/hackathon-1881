import assert from "node:assert/strict";
import test from "node:test";
import {
  athenaDemoIds,
  assessmentQuizSchema,
  checkpointResultSchema,
  demoDiagnosticSubmission,
  demoLearningIds,
  diagnosticResultSchema,
  retentionCheckResultSchema,
  studentLearningStateSchema,
  type CheckpointEvidence,
} from "@athena/shared";
import {
  calculateMastery,
  calculateStrategyReward,
  InMemoryAssessmentRepository,
  rankRecommendations,
  scheduleRetention,
  selectAssessmentQuestions,
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

test("adaptive question selection covers required concepts, targets misconceptions and avoids repeats", () => {
  const candidates = [
    {
      id: "recent-misconception-item",
      purpose: "checkpoint" as const,
      conceptId: demoLearningIds.concepts.triangleArea,
      difficulty: 0.4,
      requiredForMastery: true,
      targetMisconceptionIds: [demoLearningIds.misconceptions.triangleMissingHalf],
      transfer: false,
    },
    {
      id: "fresh-base-height-item",
      purpose: "checkpoint" as const,
      conceptId: demoLearningIds.concepts.triangleBaseHeight,
      difficulty: 0.4,
      requiredForMastery: true,
      targetMisconceptionIds: [],
      transfer: false,
    },
    {
      id: "optional-review-item",
      purpose: "checkpoint" as const,
      conceptId: demoLearningIds.concepts.rectangleArea,
      difficulty: 0.9,
      requiredForMastery: false,
      targetMisconceptionIds: [],
      transfer: false,
    },
  ];

  const withoutRepeat = selectAssessmentQuestions({
    candidates,
    purpose: "checkpoint",
    limit: 1,
    knowledgeByConcept: {},
    demonstratedConceptIds: [],
    activeMisconceptionIds: [demoLearningIds.misconceptions.triangleMissingHalf],
    recentQuestionIds: ["recent-misconception-item"],
  });
  assert.equal(withoutRepeat[0]?.question.id, "fresh-base-height-item");
  assert.equal(withoutRepeat[0]?.reason, "uncovered_required_concept");

  const misconceptionRepair = selectAssessmentQuestions({
    candidates,
    purpose: "checkpoint",
    limit: 1,
    knowledgeByConcept: { [demoLearningIds.concepts.triangleArea]: 0.3 },
    demonstratedConceptIds: [
      demoLearningIds.concepts.triangleArea,
      demoLearningIds.concepts.triangleBaseHeight,
    ],
    activeMisconceptionIds: [demoLearningIds.misconceptions.triangleMissingHalf],
    recentQuestionIds: [],
  });
  assert.equal(misconceptionRepair[0]?.question.id, "recent-misconception-item");
  assert.equal(misconceptionRepair[0]?.reason, "misconception_repair");
});

test("assessment grading supports deterministic partial credit", async () => {
  const assessments = new InMemoryAssessmentRepository();
  const partial = await assessments.grade(demoLearningIds.questions.checkpointTriangleArea, 15);
  assert.equal(partial?.correct, false);
  assert.equal(partial?.score, 0.5);
  assert.equal(partial?.misconceptionId, undefined);
});

test("diagnostics can assess multiple concepts in one submission", async () => {
  const app = await createApp({ logger: false });
  try {
    const response = await app.inject({
      method: "POST",
      url: "/api/learning/diagnostic",
      payload: {
        studentId: athenaDemoIds.students.lucia,
        courseId: athenaDemoIds.course,
        topicId: athenaDemoIds.topics.geometry,
        answers: [
          { questionId: demoLearningIds.questions.diagnosticTriangleArea, answer: 24 },
          {
            questionId: demoLearningIds.questions.diagnosticTriangleBaseHeight,
            answer: "Perpendicular",
          },
        ],
      },
    });
    assert.equal(response.statusCode, 200, response.body);
    const diagnostic = diagnosticResultSchema.parse(response.json());
    assert.equal(diagnostic.concepts.length, 2);
    assert.equal(diagnostic.strengths.includes("Base y altura de un triángulo"), true);
    const recommendations = await app.platform.events.list({ type: "TopicRecommended" });
    assert.equal(recommendations.length, 1);
  } finally {
    await app.close();
  }
});

test("quiz route returns adaptive learner-safe questions without answer keys", async () => {
  const app = await createApp({ logger: false });
  try {
    const response = await app.inject({
      method: "GET",
      url: `/api/learning/quiz/${athenaDemoIds.topics.geometry}?studentId=${athenaDemoIds.students.lucia}&courseId=${athenaDemoIds.course}&purpose=checkpoint&limit=2`,
    });
    assert.equal(response.statusCode, 200, response.body);
    const quiz = assessmentQuizSchema.parse(response.json());
    assert.equal(quiz.questions.length, 2);
    assert.equal(new Set(quiz.questions.map((question) => question.conceptId)).size, 2);
    for (const question of response.json().questions) {
      assert.equal("answerKey" in question, false);
      assert.equal("misconceptionAnswers" in question, false);
    }
  } finally {
    await app.close();
  }
});

test("checkpoint and retention submission ids are idempotent", async () => {
  const app = await createApp({
    logger: false,
    platform: {
      clock: fixedClock("2026-10-24T12:00:00.000Z"),
      ids: sequentialIdGenerator(700),
    },
  });
  try {
    const checkpointPayload = {
      submissionId: "checkpoint-submission-1",
      studentId: athenaDemoIds.students.lucia,
      courseId: athenaDemoIds.course,
      topicId: athenaDemoIds.topics.geometry,
      conceptId: demoLearningIds.concepts.triangleArea,
      questionId: demoLearningIds.questions.checkpointTriangleArea,
      answer: 30,
      strategy: "visual_decomposition",
      hintCount: 0,
    };
    const firstCheckpoint = await app.inject({
      method: "POST",
      url: "/api/learning/attempt",
      payload: checkpointPayload,
    });
    const duplicateCheckpoint = await app.inject({
      method: "POST",
      url: "/api/learning/attempt",
      payload: checkpointPayload,
    });
    assert.equal(firstCheckpoint.statusCode, 200, firstCheckpoint.body);
    assert.equal(duplicateCheckpoint.statusCode, 200, duplicateCheckpoint.body);
    assert.equal(
      checkpointResultSchema.parse(firstCheckpoint.json()).evidence.id,
      checkpointResultSchema.parse(duplicateCheckpoint.json()).evidence.id,
    );
    assert.equal((await app.platform.events.list({ type: "CheckpointCompleted" })).length, 1);

    const retentionPayload = {
      submissionId: "retention-submission-1",
      studentId: athenaDemoIds.students.lucia,
      courseId: athenaDemoIds.course,
      topicId: athenaDemoIds.topics.geometry,
      conceptId: demoLearningIds.concepts.triangleArea,
      questionId: demoLearningIds.questions.retentionTriangleArea,
      answer: 30,
    };
    const firstRetention = await app.inject({
      method: "POST",
      url: "/api/learning/retention-check",
      payload: retentionPayload,
    });
    const duplicateRetention = await app.inject({
      method: "POST",
      url: "/api/learning/retention-check",
      payload: retentionPayload,
    });
    assert.equal(firstRetention.statusCode, 200, firstRetention.body);
    assert.equal(duplicateRetention.statusCode, 200, duplicateRetention.body);
    assert.equal(
      retentionCheckResultSchema.parse(firstRetention.json()).evidence.id,
      retentionCheckResultSchema.parse(duplicateRetention.json()).evidence.id,
    );
    assert.equal((await app.platform.events.list({ type: "RetentionCheckPassed" })).length, 1);
  } finally {
    await app.close();
  }
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
    assert.equal(passed.mastery.mastery, 0.55);
    assert.deepEqual(passed.activeMisconceptionIds, []);
    assert.equal(passed.retention?.intervalDays, 1);

    const failedRetentionResponse = await app.inject({
      method: "POST",
      url: "/api/learning/retention-check",
      payload: {
        studentId: athenaDemoIds.students.lucia,
        courseId: athenaDemoIds.course,
        topicId: athenaDemoIds.topics.geometry,
        conceptId: demoLearningIds.concepts.triangleArea,
        questionId: demoLearningIds.questions.retentionTriangleArea,
        answer: 60,
      },
    });
    assert.equal(failedRetentionResponse.statusCode, 200, failedRetentionResponse.body);
    const failedRetention = retentionCheckResultSchema.parse(failedRetentionResponse.json());
    assert.equal(failedRetention.evidence.correct, false);
    assert.equal(failedRetention.mastery?.mastery, 0.55);
    assert.equal(failedRetention.masteryChanged, false);
    assert.equal(failedRetention.retention.successfulRecallStreak, 0);

    const passedRetentionResponse = await app.inject({
      method: "POST",
      url: "/api/learning/retention-check",
      payload: {
        studentId: athenaDemoIds.students.lucia,
        courseId: athenaDemoIds.course,
        topicId: athenaDemoIds.topics.geometry,
        conceptId: demoLearningIds.concepts.triangleArea,
        questionId: demoLearningIds.questions.retentionTriangleArea,
        answer: 30,
      },
    });
    assert.equal(passedRetentionResponse.statusCode, 200, passedRetentionResponse.body);
    const passedRetention = retentionCheckResultSchema.parse(passedRetentionResponse.json());
    assert.equal(passedRetention.evidence.correct, true);
    assert.equal(passedRetention.mastery?.mastery, 0.55);
    assert.equal(passedRetention.retention.successfulRecallStreak, 1);
    assert.equal((await app.platform.events.list({ type: "RetentionCheckPassed" })).length, 1);

    const stateResponse = await app.inject({
      method: "GET",
      url: `/api/learning/student/${athenaDemoIds.students.lucia}/state`,
    });
    assert.equal(stateResponse.statusCode, 200, stateResponse.body);
    const state = studentLearningStateSchema.parse(stateResponse.json());
    assert.equal(state.diagnostics.length, 1);
    assert.equal(state.mastery[0]?.mastery, 0.55);
    assert.equal(state.knowledge[0]?.evidenceCount, 5);
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
