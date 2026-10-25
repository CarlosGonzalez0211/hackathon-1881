/**
 * Internal content module: class material -> chunks -> embeddings, objectives and milestones,
 * and the class-scoped RAG chat with guardrails. See docs/CONTENT_RAG.md. Contracts are proposals.
 */
export { contentRoutes, type ContentRoutesOptions } from "./routes.js";
export {
  ChatService,
  citeOrReject,
  SlidingWindowLimiter,
  type ChatResult,
  type ChatServiceDeps,
  type RateLimitOptions,
  type RetrievalOptions,
} from "./chat.js";
export {
  buildAnswerPrompt,
  GroundedAnswerGenerator,
  MockAnswerGenerator,
  parseAnswer,
  type AnswerGenerator,
  type AnswerInput,
  type AnswerOutput,
  type AnswerSource,
  type GroundedTextGenerator,
} from "./generation.js";
export {
  GUARDRAIL_MIN_CONFIDENCE,
  HeuristicGuardrailClassifier,
  LayeredGuardrailClassifier,
  type GuardrailCategory,
  type GuardrailClassifier,
  type GuardrailInput,
  type GuardrailVerdict,
} from "./guardrails.js";
export { message, type MessageKey } from "./messages.js";
export { ContentConflictError, ContentService, type ContentServiceDeps } from "./service.js";
export {
  ContentCurriculumContext,
  type ContentCurriculumContextDeps,
} from "./curriculum-context.js";
export {
  MaterialIngestionService,
  type IngestionDeps,
  type IngestionOptions,
} from "./ingestion.js";
export {
  DefaultDocumentExtractor,
  MOCK_EMBEDDING_MODEL,
  MockEmbeddingProvider,
  ParagraphChunker,
  sha256Hex,
  sniffMatches,
  type ChunkerOptions,
} from "./extraction.js";
export {
  defaultProfilePreferences,
  demoCurriculumCatalog,
  InMemoryAiCallLedger,
  InMemoryChunkRepository,
  InMemoryFlagRepository,
  InMemoryMaterialRepository,
  InMemoryMaterialStorage,
  InMemoryVersionedRepository,
} from "./memory.js";
export {
  IngestionError,
  type AiCallLedger,
  type ChunkDraft,
  type ChunkMatch,
  type ChunkMatchInput,
  type ChunkRecord,
  type ChunkRepository,
  type ChunkingStrategy,
  type CurriculumCatalogPort,
  type DocumentExtractor,
  type EmbeddingProvider,
  type ExtractedPage,
  type FlagRecord,
  type FlagRepository,
  type MaterialRecord,
  type MaterialRepository,
  type MaterialStorage,
  type MilestoneRecord,
  type ObjectiveRecord,
  type ProfilePreferencesPort,
  type VersionedRecord,
  type VersionedRepository,
} from "./ports.js";
