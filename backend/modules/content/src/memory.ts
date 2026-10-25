import { randomUUID } from "node:crypto";
import { athenaDemoIds, athenaDemoTopics } from "@athena/shared";
import type {
  AiCallLedger,
  ChunkMatchInput,
  ChunkRecord,
  ChunkRepository,
  CurriculumCatalogPort,
  FlagRecord,
  FlagRepository,
  MaterialRecord,
  MaterialRepository,
  MaterialStorage,
  ProfilePreferencesPort,
  VersionedRecord,
  VersionedRepository,
} from "./ports.js";

const clone = <T>(value: T): T => structuredClone(value);
const unfinished = new Set(["uploaded", "failed", "extracting", "chunking", "embedding"]);

/** Mirrors the 0501 table and content_claim_material. Default in mock mode and tests. */
export class InMemoryMaterialRepository implements MaterialRepository {
  readonly rows = new Map<string, MaterialRecord>();

  constructor(seed: MaterialRecord[] = []) {
    for (const record of seed) this.rows.set(record.id, clone(record));
  }

  async insertOrGet(record: MaterialRecord) {
    const existing = [...this.rows.values()].find(
      (row) => row.classId === record.classId && row.sha256 === record.sha256,
    );
    if (existing) return { record: clone(existing), created: false };
    this.rows.set(record.id, clone(record));
    return { record: clone(record), created: true };
  }

  async get(id: string) {
    const row = this.rows.get(id);
    return row ? clone(row) : null;
  }

  async listByClass(classId: string) {
    return [...this.rows.values()]
      .filter((row) => row.classId === classId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(clone);
  }

  async update(id: string, patch: Partial<MaterialRecord>) {
    const row = this.rows.get(id);
    if (!row) throw new Error(`Material not found: ${id}`);
    const next = { ...row, ...patch };
    // Mirrors the table's check: failed <=> error code present.
    if ((next.status === "failed") !== (next.errorCode !== undefined)) {
      throw new Error("status failed and errorCode must go together");
    }
    this.rows.set(id, next);
    return clone(next);
  }

  async addTopics(id: string, topicIds: string[]) {
    const row = this.rows.get(id);
    if (!row) throw new Error(`Material not found: ${id}`);
    row.topicIds = [...new Set([...row.topicIds, ...topicIds])];
    return clone(row);
  }

  async delete(id: string) {
    this.rows.delete(id);
  }

  async claim(id: string, now: Date, leaseMs: number) {
    const row = this.rows.get(id);
    if (!row || !row.verifiedAt || !unfinished.has(row.status)) return null;
    if (row.claimedAt && Date.parse(row.claimedAt) >= now.getTime() - leaseMs) return null;
    const restarting = row.status === "uploaded" || row.status === "failed";
    const next: MaterialRecord = {
      ...row,
      claimedAt: now.toISOString(),
      updatedAt: now.toISOString(),
      attempts: row.attempts + (restarting ? 1 : 0),
      status: restarting ? "extracting" : row.status,
      errorCode: undefined,
      errorMessage: undefined,
    };
    this.rows.set(id, next);
    return clone(next);
  }
}

/** Mirrors 0502 and content_activate_generation. */
export class InMemoryChunkRepository implements ChunkRepository {
  readonly rows = new Map<string, ChunkRecord>();

  constructor(
    private readonly materials: InMemoryMaterialRepository,
    seed: ChunkRecord[] = [],
  ) {
    for (const record of seed) this.rows.set(record.id, clone(record));
  }

  async insert(chunks: ChunkRecord[]) {
    for (const chunk of chunks) {
      const duplicate = [...this.rows.values()].some(
        (row) =>
          row.materialId === chunk.materialId &&
          row.generation === chunk.generation &&
          row.chunkIndex === chunk.chunkIndex,
      );
      if (duplicate) throw new Error("duplicate (material_id, generation, chunk_index)");
      this.rows.set(chunk.id, clone(chunk));
    }
  }

  async deleteGeneration(materialId: string, generation: number) {
    for (const [id, row] of this.rows)
      if (row.materialId === materialId && row.generation === generation) this.rows.delete(id);
  }

  async deleteForMaterial(materialId: string) {
    for (const [id, row] of this.rows) if (row.materialId === materialId) this.rows.delete(id);
  }

