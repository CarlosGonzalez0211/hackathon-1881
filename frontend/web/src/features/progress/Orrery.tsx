"use client";

import { useEffect, useState, type CSSProperties } from "react";
import styles from "./progress.module.css";

export interface OrreryRing {
  id: string;
  hue: string;
  /** 0..1 */
  progress: number;
  locked?: boolean;
}

const SIZE = 420;
const CENTER = SIZE / 2;
const FIRST_ORBIT = 86;
const OUTER_ORBIT = 191;

/** Deterministic star field so server and client render the same sky. */
const STARS = Array.from({ length: 70 }, (_, index) => {
  const x = (index * 97.3) % SIZE;
  const y = (index * 53.7 + (index % 7) * 31) % SIZE;
  const r = index % 9 === 0 ? 1.6 : index % 3 === 0 ? 1.1 : 0.7;
  return { x, y, r, o: 0.25 + ((index * 37) % 60) / 100 };
});

/** A planet in a night sky with one progress orbit per ring; arcs sweep in once. */
export function Orrery({
  rings,
  active,
  centerValue,
  centerLabel,
  label,
}: {
  rings: OrreryRing[];
  active: string | null;
  centerValue: string;
  centerLabel: string;
  label: string;
}) {
  // Arcs start empty and sweep to their value once, after the first paint.
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const gap = rings.length > 1 ? Math.min(21, (OUTER_ORBIT - FIRST_ORBIT) / (rings.length - 1)) : 0;
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.orrery} role="img" aria-label={label}>
      <defs>
        <radialGradient id="planet-fill" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#bfe3c9" />
          <stop offset="55%" stopColor="#5fa88d" />
          <stop offset="100%" stopColor="#2c5b5c" />
        </radialGradient>
        <radialGradient id="planet-glow" r="50%">
          <stop offset="60%" stopColor="#7fd1b9" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7fd1b9" stopOpacity="0" />
        </radialGradient>
      </defs>
      {STARS.map((star, index) => (
        <circle key={index} cx={star.x} cy={star.y} r={star.r} fill="#fff" opacity={star.o} />
      ))}
      {rings.map((ring, index) => (
        <Orbit
          key={ring.id}
          ring={ring}
          radius={FIRST_ORBIT + index * gap}
          order={index}
          drawn={drawn}
          dimmed={active !== null && active !== ring.id}
          highlighted={active === ring.id}
        />
      ))}
      <circle cx={CENTER} cy={CENTER} r={70} fill="url(#planet-glow)" />
      <circle cx={CENTER} cy={CENTER} r={52} fill="url(#planet-fill)" />
      <path
        d={`M${CENTER - 34} ${CENTER - 18}q12-10 24-3t20-6q10 6 4 16t-18 4q-12 8-22 2t-8-13Zm30 34q10-6 22-1t4 10q-8 7-18 3t-8-12Z`}
        fill="#9fcf87"
        opacity="0.85"
      />
      <text x={CENTER} y={CENTER + 6} className={styles.planetValue} textAnchor="middle">
        {centerValue}
      </text>
      <text x={CENTER} y={CENTER + 24} className={styles.planetLabel} textAnchor="middle">
        {centerLabel}
      </text>
    </svg>
  );
}

function Orbit({
  ring,
  radius,
  order,
  drawn,
  dimmed,
  highlighted,
}: {
  ring: OrreryRing;
  radius: number;
  order: number;
  drawn: boolean;
  dimmed: boolean;
  highlighted: boolean;
}) {
  const circumference = 2 * Math.PI * radius;
  const shown = drawn ? ring.progress : 0;
  // The moon rides the tip of the arc, starting at twelve o'clock.
  const angle = shown * 2 * Math.PI - Math.PI / 2;
  return (
    <g
      className={styles.orbit}
      data-dimmed={dimmed || undefined}
      data-highlighted={highlighted || undefined}
      style={{ "--hue": ring.hue, "--order": order } as CSSProperties}
    >
      <circle
        cx={CENTER}
        cy={CENTER}
        r={radius}
        className={ring.locked ? styles.trackLocked : styles.track}
      />
      {ring.progress > 0 ? (
        <>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={radius}
            className={styles.arc}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - shown)}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
          <circle
            cx={CENTER + radius * Math.cos(angle)}
            cy={CENTER + radius * Math.sin(angle)}
            r={highlighted ? 7 : 5}
            className={styles.moon}
          />
        </>
      ) : null}
    </g>
  );
}

export const percent = (value: number) => `${Math.round(value * 100)}%`;
