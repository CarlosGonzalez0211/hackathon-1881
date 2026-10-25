export {
  gradeAssessmentQuestion,
  InMemoryAssessmentRepository,
  type AssessmentQuestion,
  type AssessmentRepository,
  type AssessmentRubricFeature,
  type ScoredAnswer,
} from "./assessment.js";
export { calculateMastery, type MasteryCalculationInput } from "./domain/mastery.js";
export {
  defaultKnowledgeTracingParameters,
  defaultKnowledgeTracingModel,
  getKnowledgeTracingModel,
  updateKnowledgeProbability,
  type KnowledgeTracingModel,
  type KnowledgeTracingParameters,
} from "./domain/knowledge-tracing.js";
export {
  calculateStrategyReward,
  initializeStrategyPosteriors,
  selectTeachingStrategy,
  updateStrategyPosterior,
} from "./domain/strategy-selection.js";
export { rankRecommendations, type RecommendationCandidate } from "./domain/recommendations.js";
export { scheduleRetention } from "./domain/retention.js";
export {
  selectAssessmentQuestions,
  type AssessmentSelectionCandidate,
  type AssessmentSelectionInput,
  type SelectedAssessmentQuestion,
} from "./domain/question-selection.js";
export { type CurriculumContextPort, type TutorProvider } from "./ports.js";
export {
  InMemoryRecommendationCatalog,
  type RecommendationCatalogPort,
  type RecommendationTopic,
} from "./recommendation-catalog.js";
export {
  MockMisconceptionClassifier,
  type MisconceptionClassifier,
} from "./misconception-classifier.js";
export {
  GeminiTutorProvider,
  getTeachingStrategyInstruction,
  MockCurriculumContextPort,
  MockTutorProvider,
  type GroundedTextGenerator,
} from "./tutor-adapters.js";
export { InMemoryLearningRepository, type LearningRepository } from "./repository.js";
export { SupabaseAssessmentRepository } from "./supabase-assessment.js";
export { SupabaseLearningRepository } from "./supabase-learning-repository.js";
export { SupabaseLearningRestClient, type LearningRestClient } from "./supabase-rest.js";
export { LearningService } from "./service.js";
export { SubmissionCoordinator } from "./submission-coordinator.js";
export { learningRoutes, type LearningRoutesOptions } from "./routes.js";
export {
  connectLearningEventsToWorld,
  HttpWorldEventSink,
  InMemoryWorldEventSink,
  LearningMasteryReadAdapter,
  mapDomainEventToWorld,
  type MasteryReadPort,
  type WorldEventSink,
} from "./world-bridge.js";
