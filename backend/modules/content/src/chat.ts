import {
  CONTENT_LIMITS,
  contentAiUsagePayloadSchema,
  contentChatResponseSchema,
  contentFlagSchema,
  contentGuardrailPolicy,
  type AuthContext,
  type ContentChatOutcome,
  type ContentChatRequest,
  type ContentChatResponse,
  type ContentCitation,
  type ContentFlag,
  type ContentFlagCategory,
  type ContentRateLimitError,
  type Locale,
} from "@athena/shared";
import {
  forbidden,
  notFound,
  type AuthorizationService,
  type ClassCatalog,
  type Clock,
  type DomainEventStore,
  type IdGenerator,
} from "@athena/platform";
import type { AnswerGenerator, AnswerOutput, AnswerSource } from "./generation.js";
import type { GuardrailClassifier } from "./guardrails.js";
import { message, type MessageKey } from "./messages.js";
import type {
  AiCallLedger,
  ChunkMatch,
  ChunkRepository,
  CurriculumCatalogPort,
  EmbeddingProvider,
  FlagRepository,
  MaterialRepository,
  ProfilePreferencesPort,
} from "./ports.js";
import { assertTopicsInCourse, courseOfClass } from "./scope.js";

export interface RetrievalOptions {
  /** Chunks handed to the tutor. */
  limit?: number;
  /** Cosine similarity below which a chunk does not count as evidence. Model-specific. */
  minSimilarity?: number;
}

export interface RateLimitOptions {
  perWindow?: number;
  windowSeconds?: number;
  perDay?: number;
}

/** In-process sliding window per student (one instance only; the daily cap is in the ledger). */
export class SlidingWindowLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  take(
    key: string,
    nowMs: number,
  ): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
    const recent = (this.hits.get(key) ?? []).filter((at) => at > nowMs - this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      const retryAfterSeconds = Math.max(1, Math.ceil((recent[0]! + this.windowMs - nowMs) / 1000));
      return { allowed: false, retryAfterSeconds };
    }
    recent.push(nowMs);
    this.hits.set(key, recent);
    return { allowed: true };
  }
}

export interface ChatServiceDeps {
  authorization: AuthorizationService;
  classes: ClassCatalog;
  catalog: CurriculumCatalogPort;
  materials: MaterialRepository;
  chunks: ChunkRepository;
  embeddings: EmbeddingProvider;
  generator: AnswerGenerator;
  classifier: GuardrailClassifier;
  preferences: ProfilePreferencesPort;
  ledger: AiCallLedger;
  flags: FlagRepository;
  events: DomainEventStore;
  clock: Clock;
  ids: IdGenerator;
  retrieval?: RetrievalOptions;
  rateLimit?: RateLimitOptions;
}

export type ChatResult =
  { status: 200; body: ContentChatResponse } | { status: 429; body: ContentRateLimitError };

interface Reply {
  outcome: ContentChatOutcome;
  answer: string;
  citations: ContentCitation[];
  suggestedTopicIds: string[];
  flagCategory?: ContentFlagCategory;
}

