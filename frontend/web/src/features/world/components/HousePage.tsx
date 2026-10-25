"use client";
import { appLocale, localizeContent, t } from "@/lib/i18n";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { houseStateVisuals } from "@athena/brand";
import type { HouseEntryResult, HouseState } from "@athena/shared";
import { useWorld } from "../WorldProvider";
import { HouseContentPanel } from "./HouseContentPanel";
import { HouseProgressPanel } from "./HouseProgressPanel";
import { HouseTutorPanel } from "./HouseTutorPanel";
import { HouseVignette } from "./HouseVignette";
import styles from "./HousePage.module.css";

type Tab = "material" | "learn" | "progress";
const tabs: { id: Tab; label: string }[] = [
  { id: "material", label: "Material" },
  { id: "learn", label: t("Learn") },
  { id: "progress", label: t("Progress") },
];

const tabKey = (studentId: string, topicId: string) => `athena.house-tab.${studentId}.${topicId}`;
function readTab(key: string): Tab | undefined {
  try {
    const value = window.localStorage.getItem(key);
    return tabs.some((tab) => tab.id === value) ? (value as Tab) : undefined;
  } catch {
    return undefined;
  }
}
function writeTab(key: string, tab: Tab) {
  try {
    window.localStorage.setItem(key, tab);
  } catch {
    // Remembering the tab is a convenience only.
  }
}

export function StateChip({ status }: { status: HouseState["status"] }) {
  const visual = houseStateVisuals[status];
  return (
    <span className={`${styles.chip} ${styles[status]}`}>
      <span aria-hidden="true">{visual.symbol}</span> {visual[appLocale]}
    </span>
  );
}

/**
 * The page that opens over the paused world when a student enters a house
 * (`/world/house/[topicId]`). World owns the shell, header, gate and Progreso tab; the
 * Material tab is Curriculum's (P1) slot and Aprender is Learning's (P2) slot.
 */
