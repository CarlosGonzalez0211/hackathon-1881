export { InMemoryAssessmentRepository, type AssessmentRepository } from "./assessment.js";
export { calculateMastery, type MasteryCalculationInput } from "./domain/mastery.js";
export {
  defaultKnowledgeTracingParameters,
  updateKnowledgeProbability,
  type KnowledgeTracingParameters,
} from "./domain/knowledge-tracing.js";
export {
  calculateStrategyReward,
  selectTeachingStrategy,
  updateStrategyPosterior,
} from "./domain/strategy-selection.js";
export { rankRecommendations, type RecommendationCandidate } from "./domain/recommendations.js";
export { scheduleRetention } from "./domain/retention.js";
export { type CurriculumContextPort, type TutorProvider } from "./ports.js";
export { InMemoryLearningRepository, type LearningRepository } from "./repository.js";
export { LearningService } from "./service.js";
export { learningRoutes, type LearningRoutesOptions } from "./routes.js";
