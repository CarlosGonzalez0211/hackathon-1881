import { z } from "zod";
import { citationSchema } from "./curriculum.js";
import { idSchema, isoDateSchema } from "./common.js";

/** Proposed GAMEPLAN contracts. Coordinate with the team before treating these as frozen. */
export const houseStatusSchema = z.enum(["locked", "available", "in_progress", "done"]);
export const houseStateSchema = z.object({
  topicId: z.string().min(1),
  title: z.string().min(1),
  slot: z.number().int().nonnegative(),
  status: houseStatusSchema,
  progress: z.number().min(0).max(1),
});
export type HouseState = z.infer<typeof houseStateSchema>;

export const planetStateSchema = z.object({
  studentId: z.string().min(1),
  // Developer-defined identity. This is not a user appearance picker.
  theme: z.object({ palette: z.string().min(1), character: z.string().min(1) }),
  growth: z.number().min(0).max(1),
  houses: z.array(houseStateSchema).superRefine((houses, ctx) => {
    const slots = new Set<number>();
    for (const [index, house] of houses.entries()) {
      if (slots.has(house.slot))
        ctx.addIssue({
          code: "custom",
          path: [index, "slot"],
          message: "A planet slot can contain only one topic",
        });
      slots.add(house.slot);
    }
  }),
});
export type PlanetState = z.infer<typeof planetStateSchema>;

export const aiEventKindSchema = z.enum([
  "chat",
  "podcast",
  "video",
  "summary",
  "hint",
  "quiz_answer",
]);
export const aiEventSchema = z.object({
  studentId: z.string().min(1),
  topicId: z.string().min(1),
  kind: aiEventKindSchema,
  at: z.string().datetime(),
  meta: z.record(z.unknown()),
});
export type AiEvent = z.infer<typeof aiEventSchema>;
const aiUsageSchema = z.object({
  chat: z.number().int().nonnegative(),
  podcast: z.number().int().nonnegative(),
  video: z.number().int().nonnegative(),
  summary: z.number().int().nonnegative(),
  hint: z.number().int().nonnegative(),
  quiz_answer: z.number().int().nonnegative(),
});
const topicProgressSchema = z.object({
  topicId: z.string(),
  title: z.string(),
  progress: z.number().min(0).max(1),
});
export const classSummarySchema = z.object({
  classId: z.string().min(1),
  topics: z.array(topicProgressSchema),
  aiUsage: aiUsageSchema,
  students: z.array(
    z.object({
      studentId: z.string(),
      growth: z.number().min(0).max(1),
      topics: z.array(topicProgressSchema),
      aiUsage: aiUsageSchema,
    }),
  ),
});
export type ClassSummary = z.infer<typeof classSummarySchema>;

/** Adaptive-learning contracts owned by Subsystem 2. */
export const teachingStrategySchema = z.enum([
  "concise_text",
  "deep_explanation",
  "worked_example",
  "visual_decomposition",
  "guided_questioning",
  "practice_first",
  "storytelling",
  "audio_summary",
  "podcast",
  "flashcards",
]);
export type TeachingStrategy = z.infer<typeof teachingStrategySchema>;

export const studentLearningPreferencesSchema = z
  .object({
    studentId: idSchema,
    preferredStrategies: z.array(teachingStrategySchema).max(5).default([]),
    blockedStrategies: z.array(teachingStrategySchema).max(10).default([]),
    requiresCaptions: z.boolean().default(false),
    reducedMotion: z.boolean().default(false),
    updatedAt: isoDateSchema,
  })
  .superRefine((preferences, ctx) => {
    const blocked = new Set(preferences.blockedStrategies);
    preferences.preferredStrategies.forEach((strategy, index) => {
      if (blocked.has(strategy)) {
        ctx.addIssue({
          code: "custom",
          path: ["preferredStrategies", index],
          message: "A preferred strategy cannot also be blocked",
        });
      }
    });
  });
export type StudentLearningPreferences = z.infer<typeof studentLearningPreferencesSchema>;

export const studentLearningPreferencesUpdateSchema = z.object({
  preferredStrategies: z.array(teachingStrategySchema).max(5).optional(),
  blockedStrategies: z.array(teachingStrategySchema).max(10).optional(),
  requiresCaptions: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
});
export type StudentLearningPreferencesUpdate = z.infer<
  typeof studentLearningPreferencesUpdateSchema
>;

export const strategyDecisionReasonSchema = z.enum([
  "student_override",
  "checkpoint_failed",
  "highest_expected_learning_gain",
  "repeated_failure_intervention",
]);
export type StrategyDecisionReason = z.infer<typeof strategyDecisionReasonSchema>;

export const conceptStatusSchema = z.enum(["mastered", "partial", "struggling", "unassessed"]);
export type ConceptStatus = z.infer<typeof conceptStatusSchema>;

