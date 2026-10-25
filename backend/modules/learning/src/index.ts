export { InMemoryAssessmentRepository, type AssessmentRepository } from "./assessment.js";
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
  MockCurriculumContextPort,
  MockTutorProvider,
  type GroundedTextGenerator,
} from "./tutor-adapters.js";
export { InMemoryLearningRepository, type LearningRepository } from "./repository.js";
export { LearningService } from "./service.js";
export { learningRoutes, type LearningRoutesOptions } from "./routes.js";
