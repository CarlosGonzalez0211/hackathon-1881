import {
  GroundedAnswerGenerator,
  type EmbeddingProvider,
  type GroundedTextGenerator,
  type GuardrailClassifier,
  type GuardrailInput,
} from "@athena/content";
import { CLASSIFIER_RULES, fenceMessage, parseVerdict } from "./content-guardrail-prompt.js";

/**
 * Gemini adapters for the content module (ATHENA_AI_MODE=real). They depend on the slice of
 * the @google/genai client they call, so tests pass a fake and need no key.
 */
export interface GenAiModels {
  embedContent(request: {
    model: string;
    contents: string[];
    config?: { outputDimensionality?: number; taskType?: string; abortSignal?: AbortSignal };
  }): Promise<{ embeddings?: { values?: number[] }[] }>;
  generateContent(request: {
    model: string;
    contents: string;
    config?: {
      systemInstruction?: string;
      responseMimeType?: string;
      temperature?: number;
      abortSignal?: AbortSignal;
    };
  }): Promise<{ text?: string }>;
}

const TIMEOUT_MS = 20_000;
/** The API takes at most 100 inputs per embedding request. */
const EMBED_BATCH = 100;

const normalize = (vector: number[]) => {
  const norm = Math.hypot(...vector) || 1;
  return vector.map((value) => value / norm);
};

/**
 * gemini-embedding-2 takes task prefixes in the text; gemini-embedding-001 takes taskType.
 * Vectors are 768-d (content_chunks.embedding) and normalized either way.
 */
export class GeminiEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions = 768;

  constructor(
    private readonly models: GenAiModels,
    readonly model: string,
  ) {}

  async embedDocuments(items: { title: string; text: string }[]) {
    const legacy = this.legacy();
    const vectors: number[][] = [];
    for (let start = 0; start < items.length; start += EMBED_BATCH) {
      const batch = items.slice(start, start + EMBED_BATCH);
      vectors.push(
        ...(await this.embed(
          batch.map((item) =>
            legacy ? item.text : `title: ${item.title.trim() || "none"} | text: ${item.text}`,
          ),
          "RETRIEVAL_DOCUMENT",
        )),
      );
    }
    return vectors;
  }

  async embedQuery(text: string) {
    const legacy = this.legacy();
    const [vector] = await this.embed(
      [legacy ? text : `task: question answering | query: ${text}`],
      "RETRIEVAL_QUERY",
    );
    return vector!;
  }

  private legacy() {
    return this.model.startsWith("gemini-embedding-001");
  }

  private async embed(contents: string[], taskType: string) {
    const response = await this.models.embedContent({
      model: this.model,
      contents,
      config: {
        outputDimensionality: this.dimensions,
        ...(this.legacy() && { taskType }),
        abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      },
    });
    const vectors = (response.embeddings ?? []).map((embedding) => embedding.values ?? []);
    if (vectors.length !== contents.length || vectors.some((v) => v.length !== this.dimensions)) {
      throw new Error(`Embedding response did not match the request (${this.model})`);
    }
    return vectors.map(normalize);
  }
}

export interface RetryOptions {
  /** Tried in order when the primary model keeps failing with a transient error. */
  fallbackModels?: string[];
  /** Passes over the model list before giving up. */
  rounds?: number;
  backoffMs?: number;
  /** No new attempt starts after this much time has passed. */
  deadlineMs?: number;
  /** Content expects JSON; Learning requests plain text for direct display in the tutor UI. */
  responseMimeType?: "application/json" | "text/plain";
}

/** Overload (429/503), server errors and our own timeout are worth another try; the rest are not. */
const isTransient = (error: unknown) => {
  const status = (error as { status?: number }).status;
  if (status !== undefined) return status === 429 || status >= 500;
  return (error as Error).name === "TimeoutError" || (error as Error).name === "AbortError";
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The GroundedTextGenerator seam shared with Learning's tutor. Content requests JSON by default;
 * Learning opts into plain text for direct display.
 * Gemini models shed load with 503s, so transient failures retry and then move to the fallbacks.
 */
export class GeminiTextGenerator implements GroundedTextGenerator {
  constructor(
    private readonly models: GenAiModels,
    private readonly model: string,
    private readonly retry: RetryOptions = {},
  ) {}

  async generate({ system, user }: { system: string; user: string }) {
    const {
      fallbackModels = [],
      rounds = 2,
      backoffMs = 400,
      deadlineMs = 40_000,
      responseMimeType = "application/json",
    } = this.retry;
    const candidates = [this.model, ...fallbackModels];
    const started = Date.now();
    let failure: unknown;
    for (let round = 0; round < rounds; round += 1) {
      for (const model of candidates) {
        if (failure && Date.now() - started > deadlineMs) throw failure;
        try {
          const response = await this.models.generateContent({
            model,
            contents: user,
            config: {
              systemInstruction: system,
              responseMimeType,
              temperature: 0.2,
              abortSignal: AbortSignal.timeout(TIMEOUT_MS),
            },
          });
          return response.text ?? "";
        } catch (error) {
          if (!isTransient(error)) throw error;
          failure = error;
        }
      }
      if (round < rounds - 1) await sleep(backoffMs * (round + 1));
    }
    throw failure;
  }
}

export const geminiAnswerGenerator = (
  models: GenAiModels,
  model: string,
  retry: RetryOptions = {},
) => new GroundedAnswerGenerator(new GeminiTextGenerator(models, model, retry), model);

/**
 * Model guardrail behind the heuristics (LayeredGuardrailClassifier). A reply that does not
 * parse throws, so the chat fails closed and abstains.
 */
export class GeminiGuardrailClassifier implements GuardrailClassifier {
  constructor(
    private readonly models: GenAiModels,
    private readonly model: string,
  ) {}

  async classify({ message }: GuardrailInput) {
    const response = await this.models.generateContent({
      model: this.model,
      contents: fenceMessage(message),
      config: {
        systemInstruction: CLASSIFIER_RULES,
        responseMimeType: "application/json",
        temperature: 0,
        abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      },
    });
    return parseVerdict(response.text);
  }
}
