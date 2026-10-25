import { t } from "@/lib/i18n";

/**
 * Orbit ↔ world hand-off. The live canvas of the scene being left (the orbit after its dive,
 * or a world after rising to its overview) is lifted into a fixed veil, keeps rendering
 * through the route change, and fades once the next scene has drawn its first frames in the
 * matching pose: one continuous shot, no cut and no loading screen. A slow scene simply keeps
 * the held planet spinning a little longer.
 */
export type ArrivalTarget = "world" | "orbit";
interface Pending {
  target: ArrivalTarget;
  /** Planet the shot is framed on. */
  studentId: string;
  veil: HTMLElement;
  dispose: () => void;
  timer: number;
}
let pending: Pending | null = null;

/**
 * Never strand the student behind the veil if the next scene fails to open. Generous: on a
 * slow network the spinning planet is the loading state.
 */
const GIVE_UP_MS = 45000;

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Keep `host` (a live engine canvas framed on `studentId`'s planet) on screen while the app
 * navigates to `target`; `dispose` frees its engine after the fade.
 */
export function holdArrival(
  target: ArrivalTarget,
  studentId: string,
  host: HTMLElement,
  dispose: () => void,
) {
  releaseArrival(0);
  const veil = document.createElement("div");
  veil.className = "planet-arrival-veil";
  host.setAttribute("aria-hidden", "true");
  // Announced, never shown: on screen the shot itself says where the student is going.
  const status = document.createElement("p");
  status.className = "sr-only";
  status.setAttribute("role", "status");
  status.textContent = target === "world" ? t("Landing on the planet") : t("Flying to your class");
  veil.append(host, status);
  document.body.appendChild(veil);
  pending = {
    target,
    studentId,
    veil,
    dispose,
    timer: window.setTimeout(() => releaseArrival(), GIVE_UP_MS),
  };
}

/** The planet a held shot is framed on, when it is waiting for `target` to take over. */
export const arrivalFor = (target: ArrivalTarget) =>
  pending?.target === target ? pending.studentId : null;

/** Crossfade from the held shot to whatever is underneath, then free its engine. */
export function releaseArrival(duration = reducedMotion() ? 250 : 1000) {
  const current = pending;
  if (!current) return;
  pending = null;
  window.clearTimeout(current.timer);
  const finish = () => {
    current.veil.remove();
    current.dispose();
  };
  if (duration <= 0) {
    finish();
    return;
  }
  // Important: the global reduced-motion rule would otherwise turn the crossfade into a cut.
  current.veil.style.setProperty("transition-duration", `${duration}ms`, "important");
  current.veil.classList.add("is-leaving");
  window.setTimeout(finish, duration + 50);
}

/** Wait until the next scene has drawn twice, then fade the held shot (`then` after the fade). */
export function revealWhenDrawn(then?: () => void) {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const duration = reducedMotion() ? 250 : 1000;
      releaseArrival(duration);
      if (then) window.setTimeout(then, duration + 100);
    }),
  );
}
