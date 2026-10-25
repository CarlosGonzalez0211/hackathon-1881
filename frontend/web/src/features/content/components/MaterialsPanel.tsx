"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  contentDisplayStatus,
  type ContentMaterial,
  type ContentTopic,
  type Locale,
} from "@athena/shared";
import { getContentClient } from "../api/content-client";
import { useLoad } from "../hooks/useLoad";
import { fill } from "../strings";
import { contentMimeFor, sha256Hex, titleFromFilename, uploadProblem } from "../upload";
import { useContentView } from "./ContentA11yRoot";
import { Button, Field, inputClass, LoadState, Notice, Panel, StatusChip } from "./ui";

const POLL_MS = 2_500;

/** Upload, status and processing of the class's material (professor view). */
export function MaterialsPanel({ classId, topics }: { classId: string; topics: ContentTopic[] }) {
  const { t } = useContentView();
  const client = getContentClient();
  const { state, reload, setData } = useLoad(
    async () => (await client.listMaterials(classId)) as ContentMaterial[],
    classId,
  );
  const [notice, setNotice] = useState<{ tone: "status" | "error"; text: string } | null>(null);

  const replace = (material: ContentMaterial) =>
    setData((items) => {
      const others = items.filter((item) => item.id !== material.id);
      return [...others, material].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    });

  // Processing advances in bounded steps: keep calling process while anything is processing.
  const materials = state.status === "ready" ? state.data : [];
  const processing = materials.filter((m) => contentDisplayStatus(m.status) === "processing");
  const processingKey = processing.map((m) => `${m.id}:${m.progress.embedded}`).join(",");
  useEffect(() => {
    if (processing.length === 0) return;
    const timer = setTimeout(async () => {
      for (const material of processing) {
        try {
          replace(await client.processMaterial(material.id));
        } catch {
          // The next poll retries; a persistent failure is recorded on the material.
        }
      }
    }, POLL_MS);
    return () => clearTimeout(timer);
    // processingKey captures every change that matters.
  }, [processingKey]);

  const run = async (material: ContentMaterial, action: "process" | "delete" | "download") => {
    setNotice(null);
    try {
      if (action === "process") replace(await client.processMaterial(material.id));
      if (action === "download")
        window.open((await client.downloadUrl(material.id)).url, "_blank", "noopener");
      if (action === "delete") {
        if (!window.confirm(fill(t.confirmDelete, { name: material.title }))) return;
        await client.deleteMaterial(material.id);
        setData((items) => items.filter((item) => item.id !== material.id));
      }
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : t.loadError });
    }
  };

  return (
    <Panel title={t.materials.heading} intro={t.materials.intro}>
      <UploadForm
        classId={classId}
        topics={topics}
        onUploaded={(material, duplicate) => {
          replace(material);
          setNotice({
            tone: "status",
            text: duplicate ? t.materials.duplicate : t.materials.uploaded,
          });
        }}
        onError={(text) => setNotice({ tone: "error", text })}
      />
      <div className="mt-4">
        {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
      </div>
      <div className="mt-6">
        {state.status !== "ready" ? (
          <LoadState status={state.status} onRetry={reload} />
        ) : materials.length === 0 ? (
          <p className="text-sm text-[var(--athena-muted)]">{t.materials.empty}</p>
        ) : (
          <>
            {processing.length > 0 ? <Notice>{t.materials.keepPageOpen}</Notice> : null}
            <ul className="mt-2 divide-y divide-[var(--athena-hairline)]">
              {materials.map((material) => (
                <MaterialRow key={material.id} material={material} topics={topics} onAction={run} />
              ))}
            </ul>
          </>
        )}
      </div>
    </Panel>
  );
}

