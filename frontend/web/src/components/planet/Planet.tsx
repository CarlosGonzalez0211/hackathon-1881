"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  achievementCatalogue,
  type HouseState,
  type PlanetState,
  type WorldState,
} from "@athena/shared";
import type {
  EngineStats,
  EngineEventListener,
  ProjectedHouse,
  ProjectedPlanet,
  SurfaceHandle,
} from "@athena/engine3d";
import { StateIcon, stateLabel } from "@/features/world/components/StateIcon";
import type { Volumes } from "@/features/world/components/SoundControls";
import { appLocale, t } from "@/lib/i18n";
import { WorldSketchIcon } from "@/features/world/components/WorldSketchIcon";
export interface PlanetProps {
  state: PlanetState;
  mode: "surface" | "orbit";
  onHouseClick?: (house: HouseState) => void;
  onPlanetClick?: (planet: PlanetState) => void;
  paused?: boolean;
  muted?: boolean;
  /** Music and effects volumes (0-1), applied live. */
  volumes?: Volumes;
  onStats?: (stats: EngineStats) => void;
  onEvent?: EngineEventListener;
  world?: WorldState;
  overview?: boolean;
  onOverviewChange?: (overview: boolean) => void;
  /** Orbit: the name the class sees (defaults to the student id). */
  label?: string;
  /** Orbit: this planet belongs to the signed-in student. */
  own?: boolean;
}
/** Orbit labels register their node; the canvas moves them every frame, outside React. */
const OrbitContext = createContext<{
  register: (studentId: string, node: HTMLElement | null) => void;
} | null>(null);
function placeOrbitLabel(node: HTMLElement, point: ProjectedPlanet, clear = true) {
  node.style.transform = `translate3d(${point.x}px, ${point.y + point.radius + 6}px, 0) translateX(-50%)`;
  node.style.visibility = point.visible ? "visible" : "hidden";
  node.classList.toggle("is-crowded", !clear);
}
/**
 * Declutter: the signed-in student's label and nearer planets claim space first; a label that
 * would overlap one already placed fades out until its planet moves clear.
 */
