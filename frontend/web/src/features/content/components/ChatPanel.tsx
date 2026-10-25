"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { CONTENT_LIMITS, type ContentChatResponse, type ContentTopic } from "@athena/shared";
import { getContentClient } from "../api/content-client";
import { ContentApiError } from "../api/types";
import { fill } from "../strings";
import { useContentView } from "./ContentA11yRoot";
import { Button, inputClass, Notice } from "./ui";

type Turn = { role: "student"; text: string } | { role: "tutor"; reply: ContentChatResponse };

/**
 * The class tutor conversation. Students use it in their class; professors see it as a preview
 * (the server decides, from the caller's role). Only the student's own turns are sent back as
 * history.
 */
export function ChatPanel({
  classId,
  topics,
  preview = false,
  initialTopicId,
}: {
  classId: string;
  topics: ContentTopic[];
  preview?: boolean;
  initialTopicId?: string;
}) {
  const { t, a11y } = useContentView();
  const id = useId();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [topicId, setTopicId] = useState(initialTopicId ?? "");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({
      behavior: a11y.reducedMotion ? "auto" : "smooth",
      block: "nearest",
    });
  }, [turns, a11y.reducedMotion]);

  const send = async (event?: FormEvent) => {
    event?.preventDefault();
    const message = draft.trim();
    if (!message || busy) return;
    const history = turns
      .filter((turn): turn is Extract<Turn, { role: "student" }> => turn.role === "student")
      .slice(-CONTENT_LIMITS.maxHistoryTurns)
      .map((turn) => ({ role: "student" as const, content: turn.text }));
    setTurns((current) => [...current, { role: "student", text: message }]);
    setDraft("");
    setProblem(null);
    setBusy(true);
    try {
      const reply = await getContentClient().chat(classId, {
        message,
        history,
        ...(topicId && { topicId }),
      });
      setTurns((current) => [...current, { role: "tutor", reply }]);
    } catch (error) {
      setProblem(
        error instanceof ContentApiError && error.status === 429
          ? fill(t.chat.rateLimited, { seconds: error.retryAfterSeconds ?? 60 })
          : t.chat.failed,
      );
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) void send(event);
  };

  return (
    <div className="flex flex-col gap-4">
      {preview ? (
        <p className="rounded-[var(--athena-radius-small)] bg-[var(--athena-paper)] px-3 py-2 text-sm">
          {t.chat.previewNote}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`${id}-scope`} className="text-sm font-medium">
          {t.chat.scope}
        </label>
        <select
          id={`${id}-scope`}
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          className={`${inputClass} w-auto`}
        >
          <option value="">{t.chat.wholeClass}</option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-label={t.chat.heading}
        className="min-h-48 space-y-4 rounded-[var(--athena-radius-small)] border border-[var(--athena-hairline)] p-4"
      >
        {turns.length === 0 ? (
          <p className="text-sm text-[var(--athena-muted)]">{t.chat.empty}</p>
        ) : null}
        {turns.map((turn, index) =>
          turn.role === "student" ? (
            <div
              key={index}
              className="ml-auto max-w-[85%] rounded-[var(--athena-radius-small)] bg-[var(--athena-paper)] px-3 py-2"
            >
              <p className="text-xs font-semibold text-[var(--athena-muted)]">{t.chat.you}</p>
              <p className="whitespace-pre-wrap">{turn.text}</p>
            </div>
          ) : (
            <TutorReply key={index} reply={turn.reply} topics={topics} onTopic={setTopicId} />
          ),
        )}
        {busy ? <Notice>{t.chat.thinking}</Notice> : null}
        <div ref={end} />
      </div>

      {problem ? <Notice tone="error">{problem}</Notice> : null}

      <form onSubmit={send} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label htmlFor={`${id}-message`} className="sr-only">
          {t.chat.placeholder}
        </label>
        <textarea
          id={`${id}-message`}
          value={draft}
          rows={2}
          maxLength={CONTENT_LIMITS.maxMessageLength}
          placeholder={t.chat.placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          className={inputClass}
        />
        <Button type="submit" variant="primary" disabled={busy || !draft.trim()}>
          {t.chat.send}
        </Button>
      </form>
    </div>
  );
}

function TutorReply({
  reply,
  topics,
  onTopic,
}: {
  reply: ContentChatResponse;
  topics: ContentTopic[];
  onTopic: (topicId: string) => void;
}) {
  const { t } = useContentView();
  const suggested = reply.suggestedTopicIds
    .map((id) => topics.find((topic) => topic.id === id))
    .filter((topic): topic is ContentTopic => Boolean(topic));
  return (
    <div
      lang={reply.locale}
      className="max-w-[90%] space-y-2 rounded-[var(--athena-radius-small)] border border-[var(--athena-hairline)] px-3 py-2"
    >
      <p className="text-xs font-semibold text-[var(--athena-muted)]">
        {t.chat.tutor} · {t.outcomes[reply.outcome]}
      </p>
      <p className="whitespace-pre-wrap">{reply.answer}</p>
      {reply.citations.length > 0 ? (
        <div>
          <p className="text-xs font-semibold">{t.chat.sources}</p>
          <ol className="mt-1 space-y-1">
            {reply.citations.map((citation, index) => (
              <li key={citation.chunkId}>
                <details className="rounded-[var(--athena-radius-small)] bg-[var(--athena-paper)] px-2 py-1 text-sm">
                  <summary className="min-h-[var(--athena-target-min)] cursor-pointer content-center">
                    [{index + 1}] {citation.materialTitle}
                    {citation.section ? ` · ${citation.section}` : ""}
                    {citation.page ? ` · ${fill(t.chat.page, { page: citation.page })}` : ""}
                  </summary>
                  <blockquote className="mt-1 border-l-2 border-[var(--athena-border)] pl-2">
                    {citation.excerpt}
                  </blockquote>
                </details>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {suggested.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span>{t.chat.tryTopics}</span>
          {suggested.map((topic) => (
            <Button key={topic.id} onClick={() => onTopic(topic.id)}>
              {topic.title}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
