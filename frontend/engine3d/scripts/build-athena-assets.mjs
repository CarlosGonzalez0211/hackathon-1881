#!/usr/bin/env node
// Builds the Athena asset kit (`athena-assets/`, Git LFS) into web-servable files under
// `frontend/web/public/athena/` plus `athena-manifest.runtime.json` and a budget report.
//
//   GLB  → dedup → prune → flatten/join → smooth normals → weld → simplify → meshopt (EXT_meshopt_compression + quantization)
//   PNG  → KTX2 via `toktx` when on PATH (ETC1S colour, UASTC data maps), else copied
//   WAV  → OGG Vorbis q4 via `ffmpeg` when on PATH, else copied
//   SVG  → copied (icons/, brand/)
//   libs → decoder libraries (basis, draco, glyph) copied from the legacy mount
//
// Filenames are content-hashed. An input-hash cache (node_modules/.cache) skips unchanged
// inputs so `predev`/`prebuild` stay fast. Individual failures are warnings (CI without
// LFS objects or tools still builds); pass `--strict` to make them fatal.
import { refineCharacters } from "./refine-characters.mjs";
import { smoothNormals } from "./smooth-normals.mjs";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  avatarOutfitSources,
  expandLegacyMap,
  normalizeLegacyKey,
} from "../src/assets/athena-keys.mjs";

const PIPELINE_VERSION = 13;
const CHARACTER_PASS_HASH = createHash("sha256")
  .update(await fs.readFile(new URL("./refine-characters.mjs", import.meta.url)))
  .update(await fs.readFile(new URL("./story-explorer.mjs", import.meta.url)))
  .update(await fs.readFile(new URL("./smooth-normals.mjs", import.meta.url)))
  .digest("hex")
  .slice(0, 12);
/**
 * Mesh simplification (meshoptimizer). The luminous village draws no ink hulls, so the
 * surface budget (≤ 250k tris) now affords far gentler reduction: curvature survives and
 * silhouettes stay round. Error is relative to each mesh's extent. Collision tiles and
 * point clouds are left exact.
 */
const SIMPLIFY = { ratio: 0.6, error: 0.004 };
const CHARACTER_SIMPLIFY = { ratio: 0.42, error: 0.0025 };
/** Houses are large and many; smooth normals let them shed more triangles invisibly. */
const BUILDING_SIMPLIFY = { ratio: 0.3, error: 0.008 };
/** Character parts carry authored normals; terrain tiles are collision data. */
const KEEP_NORMALS = /models\/(terrain|avatar|npcs|characters)\//;
const NO_SIMPLIFY = /models\/terrain\/|athena-space-(starfield|galaxy)\.glb$/;
/**
 * Avatar part GLBs keep their node hierarchy: the runtime grafts each part's meshes onto the
 * base rig by parent node name. Everything else is flattened and joined first (animated
 * nodes and their descendants are preserved by gltf-transform), so simplification works on
 * whole models instead of thousands of tiny parts.
 */
const KEEP_HIERARCHY = /models\/(avatar|terrain|npcs|characters)\//;
const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// ATHENA_KIT_DIR points at another checkout of the kit (e.g. one with LFS objects fetched).
const KIT = process.env.ATHENA_KIT_DIR
  ? path.resolve(process.env.ATHENA_KIT_DIR)
  : path.join(ENGINE, "athena-assets");
const PUBLIC = path.resolve(ENGINE, "..", "web", "public");
const LEGACY = path.join(PUBLIC, "assets", "athena");
const OUT = path.join(PUBLIC, "athena");
const BASE_URL = "/athena/";
const CACHE_FILE = path.join(ENGINE, "node_modules", ".cache", "athena-assets.json");
const MANIFEST_FILE = "athena-manifest.runtime.json";
const BUDGET_FILE = "athena-budget.json";
const FIRST_LOAD_BUDGET = 8 * 1024 * 1024;
const STRICT = process.argv.includes("--strict");
const UASTC_PATTERN = /water-normal|noise|lut/;

const posix = (p) => p.split(path.sep).join("/");
const sha = (buffer) => createHash("sha256").update(buffer).digest("hex");
const started = Date.now();
const warnings = [];
const warn = (message) => {
  warnings.push(message);
  console.warn(`[athena-assets] warn: ${message}`);
};

