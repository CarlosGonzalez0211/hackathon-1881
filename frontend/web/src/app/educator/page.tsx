"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Class } from "@athena/shared";
import { RoleGate } from "@/features/auth";
import { ClassDashboard } from "@/features/analytics";
import { getClassesClient } from "@/features/classes";

type Classes = { status: "loading" } | { status: "error" } | { status: "ready"; items: Class[] };

function ClassPicker() {
  const [classes, setClasses] = useState<Classes>({ status: "loading" });
  const [selected, setSelected] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setClasses({ status: "loading" });
    getClassesClient()
      .listClasses()
      .then((items) => {
        if (cancelled) return;
        setClasses({ status: "ready", items });
        setSelected((current) => current ?? items[0]?.id ?? null);
      })
      .catch(() => !cancelled && setClasses({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (classes.status === "loading") return <p role="status">Cargando clases… / Loading classes…</p>;
  if (classes.status === "error") {
    return (
      <div role="alert">
        <p>No se pudieron cargar tus clases. / Could not load your classes.</p>
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
  if (classes.items.length === 0) {
    return <p>Aún no tienes clases. / You have no classes yet.</p>;
  }

  const current = classes.items.find((item) => item.id === selected) ?? classes.items[0]!;
  return (
    <div className="space-y-6">
      {classes.items.length > 1 ? (
        <div>
          <label htmlFor="class-select" className="mb-1 block text-sm text-[var(--athena-muted)]">
            Clase / Class
          </label>
          <select
            id="class-select"
            value={current.id}
            onChange={(event) => setSelected(event.target.value)}
            className="min-h-[var(--athena-target-min)] rounded-[var(--athena-radius-small)] border border-[var(--athena-border)] bg-[var(--athena-surface)] px-3"
          >
            {classes.items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
                {item.term ? ` · ${item.term}` : ""}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="text-sm text-[var(--athena-muted)]">
          {current.title}
          {current.term ? ` · ${current.term}` : ""}
        </p>
      )}
      <Link
        href={`/educator/classes/${current.id}/content`}
        className="inline-flex min-h-[var(--athena-target-min)] items-center rounded-[var(--athena-radius-small)] border border-[var(--athena-border)] px-4 text-sm font-medium"
      >
        Material del curso y tutor / Course material and tutor
      </Link>
      <ClassDashboard key={current.id} classId={current.id} />
    </div>
  );
}

export default function EducatorPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="font-[family-name:var(--athena-font-display)] text-3xl">
        Panel de la clase / Class dashboard
      </h1>
      <RoleGate allow={["professor"]}>
        <ClassPicker />
      </RoleGate>
    </main>
  );
}