export const assessmentPurposeSchema = z.enum(["diagnostic", "checkpoint", "retention"]);
export type AssessmentPurpose = z.infer<typeof assessmentPurposeSchema>;

export const questionSelectionReasonSchema = z.enum([
  "uncovered_required_concept",
  "misconception_repair",
  "transfer_practice",
  "difficulty_match",
  "review",
]);
export type QuestionSelectionReason = z.infer<typeof questionSelectionReasonSchema>;

const assessmentQuestionBaseSchema = z.object({
  id: idSchema,
  topicId: idSchema,
  conceptId: idSchema,
  purpose: assessmentPurposeSchema,
  prompt: z.string().min(1),
  difficulty: z.number().min(0).max(1),
  selectionReason: questionSelectionReasonSchema,
});

export const learnerAssessmentQuestionSchema = z.discriminatedUnion("format", [
  assessmentQuestionBaseSchema.extend({ format: z.literal("numeric") }),
  assessmentQuestionBaseSchema.extend({
    format: z.literal("multiple_choice"),
    choices: z.array(z.string().min(1)).min(2),
  }),
  assessmentQuestionBaseSchema.extend({ format: z.literal("short_text") }),
]);
export type LearnerAssessmentQuestion = z.infer<typeof learnerAssessmentQuestionSchema>;

export const assessmentQuizSchema = z
  .object({
    studentId: idSchema,
    courseId: idSchema,
    topicId: idSchema,
    purpose: assessmentPurposeSchema,
    questions: z.array(learnerAssessmentQuestionSchema).min(1),
  })
  .superRefine((quiz, ctx) => {
    quiz.questions.forEach((question, index) => {
      if (question.topicId !== quiz.topicId) {
        ctx.addIssue({
          code: "custom",
          path: ["questions", index, "topicId"],
          message: "Question topic must match the quiz topic",
        });
      }
      if (question.purpose !== quiz.purpose) {
        ctx.addIssue({
          code: "custom",
          path: ["questions", index, "purpose"],
          message: "Question purpose must match the quiz purpose",
        });
      }
    });
  });
export type AssessmentQuiz = z.infer<typeof assessmentQuizSchema>;

export const topicRecommendationSchema = z.object({
  studentId: idSchema,
  courseId: idSchema,
  topicId: idSchema,
  score: z.number().min(0).max(1),
  reason: z.string().min(1),
  prerequisiteTopicIds: z.array(idSchema),
  generatedAt: isoDateSchema,
});
export type TopicRecommendation = z.infer<typeof topicRecommendationSchema>;

export const teacherPriorityOverrideSchema = z.object({
  priority: z.number().min(0).max(1),
});
export type TeacherPriorityOverride = z.infer<typeof teacherPriorityOverrideSchema>;

export const diagnosticAnswerSchema = z.object({
  questionId: idSchema,
  answer: z.unknown(),
  confidence: z.number().min(0).max(1).optional(),
});
export type DiagnosticAnswer = z.infer<typeof diagnosticAnswerSchema>;

export const misconceptionCandidateSchema = z.object({
  misconceptionId: idSchema,
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(1),
  source: z.literal("model_candidate"),
  reviewRequired: z.literal(true),
});
export type MisconceptionCandidate = z.infer<typeof misconceptionCandidateSchema>;

export const diagnosticSubmissionSchema = z.object({
  studentId: idSchema,
  courseId: idSchema,
  topicId: idSchema,
  answers: z.array(diagnosticAnswerSchema).min(1),
});
export type DiagnosticSubmission = z.infer<typeof diagnosticSubmissionSchema>;

export const conceptResultSchema = z.object({
  conceptId: idSchema,
  conceptTitle: z.string().min(1),
  score: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  status: conceptStatusSchema,
  misconceptionIds: z.array(idSchema),
  misconceptionCandidates: z.array(misconceptionCandidateSchema),
});
export type ConceptResult = z.infer<typeof conceptResultSchema>;

export const diagnosticResultSchema = z.object({
  attemptId: idSchema,
  studentId: idSchema,
  courseId: idSchema,
  topicId: idSchema,
  concepts: z.array(conceptResultSchema),
  strengths: z.array(z.string()),
  struggles: z.array(z.string()),
  recommendation: z.object({
    topicId: idSchema,
    conceptId: idSchema.optional(),
    reason: z.string().min(1),
    suggestedStrategy: teachingStrategySchema,
  }),
  completedAt: isoDateSchema,
});
export type DiagnosticResult = z.infer<typeof diagnosticResultSchema>;

