"use client";
import { useCallback, useEffect } from "react";
import { useWorld, type WorldToast } from "../WorldProvider";
import styles from "./WorldToasts.module.css";

const symbols: Record<WorldToast["tone"], string> = {
  unlock: "⌂",
  done: "✓",
  achievement: "✦",
  info: "ⓘ",
};

function Toast({ toast }: { toast: WorldToast }) {
  const { dismissToast } = useWorld();
  const onDismiss = useCallback(() => dismissToast(toast.id), [dismissToast, toast.id]);
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 6000);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);
  return (
    <li className={`${styles.toast} ${styles[toast.tone]}`}>
      <span aria-hidden="true">{symbols[toast.tone]}</span>
      <span>{toast.message}</span>
      <button onClick={onDismiss} aria-label="Cerrar aviso">
        ×
      </button>
    </li>
  );
}

/** 2D mirror of every world change (unlocks, completions, badges). Always shown. */
export function WorldToasts() {
  const { toasts } = useWorld();
  return (
    <ol className={styles.region} aria-live="polite" aria-label="Avisos del mundo">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </ol>
  );
}
