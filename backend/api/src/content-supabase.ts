import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  contentFlagActionSchema,
  contentFlagCategorySchema,
  contentMaterialErrorCodeSchema,
  contentMaterialStatusSchema,
  contentMimeTypeSchema,
  localeSchema,
} from "@athena/shared";
import type {
  AiCallLedger,
  ChunkMatchInput,
  ChunkRecord,
  ChunkRepository,
  FlagRecord,
  FlagRepository,
  MaterialRecord,
  MaterialRepository,
  MaterialStorage,
  MilestoneRecord,
  ObjectiveRecord,
  ProfilePreferencesPort,
  VersionedRepository,
} from "@athena/content";
import { fetchAll } from "./supabase-paging.js";

/**
 * Supabase adapters for the content module (ATHENA_DATA_MODE=real), over migrations 0500-0503.
 * The api uses the service role, so RLS does not apply here; every query is scoped by the ids
 * the module has already authorized.
 */

type Result<T> = { data: T | null; error: { message: string; code?: string } | null };

function check<T>({ data, error }: Result<T>, action = "query"): T {
  if (error) throw new Error(`Supabase ${action} failed: ${error.message}`);
  return data as T;
}

/** PostgREST returns `2026-10-25 10:00:00+00` style timestamps; contracts want ISO `Z`. */
export const iso = (value: string) => new Date(value).toISOString();
const isoOrUndefined = (value: string | null | undefined) => (value ? iso(value) : undefined);
const orUndefined = <T>(value: T | null | undefined) => value ?? undefined;

export const vectorLiteral = (vector: number[]) => `[${vector.join(",")}]`;
export const parseVector = (value: unknown): number[] =>
  typeof value === "string" ? (JSON.parse(value) as number[]) : (value as number[]);

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

const materialRow = z.object({
  id: z.string(),
  class_id: z.string(),
  course_id: z.string(),
  title: z.string(),
  filename: z.string(),
  mime_type: contentMimeTypeSchema,
  byte_size: z.coerce.number(),
  sha256: z.string(),
  storage_path: z.string(),
  locale: localeSchema,
  status: contentMaterialStatusSchema,
  error_code: contentMaterialErrorCodeSchema.nullable(),
  error_message: z.string().nullable(),
  attempts: z.number(),
  chunks_total: z.number(),
  chunks_embedded: z.number(),
  active_generation: z.number().nullable(),
  building_generation: z.number().nullable(),
  curriculum_version: z.number(),
  uploaded_by: z.string(),
  verified_at: z.string().nullable(),
  claimed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  processed_at: z.string().nullable(),
  content_material_topics: z.array(z.object({ topic_id: z.string() })).optional(),
});

const MATERIAL_COLUMNS = "*, content_material_topics(topic_id)";

export function rowToMaterial(input: unknown): MaterialRecord {
  const row = materialRow.parse(input);
  return {
    id: row.id,
    classId: row.class_id,
    courseId: row.course_id,
    title: row.title,
    filename: row.filename,
    mimeType: row.mime_type,
    byteSize: row.byte_size,
    sha256: row.sha256,
    storagePath: row.storage_path,
    locale: row.locale,
    topicIds: (row.content_material_topics ?? []).map((topic) => topic.topic_id).sort(),
    status: row.status,
    errorCode: orUndefined(row.error_code),
    errorMessage: orUndefined(row.error_message),
    attempts: row.attempts,
    chunksTotal: row.chunks_total,
    chunksEmbedded: row.chunks_embedded,
    activeGeneration: orUndefined(row.active_generation),
    buildingGeneration: orUndefined(row.building_generation),
    curriculumVersion: row.curriculum_version,
    uploadedBy: row.uploaded_by,
    verifiedAt: isoOrUndefined(row.verified_at),
    claimedAt: isoOrUndefined(row.claimed_at),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    processedAt: isoOrUndefined(row.processed_at),
  };
}

const MATERIAL_COLUMN_FOR: Partial<Record<keyof MaterialRecord, string>> = {
  id: "id",
  classId: "class_id",
  courseId: "course_id",
  title: "title",
  filename: "filename",
  mimeType: "mime_type",
  byteSize: "byte_size",
  sha256: "sha256",
  storagePath: "storage_path",
  locale: "locale",
  status: "status",
  errorCode: "error_code",
  errorMessage: "error_message",
  attempts: "attempts",
  chunksTotal: "chunks_total",
  chunksEmbedded: "chunks_embedded",
  activeGeneration: "active_generation",
  buildingGeneration: "building_generation",
  curriculumVersion: "curriculum_version",
  uploadedBy: "uploaded_by",
  verifiedAt: "verified_at",
  claimedAt: "claimed_at",
  createdAt: "created_at",
  updatedAt: "updated_at",
  processedAt: "processed_at",
};