const truncate = (text: string, max: number) => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${space > max * 0.6 ? cut.slice(0, space) : cut}…`;
};

/**
 * The class-scoped tutor: guardrails -> retrieval over the class's live chunks -> grounded
 * answer -> citation check. Students of the class use it under rate limits and every call is
 * recorded (content_ai_calls + AiUsageRecorded). The class professor and admins get a preview
 * that is not limited, recorded or flagged.
 */
export class ChatService {
  private readonly limiter: SlidingWindowLimiter;
  private readonly perDay: number;
  private readonly limit: number;
  private readonly minSimilarity: number;

  constructor(private readonly deps: ChatServiceDeps) {
    const rate = deps.rateLimit ?? {};
    this.limiter = new SlidingWindowLimiter(
      rate.perWindow ?? CONTENT_LIMITS.messagesPerWindow,
      (rate.windowSeconds ?? CONTENT_LIMITS.windowSeconds) * 1000,
    );
    this.perDay = rate.perDay ?? CONTENT_LIMITS.messagesPerDay;
    this.limit = deps.retrieval?.limit ?? 6;
    this.minSimilarity = deps.retrieval?.minSimilarity ?? 0.2;
  }

  async chat(
    context: AuthContext,
    classId: string,
    request: ContentChatRequest,
  ): Promise<ChatResult> {
    const { authorization, ledger, clock } = this.deps;
    const preview = authorization.canManageClass(context, classId);
    if (
      !preview &&
      !(context.role === "student" && authorization.canAccessClass(context, classId))
    ) {
      throw forbidden("Only students of this class can use its tutor");
    }
    const courseId = await courseOfClass(this.deps.classes, context, classId);
    if (request.topicId) await assertTopicsInCourse(this.deps.catalog, courseId, [request.topicId]);
    const preferences = await this.deps.preferences.get(context.userId);
    const locale = preferences.locale;

    let callId: string | undefined;
    if (!preview) {
      const window = this.limiter.take(context.userId, clock.now().getTime());
      if (!window.allowed) return this.rateLimited(locale, window.retryAfterSeconds);
      const begun = await ledger.begin({
        classId,
        studentId: context.userId,
        topicId: request.topicId,
        dailyLimit: this.perDay,
        now: clock.now(),
      });
      if (!begun.allowed) return this.rateLimited(locale, 60 * 60);
      callId = begun.callId;
    }

    const started = performance.now();
    let reply: Reply;
    try {
      reply = await this.respond(classId, courseId, request, locale, preferences.accessibility);
    } catch (error) {
      if (callId) {
        await ledger
          .finish(callId, { outcome: "error", latencyMs: Math.round(performance.now() - started) })
          .catch(() => undefined);
      }
      throw error;
    }

    if (callId) {
      await this.record(context, classId, courseId, request, locale, callId, reply, started);
    }
    // Parsing drops flagCategory: students never see how their message was classified.
    return { status: 200, body: contentChatResponseSchema.parse({ ...reply, locale, preview }) };
  }

  async listFlags(context: AuthContext, classId: string): Promise<ContentFlag[]> {
    if (!this.deps.authorization.canManageClass(context, classId)) {
      throw forbidden("Only the class professor can see tutor flags");
    }
    const rows = await this.deps.flags.listByClass(classId, this.deps.clock.now());
    return rows.map((row) => contentFlagSchema.parse(row));
  }

  async reviewFlag(context: AuthContext, flagId: string): Promise<ContentFlag> {
    const flag = await this.deps.flags.get(flagId);
    if (!flag || !this.deps.authorization.canAccessClass(context, flag.classId)) {
      throw notFound("Flag", flagId);
    }
    if (!this.deps.authorization.canManageClass(context, flag.classId)) {
      throw forbidden("Only the class professor can review tutor flags");
    }
    const reviewed = await this.deps.flags.review(
      flagId,
      context.userId,
      this.deps.clock.now().toISOString(),
    );
    return contentFlagSchema.parse(reviewed);
  }

  private async respond(
    classId: string,
    courseId: string,
    request: ContentChatRequest,
    locale: Locale,
    accessibility: Record<string, unknown>,
  ): Promise<Reply> {
    let verdict;
    try {
      verdict = await this.deps.classifier.classify({ message: request.message, locale });
    } catch {
      // Fail closed: an unchecked message never reaches the tutor.
      return this.fixed("abstained", "abstain", locale, await this.suggestions(classId, courseId));
    }
    const simplifiedLanguage = accessibility.simplifiedLanguage === true;

    if (verdict.category === "ok") {
      const matches = await this.retrieve(classId, request);
      if (matches.length === 0) {
        return this.fixed(
          "abstained",
          "abstain",
          locale,
          await this.suggestions(classId, courseId),
        );
      }
      const grounded = await this.ground(matches, request, locale, "answer", simplifiedLanguage);
      return grounded
        ? { outcome: "answered", ...grounded, suggestedTopicIds: [] }
        : this.fixed("abstained", "abstain", locale, await this.suggestions(classId, courseId));
    }

    const category = verdict.category;
    const policy = contentGuardrailPolicy[category];
    const withFlag = (reply: Reply): Reply => ({ ...reply, flagCategory: category });
    switch (category) {
      case "off_topic":
        return withFlag(
          this.fixed(policy.action, "offTopic", locale, await this.suggestions(classId, courseId)),
        );
      case "graded_work": {
        const matches = await this.retrieve(classId, request);
        const guided =
          matches.length > 0
            ? await this.ground(matches, request, locale, "guide", simplifiedLanguage)
            : null;
        return withFlag(
          guided
            ? { outcome: policy.action, ...guided, suggestedTopicIds: [] }
            : this.fixed(policy.action, "gradedWork", locale, []),
        );
      }
      case "prompt_injection":
        return withFlag(this.fixed(policy.action, "promptInjection", locale, []));
      case "unsafe":
        return withFlag(this.fixed(policy.action, "unsafe", locale, []));
      case "self_harm":
        return withFlag(this.fixed(policy.action, "selfHarm", locale, []));
    }
  }

  private async retrieve(classId: string, request: ContentChatRequest) {
    const query = await this.deps.embeddings.embedQuery(request.message);
    return this.deps.chunks.match({
      classId,
      query,
      model: this.deps.embeddings.model,
      topicId: request.topicId,
      limit: this.limit,
      minSimilarity: this.minSimilarity,
    });
  }

  /** Generates from the matches and keeps the reply only if every citation was retrieved. */
  private async ground(
    matches: ChunkMatch[],
    request: ContentChatRequest,
    locale: Locale,
    mode: "answer" | "guide",
    simplifiedLanguage: boolean,
  ) {
    const sources: AnswerSource[] = matches.map((match, index) => ({
      label: `S${index + 1}`,
      materialTitle: match.materialTitle,
      page: match.pageStart,
      section: match.sectionTitle,
      text: match.content,
    }));
    const output = await this.deps.generator.generate({
      mode,
      message: request.message,
      history: request.history.map((turn) => turn.content),
      sources,
      locale,
      simplifiedLanguage,
    });
    return citeOrReject(output, matches);
  }

  private fixed(
    outcome: ContentChatOutcome,
    key: MessageKey,
    locale: Locale,
    suggestedTopicIds: string[],
  ): Reply {
    return { outcome, answer: message(key, locale), citations: [], suggestedTopicIds };
  }

  /** Topics of the course that have live material in this class; else the course's topics. */
  private async suggestions(classId: string, courseId: string) {
    const topics = await this.deps.catalog.listTopics(courseId);
    const covered = new Set(
      (await this.deps.materials.listByClass(classId))
        .filter((material) => material.activeGeneration !== undefined)
        .flatMap((material) => material.topicIds),
    );
    const withMaterial = topics.filter((topic) => covered.has(topic.id));
    return (withMaterial.length > 0 ? withMaterial : topics).slice(0, 5).map((topic) => topic.id);
  }

  private rateLimited(locale: Locale, retryAfterSeconds: number): ChatResult {
    return { status: 429, body: { error: message("rateLimited", locale), retryAfterSeconds } };
  }

  private async record(
    context: AuthContext,
    classId: string,
    courseId: string,
    request: ContentChatRequest,
    locale: Locale,
    callId: string,
    reply: Reply,
    started: number,
  ) {
    const { ledger, flags, events, clock, ids, generator } = this.deps;
    const now = clock.now();
    await ledger.finish(callId, {
      outcome: reply.outcome,
      flagCategory: reply.flagCategory,
      model: generator.model,
      latencyMs: Math.round(performance.now() - started),
    });
    if (reply.flagCategory) {
      const policy = contentGuardrailPolicy[reply.flagCategory];
      if (policy.report) {
        await flags.create({
          id: ids.next(),
          callId,
          classId,
          studentId: context.userId,
          studentName: context.displayName,
          topicId: request.topicId,
          category: reply.flagCategory,
          action: policy.action,
          excerpt: policy.keepExcerpt
            ? truncate(request.message, CONTENT_LIMITS.maxFlagExcerpt)
            : undefined,
          locale,
          createdAt: now.toISOString(),
          expiresAt: new Date(
            now.getTime() + CONTENT_LIMITS.flagRetentionDays * 24 * 60 * 60 * 1000,
          ).toISOString(),
        });
      }
    }
    await events.append({
      id: callId,
      type: "AiUsageRecorded",
      aggregateType: "content_chat",
      aggregateId: callId,
      actorId: context.userId,
      classId,
      courseId,
      studentId: context.userId,
      occurredAt: now.toISOString(),
      payload: contentAiUsagePayloadSchema.parse({
        kind: "chat",
        outcome: reply.outcome,
        ...(reply.flagCategory && { flagCategory: reply.flagCategory }),
      }),
    });
  }
}

/**
 * Learning's rule: a supported reply cites at least one source and only retrieved ones.
 * Labels are renumbered [S3] -> [1] in order of first use and mapped to citations.
 */
export function citeOrReject(
  output: AnswerOutput,
  matches: ChunkMatch[],
): { answer: string; citations: ContentCitation[] } | null {
  if (output.unsupported || !output.answer.trim()) return null;
  const known = new Map(matches.map((match, index) => [`S${index + 1}`, match]));
  const inText = [...output.answer.matchAll(/\[(S\d+)\]/g)].map((found) => found[1]!);
  const cited = [...new Set([...inText, ...output.citedSources])];
  if (cited.length === 0 || cited.some((label) => !known.has(label))) return null;
  const answer = output.answer.replace(
    /\[(S\d+)\]/g,
    (_, label: string) => `[${cited.indexOf(label) + 1}]`,
  );
  const citations = cited.slice(0, 10).map((label) => {
    const match = known.get(label)!;
    return {
      materialId: match.materialId,
      materialTitle: match.materialTitle,
      page: match.pageStart,
      section: match.sectionTitle,
      chunkId: match.chunkId,
      excerpt: truncate(match.content, CONTENT_LIMITS.maxCitationExcerpt),
    };
  });
  return { answer, citations };
}
