"use client";
import { t } from "@/lib/i18n";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { StudentProgress, SubjectProgress, SubjectStatus } from "./mock-progress";
import { Orrery, percent } from "./Orrery";
import styles from "./progress.module.css";

const STATUS_LABEL: Record<SubjectStatus, string> = {
  done: "Complete",
  in_progress: "In progress",
  available: "Ready to start",
  locked: "Locked",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** A student's progress in every subject, drawn as orbits around their planet. */
export function StudentProgressView({ data }: { data: StudentProgress }) {
  const [active, setActive] = useState<string | null>(null);

  const studied = data.week.reduce((sum, minutes) => sum + minutes, 0);
  const busiest = Math.max(...data.week, 1);
  const activeSubject = data.subjects.find((subject) => subject.topicId === active);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/world" className={styles.back}>
          {t("Back to my world")}
        </Link>
        <h1 className={styles.title}>{t("{0}'s progress", { 0: data.studentName })}</h1>
        <p className={styles.lede}>
          {t("Each ring is a subject. The fuller the orbit, the more of it you have mastered.")}
        </p>
      </header>

      <div className={styles.layout}>
        <figure className={styles.sky}>
          <Orrery
            label={t("Progress orbits for {0} subjects", { 0: data.subjects.length })}
            active={active}
            rings={data.subjects.map((subject) => ({
              id: subject.topicId,
              hue: subject.hue,
              progress: subject.progress,
              locked: subject.status === "locked",
            }))}
            centerValue={
              activeSubject ? percent(activeSubject.progress) : percent(data.planetGrowth)
            }
            centerLabel={activeSubject ? t(activeSubject.title) : t("planet grown")}
          />
          <figcaption className={styles.week}>
            <div className={styles.weekStats}>
              <p>
                <strong>{data.streakDays}</strong> {t("day streak")}
              </p>
              <p>
                <strong>{studied}</strong> {t("minutes this week")}
              </p>
              <p>
                <strong>{data.checkpointsPassed}</strong> {t("checkpoints passed")}
              </p>
            </div>
            <ol className={styles.days} aria-label={t("Minutes studied each day this week")}>
              {data.week.map((minutes, index) => (
                <li key={DAYS[index]}>
                  <span
                    className={styles.dayBar}
                    style={{ "--day": minutes / busiest } as CSSProperties}
                    title={t("{0} minutes", { 0: minutes })}
                  />
                  <span className={styles.dayName}>{t(DAYS[index]!)}</span>
                </li>
              ))}
            </ol>
          </figcaption>
        </figure>

        <ol className={styles.subjects}>
          {data.subjects.map((subject) => (
            <SubjectRow
              key={subject.topicId}
              subject={subject}
              active={active === subject.topicId}
              onFocus={() => setActive(subject.topicId)}
              onBlur={() => setActive(null)}
            />
          ))}
        </ol>
      </div>
    </main>
  );
}

function SubjectRow({
  subject,
  active,
  onFocus,
  onBlur,
}: {
  subject: SubjectProgress;
  active: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const locked = subject.status === "locked";
  const body = (
    <>
      <span className={styles.swatch} aria-hidden="true" />
      <span className={styles.subjectMain}>
        <span className={styles.subjectName}>{t(subject.title)}</span>
        <span className={styles.subjectMeta}>
          {t(STATUS_LABEL[subject.status])}
          {subject.conceptsTotal > 0
            ? `, ${t("{0} of {1} concepts", { 0: subject.conceptsDone, 1: subject.conceptsTotal })}`
            : ""}
          {subject.bestCheckpoint !== undefined
            ? `, ${t("best checkpoint {0}%", { 0: subject.bestCheckpoint })}`
            : ""}
        </span>
        <span
          className={styles.bar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(subject.progress * 100)}
          aria-label={t(subject.title)}
        >
          <span style={{ "--value": subject.progress } as CSSProperties} />
        </span>
        <span className={styles.next}>
          {subject.status === "in_progress" || subject.status === "available"
            ? t("Next: {0}", { 0: t(subject.next) })
            : t(subject.next)}
        </span>
      </span>
      <span className={styles.subjectValue}>{percent(subject.progress)}</span>
    </>
  );
  return (
    <li
      className={styles.subject}
      data-active={active || undefined}
      data-status={subject.status}
      style={{ "--hue": subject.hue } as CSSProperties}
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
    >
      {locked ? (
        <div className={styles.subjectInner}>{body}</div>
      ) : (
        <Link
          href={`/world/house/${subject.topicId}`}
          className={styles.subjectInner}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          {body}
        </Link>
      )}
    </li>
  );
}
