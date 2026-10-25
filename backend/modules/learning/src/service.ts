import {
  assessmentQuizSchema,
  checkpointResultSchema,
  diagnosticResultSchema,
  retentionCheckResultSchema,
  studentLearningStateSchema,
  type AssessmentPurpose,
  type AssessmentQuiz,
  type AuthContext,
  type CheckpointEvidence,
  type CheckpointResult,
  type CheckpointSubmission,
  type ConceptKnowledgeState,
  type ConceptResult,
  type DiagnosticResult,
  type DiagnosticSubmission,
  type RetentionCheckResult,
  type RetentionCheckSubmission,
  type RetentionEvidence,
  type StrategyObservation,
  type StudentLearningState,
  type StudentTopicMastery,
} from "@athena/shared";
import {
  PlatformError,
  forbidden,
  notFound,
  type AuthorizationService,
  type Clock,
  type DomainEventStore,
  type IdGenerator,
} from "@athena/platform";
import type { AssessmentRepository, ScoredAnswer } from "./assessment.js";
import {
  calculateStrategyReward,
  selectTeachingStrategy,
  updateStrategyPosterior,
} from "./domain/strategy-selection.js";
import { updateKnowledgeProbability } from "./domain/knowledge-tracing.js";
import { calculateMastery } from "./domain/mastery.js";
import { scheduleRetention } from "./domain/retention.js";
import { selectAssessmentQuestions } from "./domain/question-selection.js";
import type { LearningRepository } from "./repository.js";

export class LearningService {
  constructor(
    private readonly repository: LearningRepository,
    private readonly assessments: AssessmentRepository,
    private readonly authorization: AuthorizationService,
    private readonly events: DomainEventStore,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    private readonly random: () => number = Math.random,
  ) {}

  async submitDiagnostic(
    context: AuthContext,
    submission: DiagnosticSubmission,
  ): Promise<DiagnosticResult> {
    this.assertAccess(context, submission.studentId, submission.courseId);
    const scored = await Promise.all(
      submission.answers.map(async (answer) => {
        const result = await this.assessments.grade(answer.questionId, answer.answer);
        if (!result) throw notFound("Assessment question", answer.questionId);
        if (result.question.purpose !== "diagnostic") {
          throw new PlatformError("Question is not a diagnostic item", 400);
        }
        if (result.question.topicId !== submission.topicId) {
          throw new PlatformError("Question does not belong to the requested topic", 400);
        }
        return { answer, result };
      }),
    );

    const completedAt = this.clock.now().toISOString();
    const concepts = this.toConceptResults(scored);
    const misconceptionIds = [...new Set(concepts.flatMap((value) => value.misconceptionIds))];
    await this.repository.setActiveMisconceptions(
      submission.studentId,
      submission.topicId,
      misconceptionIds,
    );
    for (const item of scored) {
      await this.updateKnowledge(
        submission.studentId,
        item.result.question.conceptId,
        item.result.correct,
        completedAt,
      );
    }

    const firstStruggle = concepts.find((concept) => concept.status !== "mastered") ?? concepts[0];
    if (!firstStruggle) throw new PlatformError("Diagnostic produced no concept results", 400);
    const result = diagnosticResultSchema.parse({
      attemptId: this.ids.next(),
      studentId: submission.studentId,
      courseId: submission.courseId,
      topicId: submission.topicId,
      concepts,
      strengths: concepts
        .filter((concept) => concept.status === "mastered")
        .map((concept) => concept.conceptTitle),
      struggles: concepts
        .filter((concept) => concept.status !== "mastered")
        .map((concept) => concept.conceptTitle),
      recommendation: {
        topicId: submission.topicId,
        conceptId: firstStruggle.conceptId,
        reason:
          misconceptionIds.length > 0
            ? "Repair the identified misconception before advancing"
            : "Practice this concept to strengthen the current evidence",
        suggestedStrategy: "worked_example",
      },
      completedAt,
    });
    await this.repository.saveDiagnostic(result);
    await this.events.append({
      id: this.ids.next(),
      type: "DiagnosticCompleted",
      aggregateType: "diagnostic_attempt",
      aggregateId: result.attemptId,
      actorId: context.userId,
      courseId: submission.courseId,
      studentId: submission.studentId,
      occurredAt: completedAt,
      payload: {
        topicId: submission.topicId,
        conceptIds: concepts.map((value) => value.conceptId),
        misconceptionIds,
      },
    });
    for (const misconceptionId of misconceptionIds) {
      await this.events.append({
        id: this.ids.next(),
        type: "MisconceptionIdentified",
        aggregateType: "misconception",
        aggregateId: misconceptionId,
        actorId: context.userId,
        courseId: submission.courseId,
        studentId: submission.studentId,
        occurredAt: completedAt,
        payload: { topicId: submission.topicId, diagnosticAttemptId: result.attemptId },
      });
    }
    await this.events.append({
      id: this.ids.next(),
      type: "TopicRecommended",
      aggregateType: "student_topic_recommendation",
      aggregateId: submission.topicId,
      actorId: context.userId,
      courseId: submission.courseId,
      studentId: submission.studentId,
      occurredAt: completedAt,
      payload: {
        topicId: result.recommendation.topicId,
        conceptId: result.recommendation.conceptId,
        reason: result.recommendation.reason,
        suggestedStrategy: result.recommendation.suggestedStrategy,
      },
    });
    return result;
  }

