#!/usr/bin/env node
// Render review: PNG contact sheets of the live world and of individual assets, so an art
// director can judge them (docs/art/ART_DIRECTION.md section 9).
//
//   pnpm --filter @athena/engine3d review:render -- [options]
//   node frontend/engine3d/scripts/render-review.mjs [options]
//
// Options
//   --world                 the 12 world shots of src/village/shots.mjs (?shot=<id> in /world)
//   --assets=<list>         families (buildings, npcs, avatar, props, nature, items, emotes,
//                           vfx, terrain, characters), manifest keys (models/..., slot:house/0/done,
//                           new:npc.cat), bare file names (athena-house-done-v0) or `all`
//                           (every models/** key except models/space/**), comma separated
//   --shots=<id,...>        only these world shots (default all twelve)
//   --yaws=0,90,180,270     turntable angles per asset (default 0,90,180,270)
//   --quality=low|high      quality tier of the world and the viewer (default high)
//   --port=3000             dev server port. Probes http://localhost:<port>/athena/athena-manifest.runtime.json
//                           and, when nothing answers, spawns `next dev --port <port>` (mock mode)
//                           and stops it on exit. Use a port of your own when another session
//                           runs the app: a server on the default port may serve another checkout.
//   --compare=<run-id|latest>  also render side-by-side previous/current sheets (compare-<family>.png)
//   --out=<dir>             output root (default frontend/engine3d/review, git-ignored)
//   --size=1280x720         viewport of every tile (default 1280x720, DPR 1)
//   --clip=<name> [--t=0.5] freeze an embedded clip of animated assets (tile name gets --<clip>)
//   --ref=auto|on|off       avatar silhouette for scale (auto: buildings, props, nature, items,
//                           emotes and NPCs) and --grid=on|off (1 m grid, default on)
//   --skip-build            do not run `build:assets` first (it always runs by default: the web
//                           dev server's predev hook is not used)
//
// Output: <out>/<YYYYMMDD-HHMM>-<sha7>/ with world/<shot>.png, assets/<family>/<id>--y<yaw>[--<clip>].png,
// report.json (per tile: key, KB from the runtime manifest, draw calls, triangles, fps, budget
// verdict from ART_DIRECTION section 6), index.html (world first, then one row per asset),
// contact-world.png, contact-<family>[-n].png (each at most 4000 px tall) and, with --compare,
// compare-<family>.png. The run is copied to <out>/latest.
//
// Determinism: the world is posed by `?shot=` (frozen clock, no input, no quality downgrade);
// the viewer is a fixed camera over a turning model. Chromium runs on SwiftShader, so frames do
// not depend on the GPU. Draw calls and triangles are static counts of the asset (viewer) or
// of one scene pass including shadow casters (world); fps is SwiftShader's and only a trend.
//
// Timings (Windows 11, SwiftShader, quality=high, 1280x720, warm dev server on :3100):
//   --world (12 shots)                  ~70 s total (page load ~5 s, ~4 s per shot, sheet 1 s)
//   --assets=buildings,npcs --yaws=0,180  ~190-250 s for 48 assets / 96 tiles (~2.5 s per tile)
//   --world + both                      ~260 s; build:assets is a no-op when cached (~2 s)
//   A cold first page load on a fresh `next dev` adds 30-60 s of compilation. Posed shots stop
//   rendering once composed, so the screenshot does not compete with the render loop.

import { execFileSync, spawn, spawnSync } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SHOTS } from "../src/village/shots.mjs";

const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO = path.resolve(ENGINE, "../..");
const MANIFEST_FILE = path.join(REPO, "frontend/web/public/athena/athena-manifest.runtime.json");

