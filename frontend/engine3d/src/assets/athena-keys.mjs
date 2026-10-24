// Pure, dependency-free key logic shared by the asset build script (Node) and the
// runtime resolver (browser). Plain JS so `scripts/build-athena-assets.mjs` can import
// it without a TypeScript toolchain; types live in `athena-keys.d.mts`.

/** Legacy loader families, i.e. the first folder under the legacy `/assets/athena/` mount. */
export const LEGACY_FAMILIES = ["geometries", "images", "audio", "fonts", "libs"];

const EXTENSION_FAMILY = {
  drc: "geometries",
  glb: "geometries",
  gltf: "geometries",
  ogg: "audio",
  mp3: "audio",
  wav: "audio",
  ktx2: "images",
  png: "images",
  jpg: "images",
  jpeg: "images",
  webp: "images",
  avif: "images",
  exr: "images",
  icon: "images",
  font: "fonts",
};
const SEGMENT_FAMILY = {
  npcs: "geometries",
  planets: "geometries",
  avatar: "geometries",
  birds: "geometries",
  deliveries: "geometries",
  emojis: "geometries",
  ui: "images",
  uv: "images",
  controls: "images",
  ambiances: "audio",
  camera: "audio",
  character: "audio",
  dialogues: "audio",
  intro: "audio",
  music: "audio",
};
/** Folders of the Athena kit; keys under them are Athena source paths and kept verbatim. */
export const ATHENA_SOURCE_ROOTS = ["models", "textures", "icons", "brand"];
const STRIP_EXTENSIONS = new Set([...Object.keys(EXTENSION_FAMILY), "svg"]);

/**
 * Normalise a legacy request path (or a kit `legacyToAthena` key) to a manifest key.
 *
 * Result shape: `<family>/<path without extension>`, e.g.
 * `geometries/npcs/present/fox/fox-idle`, `audio/ui/click2`, `images/ui/emojis/3`.
 * - Origins, query strings, leading `./` or `/` and the `assets/athena/` mount (or the bare
 *   Messenger `assets/` root) are removed.
 * - `family` is the loader family the path is relative to (`geometryLoader` paths omit
 *   `geometries/`). Without it the family is inferred from the extension, then from the
 *   first segment.
 * - Namespaced keys (`slot:…`, `new:…`) and Athena source paths (`models/…`,
 *   `textures/…`, `icons/…`, `brand/…`, and `.wav` audio) are returned unchanged.
 */