  async submitCheckpoint(
    context: AuthContext,
    submission: CheckpointSubmission,
  ): Promise<CheckpointResult> {
    this.assertAccess(context, submission.studentId, submission.courseId);
    if (submission.submissionId) {
      const existing = await this.repository.getCheckpointResultBySubmissionId(
        submission.studentId,
        submission.submissionId,
      );
      if (existing) return existing;
    }
    const graded = await this.assessments.grade(submission.questionId, submission.answer);
    if (!graded) throw notFound("Assessment question", submission.questionId);
    if (graded.question.purpose !== "checkpoint") {
      throw new PlatformError("Question is not a checkpoint item", 400);
    }
    if (
      graded.question.topicId !== submission.topicId ||
      graded.question.conceptId !== submission.conceptId
    ) {
      throw new PlatformError("Question does not match the requested topic and concept", 400);
    }

    const submittedAt = this.clock.now().toISOString();
    const activeBefore = await this.repository.listActiveMisconceptions(
      submission.studentId,
      submission.topicId,
    );
    const misconceptionIdsForConcept = Object.values(graded.question.misconceptionAnswers);
    const activeAfter = graded.correct
      ? activeBefore.filter((id) => !misconceptionIdsForConcept.includes(id))
      : [
          ...new Set([
            ...activeBefore,
            ...(graded.misconceptionId ? [graded.misconceptionId] : []),
          ]),
        ];
    const misconceptionResolved = activeAfter.length < activeBefore.length;
    await this.repository.setActiveMisconceptions(
      submission.studentId,
      submission.topicId,
      activeAfter,
    );

    const evidence: CheckpointEvidence = {
      id: this.ids.next(),
      submissionId: submission.submissionId,
      studentId: submission.studentId,
      topicId: submission.topicId,
      conceptId: submission.conceptId,
      questionId: submission.questionId,
      correct: graded.correct,
      score: graded.score,
      difficulty: graded.question.difficulty,
      strategy: submission.strategy,
      hintCount: submission.hintCount,
      evidenceEligible: submission.hintCount === 0,
      misconceptionResolved,
      submittedAt,
    };
    await this.repository.saveEvidence(evidence);

    const previousMastery = await this.repository.getMastery(
      submission.studentId,
      submission.topicId,
    );
    const allEvidence = await this.repository.listEvidence(
      submission.studentId,
      submission.topicId,
    );
    const requiredConceptIds = await this.assessments.listRequiredConceptIds(submission.topicId);
    const calculation = calculateMastery({
      previous: previousMastery?.mastery ?? 0,
      attempts: allEvidence,
      requiredConceptIds,
    });
    const mastery: StudentTopicMastery = {
      studentId: submission.studentId,
      topicId: submission.topicId,
      mastery: calculation.next,
      demonstratedConceptIds: calculation.demonstratedConceptIds,
      evidenceIds: calculation.evidenceIds,
      confidence: calculation.confidence,
      updatedAt: submittedAt,
    };
    await this.repository.saveMastery(mastery);
    await this.updateKnowledge(
      submission.studentId,
      submission.conceptId,
      graded.correct,
      submittedAt,
    );

    const priorEvidence = allEvidence.at(-2);
    const reward = calculateStrategyReward({
      beforeScore: priorEvidence?.score ?? 0,
      afterScore: evidence.score,
      misconceptionResolved,
    });
    const posteriors = await this.repository.getStrategyPosteriors(
      submission.studentId,
      graded.question.strategyContextKey,
    );
    const usedPosterior = posteriors.find((value) => value.strategy === submission.strategy);
    const updatedPosteriors = usedPosterior
      ? posteriors.map((value) =>
          value.strategy === submission.strategy ? updateStrategyPosterior(value, reward) : value,
        )
      : posteriors;
    if (usedPosterior) {
      const updated = updateStrategyPosterior(usedPosterior, reward);
      await this.repository.saveStrategyPosterior(submission.studentId, updated);
      const observation: StrategyObservation = {
        id: this.ids.next(),
        studentId: submission.studentId,
        topicId: submission.topicId,
        conceptId: submission.conceptId,
        strategy: submission.strategy,
        contextKey: graded.question.strategyContextKey,
        beforeScore: priorEvidence?.score ?? 0,
        afterScore: evidence.score,
        misconceptionResolved,
        reward,
        observedAt: submittedAt,
      };
      await this.repository.saveStrategyObservation(observation);
    }
    const recommendedStrategy = selectTeachingStrategy({
      posteriors: updatedPosteriors,
      previousStrategy: submission.strategy,
      previousAttemptFailed: !graded.correct,
      allowedStrategies: ["worked_example", "visual_decomposition", "guided_questioning"],
      random: this.random,
    });

    const previousRetention = (await this.repository.listRetention(submission.studentId)).find(
      (value) => value.conceptId === submission.conceptId,
    );
    const retention =
      graded.correct && evidence.evidenceEligible
        ? scheduleRetention({
            studentId: submission.studentId,
            conceptId: submission.conceptId,
            recalledSuccessfully: true,
            previousSuccessfulRecallStreak: previousRetention?.successfulRecallStreak,
            now: this.clock.now(),
          })
        : undefined;
    if (retention) await this.repository.saveRetention(retention);

    await this.events.append({
      id: this.ids.next(),
      type: "CheckpointCompleted",
      aggregateType: "checkpoint_evidence",
      aggregateId: evidence.id,
      actorId: context.userId,
      courseId: submission.courseId,
      studentId: submission.studentId,
      occurredAt: submittedAt,
      payload: {
        topicId: submission.topicId,
        conceptId: submission.conceptId,
        correct: evidence.correct,
        evidenceEligible: evidence.evidenceEligible,
      },
    });
    if (mastery.mastery > (previousMastery?.mastery ?? 0)) {
      await this.events.append({
        id: this.ids.next(),
        type: "MasteryUpdated",
        aggregateType: "student_topic_mastery",
        aggregateId: submission.topicId,
        actorId: context.userId,
        courseId: submission.courseId,
        studentId: submission.studentId,
        occurredAt: submittedAt,
        payload: {
          previous: previousMastery?.mastery ?? 0,
          next: mastery.mastery,
          evidenceIds: mastery.evidenceIds,
          conceptIds: mastery.demonstratedConceptIds,
        },
      });
    }
    if (recommendedStrategy !== submission.strategy) {
      await this.events.append({
        id: this.ids.next(),
        type: "TeachingStrategySelected",
        aggregateType: "student_concept_strategy",
        aggregateId: submission.conceptId,
        actorId: context.userId,
        courseId: submission.courseId,
        studentId: submission.studentId,
        occurredAt: submittedAt,
        payload: {
          topicId: submission.topicId,
          previousStrategy: submission.strategy,
          selectedStrategy: recommendedStrategy,
          reason: graded.correct ? "highest_expected_learning_gain" : "checkpoint_failed",
        },
      });
    }

    const result = checkpointResultSchema.parse({
      evidence,
      mastery,
      activeMisconceptionIds: activeAfter,
      recommendedStrategy,
      strategyChanged: recommendedStrategy !== submission.strategy,
      retention,
    });
    if (submission.submissionId) {
      await this.repository.saveCheckpointResult(submission.submissionId, result);
    }
    return result;
  }