/**
 * Patch -> row. A key present with `undefined` clears the column (null), which is how the
 * module resets errors, leases and generations. Topics live in their own table.
 */
export function materialPatchToRow(patch: Partial<MaterialRecord>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    const column = MATERIAL_COLUMN_FOR[key as keyof MaterialRecord];
    if (column) row[column] = value === undefined ? null : value;
  }
  return row;
}

export class SupabaseMaterialRepository implements MaterialRepository {
  constructor(private readonly client: SupabaseClient) {}

  async insertOrGet(record: MaterialRecord) {
    // insert ... on conflict (class_id, sha256) do nothing returning *: empty means it existed.
    const inserted = check(
      await this.client
        .from("content_materials")
        .upsert(materialPatchToRow(record), {
          onConflict: "class_id,sha256",
          ignoreDuplicates: true,
        })
        .select("id"),
      "insert",
    ) as { id: string }[];
    if (inserted.length > 0) {
      await this.addTopics(record.id, record.topicIds);
      return { record: (await this.get(record.id))!, created: true };
    }
    const existing = check(
      await this.client
        .from("content_materials")
        .select(MATERIAL_COLUMNS)
        .eq("class_id", record.classId)
        .eq("sha256", record.sha256)
        .single(),
    );
    return { record: rowToMaterial(existing), created: false };
  }

  async get(id: string) {
    const row = check(
      await this.client
        .from("content_materials")
        .select(MATERIAL_COLUMNS)
        .eq("id", id)
        .maybeSingle(),
    );
    return row ? rowToMaterial(row) : null;
  }

  async listByClass(classId: string) {
    const rows = await fetchAll((from, to) =>
      this.client
        .from("content_materials")
        .select(MATERIAL_COLUMNS)
        .eq("class_id", classId)
        .order("created_at")
        .order("id")
        .range(from, to),
    );
    return rows.map(rowToMaterial);
  }

  async update(id: string, patch: Partial<MaterialRecord>) {
    if (patch.topicIds) {
      check(
        await this.client.from("content_material_topics").delete().eq("material_id", id),
        "delete",
      );
      await this.addTopics(id, patch.topicIds);
    }
    const row = materialPatchToRow(patch);
    if (Object.keys(row).length > 0) {
      check(await this.client.from("content_materials").update(row).eq("id", id), "update");
    }
    const updated = await this.get(id);
    if (!updated) throw new Error(`Material not found: ${id}`);
    return updated;
  }

  async addTopics(id: string, topicIds: string[]) {
    if (topicIds.length > 0) {
      check(
        await this.client.from("content_material_topics").upsert(
          topicIds.map((topicId) => ({ material_id: id, topic_id: topicId })),
          { onConflict: "material_id,topic_id", ignoreDuplicates: true },
        ),
        "insert",
      );
    }
    const updated = await this.get(id);
    if (!updated) throw new Error(`Material not found: ${id}`);
    return updated;
  }

  async delete(id: string) {
    check(await this.client.from("content_materials").delete().eq("id", id), "delete");
  }

  /** content_claim_material; the database clock decides lease expiry. */
  async claim(id: string, _now: Date, leaseMs: number) {
    const rows = check(
      await this.client.rpc("content_claim_material", {
        p_material_id: id,
        p_lease_seconds: Math.ceil(leaseMs / 1000),
      }),
      "claim",
    ) as { id: string }[] | null;
    if (!rows || rows.length === 0) return null;
    return this.get(id);
  }
}

// ---------------------------------------------------------------------------
// Chunks
// ---------------------------------------------------------------------------

const chunkRow = z.object({
  id: z.string(),
  material_id: z.string(),
  class_id: z.string(),
  generation: z.number(),
  chunk_index: z.number(),
  page_start: z.number().nullable(),
  page_end: z.number().nullable(),
  section_title: z.string().nullable(),
  content: z.string(),
  content_hash: z.string(),
  token_estimate: z.number(),
  embedding: z.unknown().optional(),
  embedding_model: z.string().nullable(),
});

