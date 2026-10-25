import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  /** mock = in-memory fixtures, real = Supabase. Modules read these when real repositories land. */
  ATHENA_DATA_MODE: z.enum(["mock", "real"]).default("mock"),
  ATHENA_AI_MODE: z.enum(["mock", "real"]).default("mock"),
});

export const env = schema.parse(process.env);
