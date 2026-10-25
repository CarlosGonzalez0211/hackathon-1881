"use client";
import { useEffect, useRef } from "react";
import type { ClassOrbitStudent } from "@athena/shared";
import { StateIcon, stateLabel } from "@/features/world/components/StateIcon";

/**
 * Invitation to visit a classmate's planet (brand kit: paper panel, accent action, learning
 * states as shape + text + colour). The native modal provides focus containment, Escape and
 * focus restoration.
 */
export function VisitPlanetDialog({
  student,
  onVisit,
  onClose,
}: {
  student: ClassOrbitStudent;
  onVisit: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);
  const built = student.planet.houses.filter((house) => house.status === "done").length;
  return (
    <dialog
      ref={ref}
      className="visit-dialog"
      aria-labelledby="visit-title"
      aria-describedby="visit-summary"
      // A StrictMode remount closes and reopens the modal; ignore that replayed close.
      onClose={() => {
        if (!ref.current?.open) onClose();
      }}
    >
      <span className="visit-dialog-eyebrow">Planeta de la clase</span>
      <h2 id="visit-title">{student.displayName}</h2>
      <p id="visit-summary" className="visit-dialog-summary">
        {built === 1 ? "1 casa construida" : `${built} casas construidas`} de{" "}
        {student.planet.houses.length} temas.
      </p>
      <ul className="visit-dialog-houses" aria-label="Casas del planeta">
        {student.planet.houses.map((house) => (
          <li key={house.topicId}>
            <StateIcon status={house.status} />
            <span>{house.title}</span>
            <small>{stateLabel(house.status)}</small>
          </li>
        ))}
      </ul>
      <div className="visit-dialog-actions">
        <button
          type="button"
          className="visit-dialog-primary"
          onClick={() => {
            onVisit();
            ref.current?.close();
          }}
        >
          Visitar planeta
        </button>
        <button
          type="button"
          className="visit-dialog-secondary"
          onClick={() => ref.current?.close()}
        >
          Ahora no
        </button>
      </div>
    </dialog>
  );
}
