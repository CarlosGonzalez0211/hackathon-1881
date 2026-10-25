"use client";
import { useEffect, useId, useState } from "react";
import type { HouseContent } from "@athena/shared";
import { getHouseContentClient } from "../api/house-content-client";
import { CurriculumContentError } from "../api/http-house-content-client";
import { CurriculumMaterialView } from "./CurriculumMaterialView";
import styles from "./CurriculumMaterialPanel.module.css";

/** Props preserve the existing World Material slot, including showStart. */
export function CurriculumMaterialPanel({
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
  const languageId = useId();
  const [locale, setLocale] = useState<"auto" | "en" | "es">("auto");
  const [content, setContent] = useState<HouseContent | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setContent(null);
    setError(null);
    getHouseContentClient()
      .getHouseContent(topicId, {
        locale: locale === "auto" ? undefined : locale,
        signal: controller.signal,
      })
      .then((result) => {
        if (!controller.signal.aborted) setContent(result);
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted)
          setError(
            failure instanceof Error ? failure : new Error("Could not load course materials."),
          );
      });
    return () => controller.abort();
  }, [topicId, studentId, locale, attempt]);
  const needsLogin = error instanceof CurriculumContentError && error.code === "unauthenticated";
  return (
    <section className={styles.panel} aria-label="Course materials">
      <div className={styles.toolbar}>
        <h2>Lesson materials</h2>
        <span className={styles.language}>
          <label htmlFor={languageId}>Content language</label>
          <select
            id={languageId}
            value={locale}
            onChange={(event) => setLocale(event.target.value as typeof locale)}
          >
            <option value="auto">Course language</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </span>
      </div>
      {error ? (
        <div role="alert" className={styles.retry}>
          <p>{error.message}</p>
          {needsLogin && <a href="/login">Sign in</a>}
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>
            Try again
          </button>
        </div>
      ) : content ? (
        <CurriculumMaterialView content={content} />
      ) : (
        <p role="status">Loading course materials…</p>
      )}
      {showStart && content && (
        <button type="button" className={styles.start} onClick={onStart}>
          {cta}
        </button>
      )}
    </section>
  );
}
