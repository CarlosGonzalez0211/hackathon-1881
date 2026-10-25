"use client";
import { useEffect, useRef } from "react";
import type { ClassOrbitStudent } from "@athena/shared";
import { WorldSketchIcon } from "@/features/world/components/WorldSketchIcon";
import { usePaperDialog } from "@/components/ui/usePaperDialog";
import { t } from "@/lib/i18n";

/**
 * A compact illustrated invitation. Native focus containment and restoration are retained;
 * the shared paper-dialog hook adds motion, Escape and outside-click dismissal.
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
  const { dismiss, dialogProps } = usePaperDialog(ref);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      {...dialogProps}
      className="visit-dialog toon-paper"
      aria-labelledby="visit-title"
      aria-describedby="visit-summary"
      // A StrictMode remount closes and reopens the modal; ignore that replayed close.
      onClose={() => {
        if (!ref.current?.open) onClose();
      }}
    >
      <div className="visit-dialog-seal">
        <WorldSketchIcon kind="globe" />
      </div>
      <span className="visit-dialog-eyebrow">{t("Classmate’s planet")}</span>
      <h2 id="visit-title">{student.displayName}</h2>
      <p id="visit-summary" className="visit-dialog-summary">
        {t("Ready for a little exploring?")}
      </p>
      <div className="visit-dialog-actions">
        <button
          type="button"
          className="visit-dialog-primary"
          onClick={() => {
            dismiss(onVisit);
          }}
        >
          {t("Visit")} <span aria-hidden="true">↗</span>
        </button>
        <button type="button" className="visit-dialog-secondary" onClick={() => dismiss()}>
          {t("Cancel")}
        </button>
      </div>
    </dialog>
  );
}
