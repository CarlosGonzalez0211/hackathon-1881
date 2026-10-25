"use client";
import { t } from "@/lib/i18n";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import type { StudentProgress, SubjectProgress, SubjectStatus } from "./mock-progress";
import styles from "./progress.module.css";

const SIZE = 420;
const CENTER = SIZE / 2;
const FIRST_ORBIT = 86;
const ORBIT_GAP = 21;

const STATUS_LABEL: Record<SubjectStatus, string> = {
  done: "Complete",
  in_progress: "In progress",
  available: "Ready to start",
  locked: "Locked",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Deterministic star field so server and client render the same sky. */
const STARS = Array.from({ length: 70 }, (_, index) => {
  const x = (index * 97.3) % SIZE;
  const y = (index * 53.7 + (index % 7) * 31) % SIZE;
  const r = index % 9 === 0 ? 1.6 : index % 3 === 0 ? 1.1 : 0.7;
  return { x, y, r, o: 0.25 + ((index * 37) % 60) / 100 };
});

const percent = (value: number) => `${Math.round(value * 100)}%`;

/** A student's progress in every subject, drawn as orbits around their planet. */
export function StudentProgressView({ data }: { data: StudentProgress }) {
  const [active, setActive] = useState<string | null>(null);
  // Arcs start empty and sweep to their value once, after the first paint.
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

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
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className={styles.orrery}
            role="img"
            aria-label={t("Progress orbits for {0} subjects", { 0: data.subjects.length })}
          >
            <defs>
              <radialGradient id="planet-fill" cx="38%" cy="32%" r="75%">
                <stop offset="0%" stopColor="#bfe3c9" />
                <stop offset="55%" stopColor="#5fa88d" />
                <stop offset="100%" stopColor="#2c5b5c" />
              </radialGradient>
              <radialGradient id="planet-glow" r="50%">
                <stop offset="60%" stopColor="#7fd1b9" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#7fd1b9" stopOpacity="0" />
              </radialGradient>
            </defs>
            {STARS.map((star, index) => (
              <circle key={index} cx={star.x} cy={star.y} r={star.r} fill="#fff" opacity={star.o} />
            ))}

            {data.subjects.map((subject, index) => (
              <Orbit
                key={subject.topicId}
                subject={subject}
                radius={FIRST_ORBIT + index * ORBIT_GAP}
                order={index}
                drawn={drawn}
                dimmed={active !== null && active !== subject.topicId}
                highlighted={active === subject.topicId}
              />
            ))}

            <circle cx={CENTER} cy={CENTER} r={70} fill="url(#planet-glow)" />
            <circle cx={CENTER} cy={CENTER} r={52} fill="url(#planet-fill)" />
            <path
              d={`M${CENTER - 34} ${CENTER - 18}q12-10 24-3t20-6q10 6 4 16t-18 4q-12 8-22 2t-8-13Zm30 34q10-6 22-1t4 10q-8 7-18 3t-8-12Z`}
              fill="#9fcf87"
              opacity="0.85"
            />
            <text x={CENTER} y={CENTER + 6} className={styles.planetValue} textAnchor="middle">
              {activeSubject ? percent(activeSubject.progress) : percent(data.planetGrowth)}
            </text>
            <text x={CENTER} y={CENTER + 24} className={styles.planetLabel} textAnchor="middle">
              {activeSubject ? t(activeSubject.title) : t("planet grown")}
            </text>
          </svg>
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

function Orbit({
  subject,
  radius,
  order,
  drawn,
  dimmed,
  highlighted,
}: {
  subject: SubjectProgress;
  radius: number;
  order: number;
  drawn: boolean;
  dimmed: boolean;
  highlighted: boolean;
}) {
  const circumference = 2 * Math.PI * radius;
  const shown = drawn ? subject.progress : 0;
  // The moon rides the tip of the arc, starting at twelve o'clock.
  const angle = shown * 2 * Math.PI - Math.PI / 2;
  const moonX = CENTER + radius * Math.cos(angle);
  const moonY = CENTER + radius * Math.sin(angle);
  const locked = subject.status === "locked";
  return (
    <g
      className={styles.orbit}
      data-dimmed={dimmed || undefined}
      data-highlighted={highlighted || undefined}
      style={{ "--hue": subject.hue, "--order": order } as CSSProperties}
    >
      <circle
        cx={CENTER}
        cy={CENTER}
        r={radius}
        className={locked ? styles.trackLocked : styles.track}
      />
      {subject.progress > 0 ? (
        <>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={radius}
            className={styles.arc}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - shown)}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
          <circle cx={moonX} cy={moonY} r={highlighted ? 7 : 5} className={styles.moon} />
        </>
      ) : null}
    </g>
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
