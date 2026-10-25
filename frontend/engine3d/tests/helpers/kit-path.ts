import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Where tests read kit GLBs from. Mirrors the overlay in scripts/build-athena-assets.mjs:
 * the generated cache (`.kit-cache/`, written by athena-assets/code/generate.mjs) shadows the
 * committed kit file by file, unless `ATHENA_KIT_SOURCE=legacy`.
 */
const ENGINE = fileURLToPath(new URL("../../", import.meta.url));

export const committedKitRoot = process.env.ATHENA_KIT_DIR
  ? path.resolve(process.env.ATHENA_KIT_DIR)
  : path.join(ENGINE, "athena-assets");
export const generatedKitRoot = process.env.ATHENA_KIT_CACHE
  ? path.resolve(process.env.ATHENA_KIT_CACHE)
  : path.join(ENGINE, ".kit-cache");
export const engineRoot = ENGINE;
export const useGeneratedKit = (process.env.ATHENA_KIT_SOURCE ?? "generated") !== "legacy";

/**
 * Absolute path of a kit model. `relative` is relative to `models/`
 * (`buildings/athena-house-done-v0.glb`); a leading `models/` is accepted too.
 */
export function kitModelPath(relative: string): string {
  const inside = relative.replace(/\\/g, "/").replace(/^models\//, "");
  if (useGeneratedKit) {
    const generated = path.join(generatedKitRoot, "models", inside);
    if (existsSync(generated)) return generated;
  }
  return path.join(committedKitRoot, "models", inside);
}
