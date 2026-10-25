"use client";

import { useState } from "react";
import Link from "next/link";
import type { ContentStudentMaterial, ContentTopic } from "@athena/shared";
import { useAuth } from "@/features/auth";
import { getContentClient } from "../api/content-client";
import { objectivesInScope, upcomingMilestones } from "../coverage";
import { useLoad } from "../hooks/useLoad";
import { fill } from "../strings";
import { ChatPanel } from "./ChatPanel";
import { ContentA11yRoot, useContentView } from "./ContentA11yRoot";
import { focusRing, LoadState, Panel } from "./ui";

/** The student's class tutor, beside what it covers: material, objectives and milestones. */
export function StudentClassChat({
  classId,
  initialTopicId,
}: {
  classId: string;
  initialTopicId?: string;
}) {
  const client = getContentClient();
  const { state, reload } = useLoad(async () => {
    const [preferences, topics, materials, objectives, milestones] = await Promise.all([
      client.getPreferences(),
      client.listTopics(classId),
      client.listMaterials(classId),
      client.listObjectives(classId),
      client.listMilestones(classId),
    ]);
    return { preferences, topics, materials, objectives, milestones };
  }, classId);
  if (state.status !== "ready") return <LoadState status={state.status} onRetry={reload} />;
  const { preferences, ...data } = state.data;
  const knownTopic = data.topics.some((topic) => topic.id === initialTopicId)
    ? initialTopicId
    : undefined;
  return (
    <ContentA11yRoot preferences={preferences}>
      <ChatLayout classId={classId} initialTopicId={knownTopic} {...data} />
    </ContentA11yRoot>
  );
}

function ChatLayout({
  classId,
  initialTopicId,
  topics,
  materials,
  objectives,
  milestones,
}: {
  classId: string;
  initialTopicId?: string;
  topics: ContentTopic[];
  materials: Awaited<ReturnType<ReturnType<typeof getContentClient>["listMaterials"]>>;
  objectives: Awaited<ReturnType<ReturnType<typeof getContentClient>["listObjectives"]>>;
  milestones: Awaited<ReturnType<ReturnType<typeof getContentClient>["listMilestones"]>>;
}) {
  const { t, locale } = useContentView();
  const { user } = useAuth();
  const [topicId, setTopicId] = useState(initialTopicId ?? "");
  const topicTitle = (id: string) => topics.find((topic) => topic.id === id)?.title ?? "";
  // Professors and admins who open this page get the server's unrecorded preview.
  const preview = user ? user.role !== "student" : false;
  const scoped = objectivesInScope(objectives, topicId);
  const upcoming = upcomingMilestones(milestones, new Date());
  const ready = (materials as ContentStudentMaterial[]).filter(
    (material) => !topicId || material.topicIds.includes(topicId),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-[family-name:var(--athena-font-display)] text-3xl">{t.chat.heading}</h1>
        <Link href="/classes" className={`text-sm underline ${focusRing}`}>
          {t.student.backToClasses}
        </Link>
      </div>
      <p className="text-sm text-[var(--athena-muted)]">{t.student.honesty}</p>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Panel title={t.chat.heading}>
          <ChatPanel
            classId={classId}
            topics={topics}
            preview={preview}
            initialTopicId={initialTopicId}
            onTopicChange={setTopicId}
          />
        </Panel>
        <aside aria-label={t.student.coverageHeading} className="space-y-4">
          <Panel title={t.student.coverageHeading} intro={t.student.coverageIntro}>
            <h3 className="text-sm font-semibold">{t.student.materials}</h3>
            {ready.length === 0 ? (
              <p className="text-sm text-[var(--athena-muted)]">{t.student.noMaterials}</p>
            ) : (
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {ready.map((material) => (
                  <li key={material.id} lang={material.locale}>
                    {material.title}
                  </li>
                ))}
              </ul>
            )}
            <h3 className="mt-4 text-sm font-semibold">
              {topicId
                ? fill(t.student.objectivesFor, { topic: topicTitle(topicId) })
                : t.student.objectives}
            </h3>
            {scoped.length === 0 ? (
              <p className="text-sm text-[var(--athena-muted)]">{t.student.noObjectives}</p>
            ) : (
              <ul className="mt-1 space-y-1 text-sm">
                {scoped.map((objective) => (
                  <li key={objective.id}>
                    <span className="mr-1 font-[family-name:var(--athena-font-mono)]">
                      {objective.code}
                    </span>
                    {objective.statement[locale]}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title={t.student.milestones}>
            {upcoming.length === 0 ? (
              <p className="text-sm text-[var(--athena-muted)]">{t.student.noMilestones}</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {upcoming.map((milestone) => (
                  <li key={milestone.id}>
                    <p className="font-medium">{milestone.title[locale]}</p>
                    {milestone.dueAt ? (
                      <p className="text-[var(--athena-muted)]">
                        <time dateTime={milestone.dueAt}>
                          {fill(t.milestones.dueOn, {
                            date: new Date(milestone.dueAt).toLocaleDateString(locale, {
                              timeZone: "UTC",
                            }),
                          })}
                        </time>
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
