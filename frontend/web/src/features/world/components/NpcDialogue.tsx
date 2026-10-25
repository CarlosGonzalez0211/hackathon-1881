"use client";
import { t } from "@/lib/i18n";

import { useEffect, useRef } from "react";
import { WorldSketchIcon } from "./WorldSketchIcon";
import { usePaperDialog } from "@/components/ui/usePaperDialog";

export interface NpcConversation {
  name: string;
  text: string;
}

/** Native modal provides focus containment, Escape and focus restoration. */
export function NpcDialogue({
  conversation,
  onClose,
}: {
  conversation: NpcConversation;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { dismiss, dialogProps } = usePaperDialog(ref);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      role="dialog"
      ref={ref}
      {...dialogProps}
      className="npc-dialogue toon-paper"
      aria-labelledby="npc-speaker"
      // A remount (React StrictMode in development) closes and reopens the modal; its queued
      // `close` event then arrives while the dialog is open again and must not dismiss it.
      onClose={() => {
        if (!ref.current?.open) onClose();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key.toLowerCase() === "e") {
          event.preventDefault();
          dismiss();
        }
      }}
    >
      <div className="npc-dialogue-seal">
        <WorldSketchIcon kind="book" />
      </div>
      <div className="npc-dialogue-content">
        <span className="npc-dialogue-kicker">{t("A chat along the way")}</span>
        <h2 id="npc-speaker">{conversation.name}</h2>
        <p>{conversation.text}</p>
        <button className="toon-action" onClick={() => dismiss()}>
          {t("Keep exploring")}
          <kbd>E</kbd>
        </button>
      </div>
      <button className="toon-close" aria-label={t("Close conversation")} onClick={() => dismiss()}>
        ×
      </button>
    </dialog>
  );
}