export function HousePage({
  topicId,
  variant,
}: {
  topicId: string;
  variant: "overlay" | "standalone";
}) {
  const { world, studentId, client, houses, error: worldError } = useWorld();
  const router = useRouter();
  const house = houses.find((item) => item.topicId === topicId);
  const [entry, setEntry] = useState<HouseEntryResult | null>(null);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("material");
  const panel = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const worldLoaded = world !== null;

  const close = useCallback(() => {
    if (variant === "overlay") router.back();
    else router.push("/world");
  }, [router, variant]);

  // One server-checked entry per opened house. A visit is cosmetic, never evidence.
  useEffect(() => {
    if (!worldLoaded) return;
    let active = true;
    setEntry(null);
    setEntryError(null);
    client
      .enterHouse({ studentId, topicId })
      .then((result) => {
        if (!active) return;
        setEntry(localizeContent(result));
        if (result.granted)
          setTab(
            result.mode === "resume"
              ? (readTab(tabKey(studentId, topicId)) ?? "material")
              : "material",
          );
      })
      .catch((cause) => {
        if (active) setEntryError(cause instanceof Error ? cause.message : String(cause));
      });
    return () => {
      active = false;
    };
  }, [client, studentId, topicId, worldLoaded]);

  useEffect(() => heading.current?.focus({ preventScroll: true }), [topicId, entry?.granted]);

  // Esc closes from anywhere (focus may sit on the canvas or the body after a click).
  useEffect(() => {
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [close]);

  const choose = (next: Tab) => {
    setTab(next);
    writeTab(tabKey(studentId, topicId), next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || variant !== "overlay" || !panel.current) return;
    // Keep focus inside the page while it covers the world.
    const focusable = panel.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex="0"], h1[tabindex="-1"]',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = tabs[(index + delta + tabs.length) % tabs.length]!;
    choose(next.id);
    document.getElementById(`${titleId}-tab-${next.id}`)?.focus();
  };

  const granted = entry?.granted ? entry : null;
  const locked = entry && !entry.granted && entry.reason === "locked" ? entry : null;
  const missing =
    (!worldLoaded && worldError) ||
    (worldLoaded && !house) ||
    (entry && !entry.granted && entry.reason === "not_published");

  let body: React.ReactNode;
  if (missing) {
    body = (
      <section className={styles.compact}>
        <p>{t("This house has no content yet. Your teacher will open it soon.")}</p>
      </section>
    );
  } else if (entryError) {
    body = (
      <section className={styles.compact} role="alert">
        <p>
          {t("Could not open this house.")}
          {entryError}
        </p>
      </section>
    );
  } else if (locked) {
    body = (
      <section className={styles.compact} aria-labelledby={`${titleId}-locked`}>
        <h2 id={`${titleId}-locked`} className={styles.subheading}>
          {t("Complete these topics to open this house:")}
        </h2>
        <ul className={styles.prerequisites}>
          {locked.missingPrerequisites.map((item) => (
            <li key={item.topicId}>
              <StateChip status={item.status} />
              <strong>{item.title}</strong>
              {item.status !== "locked" && (
                <button
                  className={styles.secondary}
                  onClick={() => router.replace(`/world/house/${encodeURIComponent(item.topicId)}`)}
                >
                  {t("Go to that house")}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    );
  } else if (!granted || !house) {
    body = (
      <div className={styles.skeleton} role="status" aria-label={t("Loading the house")}>
        <span />
        <span />
        <span />
      </div>
    );
  } else {
    body = (
      <>
        {granted.mode === "review" && (
          <p className={styles.banner}>
            <span aria-hidden="true">✓</span>{" "}
            {t("Review: you’ve completed this topic. All materials are still available.")}
          </p>
        )}
        <div role="tablist" aria-label={t("House sections")} className={styles.tabs}>
          {tabs.map((item, index) => (
            <button
              key={item.id}
              id={`${titleId}-tab-${item.id}`}
              role="tab"
              aria-selected={tab === item.id}
              aria-controls={`${titleId}-panel-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => choose(item.id)}
              onKeyDown={(event) => onTabKey(event, index)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`${titleId}-panel-${tab}`}
          aria-labelledby={`${titleId}-tab-${tab}`}
          className={styles.panelBody}
        >
          {tab === "material" && (
            <HouseContentPanel
              topicId={topicId}
              studentId={studentId}
              onStart={() => choose("learn")}
              showStart={false}
              cta={
                granted.mode === "resume"
                  ? t("Continue")
                  : granted.mode === "enter"
                    ? t("Start")
                    : t("Review")
              }
            />
          )}
          {tab === "learn" && (
            <HouseTutorPanel studentId={studentId} topicId={topicId} entryId={granted.entryId} />
          )}
          {tab === "progress" && world && (
            <HouseProgressPanel house={house} mastery={granted.mastery} world={world} />
          )}
        </div>
      </>
    );
  }

  const progressShown = house && house.status !== "locked";
  return (
    <div
      className={variant === "overlay" ? styles.backdrop : styles.standalone}
      onClick={(event) => {
        if (variant === "overlay" && event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={panel}
        className={styles.sheet}
        data-tab={tab}
        role={variant === "overlay" ? "dialog" : undefined}
        aria-modal={variant === "overlay" ? true : undefined}
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
      >
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <button className={styles.back} onClick={close}>
              <span aria-hidden="true">←</span> {t("Back to my world")}
            </button>
            {house && <StateChip status={house.status} />}
          </div>
          <div className={styles.titleRow}>
            <h1 id={titleId} ref={heading} tabIndex={-1} className={styles.title}>
              {house?.title ?? t("House")}
            </h1>
            {granted && (
              <button className={styles.primary} onClick={() => choose("learn")}>
                {granted.mode === "resume"
                  ? t("Continue")
                  : granted.mode === "review"
                    ? t("Review")
                    : t("Start")}
              </button>
            )}
          </div>
          {progressShown && (
            <div className={styles.meta}>
              {granted?.mastery?.totalConcepts !== undefined && (
                <span>
                  {granted.mastery.demonstratedConcepts ?? 0} {t("of")}{" "}
                  {granted.mastery.totalConcepts} {t("concepts")}
                </span>
              )}
              <span className={styles.progress}>
                <progress
                  value={house.progress}
                  max={1}
                  aria-label={t("Progress in {0}", { 0: house.title })}
                />
                <strong>{Math.round(house.progress * 100)}%</strong>
              </span>
            </div>
          )}
          {granted?.mastery?.nextAction && (
            <p className={styles.next}>
              {t("Next:")} {granted.mastery.nextAction}
            </p>
          )}
        </header>
        <div className={styles.houseBody}>
          <div className={styles.workbench}>{body}</div>
          {tab === "material" && (
            <aside className={styles.illustration}>
              <HouseVignette />
              <span>{t("A new place to discover")}</span>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
