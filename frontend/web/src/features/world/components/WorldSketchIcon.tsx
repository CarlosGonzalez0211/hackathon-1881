import type { ReactNode } from "react";

export function WorldSketchIcon({
  kind,
  muted = false,
}: {
  kind: "book" | "globe" | "walk" | "sound" | "progress";
  muted?: boolean;
}) {
  let drawing: ReactNode;
  if (kind === "book")
    drawing = (
      <>
        <path fill="#b6c5bd" d="M8 18 27 15 32 19 38 15 56 18 57 51 36 53 31 56 26 53 7 51Z" />
        <path fill="#fff8df" d="M10 14Q23 10 32 17Q43 10 55 14L54 47Q42 44 32 51Q23 44 10 47Z" />
        <path d="M32 18v32M15 20l11 2m-11 4 11 2m-11 4 11 2m-11 4 11 2m11-18 12-3m-12 9 12-3m-12 9 12-3m-12 9 12-3" />
        <path fill="#83af8e" d="M41 10V5h6v7" />
        <path fill="#dca587" d="m53 22 6-1v6l-5 1" />
      </>
    );
  else if (kind === "globe")
    drawing = (
      <>
        <ellipse
          cx="32"
          cy="32"
          rx="29"
          ry="12"
          transform="rotate(-42 32 32)"
          strokeDasharray="3 4"
        />
        <path fill="#91b7cb" d="M52 31c1 11-8 21-19 21S12 44 12 32s8-21 20-21 20 9 20 20Z" />
        <path
          fill="#9ab979"
          d="m21 15 6 4 1 6-6 3 2 7-6 4-5-6 1-10Zm17-3-2 6 7 3 5-1m-8 7-8 4-2 7 5 4 1 8 9-6 1-9-5-2Z"
        />
        <path d="m16 43 7 4m18-31 4 3" opacity=".4" />
      </>
    );
  else if (kind === "progress")
    drawing = (
      <>
        <circle cx="32" cy="32" r="26" strokeDasharray="3 4" opacity=".45" />
        <path stroke="#e3b354" strokeWidth="4" d="M32 6a26 26 0 0 1 24 35" />
        <circle cx="32" cy="32" r="17" opacity=".35" />
        <path stroke="#8b7fe0" strokeWidth="4" d="M32 15a17 17 0 1 1-15 9" />
        <circle cx="32" cy="32" r="8" fill="#83af8e" />
        <circle cx="56" cy="41" r="3" fill="#fff8df" />
      </>
    );
  else if (kind === "walk")
    drawing = (
      <>
        <path
          fill="#d9c59a"
          d="M10 57c7-15 33-15 31-24-1-5-15-3-13-9 1-4 12-7 20-7-7 4-11 6-9 9 3 4 15 4 13 11-3 11-29 11-34 22Z"
          stroke="none"
        />
        <path d="M10 57c7-15 33-15 31-24-1-5-15-3-13-9 1-4 12-7 20-7M19 58c5-13 30-12 33-21 2-7-10-7-13-11" />
        <circle cx="42" cy="7" r="3" fill="#e5c3a1" />
        <path d="m41 11-4 7 7 4m-4-9 6 3 4-2m-13 4-2 6m8-2 3 5m-13 21-3 4m-6 1-3 4" />
      </>
    );
  else
    drawing = (
      <>
        <path fill="#9faaa6" d="M11 25h9l16-12v39L20 40h-9Z" />
        <path d="M20 25v15M41 23q9 9 0 18" />
        {muted ? (
          <path stroke="#a46f57" d="m45 22 12 20m0-20L45 42" />
        ) : (
          <path d="M47 16q17 16 0 32M53 10q22 22 0 44" />
        )}
      </>
    );
  return (
    <svg
      className="world-sketch-icon"
      viewBox="0 0 64 64"
      fill="none"
      stroke="#514b3e"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {drawing}
    </svg>
  );
}
