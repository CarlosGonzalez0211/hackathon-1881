import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  /** mock = in-memory fixtures, real = Supabase. Modules read these when real repositories land. */
  ATHENA_DATA_MODE: z.enum(["mock", "real"]).default("mock"),
  ATHENA_AI_MODE: z.enum(["mock", "real"]).default("mock"),
  /** Which provider answers and classifies in ATHENA_AI_MODE=real. Embeddings are always Gemini. */
  CONTENT_AI_PROVIDER: z.enum(["gemini", "anthropic"]).default("gemini"),
  CONTENT_ANTHROPIC_CHAT_MODEL: z.string().default("claude-sonnet-5-5"),
  CONTENT_ANTHROPIC_GUARD_MODEL: z.string().default("claude-haiku-5-5"),
  /** Content tutor models (ATHENA_AI_MODE=real). Check them with `pnpm --filter @athena/api content:models`. */
  CONTENT_CHAT_MODEL: z.string().default("gemini-3.8-flash"),
  /** Comma-separated models tried when CONTENT_CHAT_MODEL is overloaded (503/429). */
  CONTENT_CHAT_FALLBACK_MODELS: z
    .string()
    .default("gemini-3.5-flash,gemini-3-flash-preview")
    .transform((value) =>
      value
        .split(",")
        .map((model) => model.trim())
        .filter(Boolean),
    ),
  CONTENT_GUARD_MODEL: z.string().default("gemini-3.5-flash-lite"),
  CONTENT_EMBED_MODEL: z.string().default("gemini-embedding-2"),
  /** Cosine similarity a chunk needs to count as evidence for the real embeddings. */
  CONTENT_MIN_SIMILARITY: z.coerce.number().min(0).max(1).default(0.55),
  /** Lets mock mode run when NODE_ENV=production (demo deployments only). */
  ATHENA_ALLOW_MOCK: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export const env = schema.parse(process.env);