// ---------------------------------------------------------------------------- arguments
const argv = process.argv.slice(2).filter((arg) => arg !== "--");
const option = (name, fallback) => {
  const inline = argv.find((arg) => arg.startsWith(`--${name}=`));
  if (inline) return inline.slice(name.length + 3);
  const index = argv.indexOf(`--${name}`);
  const next = argv[index + 1];
  if (index >= 0 && next && !next.startsWith("--")) return next;
  return fallback;
};
const flag = (name) => argv.includes(`--${name}`);
const worldWanted = flag("world");
const assetsSpec = option("assets");
const yaws = option("yaws", "0,90,180,270")
  .split(",")
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isFinite(value));
const quality = option("quality", "high");
const port = Number(option("port", "3000"));
const compareWith = option("compare");
const outRoot = path.resolve(option("out", path.join(ENGINE, "review")));
const [width, height] = option("size", "1280x720").split("x").map(Number);
const clip = option("clip");
const onlyShots = option("shots")
  ?.split(",")
  .map((id) => id.trim());
const phase = option("t");
const refMode = option("ref", "auto");
const gridOn = option("grid", "on") !== "off";
if (!worldWanted && !assetsSpec) {
  console.error(
    "render-review: pass --world and/or --assets=<family|key,...> (see the script header).",
  );
  process.exit(2);
}
if (quality !== "low" && quality !== "high") {
  console.error("render-review: --quality must be low or high.");
  process.exit(2);
}
if (!Number.isFinite(port) || !width || !height || !yaws.length) {
  console.error("render-review: invalid --port, --size or --yaws.");
  process.exit(2);
}
const base = `http://localhost:${port}`;

// ---------------------------------------------------------------------------- helpers
const t0 = performance.now();
const timings = {};
const mark = (name, since) => {
  timings[name] = +((performance.now() - since) / 1000).toFixed(1);
  console.log(`[render-review] ${name}: ${timings[name]} s`);
};
const log = (...parts) => console.log("[render-review]", ...parts);
const html = (value) =>
  String(value).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const slug = (value) => value.replace(/[^a-z0-9._-]+/gi, "_").replace(/^_+|_+$/g, "");