  async listWithoutEmbedding(materialId: string, generation: number, limit: number) {
    return [...this.rows.values()]
      .filter((row) => row.materialId === materialId && row.generation === generation)
      .filter((row) => !row.embedding)
      .sort((a, b) => a.chunkIndex - b.chunkIndex)
      .slice(0, limit)
      .map(clone);
  }

  async findEmbedding(materialId: string, contentHash: string, model: string) {
    const row = [...this.rows.values()].find(
      (item) =>
        item.materialId === materialId &&
        item.contentHash === contentHash &&
        item.embeddingModel === model &&
        item.embedding,
    );
    return row?.embedding ? [...row.embedding] : null;
  }

  async setEmbeddings(rows: { id: string; embedding: number[]; model: string }[]) {
    for (const { id, embedding, model } of rows) {
      const row = this.rows.get(id);
      if (row) Object.assign(row, { embedding: [...embedding], embeddingModel: model });
    }
  }

  async activate(materialId: string, generation: number, now: Date) {
    const chunks = [...this.rows.values()].filter(
      (row) => row.materialId === materialId && row.generation === generation,
    );
    if (chunks.length === 0) throw new Error(`generation ${generation} has no chunks`);
    if (chunks.some((row) => !row.embedding)) throw new Error("chunks without embeddings");
    const material = await this.materials.get(materialId);
    if (material?.buildingGeneration !== generation) {
      throw new Error(`material ${materialId} is not building generation ${generation}`);
    }
    const updated = await this.materials.update(materialId, {
      activeGeneration: generation,
      buildingGeneration: undefined,
      status: "ready",
      errorCode: undefined,
      errorMessage: undefined,
      chunksTotal: chunks.length,
      chunksEmbedded: chunks.length,
      claimedAt: undefined,
      processedAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    for (const [id, row] of this.rows)
      if (row.materialId === materialId && row.generation !== generation) this.rows.delete(id);
    return updated;
  }

  async listActive(classId: string) {
    const live = new Map<string, number | undefined>();
    for (const material of await this.materials.listByClass(classId))
      live.set(material.id, material.activeGeneration);
    return [...this.rows.values()]
      .filter((row) => row.classId === classId && live.get(row.materialId) === row.generation)
      .map(clone);
  }

  async match({ classId, query, model, topicId, limit, minSimilarity }: ChunkMatchInput) {
    const materials = new Map(
      (await this.materials.listByClass(classId))
        .filter((m) => m.activeGeneration !== undefined)
        .filter((m) => !topicId || m.topicIds.includes(topicId))
        .map((m) => [m.id, m]),
    );
    return [...this.rows.values()]
      .filter((row) => row.classId === classId && row.embeddingModel === model && row.embedding)
      .filter((row) => materials.get(row.materialId)?.activeGeneration === row.generation)
      .map((row) => ({
        chunkId: row.id,
        materialId: row.materialId,
        materialTitle: materials.get(row.materialId)!.title,
        pageStart: row.pageStart,
        pageEnd: row.pageEnd,
        sectionTitle: row.sectionTitle,
        content: row.content,
        similarity: cosine(row.embedding!, query),
      }))
      .filter((match) => match.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, Math.min(Math.max(limit, 1), 20));
  }
}

/**
 * Storage for mock mode and tests. Upload URLs point at the api's dev upload route, which
 * writes into this store; real mode uses Supabase signed upload URLs instead.
 */
export class InMemoryMaterialStorage implements MaterialStorage {
  readonly objects = new Map<string, Uint8Array>();
  private readonly tokens = new Map<string, string>();

  constructor(private readonly baseUrl = "http://localhost:4000/api/content/dev-uploads") {}

  async createUploadUrl(path: string) {
    const token = randomUUID();
    this.tokens.set(token, path);
    return `${this.baseUrl}/${token}`;
  }

  /** Used by the dev upload route; false when the token is unknown. */
  acceptUpload(token: string, bytes: Uint8Array) {
    const path = this.tokens.get(token);
    if (!path) return false;
    this.tokens.delete(token);
    this.objects.set(path, new Uint8Array(bytes));
    return true;
  }

  async read(path: string) {
    const object = this.objects.get(path);
    return object ? new Uint8Array(object) : null;
  }

  async remove(path: string) {
    this.objects.delete(path);
  }

  async createDownloadUrl(path: string, expiresInSeconds: number) {
    return `memory://content-materials/${path}?expires=${expiresInSeconds}`;
  }
}

/** Topics of the demo course (shared fixture ids). Any other course has none yet. */
export const demoCurriculumCatalog: CurriculumCatalogPort = {
  async listTopics(courseId) {
    if (courseId !== athenaDemoIds.course) return [];
    return athenaDemoTopics.map(({ id, title }) => ({ id, title }));
  },
  async activeVersion() {
    return 1;
  },
};

export class InMemoryVersionedRepository<
  T extends VersionedRecord,
> implements VersionedRepository<T> {
  private readonly rows = new Map<string, T>();

  constructor(seed: T[] = []) {
    for (const record of seed) this.rows.set(record.id, clone(record));
  }

  async list(classId: string) {
    return [...this.rows.values()]
      .filter((row) => row.classId === classId && !row.deletedAt)
      .map(clone);
  }

  async get(id: string) {
    const row = this.rows.get(id);
    return row && !row.deletedAt ? clone(row) : null;
  }

  async upsert(record: T, expectedUpdatedAt?: string, _actorId?: string) {
    const existing = this.rows.get(record.id);
    if (existing && existing.classId !== record.classId) return "conflict" as const;
    if (expectedUpdatedAt !== undefined && existing?.updatedAt !== expectedUpdatedAt) {
      return "conflict" as const;
    }
    this.rows.set(record.id, clone(record));
    return clone(record);
  }

  async softDelete(id: string, now: string) {
    const row = this.rows.get(id);
    if (row) row.deletedAt = now;
  }
}

function cosine(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i]! * (b[i] ?? 0);
    normA += a[i]! * a[i]!;
    normB += (b[i] ?? 0) * (b[i] ?? 0);
  }
  return normA && normB ? dot / Math.sqrt(normA * normB) : 0;
}

/** Mock mode: every profile reads Spanish with no accessibility preferences. */
export const defaultProfilePreferences: ProfilePreferencesPort = {
  async get() {
    return { locale: "es", accessibility: {} };
  },
};

interface CallRow {
  id: string;
  studentId: string;
  createdAt: number;
  outcome: string;
  flagCategory?: string;
  model?: string;
  latencyMs?: number;
}

/** Mirrors content_ai_calls and content_begin_ai_call. */
export class InMemoryAiCallLedger implements AiCallLedger {
  readonly rows = new Map<string, CallRow>();

