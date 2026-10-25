import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  CONTENT_LIMITS,
  contentChatRequestSchema,
  createContentMaterialRequestSchema,
  updateContentMaterialRequestSchema,
  upsertContentMilestoneRequestSchema,
  upsertContentObjectiveRequestSchema,
} from "@athena/shared";
import { ChatService, type RateLimitOptions, type RetrievalOptions } from "./chat.js";
import { DefaultDocumentExtractor, MockEmbeddingProvider, ParagraphChunker } from "./extraction.js";
import { MockAnswerGenerator, type AnswerGenerator } from "./generation.js";
import { LayeredGuardrailClassifier, type GuardrailClassifier } from "./guardrails.js";
import { MaterialIngestionService, type IngestionOptions } from "./ingestion.js";
import {
  defaultProfilePreferences,
  demoCurriculumCatalog,
  InMemoryAiCallLedger,
  InMemoryChunkRepository,
  InMemoryFlagRepository,
  InMemoryMaterialRepository,
  InMemoryMaterialStorage,
  InMemoryVersionedRepository,
} from "./memory.js";
import type {
  AiCallLedger,
  ChunkRepository,
  ChunkingStrategy,
  CurriculumCatalogPort,
  DocumentExtractor,
  EmbeddingProvider,
  FlagRepository,
  MaterialRepository,
  MaterialStorage,
  MilestoneRecord,
  ObjectiveRecord,
  ProfilePreferencesPort,
  VersionedRepository,
} from "./ports.js";
import { ContentService } from "./service.js";

const classParams = z.object({ classId: z.string().uuid() });
const materialParams = z.object({ materialId: z.string().uuid() });
const objectiveParams = classParams.extend({ objectiveId: z.string().uuid() });
const milestoneParams = classParams.extend({ milestoneId: z.string().uuid() });
const uploadParams = z.object({ token: z.string().uuid() });
const flagParams = z.object({ flagId: z.string().uuid() });

export interface ContentRoutesOptions {
  materials?: MaterialRepository;
  /** Required when materials is not the in-memory repository. */
  chunks?: ChunkRepository;
  storage?: MaterialStorage;
  extractor?: DocumentExtractor;
  chunker?: ChunkingStrategy;
  embeddings?: EmbeddingProvider;
  /** Curriculum (P1) courses and topics. Defaults to the demo course. */
  catalog?: CurriculumCatalogPort;
  objectives?: VersionedRepository<ObjectiveRecord>;
  milestones?: VersionedRepository<MilestoneRecord>;
  ingestion?: IngestionOptions;
  /** The tutor. Defaults to a deterministic mock that quotes and cites the best source. */
  generator?: AnswerGenerator;
  /** Defaults to the Spanish/English heuristics with no model classifier. */
  classifier?: GuardrailClassifier;
  preferences?: ProfilePreferencesPort;
  ledger?: AiCallLedger;
  flags?: FlagRepository;
  retrieval?: RetrievalOptions;
  rateLimit?: RateLimitOptions;
}

