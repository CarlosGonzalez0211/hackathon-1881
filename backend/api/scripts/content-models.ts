/**
 * Checks that the configured content models exist for this GEMINI_API_KEY and can do their job.
 * Prints model names only, never the key. Usage: pnpm --filter @athena/api content:models
 */
import { env } from "../src/env.js";
import { gemini } from "../src/lib.js";

const wanted = {
  CONTENT_CHAT_MODEL: { id: env.CONTENT_CHAT_MODEL, action: "generateContent" },
  CONTENT_GUARD_MODEL: { id: env.CONTENT_GUARD_MODEL, action: "generateContent" },
  CONTENT_EMBED_MODEL: { id: env.CONTENT_EMBED_MODEL, action: "embedContent" },
};

const available = new Map<string, string[]>();
for await (const model of await gemini().models.list()) {
  available.set((model.name ?? "").replace(/^models\//, ""), model.supportedActions ?? []);
}

let ok = true;
for (const [variable, { id, action }] of Object.entries(wanted)) {
  const actions = available.get(id);
  const fine = actions !== undefined && (actions.length === 0 || actions.includes(action));
  ok &&= fine;
  console.log(
    `${fine ? "ok  " : "MISSING"} ${variable}=${id}${actions && !fine ? ` (no ${action})` : ""}`,
  );
}
if (!ok) {
  const similar = [...available.keys()].filter((name) => /flash|embedding/.test(name)).sort();
  console.log(`\nAvailable flash/embedding models:\n  ${similar.join("\n  ")}`);
  process.exitCode = 1;
}
