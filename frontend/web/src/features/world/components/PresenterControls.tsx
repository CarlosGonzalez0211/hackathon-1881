"use client";
import "../world.css";
import { useEffect, useState } from "react";
import { useWorld } from "../WorldProvider";

/**
 * Hidden presenter panel (`/world?presenter=1`, never in production). Plays Learning's role
 * through the same event sink P2 will call, so the world reacts exactly as it will live.
 */
export function PresenterControls() {
  const { client, studentId, refresh, notify } = useWorld();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEnabled(
      process.env.NODE_ENV !== "production" &&
        new URLSearchParams(window.location.search).get("presenter") === "1",
    );
  }, []);
  if (!enabled) return null;

  const run = async (action: () => Promise<unknown>, message: (value: unknown) => string) => {
    setBusy(true);
    try {
      notify(message(await action()));
      await refresh();
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="presenter-controls" aria-label="Controles de presentación">
      <strong>Presentación</strong>
      <button
        disabled={busy}
        onClick={() =>
          run(
            () => client.demoStep(studentId),
            (value) => {
              const step = (value as { step: string | null }).step;
              return step ? `Paso de demo: ${step}` : "La demo ya terminó";
            },
          )
        }
      >
        Siguiente paso
      </button>
      <button
        disabled={busy}
        onClick={() =>
          run(
            () => client.demoReset(),
            () => "Demo reiniciada",
          )
        }
      >
        Reiniciar
      </button>
    </aside>
  );
}
