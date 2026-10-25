"use client";
import { useEffect, useRef } from "react";
import { WorldSketchIcon } from "./WorldSketchIcon";

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
      className="npc-dialogue toon-paper"
      aria-labelledby="npc-speaker"
      onClose={onClose}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key.toLowerCase() === "e") {
          event.preventDefault();
          ref.current?.close();
        }
      }}
    >
      <div className="npc-dialogue-seal">
        <WorldSketchIcon kind="book" />
      </div>
      <div className="npc-dialogue-content">
        <span className="npc-dialogue-kicker">Una charla en el camino</span>
        <h2 id="npc-speaker">{conversation.name}</h2>
        <p>{conversation.text}</p>
        <button className="toon-action" onClick={() => ref.current?.close()}>
          Seguir explorando <kbd>E</kbd>
        </button>
      </div>
      <button
        className="toon-close"
        aria-label="Cerrar conversación"
        onClick={() => ref.current?.close()}
      >
        ×
      </button>
    </dialog>
  );
}
