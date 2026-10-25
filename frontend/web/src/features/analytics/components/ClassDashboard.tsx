"use client";

import { useEffect, useState } from "react";
import type {
  ClassAnalytics,
  Intervention,
  InterventionStatus,
  StudentAnalytics,
  TopicAnalytics,
} from "@athena/shared";
import { getAnalyticsClient } from "../api/analytics-client";

const percent = (value: number) => `${Math.round(value * 100)}%`;

const SEVERITY: Record<Intervention["severity"], { es: string; en: string; rank: number }> = {
  high: { es: "Alta", en: "High", rank: 0 },
  medium: { es: "Media", en: "Medium", rank: 1 },
  low: { es: "Baja", en: "Low", rank: 2 },
};
const STATUS: Record<Intervention["status"], string> = {
  open: "Abierta / Open",
  acknowledged: "Vista / Seen",
  resolved: "Resuelta / Resolved",
};
const AI_LABELS = {
  chat: "Chat",
  podcast: "Podcast",
  video: "Video",
  summary: "Resumen / Summary",
  hint: "Pistas / Hints",
  quiz_answer: "Respuestas / Answers",
} as const;

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      aria-label={title}
      className="rounded-[var(--athena-radius-panel)] border border-[var(--athena-border)] bg-[var(--athena-surface)] p-5"
    >
      <h2 className="mb-4 font-[family-name:var(--athena-font-display)] text-xl">{title}</h2>
      {children}
    </section>
  );
}

/** Bar with a text value, so meaning never depends on colour alone. */
function MasteryBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--athena-hairline)]"
      >
        <div
          className="h-full rounded-full bg-[var(--athena-accent)]"
          style={{ width: percent(value) }}
        />
      </div>
      <span className="w-10 text-right font-[family-name:var(--athena-font-mono)] text-sm">
        {percent(value)}
      </span>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[var(--athena-radius-panel)] border border-[var(--athena-border)] bg-[var(--athena-surface)] p-4">
      <p className="text-sm text-[var(--athena-muted)]">{label}</p>
      <p className="font-[family-name:var(--athena-font-display)] text-3xl">{value}</p>
      {hint ? <p className="text-sm text-[var(--athena-muted)]">{hint}</p> : null}
    </div>
  );
}

