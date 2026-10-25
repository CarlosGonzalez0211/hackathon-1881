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
}
const OrbitContext = createContext<{ positions: ProjectedPlanet[] } | null>(null);
export function Planet(props: PlanetProps) {
  return props.mode === "orbit" ? <OrbitPlanet {...props} /> : <SurfacePlanet {...props} />;
}
function OrbitPlanet({ state, onPlanetClick }: PlanetProps) {
  const context = useContext(OrbitContext);
  if (!context) throw new Error('Planet mode="orbit" requiere un OrbitCanvas compartido.');
  const position = context.positions.find((item) => item.studentId === state.studentId);
  return (
    <button
      className="planet-label"
      style={{
        left: position?.x ?? -1000,
        top: (position?.y ?? -1000) + 55,
        visibility: position?.visible ? "visible" : "hidden",
      }}
      onClick={() => onPlanetClick?.(state)}
      aria-label={`Abrir planeta ${state.studentId}, ${Math.round(state.growth * 100)}% de progreso simulado`}
    >
      <span>{state.studentId.replace("student-", "Estudiante ")}</span>
      <strong>{Math.round(state.growth * 100)}%</strong>
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
          setError(cause instanceof Error ? cause.message : "No se pudo abrir el mundo 3D.");
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
      <div ref={host} className="engine-host" aria-label="Mundo 3D de Athena" />
      {phase === "loading" && (
        <div className="scene-status" role="status">
          <span className="loader-orbit" />
          <strong>Preparando tu mundo</strong>
          <span>Los temas también están disponibles en la lista.</span>
        </div>
      )}
      {error && (
        <div className="scene-status" role="alert">
          <strong>Usa la vista de temas</strong>
          <span>{error}</span>
        </div>
      )}
      <div className="house-markers" aria-label="Casas de temas en el mundo">
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
            aria-label={`Entrar a ${house.title}: ${stateLabel(house.status)}`}
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
}: {
  states: PlanetState[];
  children: React.ReactNode;
  onPlanetClick?: (planet: PlanetState) => void;
  onStats?: (stats: EngineStats) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onPlanetClick, onStats });
  callbacks.current = { onPlanetClick, onStats };
  const [positions, setPositions] = useState<ProjectedPlanet[]>([]);
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
            if (!abort.signal.aborted) setPositions(next);
          },
        });
        dispose = instance.dispose;
        if (abort.signal.aborted) {
          dispose();
          return;
        }
        setPhase("ready");
      } catch (cause) {
        if (!abort.signal.aborted) {
          setPhase("error");
          setError(cause instanceof Error ? cause.message : "No se pudo cargar la órbita.");
        }
      }
    });
    return () => {
      abort.abort();
      dispose?.();
    };
  }, []);
  return (
    <OrbitContext.Provider value={{ positions }}>
      <div className="scene orbit-scene" data-engine-status={phase} data-renderer="shared-orbit">
        <div ref={host} className="engine-host" aria-label="Sistema de ocho planetas 3D" />
        {phase === "loading" && (
          <div className="scene-status" role="status">
            <span className="loader-orbit" />
            <strong>Preparando la órbita</strong>
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