async function probe() {
  try {
    const response = await fetch(`${base}/athena/athena-manifest.runtime.json`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

let server;
function stopServer() {
  if (!server) return;
  const { pid } = server;
  server = undefined;
  if (!pid) return;
  try {
    if (process.platform === "win32")
      spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore" });
    else process.kill(-pid, "SIGTERM");
  } catch {
    // Already gone.
  }
}
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    stopServer();
    process.exit(130);
  });
process.on("exit", stopServer);

async function ensureServer() {
  if (await probe()) {
    log(`using the server already answering on :${port}`);
    return false;
  }
  log(`nothing on :${port}; starting next dev (mock mode)`);
  const tail = [];
  server = spawn(
    "pnpm",
    ["--filter", "@athena/web", "exec", "next", "dev", "--port", String(port)],
    {
      cwd: REPO,
      shell: process.platform === "win32",
      detached: process.platform !== "win32",
      env: { ...process.env, NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS ?? "true" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  for (const stream of [server.stdout, server.stderr])
    stream.on("data", (chunk) => {
      tail.push(...String(chunk).split(/\r?\n/).filter(Boolean));
      tail.splice(0, Math.max(0, tail.length - 30));
    });
  let exited = false;
  server.on("exit", () => {
    exited = true;
  });
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    if (await probe()) return true;
    if (exited) break;
    await sleep(1500);
  }
  console.error(tail.join("\n"));
  throw new Error(`the dev server did not come up on :${port}`);
}

// ---------------------------------------------------------------------------- budgets (ART_DIRECTION section 6)
function budgetFor(key) {
  const name = path.basename(key).replace(/\.glb$/, "");
  if (/^athena-house-/.test(name)) return { tris: 6000, kb: 110, rule: "topic house" };
  if (/^athena-building-(school-hall|library|greenhouse|workshop|observatory)$/.test(name))
    return { tris: 8000, kb: 140, rule: "large civic building" };
  if (/^athena-building-/.test(name)) return { tris: 3000, kb: 60, rule: "small civic" };
  if (key.includes("/npcs/")) return { tris: 7000, kb: 60, rule: "character" };
  if (/athena-avatar-base/.test(name)) return { tris: 5000, rule: "avatar base" };
  if (key.includes("/avatar/")) return { tris: 1500, rule: "avatar part" };
  if (/^athena-tree-/.test(name)) return { tris: 360, kb: 40, rule: "tree" };
  if (key.includes("/props/")) return { tris: 1200, kb: 30, rule: "prop" };
  return undefined;
}
function verdict(tile) {
  const budget = budgetFor(tile.key);
  if (!budget) return { budget: null, over: [] };
  const over = [];
  if (budget.tris && tile.triangles > budget.tris)
    over.push(`${tile.triangles} tris > ${budget.tris}`);
  if (budget.kb && tile.kb > budget.kb) over.push(`${tile.kb} KB > ${budget.kb}`);
  return { budget: budget.rule, over };
}

// ---------------------------------------------------------------------------- Playwright
async function loadPlaywright() {
  try {
    return (await import("playwright")).chromium;
  } catch {
    try {
      return createRequire(import.meta.url)("playwright").chromium;
    } catch {
      return undefined;
    }
  }
}
const HIDE = [
  ".world-controls",
  ".world-footer",
  ".runtime-note",
  ".presenter-controls",
  ".planet-label",
  ".topic-panel",
  ".skip-link",
  ".village-touch-controls",
  ".village-interaction-hint",
  ".village-waypoint",
  ".house-markers",
  ".dev-asset-caption",
  "nextjs-portal",
].join(",");
const HIDE_CSS = `${HIDE}{display:none !important}.world-app>:not(.village-scene){visibility:hidden !important}`;

async function openPage(browser, url, selectorReady) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const problems = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console: ${message.text().slice(0, 300)}`);
  });
  page.on("pageerror", (error) =>
    problems.push(`pageerror: ${String(error.message).slice(0, 300)}`),
  );
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 240_000 });
  await page.addStyleTag({ content: HIDE_CSS });
  await page.waitForSelector(selectorReady, { state: "attached", timeout: 300_000 });
  try {
    await page.waitForFunction(() => !!window.__athenaShot, null, { timeout: 30_000 });
  } catch {
    throw new Error(
      `${url} rendered no render-review hook (window.__athenaShot). The server on :${port} is probably another checkout; pass --port with a server of this worktree.`,
    );
  }
  return { page, problems };
}
// A page that is reloaded or whose engine is torn down mid-run (dev server hot reload, a crash)
// is reopened and the tile retried, so one flaky frame does not sink a long run.
async function liveSession(browser, url) {
  const lists = [];
  let page;
  const open = async () => {
    await page?.close().catch(() => {});
    const opened = await openPage(browser, url, "canvas");
    page = opened.page;
    lists.push(opened.problems);
  };
  await open();
  return {
    async run(task) {
      for (let attempt = 0; ; attempt++) {
        try {
          return await task(page);
        } catch (error) {
          if (attempt >= 2) throw error;
          log(`retrying after: ${String(error.message).split(/\r?\n/)[0]}`);
          await open();
        }
      }
    },
    errors: () => lists.flat(),
    close: () => page?.close().catch(() => {}),
  };
}
// Evaluate in page: re-pose and wait for three composed frames (with a guard against hangs).
const goInPage = (page, target) =>
  page.evaluate(async (arg) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("pose timeout (120 s)")), 120_000),
    );
    await Promise.race([window.__athenaShot.go(arg), timeout]);
    return window.__athenaShot.stats();
  }, target);

// ---------------------------------------------------------------------------- run
const sha = (() => {
  try {
    return execFileSync("git", ["rev-parse", "--short=7", "HEAD"], {
      cwd: REPO,
      encoding: "utf8",
    }).trim();
  } catch {
    return "nogit000".slice(0, 7);
  }
})();
const dirty = (() => {
  try {
    return (
      execFileSync("git", ["status", "--porcelain"], { cwd: REPO, encoding: "utf8" }).trim() !== ""
    );
  } catch {
    return false;
  }
})();
const stamp = (() => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
})();
const runId = `${stamp}-${sha}`;
const runDir = path.join(outRoot, runId);

// Resolve --compare before `latest` is overwritten at the end.
let compareId;
if (compareWith) {
  if (compareWith === "latest") {
    const previous = JSON.parse(
      await readFile(path.join(outRoot, "latest", "report.json"), "utf8").catch(() => "null"),
    );
    compareId = previous?.run;
  } else compareId = compareWith;
  if (!compareId || !(await readdir(path.join(outRoot, compareId)).catch(() => null))) {
    console.error(`render-review: no earlier run "${compareWith}" under ${outRoot}`);
    process.exit(2);
  }
}

const chromium = await loadPlaywright();
if (!chromium) {
  console.error(
    "render-review needs Playwright (root devDependency; `pnpm exec playwright install chromium` fetches the browser).",
  );
  process.exit(2);
}

if (!flag("skip-build")) {
  const started = performance.now();
  log("building the Athena assets (build:assets)");
  const built = spawnSync("pnpm", ["--filter", "@athena/engine3d", "build:assets"], {
    cwd: REPO,
    shell: process.platform === "win32",
    stdio: "inherit",
  });
  if (built.status !== 0) {
    console.error("render-review: build:assets failed");
    process.exit(1);
  }
  mark("build:assets", started);
}
const manifest = JSON.parse(await readFile(MANIFEST_FILE, "utf8"));
const kbOf = (key) => {
  const entry = manifest.entries[key];
  return entry?.bytes ? +(entry.bytes / 1024).toFixed(1) : null;
};

// Which assets to render.
const modelKeys = Object.keys(manifest.entries)
  .filter((key) => key.startsWith("models/") && key.endsWith(".glb"))
  .sort();
const families = new Set(modelKeys.map((key) => key.split("/")[1]));
function expandAssets(spec) {
  const out = [];
  for (const token of spec
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)) {
    if (token === "all") out.push(...modelKeys.filter((key) => !key.startsWith("models/space/")));
    else if (families.has(token))
      out.push(...modelKeys.filter((key) => key.startsWith(`models/${token}/`)));
    else if (manifest.entries[token]) out.push(token);
    else {
      const named = modelKeys.filter((key) => {
        const name = path.basename(key, ".glb");
        return name === token || name === `athena-${token}`;
      });
      if (named.length) out.push(...named);
      else console.warn(`render-review: no asset matches "${token}"`);
    }
  }
  return [...new Set(out)];
}
const assetKeys = assetsSpec ? expandAssets(assetsSpec) : [];
if (assetsSpec && !assetKeys.length) {
  console.error("render-review: --assets matched nothing");
  process.exit(2);
}
const familyOf = (key) =>
  key.startsWith("models/") ? key.split("/")[1] : key.split(":")[0] === "slot" ? "slot" : "new";
const withRef = (family) =>
  refMode === "on" ||
  (refMode === "auto" &&
    ["buildings", "props", "nature", "items", "emotes", "npcs", "slot", "new"].includes(family));
const elevationOf = (family) => (family === "buildings" || family === "terrain" ? 20 : 14);
const idOf = (key) => slug(key.startsWith("models/") ? path.basename(key, ".glb") : key);

await mkdir(runDir, { recursive: true });
let spawned = false;
const tiles = [];
const worldTiles = [];
const problems = [];
const consoleErrors = [];
let browser;
try {
  const serverStarted = performance.now();
  spawned = await ensureServer();
  mark(spawned ? "server start" : "server probe", serverStarted);

  browser = await chromium.launch({
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--ignore-gpu-blocklist",
    ],
  });

  // ------------------------------------------------------------------ world
  if (worldWanted) {
    const started = performance.now();
    await mkdir(path.join(runDir, "world"), { recursive: true });
    const list = onlyShots ? SHOTS.filter((shot) => onlyShots.includes(shot.id)) : SHOTS;
    const first = list[0].id;
    const live = await liveSession(browser, `${base}/world?shot=${first}&quality=${quality}`);
    mark("world load", started);
    for (const shot of list) {
      const shotStarted = performance.now();
      try {
        const file = `world/${shot.id}.png`;
        const stats = await live.run(async (page) => {
          const result = await goInPage(page, shot.id);
          await page.waitForSelector(`canvas[data-athena-shot="${shot.id}"]`, { timeout: 30_000 });
          await page.screenshot({ path: path.join(runDir, file) });
          return result;
        });
        worldTiles.push({
          section: "world",
          id: shot.id,
          key: `shot:${shot.id}`,
          file,
          drawCalls: stats.drawCalls,
          triangles: stats.triangles,
          fps: +stats.fps.toFixed(1),
        });
        log(
          `world/${shot.id}  ${stats.drawCalls} draws  ${stats.triangles} tris  ${((performance.now() - shotStarted) / 1000).toFixed(1)} s`,
        );
      } catch (error) {
        problems.push(`world/${shot.id}: ${error.message}`);
        console.error(`world/${shot.id} failed: ${error.message}`);
      }
    }
    consoleErrors.push(...live.errors().map((line) => `world page ${line}`));
    await live.close();
    mark("world", started);
  }

  // ------------------------------------------------------------------ assets
  if (assetKeys.length) {
    const started = performance.now();
    const initial = assetKeys[0];
    const live = await liveSession(
      browser,
      `${base}/dev/asset?key=${encodeURIComponent(initial)}&quality=${quality}`,
    );
    mark("viewer load", started);
    for (const key of assetKeys) {
      const family = familyOf(key);
      await mkdir(path.join(runDir, "assets", family), { recursive: true });
      for (const yaw of yaws) {
        const id = idOf(key);
        const file = `assets/${family}/${id}--y${yaw}${clip ? `--${slug(clip)}` : ""}.png`;
        try {
          const stats = await live.run(async (page) => {
            const result = await goInPage(page, {
              key,
              yaw,
              elev: elevationOf(family),
              fit: 1,
              grid: gridOn,
              ref: withRef(family),
              clip,
              t: phase === undefined ? undefined : Number(phase),
            });
            await page.waitForSelector("canvas[data-athena-shot]", { timeout: 30_000 });
            await page.screenshot({ path: path.join(runDir, file) });
            return result;
          });
          const tile = {
            section: family,
            id,
            key,
            yaw,
            clip: clip ?? null,
            file,
            kb: kbOf(key),
            drawCalls: stats.drawCalls,
            triangles: stats.triangles,
            meshes: stats.meshes,
            materials: stats.materials,
            size: stats.size,
            scale: stats.scale,
            clips: stats.clips,
            fps: stats.fps,
          };
          Object.assign(tile, verdict(tile));
          tiles.push(tile);
        } catch (error) {
          problems.push(`${key} y${yaw}: ${error.message}`);
          console.error(`${key} y${yaw} failed: ${error.message}`);
        }
      }
      const last = tiles.findLast((tile) => tile.key === key);
      if (last)
        log(
          `${key}  ${last.triangles} tris  ${last.drawCalls} draws  ${last.kb ?? "?"} KB${last.over?.length ? "  OVER: " + last.over.join("; ") : ""}`,
        );
    }
    consoleErrors.push(...live.errors().map((line) => `viewer page ${line}`));
    await live.close();
    mark("assets", started);
  }

  // ------------------------------------------------------------------ report + sheets
  const report = {
    run: runId,
    sha,
    dirty,
    when: new Date().toISOString(),
    quality,
    size: [width, height],
    port,
    serverSpawned: spawned,
    yaws,
    world: worldTiles,
    tiles,
    overBudget: tiles
      .filter((tile) => tile.over?.length)
      .map((tile) => ({ key: tile.key, over: tile.over })),
    problems,
    consoleErrors: consoleErrors.slice(0, 40),
    timings,
  };
  report.overBudget = [...new Map(report.overBudget.map((item) => [item.key, item])).values()];
  await writeFile(path.join(runDir, "report.json"), JSON.stringify(report, null, 2));

  // Group the tiles into the rows of the sheets.
  const byAsset = new Map();
  for (const tile of tiles) {
    const row = byAsset.get(tile.key) ?? { ...tile, tiles: [] };
    row.tiles.push(tile);
    byAsset.set(tile.key, row);
  }
  const familyRows = new Map();
  for (const row of byAsset.values()) {
    const list = familyRows.get(row.section) ?? [];
    list.push(row);
    familyRows.set(row.section, list);
  }
  const SHEET_WIDTH = 1400,
    CAPTION = 220,
    ROWS_PER_SHEET = 15;
  const tileWidth = Math.max(
    140,
    Math.min(360, Math.floor((SHEET_WIDTH - CAPTION - 40) / yaws.length)),
  );
  const tileHeight = Math.round((tileWidth * height) / width);
  const sheets = [];
  if (worldTiles.length)
    sheets.push({ name: "world", title: `World shots (${quality})`, world: worldTiles });
  for (const [family, rows] of [...familyRows].sort(([a], [b]) => a.localeCompare(b)))
    for (let i = 0; i < rows.length; i += ROWS_PER_SHEET) {
      const part = Math.floor(i / ROWS_PER_SHEET) + 1;
      const parts = Math.ceil(rows.length / ROWS_PER_SHEET);
      sheets.push({
        name: parts > 1 ? `${family}-${part}` : family,
        title: parts > 1 ? `${family} (${part}/${parts})` : family,
        rows: rows.slice(i, i + ROWS_PER_SHEET),
      });
    }
  const sheetHtml = (sheet) => {
    if (sheet.world) {
      const w = 330,
        h = Math.round((w * height) / width);
      return `<section class="sheet" id="sheet-${html(sheet.name)}"><h2>${html(sheet.title)}</h2><div class="world">${sheet.world
        .map(
          (tile) =>
            `<figure><img src="${html(tile.file)}" width="${w}" height="${h}" alt="${html(tile.id)}"><figcaption><b>${html(tile.id)}</b> ${tile.drawCalls} draws · ${tile.triangles.toLocaleString("en")} tris</figcaption></figure>`,
        )
        .join("")}</div></section>`;
    }
    return `<section class="sheet" id="sheet-${html(sheet.name)}"><h2>${html(sheet.title)}</h2>${sheet.rows
      .map((row) => {
        const flag = row.over?.length ? ` class="over"` : "";
        return `<div class="row"><div class="caption"><b>${html(row.id)}</b><span${flag}>${row.triangles.toLocaleString("en")} tris</span><span>${row.drawCalls} draws · ${row.kb ?? "?"} KB</span><span class="dim">${row.size.join(" × ")} m${row.budget ? ` · ${html(row.budget)}` : ""}</span>${row.over?.length ? `<span class="over">${html(row.over.join("; "))}</span>` : ""}</div>${row.tiles
          .map(
            (tile) =>
              `<img src="${html(tile.file)}" width="${tileWidth}" height="${tileHeight}" alt="${html(tile.id)} y${tile.yaw}" title="yaw ${tile.yaw}">`,
          )
          .join("")}</div>`;
      })
      .join("")}</section>`;
  };
  const STYLE = `
    body{margin:0;background:#efe6d3;color:#2a2a2a;font:13px/1.35 system-ui,sans-serif}
    header{padding:14px 16px;width:${SHEET_WIDTH}px;box-sizing:border-box}
    h1{font-size:18px;margin:0 0 4px}h2{font-size:15px;margin:0 0 10px;text-transform:capitalize}
    .sheet{width:${SHEET_WIDTH}px;box-sizing:border-box;padding:14px 16px;background:#efe6d3}
    .world{display:flex;flex-wrap:wrap;gap:10px}.world figure{margin:0}.world img{display:block;border:1px solid #cfc3a8}
    figcaption{font-size:12px}
    .row{display:flex;align-items:center;gap:6px;margin-bottom:8px}
    .row img{display:block;border:1px solid #cfc3a8;background:#fff}
    .caption{width:${CAPTION}px;flex:none;display:flex;flex-direction:column;gap:1px;padding-right:6px}
    .caption b{font-size:12px;word-break:break-all}.dim{color:#7a705d;font-size:11px}
    .over{color:#b3261e;font-weight:600}
    .pair{display:flex;gap:2px}.pair img{display:block}.tag{color:#7a705d;font-size:11px}
  `;
  const meta = `<p>${html(runId)}${dirty ? " (uncommitted changes)" : ""} · ${html(quality)} quality · ${width}×${height} · ${tiles.length} asset tiles, ${worldTiles.length} world shots${report.overBudget.length ? ` · <span class="over">${report.overBudget.length} over budget</span>` : ""}${problems.length ? ` · <span class="over">${problems.length} problems</span>` : ""}</p>`;
  const index = `<!doctype html><meta charset="utf-8"><title>Athena render review ${html(runId)}</title><style>${STYLE}</style><header><h1>Athena render review</h1>${meta}</header>${sheets.map(sheetHtml).join("")}`;
  await writeFile(path.join(runDir, "index.html"), index);

  // ------------------------------------------------------------------ compare page
  let compareHtml;
  const compareSheets = [];
  if (compareId) {
    const prevReport = JSON.parse(
      await readFile(path.join(outRoot, compareId, "report.json"), "utf8"),
    );
    const rel = (file) => `../${compareId}/${file}`;
    const pairWidth = Math.max(70, Math.floor(tileWidth / 2));
    const pairHeight = Math.round((pairWidth * height) / width);
    if (worldTiles.length) {
      const pairs = worldTiles
        .map((tile) => {
          const before = prevReport.world?.find((item) => item.id === tile.id);
          const w = 330,
            h = Math.round((w * height) / width);
          return `<figure style="margin:0"><div class="pair">${before ? `<img src="${html(rel(before.file))}" width="${w}" height="${h}">` : `<span class="tag">new</span>`}<img src="${html(tile.file)}" width="${w}" height="${h}"></div><figcaption><b>${html(tile.id)}</b> before | after</figcaption></figure>`;
        })
        .join("");
      compareSheets.push({
        name: "world",
        html: `<section class="sheet" id="cmp-world"><h2>World: ${html(compareId)} | ${html(runId)}</h2><div class="world" style="gap:10px">${pairs}</div></section>`,
      });
    }
    for (const [family, rows] of [...familyRows].sort(([a], [b]) => a.localeCompare(b)))
      for (let i = 0; i < rows.length; i += ROWS_PER_SHEET) {
        const part = Math.floor(i / ROWS_PER_SHEET) + 1;
        const total = Math.ceil(rows.length / ROWS_PER_SHEET);
        const body = rows
          .slice(i, i + ROWS_PER_SHEET)
          .map((row) => {
            const was = prevReport.tiles?.filter((tile) => tile.key === row.key) ?? [];
            const delta = was[0]
              ? `${row.triangles - was[0].triangles >= 0 ? "+" : ""}${row.triangles - was[0].triangles} tris`
              : "new";
            return `<div class="row"><div class="caption"><b>${html(row.id)}</b><span>${delta}</span><span class="dim">before | after</span></div>${row.tiles
              .map((tile) => {
                const before = was.find((item) => item.yaw === tile.yaw && item.clip === tile.clip);
                return `<div class="pair">${before ? `<img src="${html(rel(before.file))}" width="${pairWidth}" height="${pairHeight}">` : `<span class="tag" style="width:${pairWidth}px">new</span>`}<img src="${html(tile.file)}" width="${pairWidth}" height="${pairHeight}"></div>`;
              })
              .join("")}</div>`;
          })
          .join("");
        compareSheets.push({
          name: total > 1 ? `${family}-${part}` : family,
          html: `<section class="sheet" id="cmp-${html(family)}-${part}"><h2>${html(family)}${total > 1 ? ` (${part}/${total})` : ""}: ${html(compareId)} | ${html(runId)}</h2>${body}</section>`,
        });
      }
    compareHtml = `<!doctype html><meta charset="utf-8"><title>Compare ${html(compareId)} to ${html(runId)}</title><style>${STYLE}</style>${compareSheets.map((sheet) => sheet.html).join("")}`;
    await writeFile(path.join(runDir, "compare.html"), compareHtml);
  }

  // Contact sheets: load the pages in the same browser and shoot each sheet element.
  const sheetsStarted = performance.now();
  const sheetPage = await browser.newPage({
    viewport: { width: SHEET_WIDTH, height: 900 },
    deviceScaleFactor: 1,
  });
  const shoot = async (file, selectorOf, names, prefix) => {
    await sheetPage.goto(pathToFileURL(path.join(runDir, file)).href, { waitUntil: "load" });
    await sheetPage.evaluate(() =>
      Promise.all(
        [...document.images].map((img) =>
          img.complete
            ? 0
            : new Promise((resolve) => {
                img.onload = img.onerror = resolve;
              }),
        ),
      ),
    );
    for (const name of names) {
      const target = sheetPage.locator(selectorOf(name));
      await target.screenshot({
        path: path.join(runDir, `${prefix}${name === "world" ? "world" : name}.png`),
      });
    }
  };
  await shoot(
    "index.html",
    (name) => `#sheet-${name}`,
    sheets.map((sheet) => sheet.name),
    "contact-",
  );
  if (compareHtml) {
    for (const sheet of compareSheets) {
      await sheetPage.goto(pathToFileURL(path.join(runDir, "compare.html")).href, {
        waitUntil: "load",
      });
      await sheetPage.evaluate(() =>
        Promise.all(
          [...document.images].map((img) =>
            img.complete
              ? 0
              : new Promise((resolve) => {
                  img.onload = img.onerror = resolve;
                }),
          ),
        ),
      );
      const id = sheet.html.match(/id="(cmp-[^"]+)"/)[1];
      await sheetPage
        .locator(`#${id}`)
        .screenshot({ path: path.join(runDir, `compare-${sheet.name}.png`) });
    }
  }
  await sheetPage.close();
  mark("sheets", sheetsStarted);

  // review/latest is a plain copy of the newest run.
  await rm(path.join(outRoot, "latest"), { recursive: true, force: true });
  await cp(runDir, path.join(outRoot, "latest"), { recursive: true });
  timings.total = +((performance.now() - t0) / 1000).toFixed(1);
  report.timings = timings;
  await writeFile(path.join(runDir, "report.json"), JSON.stringify(report, null, 2));
  await writeFile(path.join(outRoot, "latest", "report.json"), JSON.stringify(report, null, 2));

  log(`done in ${timings.total} s -> ${runDir}`);
  log(`latest: ${path.join(outRoot, "latest")}`);
  if (report.overBudget.length)
    log(
      `over budget: ${report.overBudget.map((item) => `${path.basename(item.key)} (${item.over.join("; ")})`).join(", ")}`,
    );
  if (consoleErrors.length) {
    log(`${consoleErrors.length} browser console errors (see report.json), first:`);
    for (const line of consoleErrors.slice(0, 5)) log("  " + line);
  }
  if (problems.length) {
    console.error(`render-review: ${problems.length} tiles failed`);
    for (const line of problems.slice(0, 20)) console.error("  " + line);
    process.exitCode = 1;
  }
} finally {
  await browser?.close().catch(() => {});
  stopServer();
}
