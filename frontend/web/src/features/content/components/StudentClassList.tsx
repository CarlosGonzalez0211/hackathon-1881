"use client";

import Link from "next/link";
import { getClassesClient } from "@/features/classes";
import { getContentClient } from "../api/content-client";
import { useLoad } from "../hooks/useLoad";
import { ContentA11yRoot, useContentView } from "./ContentA11yRoot";
import { focusRing, LoadState } from "./ui";

/** The classes the student is in, each with a link to its tutor. */
export function StudentClassList() {
  const { state, reload } = useLoad(async () => {
    const [preferences, classes] = await Promise.all([
      getContentClient().getPreferences(),
      getClassesClient().listClasses(),
    ]);
    return { preferences, classes };
  }, "classes");
  if (state.status !== "ready") return <LoadState status={state.status} onRetry={reload} />;
  return (
    <ContentA11yRoot preferences={state.data.preferences}>
      <ClassList classes={state.data.classes} />
    </ContentA11yRoot>
  );
}

function ClassList({ classes }: { classes: { id: string; title: string; term?: string }[] }) {
  const { t } = useContentView();
  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--athena-font-display)] text-3xl">
        {t.student.classesTitle}
      </h1>
      <p className="text-sm text-[var(--athena-muted)]">{t.student.classesIntro}</p>
      {classes.length === 0 ? (
        <p>{t.student.noClasses}</p>
      ) : (
        <ul className="space-y-3">
          {classes.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--athena-radius-panel)] border border-[var(--athena-border)] bg-[var(--athena-surface)] p-4"
            >
              <span className="font-medium">
                {item.title}
                {item.term ? (
                  <span className="text-[var(--athena-muted)]"> · {item.term}</span>
                ) : null}
              </span>
              <Link
                href={`/classes/${item.id}/chat`}
                className={`inline-flex min-h-[var(--athena-target-min)] items-center rounded-[var(--athena-radius-small)] bg-[var(--athena-accent)] px-4 text-sm font-medium text-[var(--athena-accent-ink)] ${focusRing}`}
              >
                {t.student.openTutor}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
