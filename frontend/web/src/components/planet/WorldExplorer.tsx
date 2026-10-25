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
import { WorldSketchIcon } from "@/features/world/components/WorldSketchIcon";
import { NpcDialogue, type NpcConversation } from "@/features/world/components/NpcDialogue";
import { useWorldShortcuts } from "@/features/world/use-world-shortcuts";

/**
 * Student world. The 3D planet and the 2D topic list both go through `activate`, which opens
 * the routed house page (`/world/house/[topicId]`) over the paused world.
 */
export function WorldExplorer() {
  const { world, houses, activate, houseOpen, error, notify, client, studentId } = useWorld();
  const [conversation, setConversation] = useState<NpcConversation | null>(null);
  const [overview, setOverview] = useState(false);
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
    <main
      className={`world-app${overview ? " is-overview" : ""}`}
      aria-hidden={houseOpen || undefined}
    >
      <a className="skip-link" href="#topic-list">
        Ir a la lista de temas
      </a>
      <Planet
        state={world.planet}
        world={world}
        overview={overview}
        onOverviewChange={setOverview}
        mode="surface"
        onHouseClick={(house) => {
          if (!houseOpen) activate({ slot: house.slot });
        }}
        paused={houseOpen || !!conversation}
        muted={muted}
        volumes={volumes}
        onStats={setStats}
        onEvent={(event) => {
          if (event.type !== "npc_activate") return;
          const messages: Record<string, string> = {
            lumen:
              "Lumen: te espero junto al siguiente tema disponible. Abre la casa para continuar aprendiendo.",
            "mentor-elena":
              "Elena: cada casa representa un tema. Tu mundo crece con lo que demuestras haber aprendido.",
            "guide-rafa":
              "Rafa: sigue los senderos. Puedes dar la vuelta a todo el planeta y regresar aquí.",
            "gardener-carmen":
              "Carmen: explora con calma. También puedes abrir tus temas desde la lista.",
          };
          Object.assign(messages, {
            "headmaster-ilda":
              "Ilda: cada pregunta abre una puerta. Elige un tema y comparte lo que descubres.",
            "librarian-oscar":
              "Óscar: busca conexiones entre lo que ya sabes y lo que estás aprendiendo.",
            "cook-marisol":
              "Marisol: aprender lleva práctica. Prueba, ajusta y vuelve a intentarlo.",
            "builder-ana": "Ana: las grandes ideas se construyen paso a paso.",
            "builder-leo": "Leo: una buena base ayuda a construir más alto.",
            "engineer-noor": "Noor: cuando algo falla, observa, prueba y cambia una cosa cada vez.",
            "dr-amaia": "Amaia: empieza con una pregunta. Después busca evidencias.",
            "dr-bruno": "Bruno: explicar una idea con tus palabras ayuda a comprenderla.",
            "historian-tomas": "Tomás: cada lugar tiene una historia. Sigue explorando.",
            "marine-kai": "Kai: los ríos y lagos conectan este pequeño mundo.",
            "explorer-nico":
              "Nico: los puentes conectan los senderos. Hay mucho por descubrir al otro lado.",
            "musician-lia":
              "Lia: el ritmo también está en los patrones que encontramos al aprender.",
            "study-trio":
              "Grupo de estudio: ¡comparte una idea! Aprender juntos ayuda a descubrir otras perspectivas.",
            "visitor-orbi":
              "Orbi: ¡qué mundo tan curioso! Me pregunto qué habrá en el próximo sendero.",
            "owl-sage": "Sage: tómate un momento para pensar en lo que acabas de descubrir.",
            "hare-pip": "Pip: ¡nos vemos en el siguiente sendero!",
          });
          const message =
            messages[event.npcId] ?? "Vecino: ¡Qué gusto verte por aquí! Sigue explorando.";
          const divider = message.indexOf(":");
          setConversation({
            name: message.slice(0, divider),
            text: message.slice(divider + 1).trim(),
          });
          void client
            .recordInteraction({
              studentId,
              kind: event.npcId === "lumen" ? "lumen_talked" : "npc_talked",
              targetId: event.npcId,
              at: new Date().toISOString(),
            })
            .catch(() => notify("No pudimos guardar esta interacción. Puedes seguir explorando."));
        }}
      />
      <nav className="world-controls" aria-label="Controles del mundo">
        <button
          onClick={() => setTopics(!topics)}
          aria-expanded={topics}
          aria-controls="topic-list"
          className="world-tool"
          aria-label="Temas"
          title="Temas"
        >
          <WorldSketchIcon kind="book" />
        </button>
        <Link href="/orbit" className="world-tool" aria-label="Órbita" title="Órbita">
          <WorldSketchIcon kind="globe" />
        </Link>
        <button
          className="world-tool"
          onClick={() => setOverview((value) => !value)}
          aria-pressed={overview}
          aria-label={overview ? "Volver a caminar" : "Ver planeta"}
          title={overview ? "Volver a caminar" : "Ver planeta"}
        >
          <WorldSketchIcon kind="walk" />
        </button>
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
        <div className="world-key-guide toon-paper" aria-label="Controles de teclado">
          <div className="key-command">
            <span className="movement-keys">
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
            </span>
            <span>mover</span>
          </div>
          <div className="key-command">
            <kbd className="wide-key">Space</kbd>
            <span>saltar</span>
          </div>
          <div className="key-command">
            <kbd>E</kbd>
            <span>interactuar</span>
          </div>
          <div className="key-command">
            <kbd className="shift-key">Shift</kbd>
            <span>correr</span>
          </div>
        </div>
        <span className="runtime-note">
          {useMocks ? "Datos simulados" : ""}
          {stats ? ` · ${Math.round(stats.fps)} fps` : ""}
        </span>
      </footer>
      {conversation && (
        <NpcDialogue conversation={conversation} onClose={() => setConversation(null)} />
      )}
      <WorldToasts />
      <PresenterControls />
    </main>
  );
}
