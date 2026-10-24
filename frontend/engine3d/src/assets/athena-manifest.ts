/**
 * Runtime view of the Athena asset kit.
 *
 * `scripts/build-athena-assets.mjs` turns `athena-assets/` (Git LFS) into content-hashed
 * files under `frontend/web/public/athena/` and writes `athena-manifest.runtime.json`.
 * This module loads that manifest once and resolves legacy request paths / Athena source
 * paths / `slot:` keys to the built URL.
 *
 * Key spaces in `AthenaRuntimeManifest.entries` (all point at the same entry shape):
 * - Athena source paths, verbatim: `models/buildings/athena-house-done-v0.glb`,
 *   `textures/lut-athena-256x16.png`, `audio/ui/click-a.wav`, `icons/ui-arrow.svg`,
 *   `libs/basis/basis_transcoder.js`.
 * - Normalised legacy keys (see {@link normalizeLegacyKey}): `<family>/<path-no-ext>`, e.g.
 *   `geometries/npcs/present/fox/fox-idle`, `geometries/planets/present/full_3`,
 *   `audio/ui/click2`, `images/lut`, `fonts/heading`. Patterns in the kit map are expanded
 *   to every concrete legacy file (avatar parts, terrain LODs/hitmeshes, emojis, NPC files).
 * - Athena slots with no legacy file: `slot:avatar/base`, `slot:avatar/<group>/<variant>`,
 *   `slot:avatar/animation/<role>`, `slot:terrain/<chunk 0-9>/lod<0-3>`,
 *   `slot:terrain/<chunk>/collision`, `slot:emote/<0-9|name>`,
 *   `slot:house/<slot 0-5>/<locked|available|in_progress|done>`, `slot:orbit/star`,
 *   `slot:planet/<earth|rocky|moon|gas|ringed|ice|ocean|desert>`, and `new:npc.cat`.
 */
import { normalizeLegacyKey } from "./athena-keys.mjs";
import type { AthenaSlotRole, LegacyFamily } from "./athena-keys.mjs";

export { normalizeLegacyKey };
export type { AthenaSlotRole, LegacyFamily };

/** What a built file is. `font` entries are descriptions only (no file is shipped). */
export type AthenaAssetKind = "glb" | "texture" | "audio" | "svg" | "lib" | "font";
/**
 * Encoded format of the built file.
 * - `glb-meshopt`: glTF 2.0 binary with EXT_meshopt_compression + KHR_mesh_quantization;
 *   needs `GLTFLoader.setMeshoptDecoder` (see `loaders/athena-gltf-loader.ts`).
 * - `ktx2-etc1s` / `ktx2-uastc`: Basis Universal KTX2 (only when `toktx` was on PATH).
 * - `png` / `wav`: untranscoded fallbacks when `toktx` / `ffmpeg` were missing at build.
 * - `ogg`: Vorbis q4 (ffmpeg). Safari (`client$1.capabilities.opus === false`) cannot play it.
 */
export type AthenaAssetFormat =
  | "glb-meshopt"
  | "ktx2-etc1s"
  | "ktx2-uastc"
  | "png"
  | "ogg"
  | "wav"
  | "svg"
  | "js"
  | "wasm"
  | "google-font";

/** A built, servable file. Several keys may share one file (e.g. NPC model/bones/idle). */
export interface AthenaFileEntry {
  /** Absolute URL of the content-hashed file, rebased onto the `baseUrl` it was loaded from. */
  readonly url: string;
  readonly kind: Exclude<AthenaAssetKind, "font">;
  readonly format: Exclude<AthenaAssetFormat, "google-font">;
  /** Size of the built file in bytes. */
  readonly bytes: number;
  /** Kit-relative source path (`models/…`, `textures/…`, `audio/….wav`, `libs/…`). */
  readonly source: string;
  /** How the slot uses the GLB: whole model, its node rig, one embedded clip, a LOD… */
  readonly role?: AthenaSlotRole;
  /** Embedded animation clip name for `role: "animation"` (e.g. `idle`, `afk2_stretch`). */
  readonly clip?: string;
  /** Terrain detail level 0 (finest) … 3, for `role: "lod"`. */
  readonly lod?: number;
  /** Free-form note carried from the kit (e.g. "reuse as walk path"). */
  readonly note?: string;
}
/** Prose-only replacement: the kit names a web font instead of shipping an MSDF file. */
export interface AthenaFontEntry {
  readonly kind: "font";
  readonly format: "google-font";
  /** e.g. "Newsreader 500 (Google Fonts, OFL)". */
  readonly description: string;
}
export type AthenaManifestEntry = AthenaFileEntry | AthenaFontEntry;

