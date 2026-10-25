"use client";
import { useEffect, useRef } from "react";

/**
 * World keyboard path (brand guide 08): L opens the topic list, O toggles orbit, Esc
 * closes. Tab/Enter on house markers and E near a house are handled by the markers and
 * the engine. Ignored while typing in a field.
 */
export function useWorldShortcuts(handlers: {
  onList: () => void;
  onOrbit: () => void;
  onEscape?: () => void;
}) {
  const latest = useRef(handlers);
  latest.current = handlers;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (target?.closest("input, textarea, select, [contenteditable='true'], dialog")) return;
      if (event.key === "l" || event.key === "L") latest.current.onList();
      else if (event.key === "o" || event.key === "O") latest.current.onOrbit();
      else if (event.key === "Escape") latest.current.onEscape?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
