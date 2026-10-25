import {
  checkpointEvidenceSchema,
  checkpointResultSchema,
  conceptKnowledgeStateSchema,
  demoStrategyPosteriors,
  diagnosticResultSchema,
  learningSessionSchema,
  misconceptionMemorySchema,
  retentionCheckResultSchema,
  retentionEvidenceSchema,
  retentionScheduleSchema,
  strategyObservationSchema,
  strategyPosteriorSchema,
  studentLearningPreferencesSchema,
  studentTopicMasterySchema,
  tutorMessageSchema,
  type CheckpointEvidence,
  type CheckpointResult,
  type ConceptKnowledgeState,
  type DiagnosticResult,
  type LearningSession,
  type MisconceptionMemory,
  type RetentionCheckResult,
  type RetentionEvidence,
  type RetentionSchedule,
  type StrategyObservation,
  type StrategyPosterior,
  type StudentLearningPreferences,
  type StudentTopicMastery,
  type TutorMessage,
} from "@athena/shared";
import { initializeStrategyPosteriors } from "./domain/strategy-selection.js";
import type { LearningRepository } from "./repository.js";
import type { LearningRestClient } from "./supabase-rest.js";

type Row = Record<string, unknown>;

export class SupabaseLearningRepository implements LearningRepository {
  constructor(private readonly rest: LearningRestClient) {}

  async saveDiagnostic(value: DiagnosticResult) {
    await this.rest.insert("diagnostic_attempts", {
      id: value.attemptId,
      student_id: value.studentId,
      course_id: value.courseId,
      topic_id: value.topicId,
      result: value,
      completed_at: value.completedAt,
    });
  }

  async listDiagnostics(studentId: string) {
    const rows = await this.rest.select<Row>("diagnostic_attempts", { student_id: studentId });
    return rows.map((row) => diagnosticResultSchema.parse(row.result));
  }

  async saveEvidence(value: CheckpointEvidence) {
    await this.rest.insert("checkpoint_evidence", checkpointEvidenceRow(value));
  }

  async listEvidence(studentId: string, topicId: string) {
    const rows = await this.rest.select<Row>("checkpoint_evidence", {
      student_id: studentId,
      topic_id: topicId,
    });
    return rows.map(parseCheckpointEvidence);
  }

  async getCheckpointResultBySubmissionId(studentId: string, submissionId: string) {
    const row = (
      await this.rest.select<Row>("checkpoint_evidence", {
        student_id: studentId,
        submission_id: submissionId,
      })
    )[0];
    return row?.result ? checkpointResultSchema.parse(row.result) : null;
  }

  async saveCheckpointResult(submissionId: string, value: CheckpointResult) {
    await this.rest.update(
      "checkpoint_evidence",
      { student_id: value.evidence.studentId, submission_id: submissionId },
      { result: value },
    );
  }

  async getMastery(studentId: string, topicId: string) {
    const row = (
      await this.rest.select<Row>("student_topic_mastery", {
        student_id: studentId,
        topic_id: topicId,
      })
    )[0];
    return row ? parseMastery(row) : null;
  }

  async listMastery(studentId: string) {
    return (await this.rest.select<Row>("student_topic_mastery", { student_id: studentId })).map(
      parseMastery,
    );
  }

  async saveMastery(value: StudentTopicMastery) {
    await this.rest.upsert(
      "student_topic_mastery",
      {
        student_id: value.studentId,
        topic_id: value.topicId,
        mastery: value.mastery,
        demonstrated_concept_ids: value.demonstratedConceptIds,
        evidence_ids: value.evidenceIds,
        confidence: value.confidence,
        updated_at: value.updatedAt,
      },
      "student_id,topic_id",
    );
  }

  async getKnowledge(studentId: string, conceptId: string) {
    const row = (
      await this.rest.select<Row>("student_concept_knowledge", {
        student_id: studentId,
        concept_id: conceptId,
      })
    )[0];
    return row ? parseKnowledge(row) : null;
  }

