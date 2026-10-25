import type { PlanetState } from "@athena/shared";
import type { SurfaceHandle, SurfaceOptions } from "@athena/engine3d";
import { appLocale } from "@/lib/i18n";
import { reducedMotion } from "./arrival";

/** Callbacks the adopting page plugs in; the engine was created before that page existed. */
export type WorldSink = Pick<
  SurfaceOptions,
  "onHouseClick" | "onProjection" | "onStats" | "onEvent" | "onOverviewChange"
>;
export interface PreparedWorld {
  studentId: string;
  /** `.engine-host` element the engine draws into. */
  node: HTMLElement;
  engine: Promise<SurfaceHandle>;
  sink: WorldSink;
}

/** A student who dived but never left the orbit: free the hidden world after this long. */
const UNUSED_MS = 30000;
let prepared: (PreparedWorld & { abort: AbortController; timer: number }) | null = null;

/**
 * Start building `state`'s world while the orbit camera dives, so the world page adopts a
 * ready engine instead of loading one. Until adopted it renders paused into a 1px host.
 */
export function prepareWorld(state: PlanetState) {
  if (prepared?.studentId === state.studentId) return;
  discardPreparedWorld();
  const node = document.createElement("div");
  node.className = "engine-host is-prepared";
  node.setAttribute("aria-hidden", "true");
  document.body.appendChild(node);
  const abort = new AbortController();
  const sink: WorldSink = {};
  const engine = import("@athena/engine3d")
    .then(({ createSurfaceEngine }) =>
      createSurfaceEngine(node, {
        state,
        locale: appLocale,
        signal: abort.signal,
        athenaAssets: process.env.NEXT_PUBLIC_ATHENA_ASSETS !== "false",
        // The dive ends on the overview framing; the world opens on it too.
        overview: !reducedMotion(),
        onHouseClick: (house) => sink.onHouseClick?.(house),
        onProjection: (points) => sink.onProjection?.(points),
        onStats: (stats) => sink.onStats?.(stats),
        onEvent: (event) => sink.onEvent?.(event),
        onOverviewChange: (value) => sink.onOverviewChange?.(value),
      }),
    )
    .then((handle) => {
      // Keys typed on the orbit page must not walk the hidden student.
      handle.setPaused(true);
      return handle;
    });
  engine.catch(() => {
    if (prepared?.engine === engine) discardPreparedWorld();
  });
  prepared = {
    studentId: state.studentId,
    node,
    engine,
    sink,
    abort,
    timer: window.setTimeout(discardPreparedWorld, UNUSED_MS),
  };
}

/** Hand the prepared world for `studentId` to its page (once); `null` when there is none. */
export function takePreparedWorld(studentId: string): PreparedWorld | null {
  if (prepared?.studentId !== studentId) return null;
  const taken = prepared;
  prepared = null;
  window.clearTimeout(taken.timer);
  taken.node.classList.remove("is-prepared");
  taken.node.removeAttribute("aria-hidden");
  return taken;
}

export function discardPreparedWorld() {
  const current = prepared;
  if (!current) return;
  prepared = null;
  window.clearTimeout(current.timer);
  // The engine disposes itself on abort, whether or not it finished building.
  current.abort.abort();
  current.node.remove();
}