export const checkpointSubmissionSchema = z.object({
  submissionId: idSchema.optional(),
  studentId: idSchema,
  courseId: idSchema,
  topicId: idSchema,
  conceptId: idSchema,
  questionId: idSchema,
  answer: z.unknown(),
  strategy: teachingStrategySchema,
  preferredNextStrategy: teachingStrategySchema.optional(),
  hintCount: z.number().int().nonnegative().default(0),
});
export type CheckpointSubmission = z.infer<typeof checkpointSubmissionSchema>;

export const checkpointEvidenceSchema = z.object({
  id: idSchema,
  submissionId: idSchema.optional(),
  studentId: idSchema,
  topicId: idSchema,
  conceptId: idSchema,
  questionId: idSchema,
  correct: z.boolean(),
  score: z.number().min(0).max(1),
  difficulty: z.number().min(0).max(1),
  strategy: teachingStrategySchema,
  hintCount: z.number().int().nonnegative(),
  evidenceEligible: z.boolean(),
  misconceptionResolved: z.boolean(),
  submittedAt: isoDateSchema,
});
export type CheckpointEvidence = z.infer<typeof checkpointEvidenceSchema>;

export const studentTopicMasterySchema = z.object({
  studentId: idSchema,
  topicId: idSchema,
  mastery: z.number().min(0).max(1),
  demonstratedConceptIds: z.array(idSchema),
  evidenceIds: z.array(idSchema),
  confidence: z.number().min(0).max(1),
  updatedAt: isoDateSchema,
});
export type StudentTopicMastery = z.infer<typeof studentTopicMasterySchema>;

export const strategyPosteriorSchema = z.object({
  strategy: teachingStrategySchema,
  contextKey: z.string().min(1),
  alpha: z.number().positive(),
  beta: z.number().positive(),
  observations: z.number().int().nonnegative(),
});
export type StrategyPosterior = z.infer<typeof strategyPosteriorSchema>;

export const strategyObservationSchema = z.object({
  id: idSchema,
  studentId: idSchema,
  topicId: idSchema,
  conceptId: idSchema,
  strategy: teachingStrategySchema,
  contextKey: z.string().min(1),
  beforeScore: z.number().min(0).max(1),
  afterScore: z.number().min(0).max(1),
  misconceptionResolved: z.boolean(),
  retentionPassed: z.boolean().optional(),
  reward: z.number().min(0).max(1),
  observedAt: isoDateSchema,
});
export type StrategyObservation = z.infer<typeof strategyObservationSchema>;

export const strategyEffectivenessSummarySchema = z.object({
  strategy: teachingStrategySchema,
  attempts: z.number().int().nonnegative(),
  averageReward: z.number().min(0).max(1),
  misconceptionResolutions: z.number().int().nonnegative(),
});
export type StrategyEffectivenessSummary = z.infer<typeof strategyEffectivenessSummarySchema>;

export const educatorInterventionSignalSchema = z.object({
  conceptId: idSchema,
  severity: z.enum(["medium", "high"]),
  reason: z.literal("repeated_checkpoint_failure"),
  recentFailureCount: z.number().int().min(3),
  evidenceIds: z.array(idSchema).min(3),
  recommendedAction: z.string().min(1),
});
export type EducatorInterventionSignal = z.infer<typeof educatorInterventionSignalSchema>;

export const learningEvidenceSnapshotSchema = z.object({
  studentId: idSchema,
  topicId: idSchema,
  mastery: studentTopicMasterySchema.nullable(),
  activeMisconceptionIds: z.array(idSchema),
  resolvedMisconceptionEvidenceIds: z.array(idSchema),
  strategyEffectiveness: z.array(strategyEffectivenessSummarySchema),
  interventionSignals: z.array(educatorInterventionSignalSchema),
  generatedAt: isoDateSchema,
});
export type LearningEvidenceSnapshot = z.infer<typeof learningEvidenceSnapshotSchema>;

export const conceptKnowledgeStateSchema = z.object({
  studentId: idSchema,
  conceptId: idSchema,
  probabilityKnown: z.number().min(0).max(1),
  evidenceCount: z.number().int().nonnegative(),
  updatedAt: isoDateSchema,
});
export type ConceptKnowledgeState = z.infer<typeof conceptKnowledgeStateSchema>;

export const retentionScheduleSchema = z.object({
  studentId: idSchema,
  conceptId: idSchema,
  successfulRecallStreak: z.number().int().nonnegative(),
  intervalDays: z.number().int().positive(),
  dueAt: isoDateSchema,
});
export type RetentionSchedule = z.infer<typeof retentionScheduleSchema>;

export const retentionCheckSubmissionSchema = z.object({
  submissionId: idSchema.optional(),
  studentId: idSchema,
  courseId: idSchema,
  topicId: idSchema,
  conceptId: idSchema,
  questionId: idSchema,
  answer: z.unknown(),
});
export type RetentionCheckSubmission = z.infer<typeof retentionCheckSubmissionSchema>;