  async saveKnowledge(value: ConceptKnowledgeState) {
    await this.rest.upsert(
      "student_concept_knowledge",
      {
        student_id: value.studentId,
        concept_id: value.conceptId,
        probability_known: value.probabilityKnown,
        evidence_count: value.evidenceCount,
        updated_at: value.updatedAt,
      },
      "student_id,concept_id",
    );
  }

  async listKnowledge(studentId: string) {
    return (
      await this.rest.select<Row>("student_concept_knowledge", { student_id: studentId })
    ).map(parseKnowledge);
  }

  async setActiveMisconceptions(studentId: string, topicId: string, ids: readonly string[]) {
    await this.rest.update(
      "student_misconceptions",
      { student_id: studentId, topic_id: topicId },
      { active: false, resolved_at: new Date().toISOString() },
    );
    for (const misconceptionId of ids) {
      await this.rest.upsert(
        "student_misconceptions",
        {
          student_id: studentId,
          topic_id: topicId,
          misconception_id: misconceptionId,
          active: true,
          resolved_at: null,
        },
        "student_id,topic_id,misconception_id",
      );
    }
  }

  async listActiveMisconceptions(studentId: string, topicId?: string) {
    const rows = await this.rest.select<Row>("student_misconceptions", {
      student_id: studentId,
      active: "true",
      ...(topicId ? { topic_id: topicId } : {}),
    });
    return rows.map((row) => String(row.misconception_id));
  }

  async recordMisconceptionIdentified(value: MisconceptionMemory) {
    const filters = {
      student_id: value.studentId,
      topic_id: value.topicId,
      misconception_id: value.misconceptionId,
    };
    const existing = (await this.rest.select<Row>("student_misconceptions", filters))[0];
    await this.rest.upsert(
      "student_misconceptions",
      {
        ...filters,
        active: true,
        identified_at: existing?.identified_at ?? value.identifiedAt,
        resolved_at: null,
        evidence_ids: [
          ...new Set([...(toStringArray(existing?.evidence_ids) ?? []), ...value.evidenceIds]),
        ],
      },
      "student_id,topic_id,misconception_id",
    );
  }

  async recordMisconceptionResolved(
    studentId: string,
    topicId: string,
    misconceptionId: string,
    resolvedAt: string,
    evidenceId: string,
  ) {
    const filters = {
      student_id: studentId,
      topic_id: topicId,
      misconception_id: misconceptionId,
    };
    const existing = (await this.rest.select<Row>("student_misconceptions", filters))[0];
    await this.rest.upsert(
      "student_misconceptions",
      {
        ...filters,
        active: false,
        identified_at: existing?.identified_at ?? resolvedAt,
        resolved_at: resolvedAt,
        evidence_ids: [...new Set([...toStringArray(existing?.evidence_ids), evidenceId])],
      },
      "student_id,topic_id,misconception_id",
    );
  }

  async listMisconceptionMemory(studentId: string, topicId?: string) {
    const rows = await this.rest.select<Row>("student_misconceptions", {
      student_id: studentId,
      ...(topicId ? { topic_id: topicId } : {}),
    });
    return rows.map((row) =>
      misconceptionMemorySchema.parse({
        studentId: row.student_id,
        topicId: row.topic_id,
        misconceptionId: row.misconception_id,
        status: row.active ? "active" : "resolved",
        identifiedAt: row.identified_at,
        resolvedAt: row.resolved_at ?? undefined,
        evidenceIds: toStringArray(row.evidence_ids),
      }),
    );
  }

  async getStrategyPosteriors(studentId: string, contextKey: string) {
    const rows = await this.rest.select<Row>("strategy_posteriors", {
      student_id: studentId,
      context_key: contextKey,
    });
    if (rows.length === 0) {
      return initializeStrategyPosteriors(
        contextKey,
        demoStrategyPosteriors.filter((posterior) => posterior.contextKey === contextKey),
      );
    }
    return initializeStrategyPosteriors(
      contextKey,
      rows.map((row) =>
        strategyPosteriorSchema.parse({
          strategy: row.strategy,
          contextKey: row.context_key,
          alpha: Number(row.alpha),
          beta: Number(row.beta),
          observations: Number(row.observations),
        }),
      ),
    );
  }

