"use client";
import Link from "next/link";
import { useState } from "react";
import type { PlanetState } from "@athena/shared";
import type { EngineStats } from "@athena/engine3d";
import { OrbitCanvas, Planet } from "./Planet";
export function OrbitExplorer({ states }: { states: PlanetState[] }) {
  const [list, setList] = useState(false);
  const [selected, setSelected] = useState<PlanetState | null>(null);
  const [stats, setStats] = useState<EngineStats | null>(null);
  return (
    <main className="world-app orbital-app">
      <OrbitCanvas states={states} onPlanetClick={setSelected} onStats={setStats}>
        {states.map((state) => (
          <Planet key={state.studentId} state={state} mode="orbit" onPlanetClick={setSelected} />
        ))}
      </OrbitCanvas>
      <nav className="world-controls" aria-label="Controles de órbita">
        <Link href="/world">Volver al mundo</Link>
        <button onClick={() => setList(!list)} aria-expanded={list}>
          Planetas
        </button>
      </nav>
      <aside hidden={!list} className="orbit-list" aria-label="Alternativa 2D de los planetas">
        <h2>Planetas de la clase</h2>
        {states.map((state) => (
          <button key={state.studentId} onClick={() => setSelected(state)}>
            {state.studentId.replace("student-", "Estudiante ")}
            <span>{Math.round(state.growth * 100)}%</span>
          </button>
        ))}
      </aside>
      {selected && (
        <aside className="student-card" aria-label="Planeta seleccionado">
          <button
            className="icon-button dialog-close"
            onClick={() => setSelected(null)}
            aria-label="Cerrar detalle"
          >
            ×
          </button>
          <span className="eyebrow">Progreso simulado</span>
          <h2>{selected.studentId.replace("student-", "Estudiante ")}</h2>
          {selected.houses.map((house) => (
            <p key={house.topicId}>
              {house.title}
              <strong>{Math.round(house.progress * 100)}%</strong>
            </p>
          ))}
          <small>Analytics y evaluación pendientes de integración.</small>
        </aside>
      )}
      <footer className="world-footer">
        <p>Una escena compartida · sin física ni personajes en órbita</p>
        <span className="runtime-note">
          {stats
            ? `${Math.round(stats.fps)} fps · ${stats.drawCalls} draw calls`
            : "Cargando recursos compartidos"}
        </span>
      </footer>
    </main>
  );
}