export const retentionEvidenceSchema = z.object({
  id: idSchema,
  submissionId: idSchema.optional(),
  studentId: idSchema,
  topicId: idSchema,
  conceptId: idSchema,
  questionId: idSchema,
  correct: z.boolean(),
  score: z.number().min(0).max(1),
  scheduledFor: isoDateSchema,
  checkedAt: isoDateSchema,
});
export type RetentionEvidence = z.infer<typeof retentionEvidenceSchema>;

export const retentionCheckResultSchema = z.object({
  evidence: retentionEvidenceSchema,
  retention: retentionScheduleSchema,
  mastery: studentTopicMasterySchema.nullable(),
  masteryChanged: z.literal(false),
});
export type RetentionCheckResult = z.infer<typeof retentionCheckResultSchema>;

export const checkpointResultSchema = z.object({
  evidence: checkpointEvidenceSchema,
  mastery: studentTopicMasterySchema,
  activeMisconceptionIds: z.array(idSchema),
  recommendedStrategy: teachingStrategySchema,
  strategyChanged: z.boolean(),
  strategyReason: strategyDecisionReasonSchema,
  strategyExplanation: z.string().min(1),
  educatorInterventionRecommended: z.boolean(),
  retention: retentionScheduleSchema.optional(),
});
export type CheckpointResult = z.infer<typeof checkpointResultSchema>;

export const tutorMessageSchema = z.object({
  id: idSchema,
  sessionId: idSchema,
  role: z.enum(["student", "tutor"]),
  content: z.string().min(1),
  strategy: teachingStrategySchema.optional(),
  citations: z.array(citationSchema),
  curriculumVersion: z.number().int().positive(),
  sourceIds: z.array(idSchema),
  unsupported: z.boolean().default(false),
  createdAt: isoDateSchema,
});
export type TutorMessage = z.infer<typeof tutorMessageSchema>;

export const learningSessionStatusSchema = z.enum(["active", "unsupported", "completed"]);
export type LearningSessionStatus = z.infer<typeof learningSessionStatusSchema>;

export const learningSessionSchema = z.object({
  id: idSchema,
  studentId: idSchema,
  courseId: idSchema,
  topicId: idSchema,
  conceptId: idSchema,
  objective: z.string().min(1),
  strategy: teachingStrategySchema,
  curriculumVersion: z.number().int().positive(),
  status: learningSessionStatusSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type LearningSession = z.infer<typeof learningSessionSchema>;

export const learningSessionStartSchema = z.object({
  studentId: idSchema,
  courseId: idSchema,
  topicId: idSchema,
  conceptId: idSchema,
  objective: z.string().trim().min(1).max(1_000),
  strategy: teachingStrategySchema,
  curriculumVersion: z.number().int().positive(),
  locale: z.enum(["en", "es"]).optional(),
});
export type LearningSessionStart = z.infer<typeof learningSessionStartSchema>;

export const learningSessionStartResultSchema = z.object({
  session: learningSessionSchema,
  initialMessage: tutorMessageSchema,
});
export type LearningSessionStartResult = z.infer<typeof learningSessionStartResultSchema>;

export const learningSessionMessageSubmissionSchema = z.object({
  content: z.string().trim().min(1).max(4_000),
});
export type LearningSessionMessageSubmission = z.infer<
  typeof learningSessionMessageSubmissionSchema
>;

export const hintSubmissionSchema = z.object({
  studentId: idSchema,
  courseId: idSchema,
  topicId: idSchema,
  conceptId: idSchema,
  questionId: idSchema,
  currentAnswer: z.unknown().optional(),
  strategy: teachingStrategySchema,
  curriculumVersion: z.number().int().positive(),
  sessionId: idSchema.optional(),
});
export type HintSubmission = z.infer<typeof hintSubmissionSchema>;

export const hintResultSchema = z.object({
  message: tutorMessageSchema,
  revealsAnswer: z.literal(false),
});
export type HintResult = z.infer<typeof hintResultSchema>;

export const learningSessionSummarySchema = z.object({
  sessionId: idSchema,
  messageCount: z.number().int().nonnegative(),
  citedSourceIds: z.array(idSchema),
  unsupported: z.boolean(),
  completedAt: isoDateSchema,
});
export type LearningSessionSummary = z.infer<typeof learningSessionSummarySchema>;

export const studentLearningStateSchema = z.object({
  studentId: idSchema,
  diagnostics: z.array(diagnosticResultSchema),
  mastery: z.array(studentTopicMasterySchema),
  knowledge: z.array(conceptKnowledgeStateSchema),
  activeMisconceptionIds: z.array(idSchema),
  retention: z.array(retentionScheduleSchema),
});
export type StudentLearningState = z.infer<typeof studentLearningStateSchema>;
