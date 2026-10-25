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

let prepared: (PreparedWorld & { abort: AbortController; timer?: number }) | null = null;

/**
 * Build `state`'s world ahead of the dive (the student's own, while the orbit idles; a
 * classmate's, as the camera flies in), so the world page adopts a ready engine instead of
 * loading one. Until adopted it sits paused in a 1px host and stops drawing after one frame.
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

/** Free the hidden world now, or `afterMs` later if no page has adopted it by then. */
export function discardPreparedWorld(afterMs = 0) {
  const current = prepared;
  if (!current) return;
  if (afterMs > 0) {
    window.clearTimeout(current.timer);
    current.timer = window.setTimeout(() => {
      if (prepared === current) discardPreparedWorld();
    }, afterMs);
    return;
  }
  prepared = null;
  window.clearTimeout(current.timer);
  // The engine disposes itself on abort, whether or not it finished building.
  current.abort.abort();
  current.node.remove();
}
