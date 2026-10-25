"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { defaultWorldAccessibilitySettings } from "@athena/shared";
import type { EngineStats } from "@athena/engine3d";
import { useWorld } from "@/features/world/WorldProvider";
import { PresenterControls } from "@/features/world/components/PresenterControls";
import { WorldToasts } from "@/features/world/components/WorldToasts";
import { useMocks } from "@/lib/mode";
import { Planet } from "./Planet";
import { SoundControls } from "@/features/world/components/SoundControls";
import type { Volumes } from "@/features/world/components/SoundControls";
import { StateIcon, stateLabel } from "@/features/world/components/StateIcon";
import { useWorldShortcuts } from "@/features/world/use-world-shortcuts";

/**
 * Student world. The 3D planet and the 2D topic list both go through `activate`, which opens
 * the routed house page (`/world/house/[topicId]`) over the paused world.
 */
export function WorldExplorer() {
  const { world, houses, activate, houseOpen, error } = useWorld();
  const [topics, setTopics] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volumes, setVolumes] = useState<Volumes>({
    music: defaultWorldAccessibilitySettings.musicVolume,
    effects: defaultWorldAccessibilitySettings.sfxVolume,
  });
  const router = useRouter();
  // L / O / Esc belong to the world; the house page handles its own keys while open.
  useWorldShortcuts({
    onList: () => !houseOpen && setTopics((open) => !open),
    onOrbit: () => !houseOpen && router.push("/orbit"),
    onEscape: () => !houseOpen && setTopics(false),
  });
  const [stats, setStats] = useState<EngineStats | null>(null);

  if (!world)
    return (
      <main className="world-app">
        <div className="scene-status" role={error ? "alert" : "status"}>
          {!error && <span className="loader-orbit" />}
          <strong>{error ? "No pudimos cargar tu mundo" : "Preparando tu mundo"}</strong>
          {error && <span>{error}</span>}
        </div>
      </main>
    );

  return (
    <main className="world-app" aria-hidden={houseOpen || undefined}>
      <a className="skip-link" href="#topic-list">
        Ir a la lista de temas
      </a>
      <Planet
        state={world.planet}
        mode="surface"
        onHouseClick={(house) => {
          if (!houseOpen) activate({ slot: house.slot });
        }}
        paused={houseOpen}
        muted={muted}
        volumes={volumes}
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
        <SoundControls
          muted={muted}
          onMutedChange={setMuted}
          volumes={volumes}
          onVolumesChange={setVolumes}
        />
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
            {houses.length} {topics ? "−" : "+"}
          </span>
        </button>
        <div id="topics" className="topic-content">
          <p className="subtle">Abre cualquier tema desde esta lista, sin desplazarte en 3D.</p>
          {houses.map((item) => (
            <button
              className={`topic-row ${item.status}`}
              onClick={() => activate({ topicId: item.topicId })}
              key={item.topicId}
            >
              <span className="status-symbol" aria-hidden="true">
                <StateIcon status={item.status} size={18} />
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{stateLabel(item.status)}</small>
              </span>
              <span className="topic-progress">{Math.round(item.progress * 100)}%</span>
            </button>
          ))}
        </div>
      </aside>
      <footer className="world-footer">
        <p>
          <kbd>W A S D</kbd> mover <span>·</span> <kbd>Espacio</kbd> saltar <span>·</span>{" "}
          <kbd>E</kbd> entrar a una casa
        </p>
        <span className="runtime-note">
          {useMocks ? "Datos simulados" : ""}
          {stats ? ` · ${Math.round(stats.fps)} fps` : ""}
        </span>
      </footer>
      <WorldToasts />
      <PresenterControls />
    </main>
  );
}