const CHUNK_COLUMNS =
  "id, material_id, class_id, generation, chunk_index, page_start, page_end, section_title, content, content_hash, token_estimate, embedding_model";

function rowToChunk(input: unknown): ChunkRecord {
  const row = chunkRow.parse(input);
  return {
    id: row.id,
    materialId: row.material_id,
    classId: row.class_id,
    generation: row.generation,
    chunkIndex: row.chunk_index,
    pageStart: orUndefined(row.page_start),
    pageEnd: orUndefined(row.page_end),
    sectionTitle: orUndefined(row.section_title),
    content: row.content,
    contentHash: row.content_hash,
    tokenEstimate: row.token_estimate,
    embedding: row.embedding == null ? undefined : parseVector(row.embedding),
    embeddingModel: orUndefined(row.embedding_model),
  };
}

const matchRow = z.object({
  chunk_id: z.string(),
  material_id: z.string(),
  material_title: z.string(),
  page_start: z.number().nullable(),
  page_end: z.number().nullable(),
  section_title: z.string().nullable(),
  content: z.string(),
  similarity: z.number(),
});

const INSERT_BATCH = 200;
const UPDATE_PARALLEL = 10;

export class SupabaseChunkRepository implements ChunkRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly materials: SupabaseMaterialRepository,
  ) {}

  async insert(chunks: ChunkRecord[]) {
    for (let start = 0; start < chunks.length; start += INSERT_BATCH) {
      const rows = chunks.slice(start, start + INSERT_BATCH).map((chunk) => ({
        id: chunk.id,
        material_id: chunk.materialId,
        class_id: chunk.classId,
        generation: chunk.generation,
        chunk_index: chunk.chunkIndex,
        page_start: chunk.pageStart ?? null,
        page_end: chunk.pageEnd ?? null,
        section_title: chunk.sectionTitle ?? null,
        content: chunk.content,
        content_hash: chunk.contentHash,
        token_estimate: chunk.tokenEstimate,
        embedding: chunk.embedding ? vectorLiteral(chunk.embedding) : null,
        embedding_model: chunk.embeddingModel ?? null,
      }));
      check(await this.client.from("content_chunks").insert(rows), "insert");
    }
  }

  async deleteGeneration(materialId: string, generation: number) {
    check(
      await this.client
        .from("content_chunks")
        .delete()
        .eq("material_id", materialId)
        .eq("generation", generation),
      "delete",
    );
  }

  async deleteForMaterial(materialId: string) {
    check(
      await this.client.from("content_chunks").delete().eq("material_id", materialId),
      "delete",
    );
  }

  async listWithoutEmbedding(materialId: string, generation: number, limit: number) {
    const rows = check(
      await this.client
        .from("content_chunks")
        .select(CHUNK_COLUMNS)
        .eq("material_id", materialId)
        .eq("generation", generation)
        .is("embedding", null)
        .order("chunk_index")
        .limit(limit),
    ) as unknown[];
    return rows.map(rowToChunk);
  }

  async findEmbedding(materialId: string, contentHash: string, model: string) {
    const rows = check(
      await this.client
        .from("content_chunks")
        .select("embedding")
        .eq("material_id", materialId)
        .eq("content_hash", contentHash)
        .eq("embedding_model", model)
        .not("embedding", "is", null)
        .limit(1),
    ) as { embedding: unknown }[];
    return rows[0] ? parseVector(rows[0].embedding) : null;
  }

  async setEmbeddings(rows: { id: string; embedding: number[]; model: string }[]) {
    for (let start = 0; start < rows.length; start += UPDATE_PARALLEL) {
      await Promise.all(
        rows.slice(start, start + UPDATE_PARALLEL).map(async ({ id, embedding, model }) =>
          check(
            await this.client
              .from("content_chunks")
              .update({ embedding: vectorLiteral(embedding), embedding_model: model })
              .eq("id", id),
            "update",
          ),
        ),
      );
    }
  }

  async activate(materialId: string, generation: number) {
    check(
      await this.client.rpc("content_activate_generation", {
        p_material_id: materialId,
        p_generation: generation,
      }),
      "activate",
    );
    const material = await this.materials.get(materialId);
    if (!material) throw new Error(`Material not found: ${materialId}`);
    return material;
  }

  async listActive(classId: string) {
    const live = (await this.materials.listByClass(classId)).filter(
      (material) => material.activeGeneration !== undefined,
    );
    const chunks: ChunkRecord[] = [];
    for (const material of live) {
      const rows = await fetchAll((from, to) =>
        this.client
          .from("content_chunks")
          .select(`${CHUNK_COLUMNS}, embedding`)
          .eq("material_id", material.id)
          .eq("generation", material.activeGeneration!)
          .order("chunk_index")
          .range(from, to),
      );
      chunks.push(...rows.map(rowToChunk));
    }
    return chunks;
  }

  async match({ classId, query, model, topicId, limit, minSimilarity }: ChunkMatchInput) {
    const rows = check(
      await this.client.rpc("content_match_chunks", {
        p_class_id: classId,
        p_query: vectorLiteral(query),
        p_model: model,
        p_topic_id: topicId ?? null,
        p_limit: limit,
        p_min_similarity: minSimilarity,
      }),
      "match",
    ) as unknown[];
    return rows.map((input) => {
      const row = matchRow.parse(input);
      return {
        chunkId: row.chunk_id,
        materialId: row.material_id,
        materialTitle: row.material_title,
        pageStart: orUndefined(row.page_start),
        pageEnd: orUndefined(row.page_end),
        sectionTitle: orUndefined(row.section_title),
        content: row.content,
        similarity: row.similarity,
      };
    });
  }
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