export function normalizeLegacyKey(path, family) {
  let key = String(path).trim();
  if (/^[a-z][\w+.-]*:\/\//i.test(key)) key = key.replace(/^[a-z][\w+.-]*:\/\/[^/]*/i, "");
  key = key.replace(/[?#].*$/, "");
  if (/^[a-z]+:/i.test(key)) return key; // slot:…, new:…
  key = key.replace(/\\/g, "/").replace(/^(\.\/|\/)+/, "");
  // Both the Athena mount (`/assets/athena/…`) and the bare Messenger layout (`/assets/…`).
  key = key.replace(/^assets\/(athena\/)?/, "");
  const first = key.split("/")[0];
  if (ATHENA_SOURCE_ROOTS.includes(first)) return key;
  if (first === "audio" && key.endsWith(".wav")) return key;
  if (first === "libs" || family === "libs") return first === "libs" ? key : `libs/${key}`;
  const match = /\.([a-z0-9]+)$/i.exec(key);
  const extension = match?.[1]?.toLowerCase();
  if (extension && STRIP_EXTENSIONS.has(extension)) key = key.slice(0, -extension.length - 1);
  if (LEGACY_FAMILIES.includes(first)) return key;
  const inferred =
    family ?? (extension && EXTENSION_FAMILY[extension]) ?? SEGMENT_FAMILY[first] ?? undefined;
  return inferred ? `${inferred}/${key}` : key;
}

/** Shared HouseState status spelling (`@athena/shared` houseStatusSchema). */
const HOUSE_STATUS = { "in-progress": "in_progress" };

const alternatives = (value) => /<([^>]+)>/.exec(value)?.[1]?.split("|") ?? [];
const numeric = (a, b) => a.localeCompare(b, "en", { numeric: true });

/**
 * Expand the kit's `legacyToAthena` map (flat, with patterns and prose) into concrete
 * slots. Pure: the caller supplies the legacy keys that exist (normalised) and the Athena
 * source paths that exist (kit-relative, e.g. `models/npcs/athena-npc-hare-pip.glb`).
 *
 * Returns
 * - `slots`: one record per concrete key → Athena source (+ role/clip/lod metadata),
 * - `fonts`: prose-only font replacements (`fonts/heading` → "Newsreader 500 …"),
 * - `notes`: kit entries that describe intent and have no concrete key (kept for humans),
 * - `missing`: kit targets that do not exist in the kit (build warnings).
 */
export function expandLegacyMap(legacyToAthena, legacyKeys, athenaSources) {
  const legacy = [...new Set(legacyKeys)].sort(numeric);
  const sources = new Set(athenaSources);
  const slots = new Map();
  const fonts = [];
  const notes = [];
  const missing = [];
  const add = (key, source, meta = {}) => {
    if (!sources.has(source)) {
      missing.push({ key, source });
      return;
    }
    if (!slots.has(key)) slots.set(key, { key, source, ...meta });
  };
  const variantsOf = (pattern) => {
    const [before, after] = pattern.split(/<[^>]+>/);
    return [...sources]
      .filter((source) => source.startsWith(before) && source.endsWith(after))
      .map((source) => source.slice(before.length, source.length - after.length))
      .filter((variant) => variant && !variant.includes("/"))
      .sort(numeric);
  };
  const AVATAR_BASE = "models/avatar/athena-avatar-base.glb";

  for (const [rawKey, rawValue] of Object.entries(legacyToAthena)) {
    const value = String(rawValue).trim();
    if (/^font:/i.test(value)) {
      fonts.push({ key: normalizeLegacyKey(rawKey, "fonts"), description: value.slice(5).trim() });
      continue;
    }
    let match;
    if (rawKey.startsWith("avatar/skeleton")) {
      add("geometries/avatar/accessories/base", AVATAR_BASE, { role: "model" });
      add("geometries/avatar/avatar-bones", AVATAR_BASE, { role: "skeleton" });
      add("slot:avatar/base", AVATAR_BASE, { role: "model" });
    } else if ((match = /^avatar\/animations\s+(.+)$/.exec(rawKey))) {
      const clips = (/:\s*(.+)$/.exec(value)?.[1] ?? "").split(/,\s*/).filter(Boolean);
      for (const role of match[1].split(",")) {
        const clip = clips.find((c) => c === role || c.startsWith(`${role}_`)) ?? role;
        add(`geometries/avatar/avatar-${role}`, AVATAR_BASE, { role: "animation", clip });
        add(`slot:avatar/animation/${role}`, AVATAR_BASE, { role: "animation", clip });
      }
    } else if ((match = /^avatar\/accessories\/(\w+)\/\*$/.exec(rawKey))) {
      const group = match[1];
      const pattern = value.split(/\s/)[0];
      const variants = variantsOf(pattern);
      const legacyParts = legacy.filter((key) =>
        new RegExp(`^geometries/avatar/accessories/${group}\\d+$`).test(key),
      );
      variants.forEach((variant, index) => {
        const source = pattern.replace(/<[^>]+>/, variant);
        add(`slot:avatar/${group}/${variant}`, source, { role: "model" });
        const legacyKey = legacyParts[index];
        if (legacyKey) add(legacyKey, source, { role: "model" });
      });
    } else if (rawKey.startsWith("terrain chunks")) {
      const names = alternatives(value);
      names.forEach((name, chunk) => {
        const lod = (level) => `models/terrain/athena-terrain-${name}-lod${level}.glb`;
        const collision = `models/terrain/athena-terrain-${name}-collision.glb`;
        const meta = (level) => ({
          role: "lod",
          lod: level,
          note: `terrain chunk ${chunk} (${name})`,
        });
        for (let level = 0; level <= 3; level++)
          add(`slot:terrain/${chunk}/lod${level}`, lod(level), meta(level));
        add(`slot:terrain/${chunk}/collision`, collision, { role: "collision", note: name });
        add(`geometries/planets/present/full_${chunk}`, lod(0), meta(0));
        for (let level = 1; level <= 3; level++)
          add(`geometries/planets/present/full-lod-${level}_${chunk}`, lod(level), meta(level));
        // The low-end (mobile) set is one detail level coarser than desktop.
        add(`geometries/planets/present/low/full_${chunk}`, lod(1), meta(1));
        add(`geometries/planets/present/low/full-lod-1_${chunk}`, lod(2), meta(2));
        add(`geometries/planets/present/low/full-lod-3_${chunk}`, lod(3), meta(3));
        if (legacy.includes(`geometries/planets/present/hitmesh_${chunk}`))
          add(`geometries/planets/present/hitmesh_${chunk}`, collision, { role: "collision" });
      });
    } else if (rawKey.startsWith("emoji models")) {
      const pattern = value.split(/\s/)[0];
      alternatives(value).forEach((name, index) => {
        const source = pattern.replace(/<[^>]+>/, name);
        // Legacy emojis/N.drc are 1-based; EMOJI_MAP geometryIndex is 0-based.
        add(`geometries/emojis/${index + 1}`, source, { role: "model" });
        add(`slot:emote/${index}`, source, { role: "model" });
        add(`slot:emote/${name}`, source, { role: "model" });
      });
    } else if (rawKey.startsWith("topic-anchor")) {
      const [statuses, slotRange] = [...value.matchAll(/<([^>]+)>/g)].map((m) => m[1]);
      const [from, to] = (slotRange ?? "0..5").split("..").map(Number);
      for (const status of statuses?.split("|") ?? [])
        for (let slot = from ?? 0; slot <= (to ?? 5); slot++)
          add(
            `slot:house/${slot}/${HOUSE_STATUS[status] ?? status}`,
            `models/buildings/athena-house-${status}-v${slot}.glb`,
            { role: "model" },
          );
    } else if (rawKey.startsWith("scenes/orbit.ts star")) {
      add("slot:orbit/star", value, { role: "model" });
    } else if (rawKey.startsWith("student planet types")) {
      const pattern = value.split(/\s/)[0];
      for (const type of alternatives(value))
        add(`slot:planet/${type}`, pattern.replace(/<[^>]+>/, type), { role: "model" });
    } else if (/[\s*{]/.test(rawKey) || /[*<]/.test(value.split(/\s/)[0] ?? "")) {
      notes.push({ key: rawKey, value });
    } else {
      const [source = "", ...rest] = value.split(/\s+\(/);
      const note = rest.length ? rest.join(" (").replace(/\)\s*$/, "") : undefined;
      const key = normalizeLegacyKey(rawKey);
      const npc = /^geometries\/npcs\/present\/([^/]+)$/.exec(key)?.[1];
      const npcFiles = npc ? legacy.filter((k) => k.startsWith(`${key}/`)) : [];
      if (npcFiles.length) {
        add(key, source, { role: "model", note });
        for (const file of npcFiles) {
          const stem = file.slice(key.length + 1);
          const suffix = stem.startsWith(npc) ? stem.slice(npc.length) : undefined;
          const meta = npcRole(suffix);
          if (meta) add(file, source, meta);
          else if ((match = /^curve-(\d+)$/.exec(stem))) {
            // NPC walk paths (factory-worker-b/curve-1): the kit has no NPC curves, so reuse
            // the bird curve of the same index, as the kit does for `tall-man-curve`.
            const curve = `models/nature/athena-bird-curve-${match[1]}.glb`;
            add(file, sources.has(curve) ? curve : "models/nature/athena-bird-curve-2.glb", {
              role: "curve",
              note: "reuse bird curve as walk path (no kit NPC curve)",
            });
          }
        }
      } else {
        const role = key.includes("curve") ? "curve" : undefined;
        add(key, source, { ...(role ? { role } : {}), ...(note ? { note } : {}) });
      }
    }
  }
  return { slots: [...slots.values()], fonts, notes, missing };
}

/** Map a legacy NPC file suffix (`""`, `-bones`, `-idle`, `-talk-idle`…) to a GLB role. */
function npcRole(suffix) {
  if (suffix === undefined) return undefined;
  if (suffix === "") return { role: "model" };
  if (suffix === "-alt") return { role: "model", note: "alternate outfit" };
  if (suffix === "-bones") return { role: "skeleton" };
  const parts = suffix.slice(1).split("-");
  const clip = parts.includes("talk") ? "talk" : parts.includes("walk") ? "walk" : parts[0];
  return clip ? { role: "animation", clip } : undefined;
}
