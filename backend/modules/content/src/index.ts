/**
 * Internal content module: class material -> chunks -> embeddings, objectives and milestones,
 * and (next) the class-scoped RAG chat. See docs/CONTENT_RAG.md. Contracts are proposals.
 */
export { contentRoutes, type ContentRoutesOptions } from "./routes.js";
export { ContentConflictError, ContentService, type ContentServiceDeps } from "./service.js";
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
  demoCurriculumCatalog,
  InMemoryChunkRepository,
  InMemoryMaterialRepository,
  InMemoryMaterialStorage,
  InMemoryVersionedRepository,
} from "./memory.js";
export {
  IngestionError,
  type ChunkDraft,
  type ChunkRecord,
  type ChunkRepository,
  type ChunkingStrategy,
  type CurriculumCatalogPort,
  type DocumentExtractor,
  type EmbeddingProvider,
  type ExtractedPage,
  type MaterialRecord,
  type MaterialRepository,
  type MaterialStorage,
  type MilestoneRecord,
  type ObjectiveRecord,
  type VersionedRecord,
  type VersionedRepository,
} from "./ports.js";