  async getQuiz(
    context: AuthContext,
    input: {
      studentId: string;
      courseId: string;
      topicId: string;
      purpose: AssessmentPurpose;
      limit: number;
    },
  ): Promise<AssessmentQuiz> {
    this.assertAccess(context, input.studentId, input.courseId);
    const questions = await this.assessments.listByTopic(input.topicId, input.purpose);
    if (questions.length === 0) throw notFound("Assessment questions", input.topicId);

    const [knowledge, mastery, evidence, activeMisconceptions, requiredConceptIds] =
      await Promise.all([
        this.repository.listKnowledge(input.studentId),
        this.repository.getMastery(input.studentId, input.topicId),
        this.repository.listEvidence(input.studentId, input.topicId),
        this.repository.listActiveMisconceptions(input.studentId, input.topicId),
        this.assessments.listRequiredConceptIds(input.topicId),
      ]);
    const knowledgeByConcept = Object.fromEntries(
      knowledge.map((state) => [state.conceptId, state.probabilityKnown]),
    );
    const required = new Set(requiredConceptIds);
    const selected = selectAssessmentQuestions({
      candidates: questions.map((question) => ({
        ...question,
        requiredForMastery: required.has(question.conceptId),
      })),
      purpose: input.purpose,
      limit: input.limit,
      knowledgeByConcept,
      demonstratedConceptIds: mastery?.demonstratedConceptIds ?? [],
      activeMisconceptionIds: activeMisconceptions,
      recentQuestionIds: evidence.slice(-5).map((attempt) => attempt.questionId),
    });
    if (selected.length === 0) throw notFound("Assessment questions", input.topicId);

    return assessmentQuizSchema.parse({
      studentId: input.studentId,
      courseId: input.courseId,
      topicId: input.topicId,
      purpose: input.purpose,
      questions: selected.map(({ question, reason }) => ({
        id: question.id,
        topicId: question.topicId,
        conceptId: question.conceptId,
        purpose: question.purpose,
        prompt: question.prompt,
        format: question.format,
        ...(question.format === "multiple_choice" ? { choices: question.choices } : {}),
        difficulty: question.difficulty,
        selectionReason: reason,
      })),
    });
  }

