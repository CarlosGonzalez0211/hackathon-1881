/** Developer-owned identity. No per-user skins, palettes, or age variants. */
export interface BrandKit {
  readonly name: string;
  readonly phase: "provisional" | "approved";
  readonly colors: Readonly<Record<string, string>>;
  readonly typography: {
    readonly display: string;
    readonly body: string;
    readonly mono: string;
  };
  readonly radius: Readonly<Record<string, string>>;
  readonly spacing: Readonly<Record<string, string>>;
  readonly motion: {
    readonly fast: string;
    readonly standard: string;
    readonly calm: string;
    readonly ease: string;
  };
}

/** Athena brand v1.0 (brand guide 03). Mirrors tokens.css. */
export const athenaBrand = {
  name: "Athena",
  phase: "provisional",
  colors: {
    ink: "#1B2433",
    muted: "#4A5568",
    paper: "#FBF8F3",
    surface: "#FFFFFF",
    border: "#8A8F98",
    accent: "#0B6A6C",
    accentInk: "#FFFFFF",
    focus: "#2457C5",
    light: "#D9A441",
    lightInk: "#7A5300",
    locked: "#4F5A66",
    available: "#0B6A6C",
    inProgress: "#8A5A00",
    done: "#2E6B45",
    skyZenith: "#5E93B8",
    skyMid: "#C6E0E4",
    skyHorizon: "#F8F3E8",
    dusk: "#1B2238",
  },
  typography: {
    display: '"Newsreader", Georgia, serif',
    body: '"Atkinson Hyperlegible Next", system-ui, sans-serif',
    mono: '"IBM Plex Mono", Consolas, monospace',
  },
  radius: { small: "0.5rem", panel: "1.25rem", pill: "999px" },
  spacing: {
    xs: "0.25rem",
    small: "0.5rem",
    medium: "1rem",
    large: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  motion: {
    fast: "140ms",
    standard: "320ms",
    calm: "900ms",
    ease: "cubic-bezier(0.33, 0, 0.15, 1)",
  },
} as const satisfies BrandKit;

/** Number of authored house model variants per state (`-v0` … `-v5`). */
export const houseModelVariantCount = 6;

/**
 * State language: colour is never the only signal (brand guide 05).
 * `modelPattern` names files in `athena-assets/models/buildings/`; replace `{variant}`
 * with 0…houseModelVariantCount-1, or use `houseModelFile`.
 */
export const houseStateVisuals = {
  locked: {
    symbol: "◇",
    icon: "state-locked.svg",
    es: "Bloqueado",
    en: "Locked",
    modelPattern: "athena-house-locked-v{variant}.glb",
  },
  available: {
    symbol: "⌂",
    icon: "state-available.svg",
    es: "Disponible",
    en: "Available",
    modelPattern: "athena-house-available-v{variant}.glb",
  },
  in_progress: {
    symbol: "◐",
    icon: "state-in_progress.svg",
    es: "En progreso",
    en: "In progress",
    modelPattern: "athena-house-in-progress-v{variant}.glb",
  },
  done: {
    symbol: "✓",
    icon: "state-done.svg",
    es: "Completado",
    en: "Completed",
    modelPattern: "athena-house-done-v{variant}.glb",
  },
} as const;

export type HouseState = keyof typeof houseStateVisuals;

/** Resolves a house GLB filename; `variant` wraps into 0…houseModelVariantCount-1. */
export function houseModelFile(state: HouseState, variant: number): string {
  const index =
    ((Math.trunc(variant) % houseModelVariantCount) + houseModelVariantCount) %
    houseModelVariantCount;
  return houseStateVisuals[state].modelPattern.replace("{variant}", String(index));
}

export type AthenaBrand = typeof athenaBrand;
