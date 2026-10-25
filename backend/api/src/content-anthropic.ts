import {
  GroundedAnswerGenerator,
  type GroundedTextGenerator,
  type GuardrailClassifier,
  type GuardrailInput,
} from "@athena/content";
import { CLASSIFIER_RULES, fenceMessage, parseVerdict } from "./content-guardrail-prompt.js";

/**
 * Anthropic adapters for the content module (CONTENT_AI_PROVIDER=anthropic). They depend on the
 * slice of the @anthropic-ai/sdk client they call, so tests pass a fake and need no key.
 * Embeddings stay on Gemini: Anthropic has no embeddings API.
 */
export interface AnthropicMessages {
  create(
    request: {
      model: string;
      max_tokens: number;
      system: string;
      messages: { role: "user"; content: string }[];
      output_config?: { effort: "low" | "medium" | "high" };
    },
    options?: { timeout?: number },
  ): Promise<{ content: { type: string; text?: string }[]; stop_reason?: string | null }>;
}

const TIMEOUT_MS = 20_000;

/** Thinking tokens count toward max_tokens, so leave room beyond the JSON reply itself. */
const ANSWER_MAX_TOKENS = 4_000;
const VERDICT_MAX_TOKENS = 1_000;

async function complete(
  messages: AnthropicMessages,
  request: {
    model: string;
    system: string;
    user: string;
    maxTokens: number;
    effort: "low" | "medium" | "high";
  },
) {
  const response = await messages.create(
    {
      model: request.model,
      max_tokens: request.maxTokens,
      system: request.system,
      messages: [{ role: "user", content: request.user }],
      output_config: { effort: request.effort },
    },
    { timeout: TIMEOUT_MS },
  );
  // A declined or cut-off reply is not an answer: throwing makes the chat error or fail closed.
  if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
    throw new Error(`Anthropic reply not usable (stop_reason ${response.stop_reason})`);
  }
  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("");
}

/** The GroundedTextGenerator seam (shared with Learning's tutor): system + user -> JSON text. */
export class AnthropicTextGenerator implements GroundedTextGenerator {
  constructor(
    private readonly messages: AnthropicMessages,
    private readonly model: string,
  ) {}

  generate({ system, user }: { system: string; user: string }) {
    return complete(this.messages, {
      model: this.model,
      system,
      user,
      maxTokens: ANSWER_MAX_TOKENS,
      effort: "low",
    });
  }
}

export const anthropicAnswerGenerator = (messages: AnthropicMessages, model: string) =>
  new GroundedAnswerGenerator(new AnthropicTextGenerator(messages, model), model);

/** Model guardrail behind the heuristics. A reply that does not parse throws (fail closed). */
export class AnthropicGuardrailClassifier implements GuardrailClassifier {
  constructor(
    private readonly messages: AnthropicMessages,
    private readonly model: string,
  ) {}

  async classify({ message }: GuardrailInput) {
    return parseVerdict(
      await complete(this.messages, {
        model: this.model,
        system: CLASSIFIER_RULES,
        user: fenceMessage(message),
        maxTokens: VERDICT_MAX_TOKENS,
        effort: "low",
      }),
    );
  }
}