  async submitRetentionCheck(
    context: AuthContext,
    submission: RetentionCheckSubmission,
  ): Promise<RetentionCheckResult> {
    this.assertAccess(context, submission.studentId, submission.courseId);
    if (submission.submissionId) {
      const existing = await this.repository.getRetentionResultBySubmissionId(
        submission.studentId,
        submission.submissionId,
      );
      if (existing) return existing;
    }
    const graded = await this.assessments.grade(submission.questionId, submission.answer);
    if (!graded) throw notFound("Assessment question", submission.questionId);
    if (graded.question.purpose !== "retention") {
      throw new PlatformError("Question is not a retention item", 400);
    }
    if (
      graded.question.topicId !== submission.topicId ||
      graded.question.conceptId !== submission.conceptId
    ) {
      throw new PlatformError("Question does not match the requested topic and concept", 400);
    }

    const previousRetention = (await this.repository.listRetention(submission.studentId)).find(
      (value) => value.conceptId === submission.conceptId,
    );
    if (!previousRetention) throw notFound("Retention schedule", submission.conceptId);

    const checkedAt = this.clock.now().toISOString();
    const evidence: RetentionEvidence = {
      id: this.ids.next(),
      submissionId: submission.submissionId,
      studentId: submission.studentId,
      topicId: submission.topicId,
      conceptId: submission.conceptId,
      questionId: submission.questionId,
      correct: graded.correct,
      score: graded.score,
      scheduledFor: previousRetention.dueAt,
      checkedAt,
    };
    await this.repository.saveRetentionEvidence(evidence);
    await this.updateKnowledge(
      submission.studentId,
      submission.conceptId,
      graded.correct,
      checkedAt,
    );
    const retention = scheduleRetention({
      studentId: submission.studentId,
      conceptId: submission.conceptId,
      recalledSuccessfully: graded.correct,
      previousSuccessfulRecallStreak: previousRetention.successfulRecallStreak,
      now: this.clock.now(),
    });
    await this.repository.saveRetention(retention);
    const mastery = await this.repository.getMastery(submission.studentId, submission.topicId);

    if (graded.correct) {
      await this.events.append({
        id: this.ids.next(),
        type: "RetentionCheckPassed",
        aggregateType: "retention_evidence",
        aggregateId: evidence.id,
        actorId: context.userId,
        courseId: submission.courseId,
        studentId: submission.studentId,
        occurredAt: checkedAt,
        payload: {
          topicId: submission.topicId,
          conceptId: submission.conceptId,
          intervalDays: retention.intervalDays,
        },
      });
    }

    const result = retentionCheckResultSchema.parse({
      evidence,
      retention,
      mastery,
      masteryChanged: false,
    });
    if (submission.submissionId) {
      await this.repository.saveRetentionResult(submission.submissionId, result);
    }
    return result;
  }

