"use client";
import { t } from "@/lib/i18n";

import { useState, type CSSProperties } from "react";
import { athenaDemoTopics } from "@athena/shared";
import { mockStudentProgress } from "./mock-progress";
import { Orrery, percent } from "./Orrery";
import styles from "./progress.module.css";

// Demo concept names until Curriculum exposes each topic's concept list to the house.
const CONCEPTS: Record<string, string[]> = {
  fractions: [
    "Equivalent fractions",
    "Comparing fractions",
    "Adding fractions",
    "Fractions of a quantity",
  ],
  geometry: [
    "Rectangle area",
    "Triangle area",
    "Base and perpendicular height",
    "Visual decomposition",
    "Area word problems",
  ],
  functions: [
    "Inputs and outputs",
    "Tables of values",
    "Reading graphs",
    "Slope",
    "Linear rules",
    "Comparing functions",
  ],
  statistics: ["Collecting data", "Mean", "Median and mode", "Range", "Charts", "Reading a survey"],
  probability: [
    "Outcomes",
    "Simple events",
    "Fractions as chance",
    "Experiments",
    "Expected results",
  ],
  criticalThinking: [
    "Claims and evidence",
    "Spotting assumptions",
    "Comparing arguments",
    "Drawing conclusions",
  ],
};

type ConceptStatus = "mastered" | "in_progress" | "not_started";
const STATUS_LABEL: Record<ConceptStatus, string> = {
  mastered: "Mastered",
  in_progress: "In progress",
  not_started: "Not started",
};

/** One subject's progress, drawn like the world's progress page: one orbit per concept. */
export function SubjectProgressView({
  topicId,
  title,
  progress,
  demonstrated,
  total,
  questSteps,
  badges,
}: {
  topicId: string;
  title: string;
  /** 0..1, the house's demonstrated progress. */
  progress: number;
  demonstrated?: number;
  total?: number;
  questSteps: { done: number; total: number };
  badges: number;
}) {
  const [active, setActive] = useState<string | null>(null);
  const topic = athenaDemoTopics.find((item) => item.id === topicId || item.legacyId === topicId);
  const subject = mockStudentProgress.subjects.find((item) => item.topicId === topic?.id);
  const hue = subject?.hue ?? "#5fb3a1";
  const names = CONCEPTS[topic?.key ?? ""] ?? [];
  const count = total ?? (names.length || 5);
  const done = Math.min(count, demonstrated ?? Math.round(progress * count));
  // The concept being worked on shows partial demo progress; later ones have not started.
  const concepts = Array.from({ length: count }, (_, index) => {
    const status: ConceptStatus =
      index < done ? "mastered" : index === done ? "in_progress" : "not_started";
    return {
      id: `concept-${index}`,
      name: names[index] ?? t("Concept {0}", { 0: index + 1 }),
      status,
      progress: status === "mastered" ? 1 : status === "in_progress" ? 0.35 : 0,
    };
  });
  const activeConcept = concepts.find((concept) => concept.id === active);

  return (
    <div className={styles.layout} data-compact>
      <figure className={styles.sky}>
        <Orrery
          label={t("Progress orbits for {0} concepts in {1}", { 0: count, 1: title })}
          active={active}
          rings={concepts.map((concept) => ({
            id: concept.id,
            hue,
            progress: concept.progress,
            locked: concept.status === "not_started",
          }))}
          centerValue={activeConcept ? percent(activeConcept.progress) : percent(progress)}
          centerLabel={activeConcept ? activeConcept.name : title}
        />
        <figcaption className={styles.week}>
          <div className={styles.weekStats}>
            <p>
              <strong>
                {done}/{count}
              </strong>{" "}
              {t("concepts mastered")}
            </p>
            <p>
              <strong>{subject?.minutesThisWeek ?? 0}</strong> {t("minutes this week")}
            </p>
            <p>
              <strong>
                {questSteps.done}/{questSteps.total}
              </strong>{" "}
              {t("quest steps")}
            </p>
            <p>
              <strong>{badges}</strong> {t("badges")}
            </p>
          </div>
        </figcaption>
      </figure>

      <ol className={styles.subjects}>
        {concepts.map((concept) => (
          <li
            key={concept.id}
            className={styles.subject}
            data-active={active === concept.id || undefined}
            data-status={concept.status === "not_started" ? "locked" : concept.status}
            style={{ "--hue": hue } as CSSProperties}
            onMouseEnter={() => setActive(concept.id)}
            onMouseLeave={() => setActive(null)}
          >
            <div className={styles.subjectInner}>
              <span className={styles.swatch} aria-hidden="true" />
              <span className={styles.subjectMain}>
                <span className={styles.subjectName}>{t(concept.name)}</span>
                <span className={styles.subjectMeta}>{t(STATUS_LABEL[concept.status])}</span>
                <span
                  className={styles.bar}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(concept.progress * 100)}
                  aria-label={t(concept.name)}
                >
                  <span style={{ "--value": concept.progress } as CSSProperties} />
                </span>
              </span>
              <span className={styles.subjectValue}>{percent(concept.progress)}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