/** The private content-materials bucket (0500). Clients only ever see signed URLs. */
export class SupabaseMaterialStorage implements MaterialStorage {
  constructor(
    private readonly client: SupabaseClient,
    private readonly bucket = "content-materials",
  ) {}

  async createUploadUrl(path: string) {
    const data = check(
      await this.client.storage.from(this.bucket).createSignedUploadUrl(path, { upsert: true }),
      "signed upload URL",
    );
    return data.signedUrl;
  }

  async read(path: string) {
    const { data, error } = await this.client.storage.from(this.bucket).download(path);
    if (error || !data) return null;
    return new Uint8Array(await data.arrayBuffer());
  }

  async remove(path: string) {
    check(await this.client.storage.from(this.bucket).remove([path]), "storage remove");
  }

  async createDownloadUrl(path: string, expiresInSeconds: number) {
    const data = check(
      await this.client.storage.from(this.bucket).createSignedUrl(path, expiresInSeconds),
      "signed URL",
    );
    return data.signedUrl;
  }
}

// ---------------------------------------------------------------------------
// Objectives and milestones
// ---------------------------------------------------------------------------

interface VersionedTable<T extends { id: string; classId: string; updatedAt: string }> {
  table: string;
  columns: string;
  toRecord(row: unknown): T;
  toRow(record: T): Record<string, unknown>;
  /** Writes child rows after the main row (milestone -> objectives links). */
  afterSave?(client: SupabaseClient, record: T): Promise<void>;
}

/** Upsert by id with optimistic concurrency on updated_at; soft delete. */
class SupabaseVersionedRepository<
  T extends { id: string; classId: string; updatedAt: string },
> implements VersionedRepository<T> {
  constructor(
    private readonly client: SupabaseClient,
    private readonly spec: VersionedTable<T>,
  ) {}

  async list(classId: string) {
    const rows = await fetchAll((from, to) =>
      this.client
        .from(this.spec.table)
        .select(this.spec.columns)
        .eq("class_id", classId)
        .is("deleted_at", null)
        .order("position")
        .order("id")
        .range(from, to),
    );
    return rows.map((row) => this.spec.toRecord(row));
  }

  async get(id: string) {
    const row = check(
      await this.client
        .from(this.spec.table)
        .select(this.spec.columns)
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle(),
    );
    return row ? this.spec.toRecord(row) : null;
  }

  async upsert(record: T, expectedUpdatedAt: string | undefined, actorId: string) {
    const existing = check(
      await this.client
        .from(this.spec.table)
        .select("class_id, updated_at")
        .eq("id", record.id)
        .maybeSingle(),
    ) as { class_id: string; updated_at: string } | null;
    if (existing && existing.class_id !== record.classId) return "conflict" as const;
    if (
      expectedUpdatedAt !== undefined &&
      (!existing || iso(existing.updated_at) !== expectedUpdatedAt)
    ) {
      return "conflict" as const;
    }
    const row = { ...this.spec.toRow(record), deleted_at: null };
    if (existing) {
      // Matching the version read above closes the race with a concurrent save.
      const updated = check(
        await this.client
          .from(this.spec.table)
          .update(row)
          .eq("id", record.id)
          .eq("updated_at", existing.updated_at)
          .select("id"),
        "update",
      ) as { id: string }[];
      if (updated.length === 0) return "conflict" as const;
    } else {
      const { error } = await this.client
        .from(this.spec.table)
        .insert({ ...row, created_by: actorId });
      // 23505: a concurrent insert of the same id or code won.
      if (error?.code === "23505") return "conflict" as const;
      check({ data: null, error }, "insert");
    }
    await this.spec.afterSave?.(this.client, record);
    return (await this.get(record.id))!;
  }

  async softDelete(id: string, now: string) {
    check(
      await this.client.from(this.spec.table).update({ deleted_at: now }).eq("id", id),
      "update",
    );
  }
}

