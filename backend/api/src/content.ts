import {
  ContentCurriculumContext,
  InMemoryChunkRepository,
  InMemoryFlagRepository,
  InMemoryMaterialRepository,
  InMemoryMaterialStorage,
  InMemoryVersionedRepository,
  MOCK_EMBEDDING_MODEL,
  MockEmbeddingProvider,
  demoCurriculumCatalog,
  mockTextEmbedding,
  sha256Hex,
  LayeredGuardrailClassifier,
  HeuristicGuardrailClassifier,
  type FlagRecord,
  type MaterialRecord,
  type MilestoneRecord,
  type ObjectiveRecord,
  type ContentRoutesOptions,
} from "@athena/content";
import { createDemoContentSeed, demoContentChunk, demoContentPreferences } from "@athena/shared";
import type { FastifyInstance } from "fastify";
import { env } from "./env.js";
import { anthropic, gemini, supabaseAdmin } from "./lib.js";
import { AnthropicGuardrailClassifier, anthropicAnswerGenerator } from "./content-anthropic.js";
import {
  GeminiEmbeddingProvider,
  GeminiGuardrailClassifier,
  geminiAnswerGenerator,
  type GenAiModels,
} from "./content-gemini.js";
import {
  SupabaseAiCallLedger,
  SupabaseChunkRepository,
  SupabaseFlagRepository,
  SupabaseMaterialRepository,
  SupabaseMaterialStorage,
  supabaseMilestoneRepository,
  supabaseObjectiveRepository,
  supabaseProfilePreferences,
} from "./content-supabase.js";

/**
 * Content module adapters. ATHENA_DATA_MODE=real stores material, chunks, calls and flags in
 * Supabase (migrations 0500-0503); ATHENA_AI_MODE=real embeds, answers and classifies with
 * Gemini. Either can be mock on its own; mock keeps the module's in-memory and deterministic
 * parts. The curriculum catalog stays the demo course until P1's courses/topics exist.
 */
export function contentOptionsFor(
  dataMode = env.ATHENA_DATA_MODE,
  aiMode = env.ATHENA_AI_MODE,
): ContentRoutesOptions {
  const options: ContentRoutesOptions = dataMode === "real" ? {} : mockContentOptions();
  if (dataMode === "real") {
    const client = supabaseAdmin();
    const materials = new SupabaseMaterialRepository(client);
    Object.assign(options, {
      materials,
      chunks: new SupabaseChunkRepository(client, materials),
      storage: new SupabaseMaterialStorage(client),
      objectives: supabaseObjectiveRepository(client),
      milestones: supabaseMilestoneRepository(client),
      preferences: supabaseProfilePreferences(client),
      ledger: new SupabaseAiCallLedger(client),
      flags: new SupabaseFlagRepository(client),
    } satisfies ContentRoutesOptions);
  }
  if (aiMode === "real") {
    const models: GenAiModels = gemini().models;
    const claude = env.CONTENT_AI_PROVIDER === "anthropic" ? anthropic().messages : undefined;
    Object.assign(options, {
      embeddings: new GeminiEmbeddingProvider(models, env.CONTENT_EMBED_MODEL),
      generator: claude
        ? anthropicAnswerGenerator(claude, env.CONTENT_ANTHROPIC_CHAT_MODEL)
        : geminiAnswerGenerator(models, env.CONTENT_CHAT_MODEL, {
            fallbackModels: env.CONTENT_CHAT_FALLBACK_MODELS,
          }),
      classifier: new LayeredGuardrailClassifier(
        new HeuristicGuardrailClassifier(),
        claude
          ? new AnthropicGuardrailClassifier(claude, env.CONTENT_ANTHROPIC_GUARD_MODEL)
          : new GeminiGuardrailClassifier(models, env.CONTENT_GUARD_MODEL),
      ),
      retrieval: { minSimilarity: env.CONTENT_MIN_SIMILARITY },
    } satisfies ContentRoutesOptions);
  }
  return options;
}

/** One seeded in-memory graph shared by Content routes and Learning's Curriculum gateway. */
function mockContentOptions(): ContentRoutesOptions {
  const seed = createDemoContentSeed();
  const records: MaterialRecord[] = seed.materials.map((material) => {
    const { progress, searchable, ...publicFields } = material;
    const ready = material.status === "ready";
    if (searchable !== ready) throw new Error(`Invalid demo material search state: ${material.id}`);
    return {
      ...publicFields,
      storagePath: `${material.classId}/${material.id}/${material.filename}`,
      chunksTotal: progress.total,
      chunksEmbedded: progress.embedded,
      activeGeneration: ready ? 1 : undefined,
      verifiedAt: material.createdAt,
    };
  });
  const materials = new InMemoryMaterialRepository(records);
  const chunks = new InMemoryChunkRepository(materials, [
    {
      id: demoContentChunk.id,
      materialId: demoContentChunk.materialId,
      classId: demoContentChunk.classId,
      generation: 1,
      chunkIndex: 0,
      pageStart: demoContentChunk.pageStart,
      pageEnd: demoContentChunk.pageEnd,
      sectionTitle: demoContentChunk.sectionTitle,
      content: demoContentChunk.text,
      contentHash: sha256Hex(demoContentChunk.text),
      tokenEstimate: Math.ceil(demoContentChunk.text.length / 4),
      embedding: mockTextEmbedding(demoContentChunk.text),
      embeddingModel: MOCK_EMBEDDING_MODEL,
    },
  ]);
  const flags: FlagRecord[] = seed.flags.map((flag) => ({
    ...flag,
    callId: `seed-${flag.id}`,
    expiresAt: "2027-01-24T00:00:00.000Z",
  }));
  return {
    materials,
    chunks,
    storage: new InMemoryMaterialStorage(),
    embeddings: new MockEmbeddingProvider(),
    catalog: demoCurriculumCatalog,
    objectives: new InMemoryVersionedRepository<ObjectiveRecord>(seed.objectives),
    milestones: new InMemoryVersionedRepository<MilestoneRecord>(seed.milestones),
    flags: new InMemoryFlagRepository(flags),
    preferences: {
      async get() {
        return {
          locale: demoContentPreferences.locale,
          accessibility: demoContentPreferences.accessibility,
        };
      },
    },
  };
}

/**
 * Learning retrieval uses the exact repositories and embedding provider registered by Content,
 * including the shared seeded stores in mock mode.
 */
export function contentCurriculumContextFor(
  app: FastifyInstance,
  options: ContentRoutesOptions,
  dataMode = env.ATHENA_DATA_MODE,
) {
  if (!options.materials || !options.chunks || !options.objectives) {
    throw new Error("Content-backed curriculum context requires shared repositories");
  }
  const embeddings = options.embeddings ?? new MockEmbeddingProvider();
  const catalog = options.catalog ?? demoCurriculumCatalog;
  options.embeddings = embeddings;
  options.catalog = catalog;
  return new ContentCurriculumContext({
    classes: app.platform.classes,
    enrollments: app.platform.enrollments,
    catalog,
    materials: options.materials,
    chunks: options.chunks,
    embeddings,
    objectives: options.objectives,
    minSimilarity: dataMode === "mock" ? 0 : options.retrieval?.minSimilarity,
  });
}
