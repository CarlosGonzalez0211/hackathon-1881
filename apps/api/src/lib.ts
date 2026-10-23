import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import { Resend } from "resend";
import { env } from "./env.js";

/** Service clients are created lazily so the API boots even before keys exist. */

export function supabaseAdmin() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

export function gemini() {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

export function resend() {
  if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  return new Resend(env.RESEND_API_KEY);
}
