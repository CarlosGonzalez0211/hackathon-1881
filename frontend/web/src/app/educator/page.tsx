"use client";

import { athenaDemoIds } from "@athena/shared";
import { RoleGate } from "@/features/auth";
import { ClassDashboard } from "@/features/analytics";

// Single demo class until the classes feature lists a professor's classes.
export default function EducatorPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <p className="text-sm text-[var(--athena-muted)]">Matemáticas I · Grupo A</p>
        <h1 className="font-[family-name:var(--athena-font-display)] text-3xl">
          Panel de la clase / Class dashboard
        </h1>
      </header>
      <RoleGate allow={["professor"]}>
        <ClassDashboard classId={athenaDemoIds.class} />
      </RoleGate>
    </main>
  );
}
