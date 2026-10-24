import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { expandLegacyMap } from "../src/assets/athena-keys.mjs";
import {
  loadAthenaManifest,
  normalizeLegacyKey,
  resolveAthena,
  resolveForLoader,
  setAthenaAssetsEnabled,
  setAthenaManifest,
  toLegacyLoaderPath,
  type AthenaRuntimeManifest,
} from "../src/assets/athena-manifest";
import { assetCatalog, assetUrl } from "../src/assets/catalog";

const engine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const kit = path.join(engine, "athena-assets");
const walk = (root: string, relative = ""): string[] =>
  readdirSync(path.join(root, relative), { withFileTypes: true }).flatMap((entry) => {
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    return entry.isDirectory() ? walk(root, child) : [child];
  });
const kitManifest = JSON.parse(readFileSync(path.join(kit, "asset-manifest.json"), "utf8"));
const kitFiles = walk(kit);
const legacyKeys = assetCatalog
  .filter((asset) => /^(geometries|images|audio|fonts)\//.test(asset.path))
  .map((asset) => normalizeLegacyKey(asset.path));
const expanded = expandLegacyMap(kitManifest.legacyToAthena, legacyKeys, kitFiles);
const slot = (key: string) => expanded.slots.find((entry) => entry.key === key);

test("normalizeLegacyKey maps loader-relative and mount paths to manifest keys", () => {
  const cases: [string, string | undefined, string][] = [
    ["geometries/npcs/present/fox/fox.drc", undefined, "geometries/npcs/present/fox/fox"],
    ["npcs/present/fox/fox-idle.drc", undefined, "geometries/npcs/present/fox/fox-idle"],
    ["npcs/present/fox/fox-idle.drc", "geometries", "geometries/npcs/present/fox/fox-idle"],
    ["planets/present/full_3.drc", undefined, "geometries/planets/present/full_3"],
    ["audio/ui/click.ogg", undefined, "audio/ui/click"],
    ["ui/click2.ogg", "audio", "audio/ui/click2"],
    ["images/lut.ktx2", undefined, "images/lut"],
    ["lut.ktx2", "images", "images/lut"],
    ["ui/emojis/3.icon", undefined, "images/ui/emojis/3"],
    ["/assets/athena/fonts/heading.font", undefined, "fonts/heading"],
    ["https://x.test/assets/athena/images/atlas.png?v=2", undefined, "images/atlas"],
    ["./avatar/avatar-idle.drc", undefined, "geometries/avatar/avatar-idle"],
    ["npcs/present/fox", undefined, "geometries/npcs/present/fox"],
    [
      "models/buildings/athena-house-done-v0.glb",
      undefined,
      "models/buildings/athena-house-done-v0.glb",
    ],
    ["audio/ui/click-a.wav", undefined, "audio/ui/click-a.wav"],
    ["libs/basis/basis_transcoder.js", undefined, "libs/basis/basis_transcoder.js"],
    ["slot:house/0/done", undefined, "slot:house/0/done"],
    ["new:npc.cat", undefined, "new:npc.cat"],
  ];
  for (const [input, family, expected] of cases)
    assert.equal(normalizeLegacyKey(input, family as never), expected, input);
});

test("every legacy catalog request normalises identically with or without its family", () => {
  for (const asset of assetCatalog) {
    const match = /^(geometries|images|audio|fonts)\/(.+)$/.exec(asset.path);
    if (!match) continue;
    const [, family, relative] = match;
    assert.equal(
      normalizeLegacyKey(relative!, family as never),
      normalizeLegacyKey(asset.path),
      asset.path,
    );
  }
});

test("kit patterns expand to concrete slots", () => {
  assert.deepEqual(expanded.missing, []);
  // Avatar parts: legacy hairN/topN… zip with the kit variants in name order.
  assert.equal(
    slot("geometries/avatar/accessories/hair1")?.source,
    "models/avatar/athena-avatar-hair-bob.glb",
  );
  assert.equal(
    slot("geometries/avatar/accessories/top9")?.source,
    "models/avatar/athena-avatar-top-vest.glb",
  );
  assert.equal(
    slot("slot:avatar/shoes/sneakers")?.source,
    "models/avatar/athena-avatar-shoes-sneakers.glb",
  );
  assert.deepEqual(
    ["base", "bones"].map(
      (part) =>
        slot(
          part === "base" ? "geometries/avatar/accessories/base" : "geometries/avatar/avatar-bones",
        )?.role,
    ),
    ["model", "skeleton"],
  );
  assert.equal(slot("geometries/avatar/avatar-afk1")?.clip, "afk1_lookaround");
  assert.equal(slot("geometries/avatar/avatar-run")?.clip, "run");
  // Terrain: chunk index → kit name order, LODs and collision.
  assert.equal(
    slot("geometries/planets/present/full_3")?.source,
    "models/terrain/athena-terrain-beach-lod0.glb",
  );
  assert.equal(
    slot("geometries/planets/present/full-lod-2_9")?.source,
    "models/terrain/athena-terrain-summit-lod2.glb",
  );
  assert.equal(slot("geometries/planets/present/low/full_0")?.lod, 1);
  assert.equal(slot("geometries/planets/present/hitmesh_4")?.role, "collision");
  assert.equal(
    slot("slot:terrain/7/collision")?.source,
    "models/terrain/athena-terrain-terraces-collision.glb",
  );
  for (let chunk = 0; chunk < 10; chunk++)
    for (let level = 0; level < 4; level++) assert.ok(slot(`slot:terrain/${chunk}/lod${level}`));
  // Houses: 6 slots × 4 shared statuses.
  const houses = expanded.slots.filter((entry) => entry.key.startsWith("slot:house/"));
  assert.equal(houses.length, 24);
  assert.equal(
    slot("slot:house/5/in_progress")?.source,
    "models/buildings/athena-house-in-progress-v5.glb",
  );
  // Emotes: legacy emojis are 1-based.
  assert.equal(slot("geometries/emojis/1")?.source, "models/emotes/athena-emote-wave.glb");
  assert.equal(slot("geometries/emojis/10")?.source, "models/emotes/athena-emote-sleep.glb");
  assert.equal(slot("slot:emote/heart")?.source, "models/emotes/athena-emote-heart.glb");
  // NPC groups fan out to every legacy NPC file.
  assert.equal(slot("geometries/npcs/present/fox/fox")?.role, "model");
  assert.equal(slot("geometries/npcs/present/fox/fox-bones")?.role, "skeleton");
  assert.equal(slot("geometries/npcs/present/fox/fox-idle")?.clip, "idle");
  assert.equal(slot("geometries/npcs/present/young-lady/young-lady-talk-idle")?.clip, "talk");
  assert.equal(slot("geometries/npcs/present/office-worker/office-worker-walk-alt")?.clip, "walk");
  assert.equal(slot("geometries/npcs/present/tall-man-curve")?.note, "reuse as walk path");
  // Planets, orbit star, new slot, prose.
  assert.equal(slot("slot:planet/ringed")?.source, "models/space/athena-planet-ringed.glb");
  assert.equal(slot("slot:orbit/star")?.source, "models/space/athena-teacher-sun.glb");
  assert.equal(slot("new:npc.cat")?.source, "models/characters/athena-npc-cat-lumen.glb");
  assert.deepEqual(expanded.fonts.map((font) => font.key).sort(), [
    "fonts/REM-Medium",
    "fonts/UglyDave-Alternates-optimized",
    "fonts/heading",
    "fonts/planet",
  ]);
  assert.ok(expanded.notes.some((note) => note.key === "brand/logo"));
});

const fakeManifest = (): AthenaRuntimeManifest => ({
  version: 1,
  kit: "test",
  base: "/athena/",
  conventions: {},
  tools: { toktx: false, ffmpeg: true },
  notes: [],
  entries: {
    "geometries/npcs/present/fox/fox": {
      url: "/athena/models/npcs/hare.abc.glb",
      kind: "glb",
      format: "glb-meshopt",
      bytes: 1,
      source: "models/npcs/athena-npc-hare-pip.glb",
      role: "model",
    },
    "audio/ui/click2": {
      url: "/athena/audio/ui/click-a.abc.ogg",
      kind: "audio",
      format: "ogg",
      bytes: 1,
      source: "audio/ui/click-a.wav",
    },
    "images/lut": {
      url: "/athena/textures/lut.abc.png",
      kind: "texture",
      format: "png",
      bytes: 1,
      source: "textures/lut-athena-256x16.png",
    },
    "images/galaxy": {
      url: "/athena/textures/galaxy.abc.png",
      kind: "texture",
      format: "png",
      bytes: 1,
      source: "textures/galaxy-512.png",
    },
    "fonts/heading": { kind: "font", format: "google-font", description: "Newsreader 500" },
  },
});

test("assetUrl resolves through the Athena manifest and falls back to legacy", () => {
  setAthenaManifest(undefined);
  setAthenaAssetsEnabled(true);
  assert.equal(assetUrl("audio.ui.click2.ogg"), "/assets/athena/audio/ui/click2.ogg");
  setAthenaManifest(fakeManifest());
  assert.equal(assetUrl("audio.ui.click2.ogg"), "/athena/audio/ui/click-a.abc.ogg");
  assert.equal(assetUrl("geometries.npcs.present.fox.fox.drc"), "/athena/models/npcs/hare.abc.glb");
  // Not in the manifest, or a prose-only font: legacy path.
  assert.equal(assetUrl("audio.ui.hover2.ogg"), "/assets/athena/audio/ui/hover2.ogg");
  assert.equal(assetUrl("fonts.heading.font"), "/assets/athena/fonts/heading.font");
  setAthenaAssetsEnabled(false);
  assert.equal(assetUrl("audio.ui.click2.ogg"), "/assets/athena/audio/ui/click2.ogg");
  assert.equal(resolveAthena("audio/ui/click2"), undefined);
  assert.throws(() => assetUrl("nope"));
  setAthenaAssetsEnabled(true);
  setAthenaManifest(undefined);
});

test("legacy loaders only swap formats they can consume", () => {
  setAthenaAssetsEnabled(true);
  setAthenaManifest(fakeManifest());
  // A .drc slot with a GLB target stays on the Draco path.
  assert.equal(resolveForLoader("geometry", "npcs/present/fox/fox.drc"), undefined);
  assert.equal(resolveForLoader("audio", "ui/click2.ogg")?.url, "/athena/audio/ui/click-a.abc.ogg");
  assert.equal(resolveForLoader("texture", "galaxy.ktx2")?.format, "png");
  // The LUT is sampled as a 3D texture; deferred.
  assert.equal(resolveForLoader("texture", "lut.ktx2"), undefined);
  assert.equal(toLegacyLoaderPath("/athena/a.ogg"), "../../../athena/a.ogg");
  setAthenaManifest(undefined);
});

test("loadAthenaManifest fetches once and rebases URLs", async () => {
  let calls = 0;
  const fetchImpl = (async (url: string) => {
    calls++;
    assert.equal(url, "/cdn/athena/athena-manifest.runtime.json");
    return new Response(JSON.stringify(fakeManifest()));
  }) as typeof fetch;
  const first = await loadAthenaManifest("/cdn/athena", fetchImpl);
  const second = await loadAthenaManifest("/cdn/athena/", fetchImpl);
  assert.equal(calls, 1);
  assert.equal(first, second);
  assert.equal(
    resolveAthena("ui/click2.ogg", "audio")?.url,
    "/cdn/athena/audio/ui/click-a.abc.ogg",
  );
  await assert.rejects(
    loadAthenaManifest(
      "/missing/",
      (async () => new Response("", { status: 404 })) as typeof fetch,
    ),
  );
  setAthenaManifest(undefined);
});
