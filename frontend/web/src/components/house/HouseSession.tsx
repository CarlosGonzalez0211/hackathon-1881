"use client";
import { useEffect, useRef } from "react";
import type { HouseState } from "@athena/shared";
const statuses = {
  locked: "Bloqueado",
  available: "Disponible",
  in_progress: "En progreso",
  done: "Completado",
};
export function HouseSession({ house, onClose }: { house: HouseState; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    return () => node?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="house-dialog"
      onCancel={onClose}
      onClose={onClose}
      aria-labelledby="house-title"
    >
      <button className="icon-button dialog-close" onClick={onClose} aria-label="Cerrar tema">
        ×
      </button>
      <span className="eyebrow">Casa de aprendizaje · {statuses[house.status]}</span>
      <h2 id="house-title">{house.title}</h2>
      <p>
        {house.status === "locked"
          ? "Este tema está bloqueado en los datos de demostración. La validación académica todavía no está conectada."
          : "Sesión de aprendizaje pendiente"}
      </p>
      <p className="subtle">
        Este panel es el punto de integración del tutor y las actividades. Por ahora no genera
        respuestas, quizzes ni progreso.
      </p>
      <div className="progress-label">
        <span>Progreso simulado</span>
        <strong>{Math.round(house.progress * 100)}%</strong>
      </div>
      <progress value={house.progress} max={1} aria-label="Progreso simulado del tema" />
      <button className="primary-button" onClick={onClose}>
        Volver al mundo
      </button>
    </dialog>
  );
}
