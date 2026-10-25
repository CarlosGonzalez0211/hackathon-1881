import type { Clock, DomainEventStore, IdGenerator } from "@athena/platform";
import { MAX_CHUNKS } from "./extraction.js";
import {
  IngestionError,
  type ChunkRepository,
  type ChunkingStrategy,
  type DocumentExtractor,
  type EmbeddingProvider,
  type MaterialRecord,
  type MaterialRepository,
  type MaterialStorage,
} from "./ports.js";

export interface IngestionOptions {
  /** Chunks embedded per provider call. */
  batchSize?: number;
  /** A crashed step's lease expires after this long. */
  leaseMs?: number;
  /** Work done per process() call, so one request stays inside a serverless time limit. */
  budgetMs?: number;
}

export interface IngestionDeps {
  materials: MaterialRepository;
  chunks: ChunkRepository;
  storage: MaterialStorage;
  extractor: DocumentExtractor;
  chunker: ChunkingStrategy;
  embeddings: EmbeddingProvider;
  events: DomainEventStore;
  clock: Clock;
  ids: IdGenerator;
}

/**
 * MaterialIngestionService: extract -> chunk -> embed -> activate, in bounded resumable steps.
 * Each process() call takes the material's lease, advances until done or out of budget, and
 * releases it, so repeated calls from the professor's page (or a queue later) finish the job.
 * Chunks are built as a new generation; the material keeps serving its old one until the new
 * one is fully embedded and activated in one transaction.
 */
export class MaterialIngestionService {
  private readonly batchSize: number;
  private readonly leaseMs: number;
  private readonly budgetMs: number;

  constructor(
    private readonly deps: IngestionDeps,
    options: IngestionOptions = {},
  ) {
    this.batchSize = options.batchSize ?? 100;
    this.leaseMs = options.leaseMs ?? 120_000;
    this.budgetMs = options.budgetMs ?? 20_000;
  }

  async process(materialId: string): Promise<MaterialRecord | null> {
    const { materials, clock } = this.deps;
    const claimed = await materials.claim(materialId, clock.now(), this.leaseMs);
    if (!claimed) return materials.get(materialId);
    const started = performance.now();
    let record = claimed;
    try {
      // At least one step per call, so even a zero budget always makes progress.
      do {
        record = await this.step(record);
      } while (record.status !== "ready" && performance.now() - started < this.budgetMs);
      if (record.status === "ready") return record;
      return await materials.update(record.id, { claimedAt: undefined });
    } catch (error) {
      return this.fail(record, error);
    }
  }

  private async step(record: MaterialRecord): Promise<MaterialRecord> {
    if (record.status === "embedding" && record.buildingGeneration !== undefined) {
      return this.embedBatch(record, record.buildingGeneration);
    }
    return this.extractAndChunk(record);
  }

  private async extractAndChunk(record: MaterialRecord): Promise<MaterialRecord> {
    const { materials, chunks, storage, extractor, chunker, ids, clock } = this.deps;
    await materials.update(record.id, {
      status: "extracting",
      updatedAt: clock.now().toISOString(),
    });
    const bytes = await storage.read(record.storagePath).catch(() => null);
    if (!bytes) throw new IngestionError("storage_failed", "The stored file could not be read");
    const pages = await extractor.extract(bytes, record.mimeType);
    await materials.update(record.id, { status: "chunking", updatedAt: clock.now().toISOString() });
    const drafts = chunker.chunk(pages);
    if (drafts.length === 0) {
      throw new IngestionError("no_extractable_text", "The file has no extractable text");
    }
    if (drafts.length > MAX_CHUNKS) {
      throw new IngestionError("too_large", `The file produces more than ${MAX_CHUNKS} chunks`);
    }
    // A leftover building generation from a crashed attempt is rebuilt from scratch.
    const generation = record.buildingGeneration ?? (record.activeGeneration ?? 0) + 1;
    await chunks.deleteGeneration(record.id, generation);
    await chunks.insert(
      drafts.map((draft) => ({
        ...draft,
        id: ids.next(),
        materialId: record.id,
        classId: record.classId,
        generation,
      })),
    );
    return materials.update(record.id, {
      status: "embedding",
      buildingGeneration: generation,
      chunksTotal: drafts.length,
      chunksEmbedded: 0,
      updatedAt: clock.now().toISOString(),
    });
  }

  private async embedBatch(record: MaterialRecord, generation: number): Promise<MaterialRecord> {
    const { materials, chunks, embeddings, clock } = this.deps;
    const batch = await chunks.listWithoutEmbedding(record.id, generation, this.batchSize);
    if (batch.length === 0) {
      const ready = await chunks.activate(record.id, generation, clock.now());
      await this.emitProcessed(ready, "ready");
      return ready;
    }
    const rows: { id: string; embedding: number[]; model: string }[] = [];
    const pending = [];
    for (const chunk of batch) {
      const reused = await chunks.findEmbedding(record.id, chunk.contentHash, embeddings.model);
      if (reused) rows.push({ id: chunk.id, embedding: reused, model: embeddings.model });
      else pending.push(chunk);
    }
    if (pending.length > 0) {
      let vectors: number[][];
      try {
        vectors = await embeddings.embedDocuments(
          pending.map((chunk) => ({ title: record.title, text: chunk.content })),
        );
      } catch (error) {
        throw new IngestionError(
          "embedding_failed",
          `Embedding failed: ${error instanceof Error ? error.message : "unknown error"}`,
        );
      }
      if (
        vectors.length !== pending.length ||
        vectors.some((vector) => vector.length !== embeddings.dimensions)
      ) {
        throw new IngestionError("embedding_failed", "The embedding provider returned bad vectors");
      }
      pending.forEach((chunk, index) =>
        rows.push({ id: chunk.id, embedding: vectors[index]!, model: embeddings.model }),
      );
    }
    await chunks.setEmbeddings(rows);
    return materials.update(record.id, {
      chunksEmbedded: Math.min(record.chunksTotal, record.chunksEmbedded + rows.length),
      updatedAt: clock.now().toISOString(),
    });
  }

  private async fail(record: MaterialRecord, error: unknown): Promise<MaterialRecord> {
    const known = error instanceof IngestionError;
    const failed = await this.deps.materials.update(record.id, {
      status: "failed",
      errorCode: known ? error.code : "internal",
      // Unknown errors may carry internals; the professor gets a generic message.
      errorMessage: known ? error.message.slice(0, 500) : "Unexpected processing error",
      claimedAt: undefined,
      updatedAt: this.deps.clock.now().toISOString(),
    });
    await this.emitProcessed(failed, "failed");
    return failed;
  }

  private async emitProcessed(record: MaterialRecord, status: "ready" | "failed") {
    const { events, ids, clock } = this.deps;
    await events.append({
      id: ids.next(),
      type: "MaterialProcessed",
      aggregateType: "content_material",
      aggregateId: record.id,
      classId: record.classId,
      courseId: record.courseId,
      occurredAt: clock.now().toISOString(),
      payload: { materialId: record.id, topicIds: record.topicIds, status },
    });
  }
}
