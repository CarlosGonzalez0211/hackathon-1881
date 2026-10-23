import type { FastifyInstance } from "fastify";
import { aiPromptRequestSchema, type AiPromptResponse } from "@hackathon/shared";
import { gemini } from "../lib.js";

export async function aiRoutes(app: FastifyInstance) {
  app.post("/ai/prompt", async (req): Promise<AiPromptResponse> => {
    const { prompt } = aiPromptRequestSchema.parse(req.body);
    const res = await gemini().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return { text: res.text ?? "" };
  });
}
