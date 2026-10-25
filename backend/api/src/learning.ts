import {
  GeminiTutorProvider,
  type CurriculumContextPort,
  type GroundedTextGenerator,
  type LearningRoutesOptions,
} from "@athena/learning";
import { env } from "./env.js";
import { anthropic, gemini } from "./lib.js";
import { AnthropicTextGenerator } from "./content-anthropic.js";
import { GeminiTextGenerator } from "./content-gemini.js";

/**
 * Learning composition stays deterministic in mock AI mode. In real AI mode it uses the same
 * configured provider and model family as Content, but asks for plain text tutor replies.
 */
export function learningOptionsFor(
  curriculumContext?: CurriculumContextPort,
  aiMode: "mock" | "real" = env.ATHENA_AI_MODE,
  textGenerator?: GroundedTextGenerator,
): LearningRoutesOptions {
  const options: LearningRoutesOptions = curriculumContext ? { curriculumContext } : {};
  if (aiMode === "real") {
    options.tutorProvider = new GeminiTutorProvider(textGenerator ?? configuredTextGenerator());
  }
  return options;
}

function configuredTextGenerator(): GroundedTextGenerator {
  if (env.CONTENT_AI_PROVIDER === "anthropic") {
    return new AnthropicTextGenerator(anthropic().messages, env.CONTENT_ANTHROPIC_CHAT_MODEL);
  }
  return new GeminiTextGenerator(gemini().models, env.CONTENT_CHAT_MODEL, {
    fallbackModels: env.CONTENT_CHAT_FALLBACK_MODELS,
    responseMimeType: "text/plain",
  });
}
