import fs from "node:fs/promises";
import type { LegacyContext } from "../../src/runtime/legacy-context";

export async function graphics() {
  const source = await fs.readFile(
    new URL("../../src/extracted/index.js", import.meta.url),
    "utf8",
  );
  const scope: LegacyContext = {};
  for (const m of source.matchAll(/import \{ (step\d+) \} from '(.+)';/g)) {
    const n = Number(m[1]!.slice(4));
    if (!((n >= 174 && n <= 823) || (n >= 1374 && n <= 1429))) continue;
    const module = await import(
      new URL(m[2]!, new URL("../../src/extracted/", import.meta.url)).href
    );
    module[m[1]!](scope);
  }
  return scope;
}
