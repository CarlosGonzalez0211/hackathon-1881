import type { FastifyInstance } from "fastify";
import { forbidden } from "@athena/platform";
import { aiPromptRequestSchema, type AiPromptResponse } from "@athena/shared";
import { gemini } from "../lib.js";

/** Calls per caller per window. Gemini costs money, so this stays low and in one process. */
const LIMIT = 10;
const WINDOW_MS = 60_000;

export async function aiRoutes(app: FastifyInstance) {
  const calls = new Map<string, number[]>();
  const withinLimit = (userId: string) => {
    const now = Date.now();
    const recent = (calls.get(userId) ?? []).filter((at) => now - at < WINDOW_MS);
    if (recent.length >= LIMIT) return false;
    calls.set(userId, [...recent, now]);
    return true;
  };

  // Inherited developer demo: no curriculum retrieval or academic progress writes. Staff only,
  // because it forwards arbitrary text to Gemini on the project's key.
  app.post("/ai/prompt", async (req, reply): Promise<AiPromptResponse | void> => {
    if (req.auth.role === "student") throw forbidden("Not allowed to use the AI proxy");
    if (!withinLimit(req.auth.userId)) {
      return reply.status(429).send({ error: "Too many AI requests, try again in a minute" });
    }
    const { prompt } = aiPromptRequestSchema.parse(req.body);
    const res = await gemini().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return { text: res.text ?? "" };
  });
}
