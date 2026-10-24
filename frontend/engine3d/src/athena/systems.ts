/**
 * Athena systems, installed in this order by `installAthena` (see ./install.ts).
 * Add one line per system, e.g.:
 *
 *   import { installAthenaNpcs } from "./npcs";
 *   registerAthenaSystem("npcs", installAthenaNpcs);
 */
import { registerAthenaSystem } from "./install";

/** With any `?athenaDebug=…` flag, expose the install context as `globalThis.__athena`. */
registerAthenaSystem("debug", (ctx) => {
  if (!new URLSearchParams(globalThis.location?.search ?? "").has("athenaDebug")) return;
  (globalThis as { __athena?: unknown }).__athena = ctx;
  ctx.onDispose(() => {
    const global = globalThis as { __athena?: unknown };
    if (global.__athena === ctx) delete global.__athena;
  });
});
