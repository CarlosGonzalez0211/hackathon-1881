/** Developer-owned identity. No per-user skins, palettes, or age variants. */
export interface BrandKit {
  readonly name: string;
  readonly phase: "provisional" | "approved";
  readonly colors: Readonly<Record<string, string>>;
  readonly typography: { readonly display: string; readonly body: string; readonly mono: string };
  readonly radius: Readonly<Record<string, string>>;
  readonly spacing: Readonly<Record<string, string>>;
  readonly motion: { readonly fast: string; readonly standard: string; readonly calm: string; readonly ease: string };
}
export const athenaBrand = {
  name: "Athena",
  phase: "provisional",
  colors: {
    ink: "#1B2433", muted: "#4A5568", paper: "#FBF8F3", surface: "#FFFFFF", border: "#8A8F98",
    accent: "#0B6A6C", accentInk: "#FFFFFF", focus: "#2457C5", light: "#D9A441", lightInk: "#7A5300",
    locked: "#4F5A66", available: "#0B6A6C", inProgress: "#8A5A00", done: "#2E6B45",
    skyZenith: "#5E93B8", skyMid: "#C6E0E4", skyHorizon: "#F8F3E8", dusk: "#1B2238",
  },
  typography: {
    display: '"Newsreader", Georgia, serif',
    body: '"Atkinson Hyperlegible Next", system-ui, sans-serif',
    mono: '"IBM Plex Mono", Consolas, monospace',
  },
  radius: { small: "0.5rem", panel: "1.25rem", pill: "999px" },
  spacing: { xs: "0.25rem", small: "0.5rem", medium: "1rem", large: "1.5rem", xl: "2rem", "2xl": "3rem" },
  motion: { fast: "140ms", standard: "320ms", calm: "900ms", ease: "cubic-bezier(0.33, 0, 0.15, 1)" },
} as const satisfies BrandKit;
/** State language: colour is never the only signal. */
export const houseStateVisuals = {
  locked:      { symbol: "◇", icon: "state-locked.svg",      es: "Bloqueado",   en: "Locked",      model: "athena-house-locked.glb" },
  available:   { symbol: "⌂", icon: "state-available.svg",   es: "Disponible",  en: "Available",   model: "athena-house-available.glb" },
  in_progress: { symbol: "◐", icon: "state-in_progress.svg", es: "En progreso", en: "In progress", model: "athena-house-in-progress.glb" },
  done:        { symbol: "✓", icon: "state-done.svg",        es: "Completado",  en: "Completed",   model: "athena-house-done.glb" },
} as const;
export type AthenaBrand = typeof athenaBrand;
