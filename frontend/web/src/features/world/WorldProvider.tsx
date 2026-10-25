"use client";
import { appLocale, localizeContent, t } from "@/lib/i18n";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_STUDENT_ID,
  achievementCatalogue,
  type HouseState,
  type HouseTransition,
  type WorldView,
} from "@athena/shared";
import { getWorldClient, type WorldClient } from "./world-client";

export interface WorldToast {
  id: string;
  message: string;
  tone: "unlock" | "done" | "achievement" | "info";
}

interface WorldContextValue {
  studentId: string;
  client: WorldClient;
  world: WorldView | null;
  error: string | null;
  /** True while a house page is open: the 3D world pauses underneath. */
  houseOpen: boolean;
  /** All houses the student can see: 3D slots first, then 2D-only overflow topics. */
  houses: HouseState[];
  refresh(): Promise<void>;
  /** 3D door / marker (slot) or 2D list (topicId). Applies the gate, then opens the page. */
  activate(target: { slot: number } | { topicId: string }): void;
  toasts: WorldToast[];
  dismissToast(id: string): void;
  notify(message: string, tone?: WorldToast["tone"]): void;
}

const WorldContext = createContext<WorldContextValue | null>(null);

export function useWorld() {
  const context = useContext(WorldContext);
  if (!context) throw new Error("useWorld requiere <WorldProvider>.");
  return context;
}

const POLL_MS = 30_000;

function transitionMessage(transition: HouseTransition) {
  if (transition.to === "done") return t("You completed {0}!", { 0: transition.title });
  if (transition.from === "locked" && transition.to === "available")
    return t("You unlocked {0}!", { 0: transition.title });
  if (transition.from === "absent")
    return t("New house on your planet: {0}", { 0: transition.title });
  return t("{0} changed state", { 0: transition.title });
}

/**
 * Owns the student's WorldView for both the 3D world and the house page (parallel route).
 * Identity is the demo student until Platform (P4) auth provides the real one.
 */
export function WorldProvider({
  children,
  studentId = DEMO_STUDENT_ID,
}: {
  children: ReactNode;
  studentId?: string;
}) {
  const client = useMemo(() => getWorldClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const houseOpen = pathname.startsWith("/world/house/");
  const [world, setWorld] = useState<WorldView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<WorldToast[]>([]);
  const announced = useRef(new Set<string>());

  const notify = useCallback((message: string, tone: WorldToast["tone"] = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((list) => [...list, { id, message, tone }]);
  }, []);
  const dismissToast = useCallback(
    (id: string) => setToasts((list) => list.filter((toast) => toast.id !== id)),
    [],
  );

  const refresh = useCallback(async () => {
    try {
      const next = localizeContent(await client.getWorld(studentId));
      next.accessibility.locale = appLocale;
      setWorld(next);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("Could not load your world."));
    }
  }, [client, studentId]);

  // Load (also on a direct visit to a house URL), refresh when returning from a house, on
  // focus, and on a slow demo poll.
  const loaded = world !== null;
  useEffect(() => {
    if (!houseOpen || !loaded) void refresh();
  }, [houseOpen, loaded, refresh]);
  useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(timer);
    };
  }, [refresh]);

  // Announce status changes and rewards once the student is back in the world, then ack them.
  useEffect(() => {
    if (!world || houseOpen) return;
    const at = new Date().toISOString();
    for (const transition of world.pendingTransitions) {
      if (announced.current.has(transition.id)) continue;
      announced.current.add(transition.id);
      notify(transitionMessage(transition), transition.to === "done" ? "done" : "unlock");
      void client.recordInteraction({
        studentId,
        kind: "transition_seen",
        targetId: transition.id,
        at,
      });
    }
    for (const celebrationId of world.activeCelebrationIds) {
      if (announced.current.has(celebrationId)) continue;
      announced.current.add(celebrationId);
      const definition = achievementCatalogue.find((item) => item.celebrationId === celebrationId);
      if (definition)
        notify(t("Badge: {0}", { 0: definition.longLabel[appLocale] }), "achievement");
      void client.recordInteraction({
        studentId,
        kind: "celebration_seen",
        targetId: celebrationId,
        at,
      });
    }
  }, [world, houseOpen, client, studentId, notify]);

  const houses = useMemo(
    () => (world ? [...world.planet.houses, ...world.overflowTopics] : []),
    [world],
  );

  const activate = useCallback(
    (target: { slot: number } | { topicId: string }) => {
      const house =
        "slot" in target
          ? world?.planet.houses.find((item) => item.slot === target.slot)
          : houses.find((item) => item.topicId === target.topicId);
      if (!house) {
        notify(t("This house has no content yet."));
        return;
      }
      // Locked houses open the compact explanation page; the server re-checks every entry.
      router.push(`/world/house/${encodeURIComponent(house.topicId)}`, { scroll: false });
    },
    [world, houses, router, notify],
  );

  const value = useMemo<WorldContextValue>(
    () => ({
      studentId,
      client,
      world,
      error,
      houseOpen,
      houses,
      refresh,
      activate,
      toasts,
      dismissToast,
      notify,
    }),
    [
      studentId,
      client,
      world,
      error,
      houseOpen,
      houses,
      refresh,
      activate,
      toasts,
      dismissToast,
      notify,
    ],
  );
  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}