  async saveStrategyPosterior(studentId: string, value: StrategyPosterior) {
    await this.rest.upsert(
      "strategy_posteriors",
      {
        student_id: studentId,
        context_key: value.contextKey,
        strategy: value.strategy,
        alpha: value.alpha,
        beta: value.beta,
        observations: value.observations,
      },
      "student_id,context_key,strategy",
    );
  }

  async saveStrategyObservation(value: StrategyObservation) {
    await this.rest.insert("strategy_observations", {
      id: value.id,
      student_id: value.studentId,
      topic_id: value.topicId,
      concept_id: value.conceptId,
      payload: value,
      observed_at: value.observedAt,
    });
  }

  async listStrategyObservations(studentId: string, topicId?: string) {
    const rows = await this.rest.select<Row>("strategy_observations", {
      student_id: studentId,
      ...(topicId ? { topic_id: topicId } : {}),
    });
    return rows.map((row) => strategyObservationSchema.parse(row.payload));
  }

  async saveRetention(value: RetentionSchedule) {
    await this.rest.upsert(
      "retention_schedules",
      {
        student_id: value.studentId,
        concept_id: value.conceptId,
        successful_recall_streak: value.successfulRecallStreak,
        interval_days: value.intervalDays,
        due_at: value.dueAt,
      },
      "student_id,concept_id",
    );
  }

  async listRetention(studentId: string) {
    return (await this.rest.select<Row>("retention_schedules", { student_id: studentId })).map(
      (row) =>
        retentionScheduleSchema.parse({
          studentId: row.student_id,
          conceptId: row.concept_id,
          successfulRecallStreak: Number(row.successful_recall_streak),
          intervalDays: Number(row.interval_days),
          dueAt: row.due_at,
        }),
    );
  }

  async getLearningPreferences(studentId: string) {
    const row = (
      await this.rest.select<Row>("student_learning_preferences", { student_id: studentId })
    )[0];
    return row?.preferences ? studentLearningPreferencesSchema.parse(row.preferences) : null;
  }

  async saveLearningPreferences(value: StudentLearningPreferences) {
    await this.rest.upsert(
      "student_learning_preferences",
      { student_id: value.studentId, preferences: value, updated_at: value.updatedAt },
      "student_id",
    );
  }

  async getTeacherPriority(courseId: string, topicId: string) {
    const row = (
      await this.rest.select<Row>("teacher_topic_priorities", {
        course_id: courseId,
        topic_id: topicId,
      })
    )[0];
    return row ? Number(row.priority) : 0;
  }

  async saveTeacherPriority(courseId: string, topicId: string, priority: number) {
    await this.rest.upsert(
      "teacher_topic_priorities",
      { course_id: courseId, topic_id: topicId, priority },
      "course_id,topic_id",
    );
  }

  async saveRetentionEvidence(value: RetentionEvidence) {
    await this.rest.insert("retention_evidence", {
      id: value.id,
      submission_id: value.submissionId,
      student_id: value.studentId,
      topic_id: value.topicId,
      concept_id: value.conceptId,
      question_id: value.questionId,
      correct: value.correct,
      score: value.score,
      scheduled_for: value.scheduledFor,
      checked_at: value.checkedAt,
    });
  }

  async listRetentionEvidence(studentId: string, conceptId?: string) {
    const rows = await this.rest.select<Row>("retention_evidence", {
      student_id: studentId,
      ...(conceptId ? { concept_id: conceptId } : {}),
    });
    return rows.map((row) =>
      retentionEvidenceSchema.parse({
        id: row.id,
        submissionId: row.submission_id ?? undefined,
        studentId: row.student_id,
        topicId: row.topic_id,
        conceptId: row.concept_id,
        questionId: row.question_id,
        correct: row.correct,
        score: Number(row.score),
        scheduledFor: row.scheduled_for,
        checkedAt: row.checked_at,
      }),
    );
  }

  async getRetentionResultBySubmissionId(studentId: string, submissionId: string) {
    const row = (
      await this.rest.select<Row>("retention_evidence", {
        student_id: studentId,
        submission_id: submissionId,
      })
    )[0];
    return row?.result ? retentionCheckResultSchema.parse(row.result) : null;
  }