/** Shape of `/athena/athena-manifest.runtime.json`. */
export interface AthenaRuntimeManifest {
  readonly version: 1;
  /** Kit identifier, e.g. "athena-assets v2". */
  readonly kit: string;
  /** URL prefix the build wrote into every `url` (default `/athena/`). */
  readonly base: string;
  /** Kit conventions: meters, +Y up, +Z forward, base-centre pivot, … */
  readonly conventions: Readonly<Record<string, string>>;
  /** Which optional encoders were available at build time. */
  readonly tools: { readonly toktx: boolean; readonly ffmpeg: boolean };
  readonly entries: Readonly<Record<string, AthenaManifestEntry>>;
  /** Kit entries that describe intent only (e.g. "instance buildings freely"). */
  readonly notes: readonly { readonly key: string; readonly value: string }[];
}
export interface AthenaResolved {
  readonly url: string;
  readonly kind: AthenaFileEntry["kind"];
  readonly format: AthenaFileEntry["format"];
  readonly entry: AthenaFileEntry;
}

export const ATHENA_MANIFEST_FILE = "athena-manifest.runtime.json";
const loads = new Map<string, Promise<AthenaRuntimeManifest>>();
let active: AthenaRuntimeManifest | undefined;
let enabled = true;

/** Global Athena flag (engine option `athenaAssets`). Resolution is a no-op when false. */
export function setAthenaAssetsEnabled(value: boolean) {
  enabled = value;
}
export function isAthenaAssetsEnabled() {
  return enabled && active !== undefined;
}
/** Install (or clear) the manifest used by {@link resolveAthena}; also used by tests. */
export function setAthenaManifest(manifest: AthenaRuntimeManifest | undefined) {
  active = manifest;
}
export function getAthenaManifest() {
  return active;
}

function rebase(manifest: AthenaRuntimeManifest, baseUrl: string): AthenaRuntimeManifest {
  const base = baseUrl.replace(/\/?$/, "/");
  if (base === manifest.base) return manifest;
  const entries: Record<string, AthenaManifestEntry> = {};
  for (const [key, entry] of Object.entries(manifest.entries))
    entries[key] =
      entry.kind === "font" || !entry.url.startsWith(manifest.base)
        ? entry
        : { ...entry, url: base + entry.url.slice(manifest.base.length) };
  return { ...manifest, base, entries };
}

/**
 * Fetch the runtime manifest once per `baseUrl` (cached promise) and make it active.
 * Rejects when the manifest is missing (assets not built); callers fall back to legacy.
 */