const objectiveRow = z.object({
  id: z.string(),
  class_id: z.string(),
  topic_id: z.string(),
  material_id: z.string().nullable(),
  code: z.string(),
  statement_es: z.string(),
  statement_en: z.string(),
  concept_id: z.string().nullable(),
  position: z.number(),
  updated_at: z.string(),
});

export const supabaseObjectiveRepository = (client: SupabaseClient) =>
  new SupabaseVersionedRepository<ObjectiveRecord>(client, {
    table: "content_objectives",
    columns:
      "id, class_id, topic_id, material_id, code, statement_es, statement_en, concept_id, position, updated_at",
    toRecord(input) {
      const row = objectiveRow.parse(input);
      return {
        id: row.id,
        classId: row.class_id,
        topicId: row.topic_id,
        materialId: orUndefined(row.material_id),
        code: row.code,
        statement: { es: row.statement_es, en: row.statement_en },
        conceptId: orUndefined(row.concept_id),
        position: row.position,
        updatedAt: iso(row.updated_at),
      };
    },
    toRow: (record) => ({
      id: record.id,
      class_id: record.classId,
      topic_id: record.topicId,
      material_id: record.materialId ?? null,
      code: record.code,
      statement_es: record.statement.es,
      statement_en: record.statement.en,
      concept_id: record.conceptId ?? null,
      position: record.position,
      updated_at: record.updatedAt,
    }),
  });

const milestoneRow = z.object({
  id: z.string(),
  class_id: z.string(),
  topic_id: z.string().nullable(),
  title_es: z.string(),
  title_en: z.string(),
  due_at: z.string().nullable(),
  position: z.number(),
  updated_at: z.string(),
  content_milestone_objectives: z.array(z.object({ objective_id: z.string() })).optional(),
});

export const supabaseMilestoneRepository = (client: SupabaseClient) =>
  new SupabaseVersionedRepository<MilestoneRecord>(client, {
    table: "content_milestones",
    columns:
      "id, class_id, topic_id, title_es, title_en, due_at, position, updated_at, content_milestone_objectives(objective_id)",
    toRecord(input) {
      const row = milestoneRow.parse(input);
      return {
        id: row.id,
        classId: row.class_id,
        topicId: orUndefined(row.topic_id),
        title: { es: row.title_es, en: row.title_en },
        dueAt: isoOrUndefined(row.due_at),
        position: row.position,
        objectiveIds: (row.content_milestone_objectives ?? []).map((link) => link.objective_id),
        updatedAt: iso(row.updated_at),
      };
    },
    toRow: (record) => ({
      id: record.id,
      class_id: record.classId,
      topic_id: record.topicId ?? null,
      title_es: record.title.es,
      title_en: record.title.en,
      due_at: record.dueAt ?? null,
      position: record.position,
      updated_at: record.updatedAt,
    }),
    async afterSave(client, record) {
      check(
        await client.from("content_milestone_objectives").delete().eq("milestone_id", record.id),
        "delete",
      );
      if (record.objectiveIds.length === 0) return;
      check(
        await client.from("content_milestone_objectives").insert(
          record.objectiveIds.map((objectiveId) => ({
            milestone_id: record.id,
            objective_id: objectiveId,
            class_id: record.classId,
          })),
        ),
        "insert",
      );
    },
  });

// ---------------------------------------------------------------------------
// Profiles, AI calls and flags
// ---------------------------------------------------------------------------