/** Register inside the `/api` prefix, after `installPlatform` ran on the root app. */
export async function contentRoutes(app: FastifyInstance, options: ContentRoutesOptions = {}) {
  const materials = options.materials ?? new InMemoryMaterialRepository();
  const chunks =
    options.chunks ??
    (materials instanceof InMemoryMaterialRepository
      ? new InMemoryChunkRepository(materials)
      : undefined);
  if (!chunks) throw new Error("contentRoutes: pass `chunks` with a custom material repository");
  const storage = options.storage ?? new InMemoryMaterialStorage();
  const { platform } = app;
  const embeddings = options.embeddings ?? new MockEmbeddingProvider();
  const catalog = options.catalog ?? demoCurriculumCatalog;
  const ingestion = new MaterialIngestionService(
    {
      materials,
      chunks,
      storage,
      extractor: options.extractor ?? new DefaultDocumentExtractor(),
      chunker: options.chunker ?? new ParagraphChunker(),
      embeddings,
      events: platform.events,
      clock: platform.clock,
      ids: platform.ids,
    },
    options.ingestion,
  );
  const service = new ContentService({
    authorization: platform.authorization,
    classes: platform.classes,
    catalog,
    materials,
    chunks,
    storage,
    ingestion,
    objectives: options.objectives ?? new InMemoryVersionedRepository<ObjectiveRecord>(),
    milestones: options.milestones ?? new InMemoryVersionedRepository<MilestoneRecord>(),
    events: platform.events,
    clock: platform.clock,
    ids: platform.ids,
  });
  const chat = new ChatService({
    authorization: platform.authorization,
    classes: platform.classes,
    catalog,
    materials,
    chunks,
    embeddings,
    generator: options.generator ?? new MockAnswerGenerator(),
    classifier: options.classifier ?? new LayeredGuardrailClassifier(),
    preferences: options.preferences ?? defaultProfilePreferences,
    ledger: options.ledger ?? new InMemoryAiCallLedger(),
    flags: options.flags ?? new InMemoryFlagRepository(),
    events: platform.events,
    clock: platform.clock,
    ids: platform.ids,
    retrieval: options.retrieval,
    rateLimit: options.rateLimit,
  });

  app.post("/content/classes/:classId/chat", async (request, reply) => {
    const { classId } = classParams.parse(request.params);
    const body = contentChatRequestSchema.parse(request.body);
    const result = await chat.chat(request.auth, classId, body);
    if (result.status === 429) reply.header("retry-after", result.body.retryAfterSeconds);
    return reply.status(result.status).send(result.body);
  });

  app.get("/content/classes/:classId/flags", async (request) =>
    chat.listFlags(request.auth, classParams.parse(request.params).classId),
  );

  app.post("/content/flags/:flagId/review", async (request) =>
    chat.reviewFlag(request.auth, flagParams.parse(request.params).flagId),
  );

  app.post("/content/classes/:classId/materials", async (request, reply) => {
    const { classId } = classParams.parse(request.params);
    const body = createContentMaterialRequestSchema.parse(request.body);
    const result = await service.createMaterial(request.auth, classId, body);
    return reply.status(result.duplicate ? 200 : 201).send(result);
  });

  app.get("/content/classes/:classId/materials", async (request) =>
    service.listMaterials(request.auth, classParams.parse(request.params).classId),
  );

  app.get("/content/materials/:materialId", async (request) =>
    service.getMaterial(request.auth, materialParams.parse(request.params).materialId),
  );

  app.patch("/content/materials/:materialId", async (request) => {
    const { materialId } = materialParams.parse(request.params);
    const body = updateContentMaterialRequestSchema.parse(request.body);
    return service.updateMaterial(request.auth, materialId, body);
  });

  app.delete("/content/materials/:materialId", async (request, reply) => {
    await service.deleteMaterial(request.auth, materialParams.parse(request.params).materialId);
    return reply.status(204).send();
  });

  app.post("/content/materials/:materialId/complete", async (request) =>
    service.completeUpload(request.auth, materialParams.parse(request.params).materialId),
  );

  app.post("/content/materials/:materialId/process", async (request) =>
    service.processMaterial(request.auth, materialParams.parse(request.params).materialId),
  );

  app.get("/content/materials/:materialId/download", async (request) =>
    service.downloadUrl(request.auth, materialParams.parse(request.params).materialId),
  );

  app.get("/content/classes/:classId/objectives", async (request) =>
    service.listObjectives(request.auth, classParams.parse(request.params).classId),
  );

  app.put("/content/classes/:classId/objectives/:objectiveId", async (request) => {
    const { classId, objectiveId } = objectiveParams.parse(request.params);
    const body = upsertContentObjectiveRequestSchema.parse(request.body);
    return service.upsertObjective(request.auth, classId, objectiveId, body);
  });

  app.delete("/content/classes/:classId/objectives/:objectiveId", async (request, reply) => {
    const { classId, objectiveId } = objectiveParams.parse(request.params);
    await service.deleteObjective(request.auth, classId, objectiveId);
    return reply.status(204).send();
  });

  app.get("/content/classes/:classId/milestones", async (request) =>
    service.listMilestones(request.auth, classParams.parse(request.params).classId),
  );

  app.put("/content/classes/:classId/milestones/:milestoneId", async (request) => {
    const { classId, milestoneId } = milestoneParams.parse(request.params);
    const body = upsertContentMilestoneRequestSchema.parse(request.body);
    return service.upsertMilestone(request.auth, classId, milestoneId, body);
  });

  app.delete("/content/classes/:classId/milestones/:milestoneId", async (request, reply) => {
    const { classId, milestoneId } = milestoneParams.parse(request.params);
    await service.deleteMilestone(request.auth, classId, milestoneId);
    return reply.status(204).send();
  });

  // Mock storage only: stands in for the Supabase signed upload URL, so mock mode works end
  // to end without a bucket. Callers still pass platform auth; the one-time token picks the path.
  if (storage instanceof InMemoryMaterialStorage) {
    app.addContentTypeParser(
      "application/octet-stream",
      { parseAs: "buffer", bodyLimit: CONTENT_LIMITS.maxFileBytes },
      (_request, body, done) => done(null, body),
    );
    app.put("/content/dev-uploads/:token", async (request, reply) => {
      const { token } = uploadParams.parse(request.params);
      if (!Buffer.isBuffer(request.body)) {
        return reply.status(415).send({ error: "Send the file as application/octet-stream" });
      }
      if (!storage.acceptUpload(token, request.body)) {
        return reply.status(404).send({ error: "Unknown or used upload token" });
      }
      return reply.status(204).send();
    });
  }
}
