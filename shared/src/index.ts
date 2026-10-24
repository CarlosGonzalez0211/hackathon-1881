import { z } from "zod";

/** Proposed shared contracts for frontend and backend. */
export * from "./learning.js";
export * from "./mocks.js";
export * from "./world.js";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  time: z.string(),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const aiPromptRequestSchema = z.object({
  prompt: z.string().min(1).max(8000),
});
export type AiPromptRequest = z.infer<typeof aiPromptRequestSchema>;

export const aiPromptResponseSchema = z.object({ text: z.string() });
export type AiPromptResponse = z.infer<typeof aiPromptResponseSchema>;
