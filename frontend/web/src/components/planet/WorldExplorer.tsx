"use client";
import Link from "next/link";
import { useState } from "react";
import type { HouseState, PlanetState } from "@athena/shared";
import type { EngineStats } from "@athena/engine3d";
import { Planet } from "./Planet";
import { HouseSession } from "../house/HouseSession";
const names = {
  locked: "Bloqueado",
  available: "Disponible",
  in_progress: "En progreso",
  done: "Completado",
};
const symbols = { locked: "◇", available: "⌂", in_progress: "◐", done: "✓" };
export function WorldExplorer({ state, simulated }: { state: PlanetState; simulated: boolean }) {
  const [house, setHouse] = useState<HouseState | null>(null);
  const [topics, setTopics] = useState(false);
  const [muted, setMuted] = useState(true);
  const [stats, setStats] = useState<EngineStats | null>(null);
  return (
    <main className="world-app">
      <a className="skip-link" href="#topic-list">
        Ir a la lista de temas
      </a>
      <Planet
        state={state}
        mode="surface"
        onHouseClick={setHouse}
        paused={Boolean(house)}
        muted={muted}
        onStats={setStats}
      />
      <nav className="world-controls" aria-label="Controles del mundo">
        <button
          onClick={() => setTopics(!topics)}
          aria-expanded={topics}
          aria-controls="topic-list"
        >
          Temas
        </button>
        <Link href="/orbit">Órbita</Link>
        <button
          onClick={() => setMuted(!muted)}
          aria-pressed={!muted}
          aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
        >
          {muted ? "Sonido: apagado" : "Sonido: encendido"}
        </button>
      </nav>
      <aside
        hidden={!topics}
        id="topic-list"
        className={`topic-panel ${topics ? "expanded" : ""}`}
        aria-label="Lista accesible de temas"
      >
        <button
          className="topic-toggle"
          onClick={() => setTopics(!topics)}
          aria-expanded={topics}
          aria-controls="topics"
        >
          <span>⌂ &nbsp; Tus temas</span>
          <span>
            {state.houses.length} {topics ? "−" : "+"}
          </span>
        </button>
        <div id="topics" className="topic-content">
          <p className="subtle">Abre cualquier tema desde esta lista, sin desplazarte en 3D.</p>
          {state.houses.map((item) => (
            <button
              className={`topic-row ${item.status}`}
              onClick={() => setHouse(item)}
              key={item.topicId}
            >
              <span className="status-symbol" aria-hidden="true">
                {symbols[item.status]}
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{names[item.status]}</small>
              </span>
              <span className="topic-progress">{Math.round(item.progress * 100)}%</span>
            </button>
          ))}
        </div>
      </aside>
      <footer className="world-footer">
        <p>
          <kbd>W A S D</kbd> mover <span>·</span> <kbd>Espacio</kbd> saltar <span>·</span>{" "}
          <kbd>E</kbd> interactuar
        </p>
        <span className="runtime-note">
          {simulated ? "Datos simulados" : ""}
          {stats ? ` · ${Math.round(stats.fps)} fps` : ""}
        </span>
      </footer>
      {house && <HouseSession house={house} onClose={() => setHouse(null)} />}
    </main>
  );
}
