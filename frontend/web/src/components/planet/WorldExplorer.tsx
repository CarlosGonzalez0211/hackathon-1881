"use client";
import { t } from "@/lib/i18n";

import { Tooltip } from "@/components/ui/Tooltip";
import { useOutsideDismiss } from "@/components/ui/useOutsideDismiss";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { defaultWorldAccessibilitySettings } from "@athena/shared";
import { useWorld } from "@/features/world/WorldProvider";
import { PresenterControls } from "@/features/world/components/PresenterControls";
import { WorldToasts } from "@/features/world/components/WorldToasts";
import { Planet, type PlanetControls } from "./Planet";
import { usePlanetArrival } from "./use-planet-arrival";
import { SoundControls } from "@/features/world/components/SoundControls";
import type { Volumes } from "@/features/world/components/SoundControls";
import { StateIcon, stateLabel } from "@/features/world/components/StateIcon";
import { WorldSketchIcon } from "@/features/world/components/WorldSketchIcon";
import { NpcDialogue, type NpcConversation } from "@/features/world/components/NpcDialogue";
import { useWorldShortcuts } from "@/features/world/use-world-shortcuts";

/**
 * Student world. The 3D planet and the 2D topic list both go through `activate`, which opens
 * the routed house page (`/world/house/[topicId]`) over the paused world. The list first hops
 * the avatar to the house's door.
 */
