"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { contentDisplayStatus, type ContentMaterialStatus } from "@athena/shared";
import { useContentView } from "./ContentA11yRoot";

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--athena-focus)]";

export const inputClass = `min-h-[var(--athena-target-min)] w-full rounded-[var(--athena-radius-small)] border border-[var(--athena-border)] bg-[var(--athena-surface)] px-3 py-2 ${focusRing}`;

const variants = {
  primary: "bg-[var(--athena-accent)] text-[var(--athena-accent-ink)] border-transparent",
  secondary: "bg-[var(--athena-surface)] border-[var(--athena-border)]",
  danger: "bg-[var(--athena-surface)] border-[#9b2c2c] text-[#9b2c2c]",
};

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      type="button"
      {...props}
      className={`min-h-[var(--athena-target-min)] rounded-[var(--athena-radius-small)] border px-4 text-sm font-medium disabled:opacity-60 ${variants[variant]} ${focusRing} ${className}`}
    />
  );
}

export function Panel({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="rounded-[var(--athena-radius-panel)] border border-[var(--athena-border)] bg-[var(--athena-surface)] p-5"
    >
      <h2 className="font-[family-name:var(--athena-font-display)] text-xl">{title}</h2>
      {intro ? <p className="mt-1 text-sm text-[var(--athena-muted)]">{intro}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Polite status or assertive error line. */
export function Notice({
  tone = "status",
  children,
}: {
  tone?: "status" | "error";
  children: ReactNode;
}) {
  return tone === "error" ? (
    <p
      role="alert"
      className="rounded-[var(--athena-radius-small)] border border-[#9b2c2c] bg-[#fff5f5] px-3 py-2 text-sm text-[#7a1f1f]"
    >
      {children}
    </p>
  ) : (
    <p role="status" aria-live="polite" className="text-sm text-[var(--athena-muted)]">
      {children}
    </p>
  );
}

const chipTone = {
  uploaded: "border-[var(--athena-border)] text-[var(--athena-ink)]",
  processing: "border-[var(--athena-in-progress)] text-[var(--athena-in-progress)]",
  ready: "border-[var(--athena-done)] text-[var(--athena-done)]",
  failed: "border-[#9b2c2c] text-[#9b2c2c]",
};
const chipMark = { uploaded: "○", processing: "◔", ready: "✓", failed: "✕" };

/** Status as text plus a symbol, never colour alone. */
export function StatusChip({ status }: { status: ContentMaterialStatus }) {
  const { t } = useContentView();
  const shown = contentDisplayStatus(status);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[var(--athena-radius-pill)] border px-2.5 py-0.5 text-xs font-semibold ${chipTone[shown]}`}
    >
      <span aria-hidden="true">{chipMark[shown]}</span>
      {t.status[shown]}
    </span>
  );
}

export function LoadState({
  status,
  onRetry,
}: {
  status: "loading" | "error";
  onRetry: () => void;
}) {
  const { t } = useContentView();
  if (status === "loading") return <Notice>{t.loading}</Notice>;
  return (
    <div role="alert" className="space-y-2">
      <p>{t.loadError}</p>
      <Button onClick={onRetry}>{t.retry}</Button>
    </div>
  );
}
