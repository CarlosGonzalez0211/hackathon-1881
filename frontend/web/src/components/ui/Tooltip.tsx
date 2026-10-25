"use client";
import { cloneElement, useEffect, useId, useRef, useState, type ReactElement } from "react";

/** A paper hint shared by icon controls. Escape dismisses without moving focus. */
export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactElement<{ "aria-describedby"?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointerFocus = useRef(false);
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <span
      className="paper-tooltip-anchor"
      onPointerEnter={() => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setOpen(true), 300);
      }}
      onPointerLeave={() => {
        pointerFocus.current = false;
        hide();
      }}
      onFocus={() => {
        if (!pointerFocus.current) setOpen(true);
      }}
      onBlur={() => {
        pointerFocus.current = false;
        hide();
      }}
      onPointerDown={() => {
        pointerFocus.current = true;
        hide();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          hide();
        }
      }}
    >
      {cloneElement(children, { "aria-describedby": open ? id : undefined })}
      {open && (
        <span className="paper-tooltip" id={id} role="tooltip">
          {label}
        </span>
      )}
    </span>
  );
}
