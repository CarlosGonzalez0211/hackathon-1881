"use client";

import { useId, useState, type FormEvent } from "react";
import type {
  ContentMaterial,
  ContentMilestone,
  ContentObjective,
  ContentTopic,
} from "@athena/shared";
import { getContentClient } from "../api/content-client";
import { ContentApiError } from "../api/types";
import { useLoad } from "../hooks/useLoad";
import { fill } from "../strings";
import { useContentView } from "./ContentA11yRoot";
import { Button, Field, inputClass, LoadState, Notice, Panel } from "./ui";

interface Data {
  objectives: ContentObjective[];
  milestones: ContentMilestone[];
  materials: ContentMaterial[];
}

/** Learning objectives (bilingual, per topic) and the milestones that group them. */
export function ObjectivesPanel({ classId, topics }: { classId: string; topics: ContentTopic[] }) {
  const { t, locale } = useContentView();
  const client = getContentClient();
  const { state, reload } = useLoad<Data>(async () => {
    const [objectives, milestones, materials] = await Promise.all([
      client.listObjectives(classId),
      client.listMilestones(classId),
      client.listMaterials(classId),
    ]);
    return { objectives, milestones, materials: materials as ContentMaterial[] };
  }, classId);
  const [error, setError] = useState<string | null>(null);

  if (state.status !== "ready") return <LoadState status={state.status} onRetry={reload} />;
  const { objectives, milestones, materials } = state.data;

  /**
   * Saves, then reloads. A 409 on an edit means someone else saved first: reload and explain
   * instead of overwriting. A 409 on a create is a duplicate code: show the server's reason.
   */
  const save = async (action: () => Promise<unknown>, isEdit = false) => {
    setError(null);
    try {
      await action();
      reload();
      return true;
    } catch (failure) {
      if (failure instanceof ContentApiError && failure.status === 409) {
        setError(isEdit ? t.conflict : failure.message);
        reload();
      } else {
        setError(failure instanceof Error ? failure.message : t.loadError);
      }
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Panel title={t.objectives.heading} intro={t.objectives.intro}>
        {topics.map((topic) => {
          const items = objectives
            .filter((objective) => objective.topicId === topic.id)
            .sort((a, b) => a.position - b.position);
          if (items.length === 0) return null;
          return (
            <div key={topic.id} className="mb-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--athena-muted)]">
                {topic.title}
              </h3>
              <ul className="space-y-2">
                {items.map((objective) => (
                  <ObjectiveItem
                    key={objective.id}
                    objective={objective}
                    topics={topics}
                    materials={materials}
                    onSave={(body) =>
                      save(
                        () =>
                          client.upsertObjective(classId, objective.id, {
                            ...body,
                            expectedUpdatedAt: objective.updatedAt,
                          }),
                        true,
                      )
                    }
                    onDelete={() =>
                      window.confirm(fill(t.confirmDelete, { name: objective.code })) &&
                      save(() => client.deleteObjective(classId, objective.id))
                    }
                  />
                ))}
              </ul>
            </div>
          );
        })}
        {objectives.length === 0 ? (
          <p className="text-sm text-[var(--athena-muted)]">{t.objectives.empty}</p>
        ) : null}
        <AddToggle label={t.objectives.add}>
          {(close) => (
            <ObjectiveForm
              topics={topics}
              materials={materials}
              position={objectives.length}
              onCancel={close}
              onSave={async (body) => {
                if (await save(() => client.upsertObjective(classId, crypto.randomUUID(), body)))
                  close();
              }}
            />
          )}
        </AddToggle>
      </Panel>

      <Panel title={t.milestones.heading}>
        {milestones.length === 0 ? (
          <p className="text-sm text-[var(--athena-muted)]">{t.milestones.empty}</p>
        ) : null}
        <ul className="space-y-2">
          {[...milestones]
            .sort((a, b) => a.position - b.position)
            .map((milestone) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                objectives={objectives}
                onDelete={() =>
                  window.confirm(fill(t.confirmDelete, { name: milestone.title[locale] })) &&
                  save(() => client.deleteMilestone(classId, milestone.id))
                }
              />
            ))}
        </ul>
        <AddToggle label={t.milestones.add}>
          {(close) => (
            <MilestoneForm
              objectives={objectives}
              onCancel={close}
              onSave={async (body) => {
                const saved = await save(() =>
                  client.upsertMilestone(classId, crypto.randomUUID(), {
                    ...body,
                    position: milestones.length,
                  }),
                );
                if (saved) close();
              }}
            />
          )}
        </AddToggle>
      </Panel>
    </div>
  );
}

