"use client";

import { useState } from "react";
import type { ContentFlag, ContentTopic } from "@athena/shared";
import { getContentClient } from "../api/content-client";
import { useLoad } from "../hooks/useLoad";
import { useContentView } from "./ContentA11yRoot";
import { Button, LoadState, Notice, Panel } from "./ui";

/** Messages the tutor redirected or refused, for the class professor to follow up. */
export function FlagsPanel({ classId, topics }: { classId: string; topics: ContentTopic[] }) {
  const { t, locale } = useContentView();
  const client = getContentClient();
  const { state, reload, setData } = useLoad(() => client.listFlags(classId), classId);
  const [error, setError] = useState<string | null>(null);

  const review = async (flag: ContentFlag) => {
    setError(null);
    try {
      const reviewed = await client.reviewFlag(flag.id);
      setData((flags) => flags.map((item) => (item.id === reviewed.id ? reviewed : item)));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : t.loadError);
    }
  };

  return (
    <Panel title={t.flags.heading} intro={t.flags.intro}>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {state.status !== "ready" ? (
        <LoadState status={state.status} onRetry={reload} />
      ) : state.data.length === 0 ? (
        <p className="text-sm text-[var(--athena-muted)]">{t.flags.empty}</p>
      ) : (
        <ul className="divide-y divide-[var(--athena-hairline)]">
          {state.data.map((flag) => (
            <li
              key={flag.id}
              className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium">
                  {t.categories[flag.category]}
                  <span className="font-normal text-[var(--athena-muted)]">
                    {" · "}
                    {flag.studentName}
                    {flag.topicId
                      ? ` · ${topics.find((topic) => topic.id === flag.topicId)?.title ?? ""}`
                      : ""}
                  </span>
                </p>
                <p className="text-sm">
                  {flag.excerpt ? (
                    <q lang={flag.locale}>{flag.excerpt}</q>
                  ) : (
                    <em>{t.flags.noExcerpt}</em>
                  )}
                </p>
                {flag.category === "self_harm" ? (
                  <p className="text-sm font-medium text-[#7a1f1f]">{t.flags.selfHarmNote}</p>
                ) : null}
                <p className="text-xs text-[var(--athena-muted)]">
                  <time dateTime={flag.createdAt}>
                    {new Date(flag.createdAt).toLocaleString(locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </p>
              </div>
              {flag.reviewedAt ? (
                <span className="text-sm text-[var(--athena-done)]">✓ {t.flags.reviewed}</span>
              ) : (
                <Button onClick={() => review(flag)}>{t.flags.review}</Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
