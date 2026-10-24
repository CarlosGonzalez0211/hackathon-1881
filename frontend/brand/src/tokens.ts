/** Developer-owned identity. No per-user skins, palettes, or age variants. */
export interface BrandKit {
  readonly name: string;
  readonly phase: "provisional" | "approved";
  readonly colors: Readonly<Record<string, string>>;
  readonly typography: {
    readonly body: string;
    readonly mono: string;
  };
  readonly radius: Readonly<Record<string, string>>;
  readonly spacing: Readonly<Record<string, string>>;
  readonly motion: {
    readonly fast: string;
    readonly standard: string;
  };
}

/** Messenger remains the provisional world; these neutral overlays are Athena's. */
export const athenaBrand = {
  name: "Athena",
  phase: "provisional",
  colors: {
    ink: "#172D3B",
    muted: "#415A68",
    paper: "#FFFDF5",
    surface: "#FFFFFF",
    border: "#768A91",
    accent: "#075F62",
    accentInk: "#FFFFFF",
    focus: "#064BC1",
    locked: "#48565E",
    available: "#075F62",
    inProgress: "#775000",
    done: "#215C3B",
  },
  typography: {
    body: "Arial, Helvetica, sans-serif",
    mono: 'Consolas, "Courier New", monospace',
  },
  radius: { small: "0.5rem", panel: "1rem", pill: "999px" },
  spacing: { xs: "0.25rem", small: "0.5rem", medium: "1rem", large: "1.5rem", xl: "2rem" },
  motion: { fast: "120ms", standard: "220ms" },
} as const satisfies BrandKit;

export type AthenaBrand = typeof athenaBrand;