  async saveRetentionResult(submissionId: string, value: RetentionCheckResult) {
    await this.rest.update(
      "retention_evidence",
      { student_id: value.evidence.studentId, submission_id: submissionId },
      { result: value },
    );
  }

  async saveSession(value: LearningSession) {
    await this.rest.upsert("learning_sessions", sessionRow(value), "id");
  }

  async getSession(sessionId: string) {
    const row = (await this.rest.select<Row>("learning_sessions", { id: sessionId }))[0];
    return row ? parseSession(row) : null;
  }

  async saveTutorMessage(value: TutorMessage) {
    await this.rest.insert("tutor_messages", {
      id: value.id,
      session_id: value.sessionId,
      role: value.role,
      content: value.content,
      strategy: value.strategy,
      citations: value.citations,
      curriculum_version: value.curriculumVersion,
      source_ids: value.sourceIds,
      unsupported: value.unsupported,
      created_at: value.createdAt,
    });
  }

  async listTutorMessages(sessionId: string) {
    return (await this.rest.select<Row>("tutor_messages", { session_id: sessionId })).map((row) =>
      tutorMessageSchema.parse({
        id: row.id,
        sessionId: row.session_id,
        role: row.role,
        content: row.content,
        strategy: row.strategy ?? undefined,
        citations: row.citations,
        curriculumVersion: Number(row.curriculum_version),
        sourceIds: row.source_ids,
        unsupported: row.unsupported,
        createdAt: row.created_at,
      }),
    );
  }
}

function checkpointEvidenceRow(value: CheckpointEvidence) {
  return {
    id: value.id,
    submission_id: value.submissionId,
    student_id: value.studentId,
    topic_id: value.topicId,
    concept_id: value.conceptId,
    question_id: value.questionId,
    correct: value.correct,
    score: value.score,
    difficulty: value.difficulty,
    strategy: value.strategy,
    hint_count: value.hintCount,
    evidence_eligible: value.evidenceEligible,
    misconception_resolved: value.misconceptionResolved,
    submitted_at: value.submittedAt,
  };
}

function parseCheckpointEvidence(row: Row) {
  return checkpointEvidenceSchema.parse({
    id: row.id,
    submissionId: row.submission_id ?? undefined,
    studentId: row.student_id,
    topicId: row.topic_id,
    conceptId: row.concept_id,
    questionId: row.question_id,
    correct: row.correct,
    score: Number(row.score),
    difficulty: Number(row.difficulty),
    strategy: row.strategy,
    hintCount: Number(row.hint_count),
    evidenceEligible: row.evidence_eligible,
    misconceptionResolved: row.misconception_resolved,
    submittedAt: row.submitted_at,
  });
}

function parseMastery(row: Row) {
  return studentTopicMasterySchema.parse({
    studentId: row.student_id,
    topicId: row.topic_id,
    mastery: Number(row.mastery),
    demonstratedConceptIds: row.demonstrated_concept_ids,
    evidenceIds: row.evidence_ids,
    confidence: Number(row.confidence),
    updatedAt: row.updated_at,
  });
}

function parseKnowledge(row: Row) {
  return conceptKnowledgeStateSchema.parse({
    studentId: row.student_id,
    conceptId: row.concept_id,
    probabilityKnown: Number(row.probability_known),
    evidenceCount: Number(row.evidence_count),
    updatedAt: row.updated_at,
  });
}

function sessionRow(value: LearningSession) {
  return {
    id: value.id,
    student_id: value.studentId,
    course_id: value.courseId,
    topic_id: value.topicId,
    concept_id: value.conceptId,
    objective: value.objective,
    strategy: value.strategy,
    curriculum_version: value.curriculumVersion,
    status: value.status,
    created_at: value.createdAt,
    updated_at: value.updatedAt,
  };
}

function parseSession(row: Row) {
  return learningSessionSchema.parse({
    id: row.id,
    studentId: row.student_id,
    courseId: row.course_id,
    topicId: row.topic_id,
    conceptId: row.concept_id,
    objective: row.objective,
    strategy: row.strategy,
    curriculumVersion: Number(row.curriculum_version),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}