function AddToggle({
  label,
  children,
}: {
  label: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return open ? (
    <div className="mt-4 rounded-[var(--athena-radius-small)] border border-[var(--athena-hairline)] p-4">
      {children(() => setOpen(false))}
    </div>
  ) : (
    <Button className="mt-4" onClick={() => setOpen(true)}>
      + {label}
    </Button>
  );
}

type ObjectiveBody = Omit<ContentObjective, "id" | "classId" | "updatedAt">;

function ObjectiveItem({
  objective,
  topics,
  materials,
  onSave,
  onDelete,
}: {
  objective: ContentObjective;
  topics: ContentTopic[];
  materials: ContentMaterial[];
  onSave: (body: ObjectiveBody) => Promise<boolean>;
  onDelete: () => void;
}) {
  const { t, locale } = useContentView();
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <li className="rounded-[var(--athena-radius-small)] border border-[var(--athena-hairline)] p-4">
        <ObjectiveForm
          initial={objective}
          topics={topics}
          materials={materials}
          position={objective.position}
          onCancel={() => setEditing(false)}
          onSave={async (body) => {
            if (await onSave(body)) setEditing(false);
          }}
        />
      </li>
    );
  }
  return (
    <li className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <p>
        <span className="mr-2 font-[family-name:var(--athena-font-mono)] text-sm">
          {objective.code}
        </span>
        {objective.statement[locale]}
      </p>
      <div className="flex shrink-0 gap-2">
        <Button onClick={() => setEditing(true)}>{t.edit}</Button>
        <Button variant="danger" onClick={onDelete}>
          {t.delete}
        </Button>
      </div>
    </li>
  );
}