  async begin(input: { studentId: string; dailyLimit: number; now: Date }) {
    const since = input.now.getTime() - 24 * 60 * 60 * 1000;
    const usedToday = [...this.rows.values()].filter(
      (row) =>
        row.studentId === input.studentId &&
        row.createdAt > since &&
        row.outcome !== "rate_limited",
    ).length;
    const allowed = usedToday < input.dailyLimit;
    const callId = randomUUID();
    this.rows.set(callId, {
      id: callId,
      studentId: input.studentId,
      createdAt: input.now.getTime(),
      outcome: allowed ? "pending" : "rate_limited",
    });
    return { callId, allowed, usedToday };
  }

  async finish(
    callId: string,
    result: { outcome: string; flagCategory?: string; model?: string; latencyMs: number },
  ) {
    const row = this.rows.get(callId);
    if (row) Object.assign(row, result);
  }
}

export class InMemoryFlagRepository implements FlagRepository {
  readonly rows = new Map<string, FlagRecord>();

  constructor(seed: FlagRecord[] = []) {
    for (const record of seed) this.rows.set(record.id, clone(record));
  }

  async create(flag: FlagRecord) {
    this.rows.set(flag.id, clone(flag));
  }

  async listByClass(classId: string, now: Date) {
    return [...this.rows.values()]
      .filter((row) => row.classId === classId && Date.parse(row.expiresAt) > now.getTime())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(clone);
  }

  async get(id: string) {
    const row = this.rows.get(id);
    return row ? clone(row) : null;
  }

  async review(id: string, reviewerId: string, at: string) {
    const row = this.rows.get(id);
    if (!row) throw new Error(`Flag not found: ${id}`);
    Object.assign(row, { reviewedAt: at, reviewedBy: reviewerId });
    return clone(row);
  }
}
