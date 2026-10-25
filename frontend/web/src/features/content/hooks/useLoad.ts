"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

export type Load<T> = { status: "loading" } | { status: "error" } | { status: "ready"; data: T };

/** Loads once per key, with reload and local updates for optimistic edits. */
export function useLoad<T>(loader: () => Promise<T>, key: string) {
  const [state, setState] = useState<Load<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((data) => !cancelled && setState({ status: "ready", data }))
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
    // The loader is recreated every render; the key says when to reload.
  }, [key, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const setData: Dispatch<SetStateAction<T>> = useCallback(
    (next) =>
      setState((current) =>
        current.status === "ready"
          ? {
              status: "ready",
              data: typeof next === "function" ? (next as (prev: T) => T)(current.data) : next,
            }
          : current,
      ),
    [],
  );
  return { state, reload, setData };
}
