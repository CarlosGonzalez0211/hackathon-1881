import type { ContentRoutesOptions } from "@athena/content";
import { env } from "./env.js";

/**
 * Content module adapters for the configured mode. Mock mode keeps the module's in-memory
 * repositories, storage and deterministic embeddings. Supabase and Gemini adapters arrive in a
 * later PR (docs/CONTENT_RAG.md section 12); until then real mode also stays in memory.
 */
export function contentOptionsFor(_mode = env.ATHENA_DATA_MODE): ContentRoutesOptions {
  return {};
}
