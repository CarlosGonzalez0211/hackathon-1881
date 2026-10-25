import {
  assessmentQuizSchema,
  checkpointResultSchema,
  curriculumContextResponseSchema,
  diagnosticResultSchema,
  hintResultSchema,
  learningEvidenceSnapshotSchema,
  learningSessionSchema,
  learningSessionStartResultSchema,
  learningSessionSummarySchema,
  retentionCheckResultSchema,
  studentLearningPreferencesSchema,
  studentLearningStateSchema,
  topicRecommendationSchema,
  tutorMessageSchema,
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
  type HintResult,
  type HintSubmission,
  type LearningSession,
  type LearningSessionStart,
  type LearningSessionStartResult,
  type LearningSessionSummary,
  type LearningEvidenceSnapshot,
  type MisconceptionCandidate,
  type RetentionCheckResult,
  type RetentionCheckSubmission,
  type RetentionEvidence,
  type StrategyObservation,
  type StudentLearningPreferences,
  type StudentLearningPreferencesUpdate,
  type StudentLearningState,
  type StudentTopicMastery,
  type TeachingStrategy,
  type TopicRecommendation,
  type TutorMessage,
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
import {
  getKnowledgeTracingModel,
  updateKnowledgeProbability,
} from "./domain/knowledge-tracing.js";
import { calculateMastery } from "./domain/mastery.js";
import { scheduleRetention } from "./domain/retention.js";
import { selectAssessmentQuestions } from "./domain/question-selection.js";
import { rankRecommendations } from "./domain/recommendations.js";
import type { RecommendationCatalogPort } from "./recommendation-catalog.js";
import type { LearningRepository } from "./repository.js";
import type { MisconceptionClassifier } from "./misconception-classifier.js";
import type { CurriculumContextPort, TutorProvider } from "./ports.js";

export class LearningService {
  constructor(
    private readonly repository: LearningRepository,
    private readonly assessments: AssessmentRepository,
    private readonly authorization: AuthorizationService,
    private readonly events: DomainEventStore,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    private readonly recommendationCatalog: RecommendationCatalogPort,
    private readonly misconceptionClassifier: MisconceptionClassifier,
    private readonly curriculumContext: CurriculumContextPort,
    private readonly tutorProvider: TutorProvider,
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
    const enrichedScored = await Promise.all(
      scored.map(async (item) => ({
        ...item,
        misconceptionCandidates:
          !item.result.correct && !item.result.misconceptionId
            ? await this.misconceptionClassifier.classify({
                questionId: item.result.question.id,
                conceptId: item.result.question.conceptId,
                answer: item.answer.answer,
              })
            : [],
      })),
    );
    const concepts = this.toConceptResults(enrichedScored);
    const misconceptionIds = [...new Set(concepts.flatMap((value) => value.misconceptionIds))];
    const activeMisconceptions = await this.repository.listActiveMisconceptions(
      submission.studentId,
      submission.topicId,
    );
    await this.repository.setActiveMisconceptions(submission.studentId, submission.topicId, [
      ...new Set([...activeMisconceptions, ...misconceptionIds]),
    ]);
    for (const item of enrichedScored) {
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
    for (const misconceptionId of misconceptionIds) {
      await this.repository.recordMisconceptionIdentified({
        studentId: submission.studentId,
        topicId: submission.topicId,
        misconceptionId,
        status: "active",
        identifiedAt: completedAt,
        evidenceIds: [result.attemptId],
      });
    }
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
    const preferences = await this.repository.getLearningPreferences(submission.studentId);
    if (
      submission.preferredNextStrategy &&
      preferences?.blockedStrategies.includes(submission.preferredNextStrategy)
    ) {
      throw new PlatformError("The requested strategy is blocked by learning preferences", 400);
    }
    const defaultStrategies: TeachingStrategy[] = [
      "worked_example",
      "visual_decomposition",
      "guided_questioning",
    ];
    const allowedStrategies = defaultStrategies.filter(
      (strategy) => !preferences?.blockedStrategies.includes(strategy),
    );
    if (allowedStrategies.length === 0) {
      throw new PlatformError("Learning preferences block every available strategy", 400);
    }
    const recentConceptEvidence = allEvidence
      .filter((attempt) => attempt.conceptId === submission.conceptId)
      .slice(-3);
    const educatorInterventionRecommended =
      recentConceptEvidence.length >= 3 &&
      recentConceptEvidence.every((attempt) => !attempt.correct);
    const preferredColdStart = preferences?.preferredStrategies.find((strategy) =>
      allowedStrategies.includes(strategy),
    );
    const recommendedStrategy =
      submission.preferredNextStrategy ??
      (updatedPosteriors.every((posterior) => posterior.observations === 0) && preferredColdStart
        ? preferredColdStart
        : selectTeachingStrategy({
            posteriors: updatedPosteriors,
            previousStrategy: submission.strategy,
            previousAttemptFailed: !graded.correct,
            allowedStrategies,
            random: this.random,
          }));
    const strategyReason = submission.preferredNextStrategy
      ? "student_override"
      : educatorInterventionRecommended
        ? "repeated_failure_intervention"
        : graded.correct
          ? "highest_expected_learning_gain"
          : "checkpoint_failed";
    const strategyExplanation = explainStrategyDecision({
      selected: recommendedStrategy,
      previous: submission.strategy,
      reason: strategyReason,
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
    if (misconceptionResolved) {
      for (const misconceptionId of activeBefore.filter((id) => !activeAfter.includes(id))) {
        await this.repository.recordMisconceptionResolved(
          submission.studentId,
          submission.topicId,
          misconceptionId,
          submittedAt,
          evidence.id,
        );
        await this.events.append({
          id: this.ids.next(),
          type: "MisconceptionResolved",
          aggregateType: "misconception",
          aggregateId: misconceptionId,
          actorId: context.userId,
          courseId: submission.courseId,
          studentId: submission.studentId,
          occurredAt: submittedAt,
          payload: {
            topicId: submission.topicId,
            misconceptionId,
            evidenceIds: [evidence.id],
          },
        });
      }
    }
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
          topicId: submission.topicId,
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
          reason: strategyReason,
          explanation: strategyExplanation,
          educatorInterventionRecommended,
          evidenceIds: [evidence.id],
        },
      });
    }

    const result = checkpointResultSchema.parse({
      evidence,
      mastery,
      activeMisconceptionIds: activeAfter,
      recommendedStrategy,
      strategyChanged: recommendedStrategy !== submission.strategy,
      strategyReason,
      strategyExplanation,
      educatorInterventionRecommended,
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
          evidenceIds: [evidence.id],
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

  async startLearningSession(
    context: AuthContext,
    input: LearningSessionStart,
  ): Promise<LearningSessionStartResult> {
    this.assertAccess(context, input.studentId, input.courseId);
    const now = this.clock.now().toISOString();
    const sessionId = this.ids.next();
    const draft = learningSessionSchema.parse({
      id: sessionId,
      studentId: input.studentId,
      courseId: input.courseId,
      topicId: input.topicId,
      conceptId: input.conceptId,
      objective: input.objective,
      strategy: input.strategy,
      curriculumVersion: input.curriculumVersion,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    const initialMessage = await this.buildGroundedTutorMessage({
      session: draft,
      query: input.objective,
      mode: "lesson",
      locale: input.locale,
    });
    const session = learningSessionSchema.parse({
      ...draft,
      status: initialMessage.unsupported ? "unsupported" : "active",
    });
    await this.repository.saveSession(session);
    await this.repository.saveTutorMessage(initialMessage);
    return learningSessionStartResultSchema.parse({ session, initialMessage });
  }

  async sendSessionMessage(
    context: AuthContext,
    sessionId: string,
    content: string,
  ): Promise<TutorMessage> {
    const session = await this.requireSession(context, sessionId);
    const now = this.clock.now().toISOString();
    await this.repository.saveTutorMessage(
      tutorMessageSchema.parse({
        id: this.ids.next(),
        sessionId,
        role: "student",
        content,
        citations: [],
        curriculumVersion: session.curriculumVersion,
        sourceIds: [],
        unsupported: false,
        createdAt: now,
      }),
    );
    const reply = await this.buildGroundedTutorMessage({
      session,
      query: content,
      studentMessage: content,
      mode: "message",
    });
    await this.repository.saveTutorMessage(reply);
    await this.repository.saveSession({
      ...session,
      status: reply.unsupported ? "unsupported" : "active",
      updatedAt: now,
    });
    return reply;
  }

  async requestHint(context: AuthContext, input: HintSubmission): Promise<HintResult> {
    this.assertAccess(context, input.studentId, input.courseId);
    const graded = await this.assessments.grade(input.questionId, input.currentAnswer);
    if (!graded) throw notFound("Assessment question", input.questionId);
    if (
      graded.question.topicId !== input.topicId ||
      graded.question.conceptId !== input.conceptId
    ) {
      throw new PlatformError("Question does not match the requested topic and concept", 400);
    }
    const now = this.clock.now().toISOString();
    let session = input.sessionId
      ? await this.requireSession(context, input.sessionId)
      : learningSessionSchema.parse({
          id: this.ids.next(),
          studentId: input.studentId,
          courseId: input.courseId,
          topicId: input.topicId,
          conceptId: input.conceptId,
          objective: `Give a hint for question ${input.questionId} without revealing the answer.`,
          strategy: input.strategy,
          curriculumVersion: input.curriculumVersion,
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
    if (!input.sessionId) await this.repository.saveSession(session);
    const message = await this.buildGroundedTutorMessage({
      session,
      query: `Hint for question ${input.questionId}`,
      mode: "hint",
    });
    session = {
      ...session,
      status: message.unsupported ? "unsupported" : "active",
      updatedAt: now,
    };
    await this.repository.saveSession(session);
    await this.repository.saveTutorMessage(message);
    return hintResultSchema.parse({ message, revealsAnswer: false });
  }

  async getSessionSummary(
    context: AuthContext,
    sessionId: string,
  ): Promise<LearningSessionSummary> {
    const session = await this.requireSession(context, sessionId);
    const messages = await this.repository.listTutorMessages(sessionId);
    return learningSessionSummarySchema.parse({
      sessionId,
      messageCount: messages.length,
      citedSourceIds: [...new Set(messages.flatMap((message) => message.sourceIds))],
      unsupported: session.status === "unsupported",
      completedAt: this.clock.now().toISOString(),
    });
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

  async getLearningEvidenceSnapshot(
    context: AuthContext,
    studentId: string,
    topicId: string,
  ): Promise<LearningEvidenceSnapshot> {
    if (!this.authorization.canAccessStudent(context, studentId)) {
      throw forbidden("You cannot view this student's learning evidence");
    }
    const [mastery, evidence, activeMisconceptionIds, misconceptions, observations] =
      await Promise.all([
        this.repository.getMastery(studentId, topicId),
        this.repository.listEvidence(studentId, topicId),
        this.repository.listActiveMisconceptions(studentId, topicId),
        this.repository.listMisconceptionMemory(studentId, topicId),
        this.repository.listStrategyObservations(studentId, topicId),
      ]);
    return learningEvidenceSnapshotSchema.parse({
      studentId,
      topicId,
      mastery,
      activeMisconceptionIds,
      misconceptions,
      resolvedMisconceptionEvidenceIds: evidence
        .filter((item) => item.misconceptionResolved)
        .map((item) => item.id),
      strategyEffectiveness: summarizeStrategyEffectiveness(observations),
      interventionSignals: buildInterventionSignals(evidence),
      generatedAt: this.clock.now().toISOString(),
    });
  }

  async updateLearningPreferences(
    context: AuthContext,
    studentId: string,
    update: StudentLearningPreferencesUpdate,
  ): Promise<StudentLearningPreferences> {
    if (!this.authorization.canAccessStudent(context, studentId)) {
      throw forbidden("You cannot update this student's learning preferences");
    }
    const previous = await this.repository.getLearningPreferences(studentId);
    const preferences = studentLearningPreferencesSchema.parse({
      studentId,
      preferredStrategies: update.preferredStrategies ?? previous?.preferredStrategies ?? [],
      blockedStrategies: update.blockedStrategies ?? previous?.blockedStrategies ?? [],
      requiresCaptions: update.requiresCaptions ?? previous?.requiresCaptions ?? false,
      reducedMotion: update.reducedMotion ?? previous?.reducedMotion ?? false,
      updatedAt: this.clock.now().toISOString(),
    });
    await this.repository.saveLearningPreferences(preferences);
    return preferences;
  }

  async getRecommendation(
    context: AuthContext,
    studentId: string,
    courseId: string,
  ): Promise<TopicRecommendation> {
    this.assertAccess(context, studentId, courseId);
    const topics = await this.recommendationCatalog.listTopics(courseId);
    if (topics.length === 0) throw notFound("Recommendation catalog", courseId);
    const [mastery, knowledge, activeMisconceptions, retention] = await Promise.all([
      this.repository.listMastery(studentId),
      this.repository.listKnowledge(studentId),
      this.repository.listActiveMisconceptions(studentId),
      this.repository.listRetention(studentId),
    ]);
    const masteryByTopic = Object.fromEntries(
      mastery.map((state) => [state.topicId, state.mastery]),
    );
    const candidates = await Promise.all(
      topics.map(async (topic) => {
        const conceptKnowledge = knowledge.filter((state) =>
          topic.conceptIds.includes(state.conceptId),
        );
        const averageKnowledge =
          conceptKnowledge.length === 0
            ? (masteryByTopic[topic.topicId] ?? 0)
            : average(conceptKnowledge.map((state) => state.probabilityKnown));
        const hasMisconception = activeMisconceptions.some((misconceptionId) =>
          topic.conceptIds.some((conceptId) => misconceptionId.startsWith(`${conceptId}.`)),
        );
        const retentionUrgency = retention.some(
          (schedule) =>
            topic.conceptIds.includes(schedule.conceptId) &&
            schedule.dueAt <= this.clock.now().toISOString(),
        )
          ? 1
          : 0;
        return {
          topicId: topic.topicId,
          prerequisiteTopicIds: topic.prerequisiteTopicIds,
          knowledgeGap: 1 - averageKnowledge,
          misconceptionSeverity: hasMisconception ? 1 : 0,
          retentionUrgency,
          teacherPriority: await this.repository.getTeacherPriority(courseId, topic.topicId),
        };
      }),
    );
    const top = rankRecommendations({ candidates, masteryByTopic })[0];
    if (!top) throw notFound("Eligible recommendation", studentId);
    const reason =
      (top.teacherPriority ?? 0) > 0
        ? "Your teacher prioritized this topic."
        : top.misconceptionSeverity > 0
          ? "This topic addresses an active misconception."
          : top.retentionUrgency > 0
            ? "This topic is due for retention practice."
            : "This is the largest eligible knowledge gap after prerequisite filtering.";
    return topicRecommendationSchema.parse({
      studentId,
      courseId,
      topicId: top.topicId,
      score: top.score,
      reason,
      prerequisiteTopicIds: top.prerequisiteTopicIds,
      generatedAt: this.clock.now().toISOString(),
    });
  }

  async setTeacherPriority(
    context: AuthContext,
    courseId: string,
    topicId: string,
    priority: number,
  ) {
    if (context.role !== "professor" && context.role !== "admin") {
      throw forbidden("Only professors can prioritize topics");
    }
    if (!this.authorization.canAccessCourse(context, courseId)) {
      throw forbidden("You cannot access this course");
    }
    await this.repository.saveTeacherPriority(courseId, topicId, priority);
    return { priority };
  }

  private assertAccess(context: AuthContext, studentId: string, courseId: string) {
    if (!this.authorization.canAccessStudent(context, studentId)) {
      throw forbidden("You cannot update this student");
    }
    if (!this.authorization.canAccessCourse(context, courseId)) {
      throw forbidden("You cannot access this course");
    }
  }

  private async requireSession(context: AuthContext, sessionId: string) {
    const session = await this.repository.getSession(sessionId);
    if (!session) throw notFound("Learning session", sessionId);
    this.assertAccess(context, session.studentId, session.courseId);
    return session;
  }

  private async buildGroundedTutorMessage(input: {
    session: LearningSession;
    query: string;
    studentMessage?: string;
    mode: "lesson" | "message" | "hint";
    locale?: "en" | "es";
  }): Promise<TutorMessage> {
    const response = curriculumContextResponseSchema.parse(
      await this.curriculumContext.retrieve({
        courseId: input.session.courseId,
        topicId: input.session.topicId,
        conceptId: input.session.conceptId,
        query: input.query,
        curriculumVersion: input.session.curriculumVersion,
        locale: input.locale,
        limit: 5,
      }),
    );
    const createdAt = this.clock.now().toISOString();
    if (response.unsupported) {
      return tutorMessageSchema.parse({
        id: this.ids.next(),
        sessionId: input.session.id,
        role: "tutor",
        content: `The approved course material cannot support this response (${response.unsupportedReason}).`,
        strategy: input.session.strategy,
        citations: [],
        curriculumVersion: response.curriculumVersion,
        sourceIds: [],
        unsupported: true,
        createdAt,
      });
    }
    if (response.curriculumVersion !== input.session.curriculumVersion) {
      throw new PlatformError("Retrieved curriculum version does not match the session", 400);
    }
    const generated = await this.tutorProvider.respond({
      objective: input.session.objective,
      strategy: input.session.strategy,
      evidence: response.chunks.map((chunk) => ({ text: chunk.text, citation: chunk.citation })),
      studentMessage: input.studentMessage,
      mode: input.mode,
    });
    if (!generated.unsupported && generated.citations.length === 0) {
      throw new PlatformError("Supported tutor responses require at least one citation", 400);
    }
    const allowedChunkIds = new Set(response.chunks.map((chunk) => chunk.citation.chunkId));
    if (generated.citations.some((citation) => !allowedChunkIds.has(citation.chunkId))) {
      throw new PlatformError("Tutor returned a citation outside the retrieved context", 400);
    }
    return tutorMessageSchema.parse({
      id: this.ids.next(),
      sessionId: input.session.id,
      role: "tutor",
      content: generated.content,
      strategy: input.session.strategy,
      citations: generated.citations,
      curriculumVersion: response.curriculumVersion,
      sourceIds: [...new Set(generated.citations.map((citation) => citation.materialId))],
      unsupported: generated.unsupported,
      createdAt,
    });
  }

  private toConceptResults(
    scored: {
      answer: { confidence?: number };
      result: ScoredAnswer;
      misconceptionCandidates: MisconceptionCandidate[];
    }[],
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
        misconceptionCandidates: values.flatMap((value) => value.misconceptionCandidates),
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
    const model = getKnowledgeTracingModel(conceptId);
    const knowledge: ConceptKnowledgeState = {
      studentId,
      conceptId,
      probabilityKnown: updateKnowledgeProbability(
        previous?.probabilityKnown ?? model.prior,
        correct,
        model,
      ),
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

function summarizeStrategyEffectiveness(observations: StrategyObservation[]) {
  const grouped = new Map<TeachingStrategy, StrategyObservation[]>();
  for (const observation of observations) {
    const values = grouped.get(observation.strategy) ?? [];
    values.push(observation);
    grouped.set(observation.strategy, values);
  }
  return [...grouped.entries()]
    .map(([strategy, values]) => ({
      strategy,
      attempts: values.length,
      averageReward: average(values.map((value) => value.reward)),
      misconceptionResolutions: values.filter((value) => value.misconceptionResolved).length,
    }))
    .sort((left, right) => left.strategy.localeCompare(right.strategy));
}

function buildInterventionSignals(evidence: CheckpointEvidence[]) {
  const byConcept = new Map<string, CheckpointEvidence[]>();
  for (const item of evidence) {
    const values = byConcept.get(item.conceptId) ?? [];
    values.push(item);
    byConcept.set(item.conceptId, values);
  }
  return [...byConcept.entries()].flatMap(([conceptId, values]) => {
    const recentFailures: CheckpointEvidence[] = [];
    for (const item of [...values].sort(
      (left, right) =>
        right.submittedAt.localeCompare(left.submittedAt) || right.id.localeCompare(left.id),
    )) {
      if (item.correct) break;
      recentFailures.push(item);
    }
    if (recentFailures.length < 3) return [];
    return [
      {
        conceptId,
        severity: recentFailures.length >= 5 ? ("high" as const) : ("medium" as const),
        reason: "repeated_checkpoint_failure" as const,
        recentFailureCount: recentFailures.length,
        evidenceIds: recentFailures.map((item) => item.id),
        recommendedAction:
          "Review the student's recent evidence and provide a teacher-guided explanation.",
      },
    ];
  });
}

function explainStrategyDecision(input: {
  selected: TeachingStrategy;
  previous: TeachingStrategy;
  reason:
    | "student_override"
    | "checkpoint_failed"
    | "highest_expected_learning_gain"
    | "repeated_failure_intervention";
}) {
  if (input.reason === "student_override") {
    return `You chose ${input.selected.replaceAll("_", " ")}; Athena will use it for the next explanation.`;
  }
  if (input.reason === "repeated_failure_intervention") {
    return `The last attempts still show difficulty, so Athena is switching from ${input.previous.replaceAll("_", " ")} to ${input.selected.replaceAll("_", " ")} and recommending educator support.`;
  }
  if (input.reason === "checkpoint_failed") {
    return `The previous approach did not produce a correct checkpoint, so Athena is trying ${input.selected.replaceAll("_", " ")} next.`;
  }
  return `${input.selected.replaceAll("_", " ")} currently has the strongest evidence for helping with this concept.`;
}
