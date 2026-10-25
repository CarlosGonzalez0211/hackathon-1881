"use client";
import styles from "./HousePage.module.css";

/**
 * Aprender tab. Slot owned by Learning (P2): `POST /api/learning/session` with these props,
 * checkpoints, hints. When mastery changes, P2 emits learning events to World; call
 * `onProgress` so the world refreshes. Contract: docs/contracts/P2-learning-world.md.
 */
export function HouseTutorPanel(props: {
  studentId: string;
  topicId: string;
  entryId: string;
  onProgress?: () => void;
}) {
  return (
    <div className={styles.compact} data-topic={props.topicId} data-entry={props.entryId}>
      <h2 className={styles.subheading}>Próximamente: tu tutor de Athena</h2>
      <p>
        Aquí aprenderás con explicaciones basadas en el material de tu profesora, pistas que no
        revelan la respuesta y puntos de control. Tu progreso crece solo con lo que demuestras.
      </p>
      <button className={styles.primary} disabled>
        Iniciar sesión de aprendizaje
      </button>
    </div>
  );
}
