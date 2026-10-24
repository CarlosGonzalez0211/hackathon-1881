import { GoogleGenAI } from "@google/genai";
/** Server-only integration; not a grounded tutor or a separate service. */
export function createGeminiClient(apiKey?: string) {
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenAI({ apiKey });
}