export function WorldExplorer() {
  const { world, houses, activate, houseOpen, error, notify, client, studentId } = useWorld();
  const [conversation, setConversation] = useState<NpcConversation | null>(null);
  // Orbit ↔ world shot: open on the dive's overview; rise back to it when leaving.
  const { overview, setOverview, leaving, onReady, leave } = usePlanetArrival(error);
  const [topics, setTopics] = useState(false);
  const topicArea = useRef<HTMLDivElement>(null);
  useOutsideDismiss(topicArea, topics, () => setTopics(false));
  const [muted, setMuted] = useState(true);
  const [volumes, setVolumes] = useState<Volumes>({
    music: defaultWorldAccessibilitySettings.musicVolume,
    effects: defaultWorldAccessibilitySettings.sfxVolume,
  });
  const router = useRouter();
  // L / O / Esc belong to the world; the house page handles its own keys while open.
  useWorldShortcuts({
    onList: () => !houseOpen && setTopics((open) => !open),
    onOrbit: () => !houseOpen && leaveToOrbit(),
    onEscape: () => !houseOpen && setTopics(false),
  });
  function leaveToOrbit() {
    router.prefetch("/orbit");
    setTopics(false);
    leave();
  }
  const planet = useRef<PlanetControls>(null);
  const travelling = useRef(false);
  // A topic with a house on the planet hops the avatar to its door first, then opens it;
  // 2D-only overflow topics (or a 3D world that failed to load) open straight away.
  const openTopic = async (topicId: string) => {
    const placed = world?.planet.houses.find((house) => house.topicId === topicId);
    if (!placed) return activate({ topicId });
    if (travelling.current) return;
    travelling.current = true;
    setTopics(false);
    try {
      await planet.current?.travelToHouse(placed.slot);
    } finally {
      travelling.current = false;
    }
    activate({ slot: placed.slot });
  };

  if (!world)
    return (
      <main className="world-app">
        <div className="scene-status" role={error ? "alert" : "status"}>
          {!error && <span className="loader-orbit" />}
          <strong>{error ? t("Could not load your world") : t("Getting your world ready")}</strong>
          {error && <span>{error}</span>}
        </div>
      </main>
    );

  return (
    <main
      className={`world-app${overview ? " is-overview" : ""}${leaving ? " is-leaving" : ""}`}
      aria-hidden={houseOpen || undefined}
    >
      <a className="skip-link" href="#topic-list">
        {t("Skip to topic list")}
      </a>
      <Planet
        state={world.planet}
        world={world}
        overview={overview}
        onOverviewChange={setOverview}
        mode="surface"
        controls={planet}
        onHouseClick={(house) => {
          if (!houseOpen) activate({ slot: house.slot });
        }}
        paused={houseOpen || !!conversation || leaving}
        muted={muted}
        volumes={volumes}
        onReady={onReady}
        leaving={leaving}
        onLeft={() => router.push("/orbit")}
        onEvent={(event) => {
          if (event.type !== "npc_activate") return;
          const messages: Record<string, string> = {
            lumen: t("Lumen: I’m waiting by your next topic. Open the house to keep learning."),
            "mentor-elena": t(
              "Elena: each house is a topic. Your world grows as you show what you’ve learned.",
            ),
            "guide-rafa": t(
              "Rafa: follow the paths. You can walk around the whole planet and come back here.",
            ),
            "gardener-carmen": t(
              "Carmen: take your time exploring. You can also open topics from the list.",
            ),
          };
          Object.assign(messages, {
            "headmaster-ilda": t(
              "Ilda: every question opens a door. Choose a topic and share what you discover.",
            ),
            "librarian-oscar": t(
              "Óscar: look for connections between what you know and what you’re learning.",
            ),
            "cook-marisol": t("Marisol: learning takes practice. Try, adjust, and try again."),
            "builder-ana": t("Ana: great ideas are built one step at a time."),
            "builder-leo": t("Leo: a strong foundation helps you build higher."),
            "engineer-noor": t(
              "Noor: when something goes wrong, observe, test, and change one thing at a time.",
            ),
            "dr-amaia": t("Amaia: start with a question. Then look for evidence."),
            "dr-bruno": t("Bruno: explaining an idea in your own words helps you understand it."),
            "historian-tomas": t("Tomás: every place has a story. Keep exploring."),
            "marine-kai": t("Kai: rivers and lakes connect this little world."),
            "explorer-nico": t(
              "Nico: bridges connect the paths. There’s plenty to discover on the other side.",
            ),
            "musician-lia": t("Lia: there’s rhythm in the patterns we find while learning."),
            "study-trio": t(
              "Study group: share an idea! Learning together helps us discover new perspectives.",
            ),
            "visitor-orbi": t("Orbi: what a curious world! I wonder what’s down the next path."),
            "owl-sage": t("Sage: take a moment to think about what you just discovered."),
            "hare-pip": t("Pip: see you on the next path!"),
          });
          const message =
            messages[event.npcId] ?? t("Neighbor: good to see you here! Keep exploring.");
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
            .catch(() => notify(t("Could not save this interaction. You can keep exploring.")));
        }}
      />
      <div ref={topicArea}>
        <nav className="world-controls" aria-label={t("World controls")}>
          <Tooltip label={t("Topics")}>
            <button
              onClick={() => setTopics(!topics)}
              aria-expanded={topics}
              aria-controls="topic-list"
              className="world-tool"
              aria-label={t("Topics")}
            >
              <WorldSketchIcon kind="book" />
            </button>
          </Tooltip>
          <Tooltip label={t("Class orbit")}>
            <Link
              href="/orbit"
              className="world-tool"
              aria-label={t("Class orbit")}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                event.preventDefault();
                leaveToOrbit();
              }}
            >
              <WorldSketchIcon kind="globe" />
            </Link>
          </Tooltip>
          <Tooltip label={overview ? t("Back to walking") : t("Planet overview")}>
            <button
              className="world-tool"
              onClick={() => setOverview((value) => !value)}
              aria-pressed={overview}
              aria-label={overview ? t("Back to walking") : t("Planet overview")}
            >
              <WorldSketchIcon kind="walk" />
            </button>
          </Tooltip>
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
          aria-label={t("Accessible topic list")}
        >
          <button
            className="topic-toggle"
            onClick={() => setTopics(!topics)}
            aria-expanded={topics}
            aria-controls="topics"
          >
            <span>{t("Your topics")}</span>
            <span>
              {houses.length} {topics ? "−" : "+"}
            </span>
          </button>
          <div id="topics" className="topic-content">
            <p className="subtle">{t("Open any topic here without walking across the world.")}</p>
            {houses.map((item) => (
              <button
                className={`topic-row ${item.status}`}
                onClick={() => void openTopic(item.topicId)}
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
      </div>
      <footer className="world-footer">
        <div className="world-key-guide toon-paper" aria-label={t("Keyboard controls")}>
          <div className="key-command">
            <span className="movement-keys">
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
            </span>
            <span>{t("move")}</span>
          </div>
          <div className="key-command">
            <kbd className="wide-key">Space</kbd>
            <span>{t("jump")}</span>
          </div>
          <div className="key-command">
            <kbd>E</kbd>
            <span>{t("interact")}</span>
          </div>
          <div className="key-command">
            <kbd className="shift-key">Shift</kbd>
            <span>{t("run")}</span>
          </div>
        </div>
      </footer>
      {conversation && (
        <NpcDialogue conversation={conversation} onClose={() => setConversation(null)} />
      )}
      <WorldToasts />
      <PresenterControls />
    </main>
  );
}
