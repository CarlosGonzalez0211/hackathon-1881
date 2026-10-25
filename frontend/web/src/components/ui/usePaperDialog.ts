"use client";
import { useEffect, useRef, type RefObject, type PointerEvent } from "react";

/** Native focus management with animated dismissal and a true outside click. */
export function usePaperDialog(ref: RefObject<HTMLDialogElement | null>) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const outside = useRef(false);
  useEffect(() => () => clearTimeout(timer.current), []);
  const dismiss = (after?: () => void) => {
    const dialog = ref.current;
    if (!dialog || timer.current) return;
    dialog.dataset.closing = "true";
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180;
    timer.current = setTimeout(() => {
      timer.current = undefined;
      after?.();
      dialog.close();
    }, duration);
  };
  const isOutside = (event: PointerEvent<HTMLDialogElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    );
  };
  return {
    dismiss,
    dialogProps: {
      onCancel: (event: React.SyntheticEvent<HTMLDialogElement>) => {
        event.preventDefault();
        dismiss();
      },
      onPointerDown: (event: PointerEvent<HTMLDialogElement>) => {
        outside.current = isOutside(event);
      },
      onPointerUp: (event: PointerEvent<HTMLDialogElement>) => {
        if (outside.current && isOutside(event)) dismiss();
        outside.current = false;
      },
    },
  };
}