function hasTool(command, args) {
  try {
    const result = spawnSync(command, args, { stdio: "ignore", timeout: 10_000 });
    return !result.error && result.status === 0;
  } catch {
    return false;
  }
}
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited ${code}: ${stderr.trim()}`)),
    );
  });
}
async function walk(root, relative = "") {
  const directory = path.join(root, relative);
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(root, child)));
    else files.push(posix(child));
  }
  return files.sort();
}
async function pool(items, size, worker) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) await worker(items[next++]);
    }),
  );
}
const isLfsPointer = (buffer) =>
  buffer.length < 1024 &&
  buffer.subarray(0, 40).toString("utf8").startsWith("version https://git-lfs");
const hashedName = (relative, hash, extension) => {
  const parsed = path.posix.parse(relative);
  return path.posix.join(parsed.dir, `${parsed.name}.${hash.slice(0, 10)}${extension}`);
};

// ---------------------------------------------------------------------------- tools
const tools = {
  toktx: hasTool("toktx", ["--version"]),
  ffmpeg: hasTool("ffmpeg", ["-version"]),
};
let gltf;
async function gltfToolchain() {
  if (gltf) return gltf;
  const [
    { NodeIO },
    { ALL_EXTENSIONS },
    functions,
    { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier },
  ] = await Promise.all([
    import("@gltf-transform/core"),
    import("@gltf-transform/extensions"),
    import("@gltf-transform/functions"),
    import("meshoptimizer"),
  ]);
  await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);
  const { Logger } = await import("@gltf-transform/core");
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    "meshopt.encoder": MeshoptEncoder,
    "meshopt.decoder": MeshoptDecoder,
  });
  gltf = {
    io,
    functions,
    MeshoptEncoder,
    MeshoptSimplifier,
    logger: new Logger(Logger.Verbosity.ERROR),
  };
  return gltf;
}

// ------------------------------------------------------------------------ processors
/** Each processor: (input buffer, absolute input path) → { buffer, extension, format }. */
const processors = {
  async glb(input, absolute) {
    const { io, functions, MeshoptEncoder, MeshoptSimplifier, logger } = await gltfToolchain();
    const document = await io.readBinary(new Uint8Array(input));
    document.setLogger(logger);
    const character = refineCharacters(document, posix(absolute));
    await document.transform(
      functions.dedup(),
      // Keep empty leaf nodes (rig sockets/attachment points) and unused attributes (UV/colour
      // may be used by the toon material later).
      // Character rigs keep custom style/weave attributes; everything else drops vertex
      // attributes no material reads (the kit is untextured), which shrinks every file.
      functions.prune({ keepLeaves: true, keepAttributes: KEEP_NORMALS.test(posix(absolute)) }),
      ...(KEEP_HIERARCHY.test(posix(absolute)) ? [] : [functions.flatten(), functions.join()]),
      (doc) => {
        if (!KEEP_NORMALS.test(posix(absolute))) smoothNormals(doc);
      },
      functions.weld(),
      ...(NO_SIMPLIFY.test(posix(absolute))
        ? []
        : [
            functions.simplify({
              simplifier: MeshoptSimplifier,
              ...(character
                ? CHARACTER_SIMPLIFY
                : posix(absolute).includes("models/buildings/")
                  ? BUILDING_SIMPLIFY
                  : SIMPLIFY),
            }),
          ]),
      functions.meshopt({ encoder: MeshoptEncoder, level: "high" }),
    );
    return {
      buffer: Buffer.from(await io.writeBinary(document)),
      extension: ".glb",
      format: "glb-meshopt",
    };
  },
  async texture(input, absolute, relative) {
    if (!tools.toktx) return { buffer: input, extension: ".png", format: "png" };
    const uastc = UASTC_PATTERN.test(relative);
    const temporary = path.join(
      os.tmpdir(),
      `athena-${process.pid}-${sha(relative).slice(0, 8)}.ktx2`,
    );
    const args = uastc
      ? [
          "--t2",
          "--encode",
          "uastc",
          "--uastc_quality",
          "2",
          "--zcmp",
          "19",
          "--assign_oetf",
          "linear",
        ]
      : ["--t2", "--encode", "etc1s", "--clevel", "2", "--qlevel", "128", "--assign_oetf", "srgb"];
    try {
      await run("toktx", [...args, "--genmipmap", temporary, absolute]);
      const buffer = await fs.readFile(temporary);
      return { buffer, extension: ".ktx2", format: uastc ? "ktx2-uastc" : "ktx2-etc1s" };
    } catch (error) {
      warn(`toktx failed for ${relative}, copying PNG (${error.message})`);
      return { buffer: input, extension: ".png", format: "png" };
    } finally {
      await fs.rm(temporary, { force: true });
    }
  },
  async audio(input, absolute, relative) {
    if (!tools.ffmpeg) return { buffer: input, extension: ".wav", format: "wav" };
    const temporary = path.join(
      os.tmpdir(),
      `athena-${process.pid}-${sha(relative).slice(0, 8)}.ogg`,
    );
    try {
      await run("ffmpeg", [
        "-y",
        "-loglevel",
        "error",
        "-i",
        absolute,
        "-c:a",
        "libvorbis",
        "-q:a",
        "4",
        temporary,
      ]);
      return { buffer: await fs.readFile(temporary), extension: ".ogg", format: "ogg" };
    } catch (error) {
      warn(`ffmpeg failed for ${relative}, copying WAV (${error.message})`);
      return { buffer: input, extension: ".wav", format: "wav" };
    } finally {
      await fs.rm(temporary, { force: true });
    }
  },
  async svg(input) {
    return { buffer: input, extension: ".svg", format: "svg" };
  },
};
const signature = (kind) =>
  `${PIPELINE_VERSION}:${CHARACTER_PASS_HASH}:${kind}:${
    kind === "texture"
      ? tools.toktx
        ? "toktx"
        : "copy"
      : kind === "audio"
        ? tools.ffmpeg
          ? "ffmpeg-q4"
          : "copy"
        : "-"
  }`;

// ---------------------------------------------------------------------------- inputs
const kitManifest = JSON.parse(await fs.readFile(path.join(KIT, "asset-manifest.json"), "utf8"));
const kitFiles = await walk(KIT);
const jobs = [
  ...kitFiles.filter((f) => /^models\/.+\.glb$/.test(f)).map((source) => ({ source, kind: "glb" })),
  ...kitFiles
    .filter((f) => /^textures\/[^/]+\.png$/.test(f))
    .map((source) => ({ source, kind: "texture" })),
  ...kitFiles
    .filter((f) => /^audio\/.+\.wav$/.test(f))
    .map((source) => ({ source, kind: "audio" })),
  ...kitFiles
    .filter((f) => /^(icons|brand)\/[^/]+\.svg$/.test(f))
    .map((source) => ({ source, kind: "svg" })),
];
const libFiles = (await walk(path.join(LEGACY, "libs"))).map((f) => `libs/${f}`);

let cache = { version: PIPELINE_VERSION, entries: {} };
try {
  const loaded = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));
  if (loaded.version === PIPELINE_VERSION) cache = loaded;
} catch {
  /* cold cache */
}

// --------------------------------------------------------------------------- process
const outputs = new Map(); // source → { url, kind, format, bytes }
const stats = { built: 0, cached: 0, failed: 0 };
await fs.mkdir(OUT, { recursive: true });

async function processJob({ source, kind }) {
  const absolute = path.join(KIT, source);
  try {
    const stat = await fs.stat(absolute);
    const sig = signature(kind);
    const previous = cache.entries[source];
    const quick = previous && previous.size === stat.size && previous.mtimeMs === stat.mtimeMs;
    let input;
    let inputHash = quick ? previous.inputHash : undefined;
    if (!inputHash) {
      input = await fs.readFile(absolute);
      inputHash = sha(input);
    }
    if (
      previous &&
      previous.sig === sig &&
      previous.inputHash === inputHash &&
      existsSync(path.join(OUT, previous.out))
    ) {
      cache.entries[source] = { ...previous, size: stat.size, mtimeMs: stat.mtimeMs };
      outputs.set(source, {
        out: previous.out,
        kind,
        format: previous.format,
        bytes: previous.bytes,
      });
      stats.cached++;
      return;
    }
    input ??= await fs.readFile(absolute);
    if (isLfsPointer(input))
      throw new Error("Git LFS pointer, object not fetched (run `git lfs pull`)");
    const result = await processors[kind](input, absolute, source);
    const out = hashedName(source, sha(result.buffer), result.extension);
    await fs.mkdir(path.dirname(path.join(OUT, out)), { recursive: true });
    await fs.writeFile(path.join(OUT, out), result.buffer);
    const record = { out, format: result.format, bytes: result.buffer.length };
    cache.entries[source] = { ...record, sig, inputHash, size: stat.size, mtimeMs: stat.mtimeMs };
    outputs.set(source, { ...record, kind });
    stats.built++;
  } catch (error) {
    stats.failed++;
    warn(`${source}: ${error.message}`);
  }
}
await pool(jobs, Math.max(2, Math.min(8, os.cpus().length)), processJob);

// Decoder libraries keep their filenames (loaders take a directory); the directory is hashed.
const libGroups = new Map();
for (const file of libFiles) {
  const group = file.split("/")[1];
  libGroups.set(group, [...(libGroups.get(group) ?? []), file]);
}
for (const [group, files] of libGroups) {
  const buffers = await Promise.all(files.map((file) => fs.readFile(path.join(LEGACY, file))));
  const hash = sha(Buffer.concat(buffers.map((b) => Buffer.from(sha(b), "hex")))).slice(0, 10);
  for (const [index, file] of files.entries()) {
    const out = `libs/${group}.${hash}/${path.posix.basename(file)}`;
    const target = path.join(OUT, out);
    if (!existsSync(target)) {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, buffers[index]);
    }
    const extension = path.posix.extname(file).slice(1);
    outputs.set(file, { out, kind: "lib", format: extension, bytes: buffers[index].length });
  }
}

// -------------------------------------------------------------------------- manifest
const legacyKeys = (await walk(LEGACY))
  .filter((file) => /^(geometries|images|audio|fonts)\//.test(file))
  .map((file) => normalizeLegacyKey(file));
const expanded = expandLegacyMap(kitManifest.legacyToAthena, legacyKeys, kitFiles);
for (const { key, source } of expanded.missing) warn(`kit target missing for ${key}: ${source}`);

const fileEntry = (source) => {
  const output = outputs.get(source);
  if (!output) return undefined;
  return {
    url: BASE_URL + output.out,
    kind: output.kind,
    format: output.format,
    bytes: output.bytes,
    source,
  };
};
const entries = {};
for (const source of [...outputs.keys()].sort()) entries[source] = fileEntry(source);
for (const slot of expanded.slots) {
  const base = fileEntry(slot.source);
  if (!base) continue;
  const meta = Object.fromEntries(
    Object.entries(slot).filter(([field]) => field !== "key" && field !== "source"),
  );
  entries[slot.key] = { ...base, ...meta };
}
for (const font of expanded.fonts)
  entries[font.key] = { kind: "font", format: "google-font", description: font.description };

const manifest = {
  version: 1,
  kit: kitManifest.kit,
  base: BASE_URL,
  conventions: kitManifest.conventions,
  tools: { toktx: tools.toktx, ffmpeg: tools.ffmpeg },
  entries,
  notes: expanded.notes,
};
await fs.writeFile(path.join(OUT, MANIFEST_FILE), JSON.stringify(manifest, null, 2) + "\n");

// ---------------------------------------------------------------------------- budget
const bytesOf = (key) => entries[key]?.bytes ?? 0;
// What the surface view fetches before it is playable (src/athena/*). Terrain tiles are not
// loaded: the spherical legacy terrain and its collision stay (docs/MIGRATION.md).
const firstLoadKeys = [
  "slot:avatar/base",
  ...avatarOutfitSources(),
  // Worst case per topic-anchor slot: the largest of its status variants.
  ...Array.from(
    { length: 6 },
    (_, slot) =>
      ["locked", "available", "in_progress", "done"]
        .map((status) => `slot:house/${slot}/${status}`)
        .sort((a, b) => bytesOf(b) - bytesOf(a))[0],
  ),
  ...Object.keys(entries).filter((key) => /^models\/npcs\//.test(key)),
  "new:npc.cat",
  ...Object.keys(entries).filter((key) => /^textures\/(sky-gradient-|clouds-noise-)/.test(key)),
  ...[
    "audio/ambiances/base",
    "audio/music/bgmusic-highq",
    "audio/character/footsteps4",
    "audio/ui/hover2",
    "audio/ui/click2",
    "audio/ui/buttons2",
  ],
];
// Distinct files only (several keys share one GLB).
const firstLoadFiles = new Map();
for (const key of firstLoadKeys) {
  const entry = entries[key];
  if (entry?.url) firstLoadFiles.set(entry.url, { key, bytes: entry.bytes });
}
const groupBytes = (pattern) =>
  Object.entries(entries)
    .filter(([key, entry]) => entry.source === key && pattern.test(key))
    .reduce((sum, [, entry]) => sum + entry.bytes, 0);
const firstLoadBytes = [...firstLoadFiles.values()].reduce((sum, file) => sum + file.bytes, 0);
const totalBytes = [...outputs.values()].reduce((sum, output) => sum + output.bytes, 0);
const sourceBytes = (
  await Promise.all(
    jobs.map(({ source }) =>
      fs.stat(path.join(KIT, source)).then(
        (s) => s.size,
        () => 0,
      ),
    ),
  )
).reduce((sum, size) => sum + size, 0);
const budget = {
  totalBytes,
  sourceBytes,
  byKind: Object.fromEntries(
    ["glb", "texture", "audio", "svg", "lib"].map((kind) => [
      kind,
      [...outputs.values()].filter((o) => o.kind === kind).reduce((sum, o) => sum + o.bytes, 0),
    ]),
  ),
  byGroup: {
    terrain: groupBytes(/^models\/terrain\//),
    buildings: groupBytes(/^models\/buildings\//),
    npcs: groupBytes(/^models\/npcs\//),
    avatar: groupBytes(/^models\/avatar\//),
    space: groupBytes(/^models\/space\//),
  },
  surfaceFirstLoad: {
    bytes: firstLoadBytes,
    budgetBytes: FIRST_LOAD_BUDGET,
    withinBudget: firstLoadBytes <= FIRST_LOAD_BUDGET,
    files: [...firstLoadFiles.entries()].map(([url, file]) => ({ url, ...file })),
  },
  tools: manifest.tools,
};
await fs.writeFile(path.join(OUT, BUDGET_FILE), JSON.stringify(budget, null, 2) + "\n");

// ----------------------------------------------------------------------------- tidy
const keep = new Set([MANIFEST_FILE, BUDGET_FILE, ...[...outputs.values()].map((o) => o.out)]);
for (const file of await walk(OUT))
  if (!keep.has(file)) await fs.rm(path.join(OUT, file), { force: true });
for (const source of Object.keys(cache.entries))
  if (!outputs.has(source)) delete cache.entries[source];
await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
await fs.writeFile(CACHE_FILE, JSON.stringify(cache));

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
console.log(
  [
    `[athena-assets] ${stats.built} built, ${stats.cached} cached, ${stats.failed} failed, ${libFiles.length} libs` +
      ` in ${((Date.now() - started) / 1000).toFixed(1)}s (toktx: ${tools.toktx ? "yes" : "no, PNG"}, ffmpeg: ${tools.ffmpeg ? "yes" : "no, WAV"})`,
    `[athena-assets] manifest: ${Object.keys(entries).length} entries → ${posix(path.relative(process.cwd(), path.join(OUT, MANIFEST_FILE)))}`,
    `[athena-assets] total output ${mb(totalBytes)} (sources ${mb(sourceBytes)}); ` +
      Object.entries(budget.byKind)
        .map(([kind, bytes]) => `${kind} ${mb(bytes)}`)
        .join(", "),
    `[athena-assets] surface first load ${mb(firstLoadBytes)} / ${mb(FIRST_LOAD_BUDGET)} ` +
      `(${firstLoadFiles.size} files) ${budget.surfaceFirstLoad.withinBudget ? "OK" : "OVER BUDGET"}`,
  ].join("\n"),
);
if (STRICT && warnings.length) {
  console.error(`[athena-assets] --strict: ${warnings.length} warning(s)`);
  process.exit(1);
}
