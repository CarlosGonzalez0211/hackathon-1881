"use client";
import { localizeContent, t } from "@/lib/i18n";

import { useEffect, useState } from "react";
import type { HouseContent } from "@athena/shared";
import { getCurriculumContentClient } from "../house-content-client";
import styles from "./HousePage.module.css";

/**
 * Material tab. Slot owned by Curriculum (P1): it may replace the internals (viewer,
 * citations, generated resources) as long as it keeps these props. World only mounts it.
 */
export function HouseContentPanel({
  topicId,
  studentId,
  cta,
  onStart,
  showStart = true,
}: {
  topicId: string;
  studentId: string;
  cta: string;
  onStart: () => void;
  showStart?: boolean;
}) {
  const [content, setContent] = useState<HouseContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setContent(null);
    setError(null);
    getCurriculumContentClient()
      .getHouseContent(topicId)
      .then((value) => active && setContent(localizeContent(value)))
      .catch((cause) => active && setError(cause instanceof Error ? cause.message : String(cause)));
    return () => {
      active = false;
    };
  }, [topicId, studentId, attempt]);

  if (error)
    return (
      <div className={styles.compact} role="alert">
        <p>{t("Could not load the material.")}</p>
        <button className={styles.secondary} onClick={() => setAttempt((value) => value + 1)}>
          {t("Retry")}
        </button>
      </div>
    );
  if (!content)
    return (
      <div className={styles.skeleton} role="status" aria-label={t("Loading material")}>
        <span />
        <span />
      </div>
    );

  const ready = content.materials.filter((material) => material.status === "ready");
  return (
    <div className={styles.stack}>
      {content.summary && <p className={styles.lead}>{content.summary}</p>}
      <ul className={styles.cards} aria-label={t("Topic material")}>
        {ready.map((material) => (
          <li key={material.id} className={styles.card}>
            <span className={styles.fileBadge} aria-hidden="true">
              {material.mimeType === "application/pdf" ? "PDF" : "DOC"}
            </span>
            <span className={styles.cardText}>
              <strong>{material.title}</strong>
              <small>
                {material.filename}
                {material.pageCount ? t(" · {0} pages", { 0: material.pageCount }) : ""}
              </small>
            </span>
            {material.url ? (
              <a className={styles.secondary} href={material.url} target="_blank" rel="noreferrer">
                {t("Open")}
              </a>
            ) : (
              <span className={styles.muted}>{t("Preview coming soon")}</span>
            )}
          </li>
        ))}
      </ul>
      {content.resources.map((resource) => (
        <article key={resource.id} className={styles.resource}>
          <h3>{resource.title}</h3>
          {resource.body && <p>{resource.body}</p>}
        </article>
      ))}
      {showStart && (
        <button className={styles.primary} onClick={onStart}>
          {cta}
        </button>
      )}
    </div>
  );
}