function MaterialRow({
  material,
  topics,
  onAction,
}: {
  material: ContentMaterial;
  topics: ContentTopic[];
  onAction: (material: ContentMaterial, action: "process" | "delete" | "download") => void;
}) {
  const { t } = useContentView();
  const shown = contentDisplayStatus(material.status);
  const topicNames = material.topicIds
    .map((id) => topics.find((topic) => topic.id === id)?.title)
    .filter(Boolean)
    .join(", ");
  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="font-medium">{material.title}</p>
        <p className="text-sm text-[var(--athena-muted)]">
          {material.filename} · {topicNames || t.materials.noTopics} ·{" "}
          {t.languages[material.locale]}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip status={material.status} />
          {shown === "processing" && material.progress.total > 0 ? (
            <ProgressMeter done={material.progress.embedded} total={material.progress.total} />
          ) : null}
        </div>
        {material.errorCode ? (
          <p className="text-sm text-[#7a1f1f]">{t.errorCodes[material.errorCode]}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {shown === "failed" || shown === "uploaded" ? (
          <Button onClick={() => onAction(material, "process")}>
            {shown === "failed" ? t.retry : t.materials.process}
          </Button>
        ) : null}
        <Button onClick={() => onAction(material, "download")}>{t.materials.download}</Button>
        <Button variant="danger" onClick={() => onAction(material, "delete")}>
          {t.delete}
        </Button>
      </div>
    </li>
  );
}

function ProgressMeter({ done, total }: { done: number; total: number }) {
  const { t } = useContentView();
  const label = fill(t.materials.progress, { done, total });
  return (
    <span className="flex items-center gap-2 text-xs text-[var(--athena-muted)]">
      <span
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="block h-2 w-28 overflow-hidden rounded-full bg-[var(--athena-hairline)]"
      >
        <span
          className="block h-full bg-[var(--athena-in-progress)] transition-[width]"
          style={{ width: `${Math.round((done / total) * 100)}%` }}
        />
      </span>
      {label}
    </span>
  );
}

function UploadForm({
  classId,
  topics,
  onUploaded,
  onError,
}: {
  classId: string;
  topics: ContentTopic[];
  onUploaded: (material: ContentMaterial, duplicate: boolean) => void;
  onError: (text: string) => void;
}) {
  const { t, locale } = useContentView();
  const id = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [materialLocale, setMaterialLocale] = useState<Locale>(locale);
  const [busy, setBusy] = useState(false);

  const problems = {
    type: t.materials.problemType,
    size: t.materials.problemSize,
    empty: t.materials.problemEmpty,
  };

  const choose = (next: File | null) => {
    setFile(next);
    if (!next) return;
    const problem = uploadProblem(next);
    if (problem) onError(problems[problem]);
    else if (!title) setTitle(titleFromFilename(next.name));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return;
    const problem = uploadProblem(file);
    const mimeType = contentMimeFor(file);
    if (problem || !mimeType) return onError(problems[problem ?? "type"]);
    setBusy(true);
    const client = getContentClient();
    try {
      const created = await client.createMaterial(classId, {
        filename: file.name,
        mimeType,
        byteSize: file.size,
        sha256: await sha256Hex(file),
        title: title.trim() || titleFromFilename(file.name),
        topicIds,
        locale: materialLocale,
      });
      if (created.duplicate) {
        onUploaded(created.material, true);
      } else {
        await client.uploadFile(created.uploadUrl, file);
        await client.completeUpload(created.material.id);
        onUploaded(await client.processMaterial(created.material.id), false);
      }
      setFile(null);
      setTitle("");
      setTopicIds([]);
      if (fileInput.current) fileInput.current.value = "";
    } catch (error) {
      onError(`${t.materials.uploadFailed} ${error instanceof Error ? error.message : ""}`.trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" aria-busy={busy}>
      <Field label={t.materials.file} htmlFor={`${id}-file`}>
        <input
          ref={fileInput}
          id={`${id}-file`}
          type="file"
          accept=".pdf,.txt,.md,.markdown,application/pdf,text/plain,text/markdown"
          onChange={(event) => choose(event.target.files?.[0] ?? null)}
          className={inputClass}
          required
        />
      </Field>
      <Field label={t.materials.title} htmlFor={`${id}-title`}>
        <input
          id={`${id}-title`}
          value={title}
          maxLength={200}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
        />
      </Field>
      <fieldset className="space-y-1">
        <legend className="text-sm font-medium">{t.materials.topics}</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {topics.map((topic) => (
            <label
              key={topic.id}
              className="flex min-h-[var(--athena-target-min)] items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={topicIds.includes(topic.id)}
                onChange={(event) =>
                  setTopicIds((ids) =>
                    event.target.checked
                      ? [...ids, topic.id]
                      : ids.filter((value) => value !== topic.id),
                  )
                }
                className="size-4"
              />
              {topic.title}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label={t.materials.language} htmlFor={`${id}-locale`}>
        <select
          id={`${id}-locale`}
          value={materialLocale}
          onChange={(event) => setMaterialLocale(event.target.value as Locale)}
          className={inputClass}
        >
          <option value="es">{t.languages.es}</option>
          <option value="en">{t.languages.en}</option>
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" variant="primary" disabled={busy || !file}>
          {busy ? t.materials.uploading : t.materials.upload}
        </Button>
      </div>
    </form>
  );
}
