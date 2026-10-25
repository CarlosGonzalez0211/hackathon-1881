import type {
  ContentMaterial,
  ContentMaterialErrorCode,
  ContentMilestone,
  ContentObjective,
} from "@athena/shared";

/**
 * Seams of the content module. Names follow proposal section 3.3 (MaterialStorage,
 * DocumentExtractor, ChunkingStrategy, EmbeddingProvider). The module ships in-memory and mock
 * implementations; the api injects Supabase and Gemini ones in real mode.
 */

/** A material as stored: the professor view plus fields that never leave the server. */
export interface MaterialRecord extends Omit<ContentMaterial, "searchable" | "progress"> {
  storagePath: string;
  chunksTotal: number;
  chunksEmbedded: number;
  activeGeneration?: number;
  buildingGeneration?: number;
  verifiedAt?: string;
  claimedAt?: string;
}

export interface MaterialRepository {
  /** Inserts unless (classId, sha256) exists; then returns the existing row untouched. */
  insertOrGet(record: MaterialRecord): Promise<{ record: MaterialRecord; created: boolean }>;
  get(id: string): Promise<MaterialRecord | null>;
  listByClass(classId: string): Promise<MaterialRecord[]>;
  update(id: string, patch: Partial<MaterialRecord>): Promise<MaterialRecord>;
  addTopics(id: string, topicIds: string[]): Promise<MaterialRecord>;
  delete(id: string): Promise<void>;
  /**
   * Takes the processing lease (content_claim_material): only verified, unfinished materials
   * whose lease is free or older than leaseMs. uploaded/failed move to extracting.
   */
  claim(id: string, now: Date, leaseMs: number): Promise<MaterialRecord | null>;
}

export interface ChunkDraft {
  chunkIndex: number;
  pageStart?: number;
  pageEnd?: number;
  sectionTitle?: string;
  content: string;
  contentHash: string;
  tokenEstimate: number;
}

export interface ChunkRecord extends ChunkDraft {
  id: string;
  materialId: string;
  classId: string;
  generation: number;
  embedding?: number[];
  embeddingModel?: string;
}

export interface ChunkRepository {
  insert(chunks: ChunkRecord[]): Promise<void>;
  deleteGeneration(materialId: string, generation: number): Promise<void>;
  /** Explicit for adapters without cascade; the 0502 foreign key also cascades. */
  deleteForMaterial(materialId: string): Promise<void>;
  listWithoutEmbedding(
    materialId: string,
    generation: number,
    limit: number,
  ): Promise<ChunkRecord[]>;
  /** An embedding already computed for the same text and model in another generation. */
  findEmbedding(materialId: string, contentHash: string, model: string): Promise<number[] | null>;
  setEmbeddings(rows: { id: string; embedding: number[]; model: string }[]): Promise<void>;
  /** content_activate_generation: makes a fully embedded generation live, drops older ones. */
  activate(materialId: string, generation: number, now: Date): Promise<MaterialRecord>;
  listActive(classId: string): Promise<ChunkRecord[]>;
}

export interface MaterialStorage {
  /** URL the browser PUTs the file to. Path is chosen by the server. */
  createUploadUrl(path: string): Promise<string>;
  read(path: string): Promise<Uint8Array | null>;
  remove(path: string): Promise<void>;
  createDownloadUrl(path: string, expiresInSeconds: number): Promise<string>;
}

export interface ExtractedPage {
  /** 1-based page number; undefined for formats without pages (plain text, markdown). */
  page?: number;
  text: string;
}

export interface DocumentExtractor {
  extract(bytes: Uint8Array, mimeType: string): Promise<ExtractedPage[]>;
}

export interface ChunkingStrategy {
  chunk(pages: ExtractedPage[]): ChunkDraft[];
}

export interface EmbeddingProvider {
  readonly model: string;
  readonly dimensions: number;
  embedDocuments(items: { title: string; text: string }[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}

/** What content needs from Curriculum (P1). The mock serves the demo course. */
export interface CurriculumCatalogPort {
  listTopics(courseId: string): Promise<{ id: string; title: string }[]>;
  activeVersion(courseId: string): Promise<number>;
}

export interface VersionedRecord {
  id: string;
  classId: string;
  updatedAt: string;
  deletedAt?: string;
}

/** Objectives and milestones: upsert by client id with optimistic concurrency, soft delete. */
export interface VersionedRepository<T extends VersionedRecord> {
  list(classId: string): Promise<T[]>;
  get(id: string): Promise<T | null>;
  /**
   * Returns "conflict" when expectedUpdatedAt is given and no longer matches, or when the id
   * already belongs to another class.
   */
  upsert(record: T, expectedUpdatedAt?: string): Promise<T | "conflict">;
  softDelete(id: string, now: string): Promise<void>;
}

export type ObjectiveRecord = ContentObjective & { deletedAt?: string };
export type MilestoneRecord = ContentMilestone & { deletedAt?: string };

/** Failures recorded on the material so the professor sees them. */
export class IngestionError extends Error {
  constructor(
    readonly code: ContentMaterialErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "IngestionError";
  }
}