function ObjectiveForm({
  initial,
  topics,
  materials,
  position,
  onSave,
  onCancel,
}: {
  initial?: ContentObjective;
  topics: ContentTopic[];
  materials: ContentMaterial[];
  position: number;
  onSave: (body: ObjectiveBody) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useContentView();
  const id = useId();
  const [topicId, setTopicId] = useState(initial?.topicId ?? topics[0]?.id ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [es, setEs] = useState(initial?.statement.es ?? "");
  const [en, setEn] = useState(initial?.statement.en ?? "");
  const [materialId, setMaterialId] = useState(initial?.materialId ?? "");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    await onSave({
      topicId,
      code: code.trim(),
      statement: { es: es.trim(), en: en.trim() },
      position,
      ...(materialId && { materialId }),
      ...(initial?.conceptId && { conceptId: initial.conceptId }),
    });
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <Field label={t.objectives.topic} htmlFor={`${id}-topic`}>
        <select
          id={`${id}-topic`}
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          className={inputClass}
          required
        >
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.objectives.code} htmlFor={`${id}-code`}>
        <input
          id={`${id}-code`}
          value={code}
          maxLength={32}
          onChange={(e) => setCode(e.target.value)}
          className={inputClass}
          required
        />
      </Field>
      <Field label={t.objectives.statementEs} htmlFor={`${id}-es`}>
        <textarea
          id={`${id}-es`}
          lang="es"
          value={es}
          maxLength={1000}
          onChange={(e) => setEs(e.target.value)}
          className={inputClass}
          rows={2}
          required
        />
      </Field>
      <Field label={t.objectives.statementEn} htmlFor={`${id}-en`}>
        <textarea
          id={`${id}-en`}
          lang="en"
          value={en}
          maxLength={1000}
          onChange={(e) => setEn(e.target.value)}
          className={inputClass}
          rows={2}
          required
        />
      </Field>
      <Field label={t.objectives.material} htmlFor={`${id}-material`}>
        <select
          id={`${id}-material`}
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
          className={inputClass}
        >
          <option value="">{t.objectives.none}</option>
          {materials.map((material) => (
            <option key={material.id} value={material.id}>
              {material.title}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex items-end gap-2">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? t.saving : t.save}
        </Button>
        <Button onClick={onCancel}>{t.cancel}</Button>
      </div>
    </form>
  );
}

function MilestoneItem({
  milestone,
  objectives,
  onDelete,
}: {
  milestone: ContentMilestone;
  objectives: ContentObjective[];
  onDelete: () => void;
}) {
  const { t, locale } = useContentView();
  const codes = milestone.objectiveIds
    .map((id) => objectives.find((objective) => objective.id === id)?.code)
    .filter(Boolean)
    .join(", ");
  return (
    <li className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="font-medium">{milestone.title[locale]}</p>
        <p className="text-sm text-[var(--athena-muted)]">
          {milestone.dueAt
            ? fill(t.milestones.dueOn, {
                date: new Date(milestone.dueAt).toLocaleDateString(locale, { timeZone: "UTC" }),
              })
            : null}
          {milestone.dueAt && codes ? " · " : null}
          {codes}
        </p>
      </div>
      <Button variant="danger" onClick={onDelete}>
        {t.delete}
      </Button>
    </li>
  );
}

function MilestoneForm({
  objectives,
  onSave,
  onCancel,
}: {
  objectives: ContentObjective[];
  onSave: (body: {
    title: { es: string; en: string };
    dueAt?: string;
    objectiveIds: string[];
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const { t, locale } = useContentView();
  const id = useId();
  const [es, setEs] = useState("");
  const [en, setEn] = useState("");
  const [due, setDue] = useState("");
  const [objectiveIds, setObjectiveIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    await onSave({
      title: { es: es.trim(), en: en.trim() },
      ...(due && { dueAt: new Date(`${due}T00:00:00.000Z`).toISOString() }),
      objectiveIds,
    });
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <Field label={t.milestones.titleEs} htmlFor={`${id}-es`}>
        <input
          id={`${id}-es`}
          lang="es"
          value={es}
          onChange={(e) => setEs(e.target.value)}
          className={inputClass}
          required
        />
      </Field>
      <Field label={t.milestones.titleEn} htmlFor={`${id}-en`}>
        <input
          id={`${id}-en`}
          lang="en"
          value={en}
          onChange={(e) => setEn(e.target.value)}
          className={inputClass}
          required
        />
      </Field>
      <Field label={t.milestones.due} htmlFor={`${id}-due`}>
        <input
          id={`${id}-due`}
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className={inputClass}
        />
      </Field>
      <fieldset className="space-y-1">
        <legend className="text-sm font-medium">{t.milestones.objectives}</legend>
        {objectives.map((objective) => (
          <label
            key={objective.id}
            className="flex min-h-[var(--athena-target-min)] items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              className="size-4"
              checked={objectiveIds.includes(objective.id)}
              onChange={(event) =>
                setObjectiveIds((ids) =>
                  event.target.checked
                    ? [...ids, objective.id]
                    : ids.filter((value) => value !== objective.id),
                )
              }
            />
            <span className="font-[family-name:var(--athena-font-mono)]">{objective.code}</span>
            {objective.statement[locale]}
          </label>
        ))}
      </fieldset>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? t.saving : t.save}
        </Button>
        <Button onClick={onCancel}>{t.cancel}</Button>
      </div>
    </form>
  );
}
