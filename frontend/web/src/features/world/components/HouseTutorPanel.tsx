"use client";
import { t } from "@/lib/i18n";

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
      <h2 className={styles.subheading}>{t("Coming soon: your Athena tutor")}</h2>
      <p>
        {t(
          "Learn with explanations grounded in your teacher’s material, hints, and checkpoints. Progress grows as you show what you’ve learned.",
        )}
      </p>
      <button className={styles.primary} disabled>
        {t("Start learning session")}
      </button>
    </div>
  );
}
