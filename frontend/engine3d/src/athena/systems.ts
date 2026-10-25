/**
 * Athena systems, installed in this order by `installAthena` (see ./install.ts).
 * Add one line per system, e.g.:
 *
 *   import { installAthenaNpcs } from "./npcs";
import { installAthenaSky } from "./sky";
 *   registerAthenaSystem("npcs", installAthenaNpcs);
 */
import { registerAthenaSystem } from "./install";
import { installAthenaAvatar } from "./avatar";
import { installAthenaFauna } from "./fauna";
import { installAthenaFoliage } from "./foliage";
import { installAthenaHouses } from "./houses";
import { installAthenaLook } from "./look";
import { installAthenaNpcs } from "./npcs";
import { installAthenaSky } from "./sky";

/** With any `?athenaDebug=…` flag, expose the install context as `globalThis.__athena`. */
registerAthenaSystem("debug", (ctx) => {
  if (!new URLSearchParams(globalThis.location?.search ?? "").has("athenaDebug")) return;
  const global = globalThis as {
    __athena?: unknown;
    __athenaPlanet?: unknown;
    __athenaBatches?: Record<string, unknown>;
  };
  global.__athena = ctx;
  // The surface scene too, for inspecting the live graph from devtools.
  const planetInit = ctx.scope.planet.prototype._init;
  ctx.scope.planet.prototype._init = function (this: unknown, ...args: unknown[]) {
    global.__athenaPlanet = this;
    return planetInit.apply(this, args);
  };
  // …and every batched geometry by request path (terrain chunks, building batches).
  const batches: Record<string, unknown> = (global.__athenaBatches = {});
  const batched = ctx.scope.geometryLoader.batched;
  ctx.scope.geometryLoader.batched = async (path: string, ...args: unknown[]) =>
    (batches[path] = await batched(path, ...args));
  ctx.onDispose(() => {
    ctx.scope.geometryLoader.batched = batched;
    delete global.__athenaBatches;
    ctx.scope.planet.prototype._init = planetInit;
    if (global.__athena === ctx) delete global.__athena;
    delete global.__athenaPlanet;
  });
});

registerAthenaSystem("look", installAthenaLook);
registerAthenaSystem("avatar", installAthenaAvatar);
registerAthenaSystem("npcs", installAthenaNpcs);
registerAthenaSystem("houses", installAthenaHouses);
registerAthenaSystem("sky", installAthenaSky);
registerAthenaSystem("fauna", installAthenaFauna);
registerAthenaSystem("foliage", installAthenaFoliage);
