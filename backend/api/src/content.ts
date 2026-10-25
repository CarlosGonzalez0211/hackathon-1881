import {
  ContentCurriculumContext,
  MockEmbeddingProvider,
  demoCurriculumCatalog,
  LayeredGuardrailClassifier,
  HeuristicGuardrailClassifier,
  type ContentRoutesOptions,
} from "@athena/content";
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
  const options: ContentRoutesOptions = {};
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

/**
 * Real-data Learning retrieval uses the exact repositories and embedding provider registered by
 * Content. Mock mode intentionally keeps Learning's deterministic curriculum fixture.
 */
export function contentCurriculumContextFor(
  app: FastifyInstance,
  options: ContentRoutesOptions,
  dataMode = env.ATHENA_DATA_MODE,
) {
  if (dataMode !== "real") return undefined;
  if (!options.materials || !options.chunks || !options.objectives) {
    throw new Error("Content-backed curriculum context requires shared real-data repositories");
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
    minSimilarity: options.retrieval?.minSimilarity,
  });
}