export const supabaseProfilePreferences = (client: SupabaseClient): ProfilePreferencesPort => ({
  async get(profileId) {
    const row = check(
      await client
        .from("profiles")
        .select("locale, accessibility_preferences")
        .eq("id", profileId)
        .maybeSingle(),
    ) as { locale: string; accessibility_preferences: unknown } | null;
    const locale = localeSchema.safeParse(row?.locale);
    const accessibility = row?.accessibility_preferences;
    return {
      locale: locale.success ? locale.data : "es",
      accessibility:
        accessibility && typeof accessibility === "object"
          ? (accessibility as Record<string, unknown>)
          : {},
    };
  },
});

const beginRow = z.object({ call_id: z.string(), allowed: z.boolean(), used_today: z.number() });

export class SupabaseAiCallLedger implements AiCallLedger {
  constructor(private readonly client: SupabaseClient) {}

  async begin(input: { classId: string; studentId: string; topicId?: string; dailyLimit: number }) {
    const rows = check(
      await this.client.rpc("content_begin_ai_call", {
        p_class_id: input.classId,
        p_student_id: input.studentId,
        p_topic_id: input.topicId ?? null,
        p_kind: "chat",
        p_daily_limit: input.dailyLimit,
      }),
      "begin AI call",
    ) as unknown[];
    const row = beginRow.parse(rows[0]);
    return { callId: row.call_id, allowed: row.allowed, usedToday: row.used_today };
  }

  async finish(
    callId: string,
    result: { outcome: string; flagCategory?: string; model?: string; latencyMs: number },
  ) {
    check(
      await this.client
        .from("content_ai_calls")
        .update({
          outcome: result.outcome,
          flag_category: result.flagCategory ?? null,
          model: result.model ?? null,
          latency_ms: result.latencyMs,
        })
        .eq("id", callId),
      "update",
    );
  }
}

const flagRow = z.object({
  id: z.string(),
  call_id: z.string(),
  class_id: z.string(),
  student_id: z.string(),
  topic_id: z.string().nullable(),
  category: contentFlagCategorySchema,
  action: contentFlagActionSchema,
  excerpt: z.string().nullable(),
  locale: localeSchema,
  created_at: z.string(),
  expires_at: z.string(),
  reviewed_at: z.string().nullable(),
  reviewed_by: z.string().nullable(),
  profiles: z.object({ display_name: z.string() }).nullable(),
});

// Two foreign keys point at profiles (student and reviewer), so the embed names one.
const FLAG_COLUMNS = "*, profiles!content_ai_flags_student_id_fkey(display_name)";

function rowToFlag(input: unknown): FlagRecord {
  const row = flagRow.parse(input);
  return {
    id: row.id,
    callId: row.call_id,
    classId: row.class_id,
    studentId: row.student_id,
    studentName: row.profiles?.display_name ?? "—",
    topicId: orUndefined(row.topic_id),
    category: row.category,
    action: row.action,
    excerpt: orUndefined(row.excerpt),
    locale: row.locale,
    createdAt: iso(row.created_at),
    expiresAt: iso(row.expires_at),
    reviewedAt: isoOrUndefined(row.reviewed_at),
    reviewedBy: orUndefined(row.reviewed_by),
  };
}

export class SupabaseFlagRepository implements FlagRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(flag: FlagRecord) {
    check(
      await this.client.from("content_ai_flags").insert({
        id: flag.id,
        call_id: flag.callId,
        class_id: flag.classId,
        student_id: flag.studentId,
        topic_id: flag.topicId ?? null,
        category: flag.category,
        action: flag.action,
        excerpt: flag.excerpt ?? null,
        locale: flag.locale,
        created_at: flag.createdAt,
        expires_at: flag.expiresAt,
      }),
      "insert",
    );
  }

  async listByClass(classId: string, now: Date) {
    const rows = await fetchAll((from, to) =>
      this.client
        .from("content_ai_flags")
        .select(FLAG_COLUMNS)
        .eq("class_id", classId)
        .gt("expires_at", now.toISOString())
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    );
    return rows.map(rowToFlag);
  }

  async get(id: string) {
    const row = check(
      await this.client.from("content_ai_flags").select(FLAG_COLUMNS).eq("id", id).maybeSingle(),
    );
    return row ? rowToFlag(row) : null;
  }

  async review(id: string, reviewerId: string, at: string) {
    const row = check(
      await this.client
        .from("content_ai_flags")
        .update({ reviewed_at: at, reviewed_by: reviewerId })
        .eq("id", id)
        .select(FLAG_COLUMNS)
        .single(),
      "update",
    );
    return rowToFlag(row);
  }
}