  async getStudentState(context: AuthContext, studentId: string): Promise<StudentLearningState> {
    if (!this.authorization.canAccessStudent(context, studentId)) {
      throw forbidden("You cannot view this student");
    }
    return studentLearningStateSchema.parse({
      studentId,
      diagnostics: await this.repository.listDiagnostics(studentId),
      mastery: await this.repository.listMastery(studentId),
      knowledge: await this.repository.listKnowledge(studentId),
      activeMisconceptionIds: await this.repository.listActiveMisconceptions(studentId),
      retention: await this.repository.listRetention(studentId),
    });
  }

  private assertAccess(context: AuthContext, studentId: string, courseId: string) {
    if (!this.authorization.canAccessStudent(context, studentId)) {
      throw forbidden("You cannot update this student");
    }
    if (!this.authorization.canAccessCourse(context, courseId)) {
      throw forbidden("You cannot access this course");
    }
  }

  private toConceptResults(
    scored: { answer: { confidence?: number }; result: ScoredAnswer }[],
  ): ConceptResult[] {
    const grouped = new Map<string, typeof scored>();
    for (const item of scored) {
      const values = grouped.get(item.result.question.conceptId) ?? [];
      values.push(item);
      grouped.set(item.result.question.conceptId, values);
    }
    return [...grouped.entries()].map(([conceptId, values]) => {
      const score = average(values.map((value) => value.result.score));
      const confidence = average(values.map((value) => value.answer.confidence ?? 0.5));
      const title = values[0]?.result.question.conceptTitle;
      if (!title) throw new PlatformError("Concept has no assessment definition", 400);
      return {
        conceptId,
        conceptTitle: title,
        score,
        confidence,
        status: score >= 0.8 ? "mastered" : score >= 0.5 ? "partial" : "struggling",
        misconceptionIds: [
          ...new Set(
            values.flatMap((value) =>
              value.result.misconceptionId ? [value.result.misconceptionId] : [],
            ),
          ),
        ],
      };
    });
  }

  private async updateKnowledge(
    studentId: string,
    conceptId: string,
    correct: boolean,
    updatedAt: string,
  ) {
    const previous = await this.repository.getKnowledge(studentId, conceptId);
    const knowledge: ConceptKnowledgeState = {
      studentId,
      conceptId,
      probabilityKnown: updateKnowledgeProbability(previous?.probabilityKnown ?? 0.2, correct),
      evidenceCount: (previous?.evidenceCount ?? 0) + 1,
      updatedAt,
    };
    await this.repository.saveKnowledge(knowledge);
  }
}

function average(values: number[]) {
  return values.length === 0
    ? 0
    : values.reduce((total, value) => total + value, 0) / values.length;
}
