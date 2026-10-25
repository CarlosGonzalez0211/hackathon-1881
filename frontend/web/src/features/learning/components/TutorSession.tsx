"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { Citation, TutorMessage, WorldLearningSessionStart } from "@athena/shared";
import { appLocale, t } from "@/lib/i18n";
import { getLearningClient } from "../api/learning-client";
import { LearnFormatMenu } from "./LearnFormatMenu";
import styles from "./TutorSession.module.css";

type Turn =
  | { id: string; role: "student"; content: string }
  | { id: string; role: "tutor"; message: TutorMessage };

export interface TutorSessionProps {
  studentId: string;
  topicId: string;
  entryId: string;
}

/** Grounded adaptive tutor embedded in a topic house's Learn tab. */
export function TutorSession({ studentId, topicId, entryId }: TutorSessionProps) {
  const client = useMemo(() => getLearningClient(), []);
  const id = useId();
  const nextTurn = useRef(0);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const [session, setSession] = useState<WorldLearningSessionStart | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    end.current?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest",
    });
  }, [turns, sending]);

  const start = async () => {
    if (starting) return;
    setStarting(true);
    setProblem(null);
    try {
      const started = await client.startSession({ studentId, topicId, entryId });
      setSession(started);
      window.setTimeout(() => input.current?.focus(), 0);
    } catch {
      setProblem(t("Could not start the learning session. Please try again."));
    } finally {
      setStarting(false);
    }
  };

  const send = async (event?: FormEvent) => {
    event?.preventDefault();
    const content = draft.trim();
    if (!session || !content || sending) return;
    const studentTurn: Turn = {
      id: `student-${nextTurn.current++}`,
      role: "student",
      content,
    };
    setTurns((current) => [...current, studentTurn]);
    setDraft("");
    setProblem(null);
    setSending(true);
    try {
      const message = await client.sendMessage(session.sessionId, content);
      setTurns((current) => [...current, { id: message.id, role: "tutor", message }]);
    } catch {
      setProblem(t("The tutor could not answer. Your message is ready to retry."));
      setDraft(content);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  };

  if (!session) {
    return (
      <section className={styles.intro} aria-labelledby={`${id}-title`}>
        <div className={styles.orb} aria-hidden="true">
          ✶
        </div>
        <div>
          <h2 id={`${id}-title`} className={styles.title}>
            {t("Your Athena tutor")}
          </h2>
          <p className={styles.lead}>
            {t(
              "Ask questions and get explanations grounded in your teacher's approved material, with sources you can inspect.",
            )}
          </p>
          <p className={styles.integrity}>
            {t(
              "Chat activity does not change mastery. Progress still requires checkpoint evidence.",
            )}
          </p>
        </div>
        {problem ? (
          <p className={styles.error} role="alert">
            {problem}
          </p>
        ) : null}
        <button
          className={styles.primary}
          type="button"
          onClick={() => void start()}
          disabled={starting}
        >
          {starting ? t("Starting tutor…") : t("Start learning session")}
        </button>
      </section>
    );
  }

  return (
    <section className={styles.session} aria-labelledby={`${id}-title`}>
      <header className={styles.sessionHeader}>
        <div>
          <h2 id={`${id}-title`} className={styles.title}>
            {t("Your Athena tutor")}
          </h2>
          <p className={styles.strategy}>
            {t("Teaching approach:")} {humanize(session.strategy)}
          </p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.online}>
            <span aria-hidden="true" /> {t("Session ready")}
          </span>
          <LearnFormatMenu
            onPick={(prompt) => {
              setDraft(prompt);
              window.setTimeout(() => input.current?.focus(), 0);
            }}
          />
        </div>
      </header>

      <div
        className={styles.log}
        role="log"
        aria-live="polite"
        aria-busy={sending}
        aria-label={t("Tutor conversation")}
      >
        {turns.length === 0 ? (
          <div className={styles.welcome}>
            <strong>{t("What would you like to understand?")}</strong>
            <span>{t("Try asking why a triangle's area is divided by two.")}</span>
          </div>
        ) : null}
        {turns.map((turn) =>
          turn.role === "student" ? (
            <article key={turn.id} className={`${styles.message} ${styles.student}`}>
              <strong>{t("You")}</strong>
              <p>{turn.content}</p>
            </article>
          ) : (
            <TutorReply key={turn.id} message={turn.message} />
          ),
        )}
        {sending ? (
          <p className={styles.thinking} role="status">
            <span aria-hidden="true">✦</span> {t("Athena is thinking…")}
          </p>
        ) : null}
        <div ref={end} />
      </div>

      {problem ? (
        <p className={styles.error} role="alert">
          {problem}
        </p>
      ) : null}

      <form className={styles.composer} onSubmit={send}>
        <label htmlFor={`${id}-message`} className={styles.srOnly}>
          {t("Message your tutor")}
        </label>
        <textarea
          ref={input}
          id={`${id}-message`}
          value={draft}
          rows={2}
          maxLength={4_000}
          placeholder={t("Ask about this topic…")}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          disabled={sending}
        />
        <button className={styles.primary} type="submit" disabled={sending || !draft.trim()}>
          {t("Send")}
        </button>
      </form>
      <p className={styles.composerHint}>{t("Enter sends · Shift+Enter adds a new line")}</p>
    </section>
  );
}

function TutorReply({ message }: { message: TutorMessage }) {
  return (
    <article className={`${styles.message} ${styles.tutor}`}>
      <strong>{t("Athena tutor")}</strong>
      <p>{message.content}</p>
      {message.unsupported ? (
        <p className={styles.unsupported}>
          {t("This answer is limited because the approved material does not cover the question.")}
        </p>
      ) : null}
      {message.citations.length > 0 ? (
        <div className={styles.sources}>
          <strong>{t("Sources")}</strong>
          <ol>
            {message.citations.map((citation, index) => (
              <li key={citation.chunkId}>
                <CitationDetails citation={citation} number={index + 1} />
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </article>
  );
}

function CitationDetails({ citation, number }: { citation: Citation; number: number }) {
  const locator = citation.section
    ? citation.section
    : citation.page
      ? t("Page {0}", { 0: citation.page })
      : "";
  return (
    <details>
      <summary>
        [{number}] {citation.materialTitle}
        {locator ? ` · ${locator}` : ""}
      </summary>
      <blockquote lang={appLocale}>{citation.excerpt}</blockquote>
    </details>
  );
}

function humanize(value: string) {
  return value.replaceAll("_", " ");
}