function TopicList({ topics }: { topics: TopicAnalytics[] }) {
  const sorted = [...topics].sort((a, b) => a.averageMastery - b.averageMastery);
  return (
    <ul className="space-y-5">
      {sorted.map((topic) => (
        <li key={topic.topicId}>
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-semibold">{topic.title}</h3>
            <p className="text-sm text-[var(--athena-muted)]">
              {topic.masteredStudents} dominan · {topic.strugglingStudents} con dificultad
            </p>
          </div>
          <MasteryBar value={topic.averageMastery} label={`Dominio promedio, ${topic.title}`} />
          {topic.commonMisconceptions.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {topic.commonMisconceptions.map((item) => (
                <li
                  key={item.code}
                  className="rounded-[var(--athena-radius-pill)] border border-[var(--athena-border)] px-3 py-1 text-sm"
                >
                  {item.label} ({item.studentCount})
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

const actionButton =
  "min-h-[var(--athena-target-min)] rounded-[var(--athena-radius-small)] border border-[var(--athena-border)] px-3 text-sm disabled:opacity-50";

function InterventionList({
  interventions,
  students,
  topics,
  onStatus,
  busyId,
}: {
  interventions: Intervention[];
  students: StudentAnalytics[];
  topics: TopicAnalytics[];
  onStatus?: (id: string, status: InterventionStatus) => void;
  busyId?: string | null;
}) {
  const nameOf = (id: string) => students.find((s) => s.studentId === id)?.displayName ?? id;
  const topicOf = (id: string) => topics.find((t) => t.topicId === id)?.title ?? id;
  const active = interventions
    .filter((item) => item.status !== "resolved")
    .sort((a, b) => SEVERITY[a.severity].rank - SEVERITY[b.severity].rank);
  if (active.length === 0) {
    return <p>Sin intervenciones pendientes. / No pending interventions.</p>;
  }
  return (
    <ul className="space-y-4">
      {active.map((item) => (
        <li key={item.id} className="border-l-4 border-[var(--athena-accent)] pl-4">
          <p className="flex flex-wrap items-center gap-2">
            <strong>{nameOf(item.studentId)}</strong>
            <span className="text-[var(--athena-muted)]">· {topicOf(item.topicId)}</span>
            <span className="rounded-[var(--athena-radius-pill)] bg-[var(--athena-accent)] px-2 py-0.5 text-xs text-[var(--athena-accent-ink)]">
              {SEVERITY[item.severity].es} / {SEVERITY[item.severity].en}
            </span>
            <span className="text-xs text-[var(--athena-muted)]">{STATUS[item.status]}</span>
          </p>
          <p className="mt-1 text-sm">{item.reason}</p>
          <p className="mt-1 text-sm">
            <span className="font-semibold">Siguiente paso:</span> {item.recommendedAction}
          </p>
          {onStatus ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.status === "open" ? (
                <button
                  type="button"
                  className={actionButton}
                  disabled={busyId === item.id}
                  onClick={() => onStatus(item.id, "acknowledged")}
                >
                  Marcar como vista / Acknowledge
                </button>
              ) : null}
              <button
                type="button"
                className={actionButton}
                disabled={busyId === item.id}
                onClick={() => onStatus(item.id, "resolved")}
              >
                Resolver / Resolve
              </button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function StudentTable({ students }: { students: StudentAnalytics[] }) {
  const sorted = [...students].sort((a, b) => a.averageMastery - b.averageMastery);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] text-left text-sm">
        <caption className="sr-only">
          Estudiantes ordenados por dominio / Students by mastery
        </caption>
        <thead>
          <tr className="border-b border-[var(--athena-border)]">
            <th scope="col" className="py-2 pr-4 font-semibold">
              Estudiante
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold">
              Dominio
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold">
              Crecimiento
            </th>
            <th scope="col" className="py-2 pr-4 font-semibold">
              Alertas
            </th>
            <th scope="col" className="py-2 font-semibold">
              Uso de IA
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((student) => {
            const uses = Object.values(student.aiUsage).reduce((a, b) => a + b, 0);
            return (
              <tr key={student.studentId} className="border-b border-[var(--athena-hairline)]">
                <th scope="row" className="py-2 pr-4 font-normal">
                  {student.displayName}
                </th>
                <td className="py-2 pr-4 font-[family-name:var(--athena-font-mono)]">
                  {percent(student.averageMastery)}
                </td>
                <td className="py-2 pr-4 font-[family-name:var(--athena-font-mono)]">
                  +{percent(student.growth)}
                </td>
                <td className="py-2 pr-4">{student.openInterventions || "—"}</td>
                <td className="py-2 font-[family-name:var(--athena-font-mono)]">{uses}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ClassDashboardView({
  analytics,
  onInterventionStatus,
  busyId,
  notice,
}: {
  analytics: ClassAnalytics;
  /** When given, interventions show acknowledge/resolve buttons. */
  onInterventionStatus?: (id: string, status: InterventionStatus) => void;
  busyId?: string | null;
  notice?: string | null;
}) {
  const { students, topics, interventions, aiUsage } = analytics;
  const avg = students.length
    ? students.reduce((sum, s) => sum + s.averageMastery, 0) / students.length
    : 0;
  const growth = students.length
    ? students.reduce((sum, s) => sum + s.growth, 0) / students.length
    : 0;
  const open = interventions.filter((item) => item.status !== "resolved").length;
  const totalAi = Object.values(aiUsage).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Dominio promedio"
          value={percent(avg)}
          hint={`${students.length} estudiantes`}
        />
        <Stat label="Crecimiento promedio" value={`+${percent(growth)}`} />
        <Stat label="Intervenciones abiertas" value={String(open)} />
        <Stat
          label="Usos de IA"
          value={String(totalAi)}
          hint="Se muestra junto al dominio, no lo cambia"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Temas / Topics">
          <TopicList topics={topics} />
        </Panel>
        <Panel title="Intervenciones sugeridas / Suggested interventions">
          {notice ? (
            <p role="alert" className="mb-3 text-sm">
              {notice}
            </p>
          ) : null}
          <InterventionList
            interventions={interventions}
            students={students}
            topics={topics}
            onStatus={onInterventionStatus}
            busyId={busyId}
          />
        </Panel>
      </div>

      <Panel title="Estudiantes / Students">
        <StudentTable students={students} />
      </Panel>

      <Panel title="Uso de IA / AI usage">
        <p className="mb-3 text-sm text-[var(--athena-muted)]">
          Evidencia descriptiva. No cambia el dominio ni el crecimiento. / Descriptive only; it
          never changes mastery.
        </p>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(Object.keys(AI_LABELS) as (keyof typeof AI_LABELS)[]).map((key) => (
            <div key={key}>
              <dt className="text-sm text-[var(--athena-muted)]">{AI_LABELS[key]}</dt>
              <dd className="font-[family-name:var(--athena-font-mono)] text-lg">{aiUsage[key]}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  );
}

/** Loads class analytics through the feature client (mock or API) and renders the dashboard. */
export function ClassDashboard({ classId }: { classId: string }) {
  const [state, setState] = useState<
    { status: "loading" } | { status: "error" } | { status: "ready"; data: ClassAnalytics }
  >({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function updateStatus(id: string, status: InterventionStatus) {
    setBusyId(id);
    setNotice(null);
    try {
      await getAnalyticsClient().updateInterventionStatus(classId, id, status);
      setState((current) => {
        if (current.status !== "ready") return current;
        const interventions = current.data.interventions.map((item) =>
          item.id === id ? { ...item, status } : item,
        );
        const students = current.data.students.map((student) => ({
          ...student,
          openInterventions: interventions.filter(
            (item) => item.studentId === student.studentId && item.status !== "resolved",
          ).length,
        }));
        return { status: "ready", data: { ...current.data, interventions, students } };
      });
    } catch {
      setNotice("No se pudo guardar el cambio. / Could not save the change.");
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    getAnalyticsClient()
      .getClassAnalytics(classId)
      .then((data) => !cancelled && setState({ status: "ready", data }))
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [classId, attempt]);

  if (state.status === "loading") {
    return <p role="status">Cargando análisis… / Loading analytics…</p>;
  }
  if (state.status === "error") {
    return (
      <div role="alert">
        <p>No se pudo cargar el análisis de la clase. / Could not load class analytics.</p>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="mt-2 min-h-[var(--athena-target-min)] rounded-[var(--athena-radius-small)] border border-[var(--athena-border)] px-4"
        >
          Reintentar / Retry
        </button>
      </div>
    );
  }
  return (
    <ClassDashboardView
      analytics={state.data}
      onInterventionStatus={updateStatus}
      busyId={busyId}
      notice={notice}
    />
  );
}
