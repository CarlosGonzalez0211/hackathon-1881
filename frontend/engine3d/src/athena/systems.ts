/**
 * Athena systems, installed in this order by `installAthena` (see ./install.ts).
 * Add one line per system, e.g.:
 *
 *   import { installAthenaNpcs } from "./npcs";
 *   registerAthenaSystem("npcs", installAthenaNpcs);
 */
import { registerAthenaSystem } from "./install";
import { installAthenaLook } from "./look";

/** With any `?athenaDebug=…` flag, expose the install context as `globalThis.__athena`. */
registerAthenaSystem("debug", (ctx) => {
  if (!new URLSearchParams(globalThis.location?.search ?? "").has("athenaDebug")) return;
  const global = globalThis as { __athena?: unknown; __athenaPlanet?: unknown };
  global.__athena = ctx;
  // The surface scene too, for inspecting the live graph from devtools.
  const planetInit = ctx.scope.planet.prototype._init;
  ctx.scope.planet.prototype._init = function (this: unknown, ...args: unknown[]) {
    global.__athenaPlanet = this;
    return planetInit.apply(this, args);
  };
  ctx.onDispose(() => {
    ctx.scope.planet.prototype._init = planetInit;
    if (global.__athena === ctx) delete global.__athena;
    delete global.__athenaPlanet;
  });
});

registerAthenaSystem("look", installAthenaLook);
