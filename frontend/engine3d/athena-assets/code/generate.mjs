#!/usr/bin/env node
/**
 * Headless kit generator (Node 22, no DOM). Builds every registry entry with the npm `three`
 * and the sculpting toolkit, exports binary GLB and writes a gitignored cache that
 * `scripts/build-athena-assets.mjs` overlays on the committed (Git LFS) kit, file by file.
 *
 *   node athena-assets/code/generate.mjs [--only=spike,house-done-v0] [--out=<dir>] [--list] [--force]
 *
 *   --only   comma list of family names, entry ids or file names (default: everything)
 *   --out    cache directory (default frontend/engine3d/.kit-cache)
 *   --list   print the registry with fresh / stale / missing status and exit
 *   --force  rebuild the selected entries even when their hash matches
 *   --quiet  print nothing when the cache is already fresh (used by the asset build)
 *
 * The default cache directory can also be set with ATHENA_KIT_CACHE.
 *
 * Output: `<out>/models/<family>/<file>.glb` and `<out>/kit-cache.json`:
 *   { version, three, codeHash, entries: { <id>: { family, file, hash, bytes } } }
 * `codeHash` covers every file under athena-assets/code (except markdown). An entry's `hash`
 * covers the toolkit (sculpt/**, generate.mjs, registry.mjs), its own family module, its id and
 * the three version, so editing one family only rebuilds that family. A fresh cache exits
 * without importing three.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CODE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE = path.resolve(CODE, "..", "..");
const CACHE_VERSION = 1;
const sha = (data) => createHash("sha256").update(data).digest("hex");
const rel = (p) => path.relative(CODE, p).split(path.sep).join("/");

function parseArgs(argv) {
  const args = {
    only: [],
    out: process.env.ATHENA_KIT_CACHE
      ? path.resolve(process.env.ATHENA_KIT_CACHE)
      : path.join(ENGINE, ".kit-cache"),
    list: false,
    force: false,
    quiet: false,
  };
  for (const arg of argv) {
    if (arg === "--list") args.list = true;
    else if (arg === "--force") args.force = true;
    else if (arg === "--quiet") args.quiet = true;
    else if (arg.startsWith("--only="))
      args.only = arg
        .slice(7)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    else if (arg.startsWith("--out=")) args.out = path.resolve(process.cwd(), arg.slice(6));
    else {
      console.error(`[kit] unknown argument: ${arg}`);
      process.exit(2);
    }
  }
  return args;
}

async function walk(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files.sort();
}

async function hashFiles(files) {
  const hash = createHash("sha256");
  for (const file of files) hash.update(rel(file)).update(await fs.readFile(file));
  return hash.digest("hex");
}

async function threeVersion() {
  const entry = fileURLToPath(import.meta.resolve("three"));
  const pkg = path.join(path.dirname(entry), "..", "package.json");
  return JSON.parse(await fs.readFile(pkg, "utf8")).version;
}

const args = parseArgs(process.argv.slice(2));
const started = Date.now();

const { entries } = await import("./registry.mjs");
const ids = new Set();
for (const entry of entries) {
  if (ids.has(entry.id)) throw new Error(`duplicate registry id: ${entry.id}`);
  ids.add(entry.id);
}
const selected = args.only.length
  ? entries.filter((e) =>
      args.only.some(
        (key) => key === e.id || key === e.family || key === e.file || `${key}.glb` === e.file,
      ),
    )
  : entries;
if (args.only.length && !selected.length) {
  console.error(`[kit] --only matched nothing (${args.only.join(", ")}); try --list`);
  process.exit(2);
}

const allCode = (await walk(CODE)).filter((f) => !/\.md$/i.test(f));
const toolkit = await hashFiles(
  allCode.filter((f) => /^(sculpt\/|generate\.mjs$|registry\.mjs$)/.test(rel(f))),
);
const version = await threeVersion();
const familyHash = new Map();
async function hashOf(entry) {
  if (!familyHash.has(entry.family)) {
    const file = path.join(CODE, "families", `${entry.family}.mjs`);
    familyHash.set(entry.family, existsSync(file) ? sha(await fs.readFile(file)) : "none");
  }
  return sha([toolkit, familyHash.get(entry.family), entry.id, entry.file, version].join("|"));
}

const cacheFile = path.join(args.out, "kit-cache.json");
let cache = { version: CACHE_VERSION, three: version, codeHash: "", entries: {} };
try {
  const loaded = JSON.parse(await fs.readFile(cacheFile, "utf8"));
  if (loaded.version === CACHE_VERSION) cache = loaded;
} catch {
  /* cold cache */
}
const outputOf = (entry) => path.join(args.out, "models", entry.family, entry.file);
async function statusOf(entry) {
  const hash = await hashOf(entry);
  const recorded = cache.entries[entry.id];
  const file = outputOf(entry);
  if (!existsSync(file)) return { hash, status: "missing" };
  return { hash, status: recorded?.hash === hash ? "fresh" : "stale" };
}

if (args.list) {
  for (const entry of entries) {
    const { status, hash } = await statusOf(entry);
    console.log(
      `${entry.id.padEnd(24)} ${entry.family.padEnd(10)} ${entry.file.padEnd(36)} ${status.padEnd(8)} ${hash.slice(0, 10)}`,
    );
  }
  console.log(`[kit] ${entries.length} entries, cache ${args.out}`);
  process.exit(0);
}

const todo = [];
for (const entry of selected) {
  const { hash, status } = await statusOf(entry);
  if (args.force || status !== "fresh") todo.push({ entry, hash });
}

let failures = 0;
if (todo.length) {
  const THREE = await import("three");
  const { createTools } = await import("./sculpt/index.mjs");
  const { exportGlb, finalizeGlb } = await import("./sculpt/export.mjs");
  await fs.mkdir(args.out, { recursive: true });
  for (const { entry, hash } of todo) {
    const t0 = Date.now();
    try {
      const tools = createTools(THREE); // fresh material cache per model
      const result = await entry.build(THREE, tools, {});
      let glb = await exportGlb(result.root, result.clips ?? [], { extras: result.extras });
      glb = await finalizeGlb(glb, { extras: result.extras, textures: result.textures });
      const target = outputOf(entry);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(`${target}.tmp`, glb);
      await fs.rename(`${target}.tmp`, target);
      cache.entries[entry.id] = { family: entry.family, file: entry.file, hash, bytes: glb.length };
      console.log(
        `[kit] built ${entry.id.padEnd(20)} ${(glb.length / 1024).toFixed(1).padStart(7)} KB ${String(Date.now() - t0).padStart(6)} ms`,
      );
    } catch (error) {
      failures++;
      console.error(`[kit] FAILED ${entry.id}: ${error.stack ?? error}`);
    }
  }
}

// A full run also drops entries (and files) the registry no longer has.
if (!args.only.length)
  for (const [id, record] of Object.entries(cache.entries))
    if (!ids.has(id)) {
      await fs.rm(path.join(args.out, "models", record.family, record.file), { force: true });
      delete cache.entries[id];
    }
cache.three = version;
cache.codeHash = await hashFiles(allCode);
if (todo.length || !existsSync(cacheFile)) {
  await fs.mkdir(args.out, { recursive: true });
  await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2) + "\n");
}
if (todo.length || failures || !args.quiet)
  console.log(
    `[kit] ${todo.length} built, ${selected.length - todo.length} fresh, ${failures} failed in ${((Date.now() - started) / 1000).toFixed(2)}s -> ${path.relative(process.cwd(), args.out) || "."}`,
  );
if (failures) process.exit(1);