export function loadAthenaManifest(
  baseUrl = "/athena/",
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<AthenaRuntimeManifest> {
  const base = baseUrl.replace(/\/?$/, "/");
  let load = loads.get(base);
  if (!load) {
    load = fetchImpl(base + ATHENA_MANIFEST_FILE)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Athena manifest ${response.status} at ${base}`);
        const manifest = (await response.json()) as AthenaRuntimeManifest;
        if (manifest.version !== 1)
          throw new Error(`Unsupported Athena manifest v${manifest.version}`);
        return rebase(manifest, base);
      })
      .catch((error: unknown) => {
        loads.delete(base);
        throw error;
      });
    loads.set(base, load);
  }
  return load.then((manifest) => {
    active = manifest;
    return manifest;
  });
}

/**
 * Resolve a manifest key, Athena source path or legacy request path to a built file.
 * Tries the key verbatim, then {@link normalizeLegacyKey}. `undefined` when the flag is
 * off, no manifest is loaded, the key is unknown, or the entry is a font description.
 */
export function resolveAthena(key: string, family?: LegacyFamily): AthenaResolved | undefined {
  if (!isAthenaAssetsEnabled()) return undefined;
  const entries = active!.entries;
  const entry = entries[key] ?? entries[normalizeLegacyKey(key, family)];
  if (!entry || entry.kind === "font") return undefined;
  return { url: entry.url, kind: entry.kind, format: entry.format, entry };
}

/** Legacy loaders that accept a path relative to their `/assets/athena/<family>/` root. */
export type LegacyLoaderName = "geometry" | "texture" | "audio";
/**
 * Formats each legacy loader can consume today. A slot only swaps when its Athena format is
 * listed: `.drc` geometry slots whose Athena target is a GLB stay legacy until a GLB-aware
 * path replaces them (`allowLoaderFormat("geometry", "glb-meshopt")` once that exists).
 */
const loaderFormats: Record<LegacyLoaderName, Set<AthenaAssetFormat>> = {
  geometry: new Set(),
  texture: new Set(["png", "ktx2-etc1s", "ktx2-uastc"]),
  audio: new Set(["ogg", "wav"]),
};
/**
 * Legacy texture slots that must not swap yet: their layout is coupled to legacy geometry
 * UVs or shaders (palette/face atlases, sprite sheets, leaf cards) or they are sampled as a
 * 3D texture (`lut` → Data3DTexture, but the kit ships a 256x16 PNG strip).
 */
export const deferredLegacyKeys = new Set<string>([
  "images/atlas",
  "images/lut",
  "images/eye-highq",
  "images/mainchar-eye-highq",
  "images/mouth-highq",
  "images/particle_sprites",
  "images/butterfly-highq",
  "images/butterfly-front-highq",
  "images/grass-blades-highq",
  "images/tree-leaves",
]);
export function allowLoaderFormat(loader: LegacyLoaderName, format: AthenaAssetFormat) {
  loaderFormats[loader].add(format);
}
const LOADER_FAMILY: Record<LegacyLoaderName, LegacyFamily> = {
  geometry: "geometries",
  texture: "images",
  audio: "audio",
};

/**
 * For a request made to a legacy loader (path relative to `/assets/athena/<family>/`),
 * return the Athena file when the loader can consume it, else `undefined` (keep legacy).
 */
export function resolveForLoader(
  loader: LegacyLoaderName,
  relative: string,
): AthenaResolved | undefined {
  const family = LOADER_FAMILY[loader];
  const key = normalizeLegacyKey(relative, family);
  if (deferredLegacyKeys.has(key)) return undefined;
  const resolved = resolveAthena(key, family);
  return resolved && loaderFormats[loader].has(resolved.format) ? resolved : undefined;
}

/**
 * Which Athena formats `assetUrl` may return, on top of what the category's legacy
 * consumer reads. `"any"` returns whatever the manifest maps (no format/deferral checks).
 */
export type AthenaAcceptFormats = readonly AthenaAssetFormat[] | "any";
const CATEGORY_LOADER: Readonly<Record<string, LegacyLoaderName>> = {
  geometry: "geometry",
  texture: "texture",
  audio: "audio",
};
/** Catalog categories whose legacy consumer reads a bespoke format no Athena build emits. */
const LEGACY_ONLY_CATEGORIES = new Set<string>(["icon"]);

/**
 * Resolve a catalog asset (`asset.path` relative to `/assets/athena/`, plus its catalog
 * `category`) to an Athena file only when the legacy consumer of that category can read
 * the Athena format: geometry/texture/audio go through the {@link resolveForLoader} format
 * table and deferral list (so `.drc` geometry ids stay legacy until `accept` includes
 * `"glb-meshopt"`), `.icon` stays legacy unless `accept` lists the Athena format, and other
 * categories (codec libs) resolve as-is. `accept` widens the allowed formats.
 */
export function resolveForCategory(
  category: string,
  path: string,
  accept?: AthenaAcceptFormats,
): AthenaResolved | undefined {
  if (accept === "any") return resolveAthena(path);
  const extra = new Set<AthenaAssetFormat>(accept ?? []);
  const loader = CATEGORY_LOADER[category];
  if (!loader) {
    const resolved = resolveAthena(path);
    if (!resolved) return undefined;
    return !LEGACY_ONLY_CATEGORIES.has(category) || extra.has(resolved.format)
      ? resolved
      : undefined;
  }
  const family = LOADER_FAMILY[loader];
  const key = normalizeLegacyKey(path, family);
  if (deferredLegacyKeys.has(key)) return undefined;
  const resolved = resolveAthena(key, family);
  return resolved && (loaderFormats[loader].has(resolved.format) || extra.has(resolved.format))
    ? resolved
    : undefined;
}

/**
 * Express an absolute Athena URL relative to a legacy loader root
 * (`<absolutePath>/assets/athena/<family>/`), because those loaders prepend their path to
 * every request. `/athena/x.ogg` → `../../../athena/x.ogg`.
 */
export function toLegacyLoaderPath(url: string) {
  return url.startsWith("/") ? `../../..${url}` : url;
}
