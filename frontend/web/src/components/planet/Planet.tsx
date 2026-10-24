"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { HouseState, PlanetState } from "@athena/shared";
import type { EngineStats, ProjectedHouse, ProjectedPlanet, SurfaceHandle } from "@athena/engine3d";
export interface PlanetProps {
  state: PlanetState;
  mode: "surface" | "orbit";
  onHouseClick?: (house: HouseState) => void;
  onPlanetClick?: (planet: PlanetState) => void;
  paused?: boolean;
  muted?: boolean;
  onStats?: (stats: EngineStats) => void;
}
const OrbitContext = createContext<{ positions: ProjectedPlanet[] } | null>(null);
const symbols = { locked: "◇", available: "⌂", in_progress: "◐", done: "✓" };
const names = {
  locked: "Bloqueado",
  available: "Disponible",
  in_progress: "En progreso",
  done: "Completado",
};
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
  onStats,
}: PlanetProps) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<SurfaceHandle | null>(null);
  const callbacks = useRef({ onHouseClick, onStats });
  callbacks.current = { onHouseClick, onStats };
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState("");
  const [markers, setMarkers] = useState<ProjectedHouse[]>([]);
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
          onProjection: (points) => {
            if (!abort.signal.aborted) setMarkers(points);
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
  useEffect(() => handle.current?.update(state), [state]);
  useEffect(() => handle.current?.setPaused(paused), [paused]);
  useEffect(() => handle.current?.setMuted(muted), [muted, phase]);
  return (
    <div className="scene" data-engine-status={phase} data-renderer="extracted-three">
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
        {markers
          .filter((marker) => marker.visible && marker.distance < 24)
          .map((marker) => {
            const house = state.houses.find((item) => item.slot === marker.slot);
            if (!house) return null;
            return (
              <button
                key={house.topicId}
                className={`house-marker ${house.status}`}
                style={{ left: marker.x, top: marker.y }}
                onClick={() => onHouseClick?.(house)}
                aria-label={`${house.title}: ${names[house.status]}`}
              >
                <span aria-hidden="true">{symbols[house.status]}</span>
                <span>{house.title}</span>
              </button>
            );
          })}
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