function placeOrbitLabels(
  points: ProjectedPlanet[],
  labels: Map<string, HTMLElement>,
  sizes: Map<string, { width: number; height: number }>,
) {
  const placed: { left: number; right: number; top: number; bottom: number }[] = [];
  const order = [...points].sort(
    (a, b) =>
      Number(labels.get(b.studentId)?.classList.contains("is-own")) -
        Number(labels.get(a.studentId)?.classList.contains("is-own")) || a.depth - b.depth,
  );
  for (const point of order) {
    const node = labels.get(point.studentId);
    if (!node) continue;
    let size = sizes.get(point.studentId);
    if (!size || !size.width) {
      size = { width: node.offsetWidth, height: node.offsetHeight };
      sizes.set(point.studentId, size);
    }
    const top = point.y + point.radius + 6;
    const box = {
      left: point.x - size.width / 2 - 4,
      right: point.x + size.width / 2 + 4,
      top: top - 2,
      bottom: top + size.height + 2,
    };
    const clear =
      !point.visible ||
      !placed.some(
        (other) =>
          box.left < other.right &&
          box.right > other.left &&
          box.top < other.bottom &&
          box.bottom > other.top,
      );
    if (clear && point.visible) placed.push(box);
    placeOrbitLabel(node, point, clear);
  }
}
export function Planet(props: PlanetProps) {
  return props.mode === "orbit" ? <OrbitPlanet {...props} /> : <SurfacePlanet {...props} />;
}
function OrbitPlanet({ state, onPlanetClick, label, own }: PlanetProps) {
  const context = useContext(OrbitContext);
  if (!context) throw new Error(t('Planet mode="orbit" requires a shared OrbitCanvas.'));
  const { register } = context;
  const name = label ?? state.studentId;
  return (
    <button
      ref={(node) => register(state.studentId, node)}
      className={`planet-label${own ? " is-own" : ""}`}
      style={{ visibility: "hidden" }}
      onClick={() => onPlanetClick?.(state)}
      aria-label={
        own
          ? t("Your planet, {0}: back to your world", { 0: name })
          : t("{0}’s planet", { 0: name })
      }
    >
      {own && (
        <span className="planet-label-home">
          <WorldSketchIcon kind="globe" />
        </span>
      )}
      <span className="planet-label-copy">
        {own && <span className="planet-label-badge">{t("YOUR LITTLE WORLD")}</span>}
        <span className="planet-label-name">
          {name}
          {own && <span aria-hidden="true"> ↗</span>}
        </span>
      </span>
    </button>
  );
}
function SurfacePlanet({
  state,
  onHouseClick,
  paused = false,
  muted = true,
  volumes,
  onStats,
  onEvent,
  world,
  overview = false,
  onOverviewChange,
}: PlanetProps) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<SurfaceHandle | null>(null);
  const callbacks = useRef({ onHouseClick, onStats, onEvent, onOverviewChange });
  callbacks.current = { onHouseClick, onStats, onEvent, onOverviewChange };
  const celebrated = useRef(new Set<string>());
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState("");
  const markerNodes = useRef(new Map<number, HTMLButtonElement>());
  const latestProjection = useRef<ProjectedHouse[]>([]);
  const markerRefs = useRef(new Map<number, (node: HTMLButtonElement | null) => void>());
  const positionMarker = (node: HTMLButtonElement, point: ProjectedHouse) => {
    const visible = point.visible && point.distance < 24;
    node.style.visibility = visible ? "visible" : "hidden";
    node.style.transform = `translate3d(${point.x}px,${point.y}px,0) translate(-50%,-100%)`;
    node.dataset.inReach = String(point.inReach);
    node.disabled = !point.inReach;
    node.tabIndex = visible && point.inReach ? 0 : -1;
    node.setAttribute("aria-hidden", String(!visible));
  };
  const markerRef = (slot: number) => {
    if (!markerRefs.current.has(slot))
      markerRefs.current.set(slot, (node) => {
        if (!node) {
          markerNodes.current.delete(slot);
          return;
        }
        markerNodes.current.set(slot, node);
        const point = latestProjection.current.find((point) => point.slot === slot);
        if (point) positionMarker(node, point);
      });
    return markerRefs.current.get(slot)!;
  };
  useEffect(() => {
    const abort = new AbortController();
    queueMicrotask(async () => {
      if (abort.signal.aborted || !host.current) return;
      try {
        const { createSurfaceEngine } = await import("@athena/engine3d");
        if (abort.signal.aborted) return;
        const instance = await createSurfaceEngine(host.current, {
          state,
          locale: appLocale,
          signal: abort.signal,
          athenaAssets: process.env.NEXT_PUBLIC_ATHENA_ASSETS !== "false",
          onHouseClick: (house) => callbacks.current.onHouseClick?.(house),
          onStats: (stats) => callbacks.current.onStats?.(stats),
          onEvent: (event) => callbacks.current.onEvent?.(event),
          onOverviewChange: (value) => callbacks.current.onOverviewChange?.(value),
          onProjection: (points) => {
            if (abort.signal.aborted) return;
            latestProjection.current = points;
            for (const point of points) {
              const node = markerNodes.current.get(point.slot);
              if (node) positionMarker(node, point);
            }
          },
        });
        if (abort.signal.aborted) {
          instance.dispose();
          return;
        }
        handle.current = instance;
        setPhase("ready");
      } catch (cause) {
        if (!abort.signal.aborted) {
          setError(cause instanceof Error ? cause.message : t("Could not open the 3D world."));
          setPhase("error");
        }
      }
    });
    return () => {
      abort.abort();
      handle.current?.dispose();
      handle.current = null;
    };
  }, []);
  useEffect(() => handle.current?.update(state), [state, phase]);
  useEffect(() => handle.current?.setPaused(paused), [paused, phase]);
  useEffect(() => handle.current?.setOverview(overview), [overview, phase]);
  useEffect(() => {
    if (!world || !handle.current) return;
    handle.current.updateQuests(world.quests);
    handle.current.setAccessibility({
      ...world.accessibility,
      reducedMotion:
        world.accessibility.reducedMotion ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    if (paused) return;
    for (const id of world.activeCelebrationIds) {
      if (celebrated.current.has(id)) continue;
      const definition = achievementCatalogue.find((item) => item.celebrationId === id);
      const achievement = world.achievements.find((item) => item.code === definition?.code);
      if (achievement) {
        celebrated.current.add(id);
        handle.current.showAchievement(achievement);
      }
    }
  }, [world, paused, phase]);
  useEffect(() => handle.current?.setMuted(muted), [muted, phase]);
  useEffect(() => {
    if (volumes) handle.current?.setVolumes(volumes);
  }, [volumes, phase]);
  return (
    <div className="scene village-scene" data-engine-status={phase} data-renderer="athena-village">
      <div ref={host} className="engine-host" aria-label={t("Athena 3D world")} />
      {phase === "loading" && (
        <div className="scene-status" role="status">
          <span className="loader-orbit" />
          <strong>{t("Getting your world ready")}</strong>
          <span>{t("Your topics are also available in the list.")}</span>
        </div>
      )}
      {error && (
        <div className="scene-status" role="alert">
          <strong>{t("Use the topic list")}</strong>
          <span>{error}</span>
        </div>
      )}
      <div className="house-markers" aria-label={t("Topic houses in your world")}>
        {state.houses.map((house) => (
          <button
            key={house.topicId}
            ref={markerRef(house.slot)}
            className={`house-marker ${house.status}`}
            disabled
            tabIndex={-1}
            aria-hidden="true"
            style={{ left: 0, top: 0 }}
            onClick={() => onHouseClick?.(house)}
            aria-label={t("Enter {0}: {1}", { 0: house.title, 1: stateLabel(house.status) })}
          >
            <StateIcon status={house.status} />
            <span>{house.title}</span>
            <kbd aria-hidden="true">E</kbd>
          </button>
        ))}
      </div>
    </div>
  );
}
export function OrbitCanvas({
  states,
  children,
  onPlanetClick,
  onStats,
  focus = null,
}: {
  states: PlanetState[];
  children: React.ReactNode;
  onPlanetClick?: (planet: PlanetState) => void;
  onStats?: (stats: EngineStats) => void;
  /** Student whose planet the camera visits; `null` frames the whole class. */
  focus?: string | null;
}) {
  const host = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onPlanetClick, onStats });
  callbacks.current = { onPlanetClick, onStats };
  const engine = useRef<{ focus(studentId: string | null): void } | null>(null);
  const labels = useRef(new Map<string, HTMLElement>());
  const latest = useRef(new Map<string, ProjectedPlanet>());
  const sizes = useRef(new Map<string, { width: number; height: number }>());
  useEffect(() => {
    // Font loading and responsive styles can change chips after their first projection.
    const observer = new ResizeObserver(() => sizes.current.clear());
    for (const node of labels.current.values()) observer.observe(node);
    return () => observer.disconnect();
  }, [states]);
  const register = useRef((studentId: string, node: HTMLElement | null) => {
    if (!node) {
      labels.current.delete(studentId);
      return;
    }
    labels.current.set(studentId, node);
    sizes.current.delete(studentId);
    const point = latest.current.get(studentId);
    if (point) placeOrbitLabel(node, point);
  }).current;
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    let dispose: undefined | (() => void);
    queueMicrotask(async () => {
      if (abort.signal.aborted || !host.current) return;
      try {
        const { createOrbitEngine } = await import("@athena/engine3d");
        if (abort.signal.aborted) return;
        const instance = await createOrbitEngine(host.current, states, {
          signal: abort.signal,
          athenaAssets: process.env.NEXT_PUBLIC_ATHENA_ASSETS !== "false",
          onPlanetClick: (planet) => callbacks.current.onPlanetClick?.(planet),
          onStats: (stats) => callbacks.current.onStats?.(stats),
          onProjection: (next) => {
            if (abort.signal.aborted) return;
            for (const point of next) latest.current.set(point.studentId, point);
            placeOrbitLabels(next, labels.current, sizes.current);
          },
        });
        dispose = instance.dispose;
        engine.current = instance;
        if (abort.signal.aborted) {
          dispose();
          return;
        }
        setPhase("ready");
      } catch (cause) {
        if (!abort.signal.aborted) {
          setPhase("error");
          setError(cause instanceof Error ? cause.message : t("Could not load the orbit."));
        }
      }
    });
    return () => {
      abort.abort();
      engine.current = null;
      dispose?.();
    };
  }, []);
  useEffect(() => engine.current?.focus(focus), [focus, phase]);
  return (
    <OrbitContext.Provider value={{ register }}>
      <div className="scene orbit-scene" data-engine-status={phase} data-renderer="shared-orbit">
        <div
          ref={host}
          className="engine-host"
          aria-label={t("Class solar system with {0} planets", { 0: states.length })}
        />
        {phase === "loading" && (
          <div className="scene-status" role="status">
            <span className="loader-orbit" />
            <strong>{t("Getting the orbit ready")}</strong>
          </div>
        )}
        {error && (
          <div className="scene-status" role="alert">
            {error}
          </div>
        )}
        {children}
      </div>
    </OrbitContext.Provider>
  );
}
