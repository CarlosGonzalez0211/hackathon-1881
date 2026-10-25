import { defaultWorldAccessibilitySettings } from "@athena/shared";
import { assetCatalog } from "../assets/catalog";
import kit from "../../athena-assets/asset-manifest.json";

/**
 * Task 12: every legacy audio key → its Athena WAV source (built to OGG), straight from
 * the kit's `legacyToAthena`. The runtime resolves requests through the built manifest;
 * this table is the reviewable mapping (docs/MIGRATION.md).
 */
export const athenaAudioMap: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(kit.legacyToAthena as Record<string, string>).filter(([key]) =>
    key.startsWith("audio/"),
  ),
);
const athena = (legacy: string) => athenaAudioMap[`audio/${legacy}`] ?? null;

/**
 * Two volume buses (brand guide 07: separate music/effects sliders). Music carries the
 * score and the ambient bed; everything else (steps, UI ticks, chime, voices) is effects.
 */
export type AudioBus = "music" | "effects";
export function audioBusOf(name: string): AudioBus {
  return /^(bgmusic|musician|ambiance-)/.test(name) ? "music" : "effects";
}

export const audioDefinition = {
  assets: assetCatalog.filter((asset) => asset.category === "audio").map((asset) => asset.id),
  music: {
    desktop: "audio.music.bgmusic-highq.ogg",
    mobile: "audio.music.bgmusic-mobile.ogg",
    positionalMusician: "audio.music.musician.ogg",
  },
  ambiences: ["base", "beach", "city", "factory", "forest", "temple", "waterfalls"].map((name) => ({
    id: `ambience.${name}`,
    assetId: `audio.ambiances.${name}.ogg`,
    athena: athena(`ambiances/${name}`),
  })),
  athena: {
    music: {
      desktop: athena("music/bgmusic-highq"),
      mobile: athena("music/bgmusic-mobile"),
      positionalMusician: athena("music/musician"),
    },
    /** The single warm chime for demonstrated understanding (brand guide 07). */
    understandingShown: athena("ui/quest-complete"),
  },
  autoplay: false,
  /** Default bus volumes (0-1), from the shared world accessibility defaults. */
  volumes: {
    music: defaultWorldAccessibilitySettings.musicVolume,
    effects: defaultWorldAccessibilitySettings.sfxVolume,
  } as Record<AudioBus, number>,
  policy:
    "Off until the first user gesture (the engine starts muted); dispose sources on route exit. Original spatial positions and gains remain in the extracted runtime; bus volumes scale them.",
} as const;
