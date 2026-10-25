"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { getContentClient } from "../api/content-client";
import { useLoad } from "../hooks/useLoad";
import { ChatPanel } from "./ChatPanel";
import { ContentA11yRoot, useContentView } from "./ContentA11yRoot";
import { FlagsPanel } from "./FlagsPanel";
import { MaterialsPanel } from "./MaterialsPanel";
import { ObjectivesPanel } from "./ObjectivesPanel";
import { focusRing, LoadState, Panel } from "./ui";

const TABS = ["materials", "objectives", "flags", "preview"] as const;
type Tab = (typeof TABS)[number];

/** Professor workspace for one class: material, objectives and milestones, flags, tutor preview. */
export function ContentWorkspace({ classId }: { classId: string }) {
  const client = getContentClient();
  const { state, reload } = useLoad(async () => {
    const [preferences, topics] = await Promise.all([
      client.getPreferences(),
      client.listTopics(classId),
    ]);
    return { preferences, topics };
  }, classId);
  if (state.status !== "ready") return <LoadState status={state.status} onRetry={reload} />;
  return (
    <ContentA11yRoot preferences={state.data.preferences}>
      <Workspace classId={classId} topics={state.data.topics} />
    </ContentA11yRoot>
  );
}

function Workspace({
  classId,
  topics,
}: {
  classId: string;
  topics: { id: string; title: string }[];
}) {
  const { t } = useContentView();
  const [tab, setTab] = useState<Tab>("materials");
  const refs = useRef<Record<Tab, HTMLButtonElement | null>>({
    materials: null,
    objectives: null,
    flags: null,
    preview: null,
  });

  // WAI-ARIA tabs: arrows move between tabs, Home/End jump to the ends.
  const onKeyDown = (event: KeyboardEvent) => {
    const index = TABS.indexOf(tab);
    const next =
      event.key === "ArrowRight"
        ? TABS[(index + 1) % TABS.length]
        : event.key === "ArrowLeft"
          ? TABS[(index - 1 + TABS.length) % TABS.length]
          : event.key === "Home"
            ? TABS[0]
            : event.key === "End"
              ? TABS[TABS.length - 1]
              : undefined;
    if (!next) return;
    event.preventDefault();
    setTab(next);
    refs.current[next]?.focus();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-[family-name:var(--athena-font-display)] text-3xl">{t.pageTitle}</h1>
        <Link href="/educator" className={`text-sm underline ${focusRing}`}>
          {t.backToDashboard}
        </Link>
      </div>
      <div
        role="tablist"
        aria-label={t.pageTitle}
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-1 border-b border-[var(--athena-hairline)]"
      >
        {TABS.map((key) => (
          <button
            key={key}
            ref={(node) => {
              refs.current[key] = node;
            }}
            id={`content-tab-${key}`}
            role="tab"
            type="button"
            aria-selected={tab === key}
            aria-controls={`content-panel-${key}`}
            tabIndex={tab === key ? 0 : -1}
            onClick={() => setTab(key)}
            className={`min-h-[var(--athena-target-min)] border-b-2 px-4 text-sm font-medium ${
              tab === key
                ? "border-[var(--athena-accent)] text-[var(--athena-ink)]"
                : "border-transparent text-[var(--athena-muted)]"
            } ${focusRing}`}
          >
            {t.tabs[key]}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`content-panel-${tab}`} aria-labelledby={`content-tab-${tab}`}>
        {tab === "materials" ? <MaterialsPanel classId={classId} topics={topics} /> : null}
        {tab === "objectives" ? <ObjectivesPanel classId={classId} topics={topics} /> : null}
        {tab === "flags" ? <FlagsPanel classId={classId} topics={topics} /> : null}
        {tab === "preview" ? (
          <Panel title={t.chat.heading}>
            <ChatPanel classId={classId} topics={topics} preview />
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
