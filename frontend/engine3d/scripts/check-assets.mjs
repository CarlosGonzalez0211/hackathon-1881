#!/usr/bin/env node
// Task 14: fails when the running app requests Messenger assets it should not.
//
//   pnpm check:assets [url…] [--strict]
//
// Opens each page (default: /world and /orbit on http://localhost:3000) in headless
// Chromium (Playwright, installed separately), records every request and classifies it:
//   athena      /athena/… (built Athena kit)                         OK
//   structural  /assets/athena/… listed in src/assets/legacy-allowlist.mjs   OK (fails with --strict)
//   legacy      any other /assets/athena/… request                         FAIL
// A legacy hit whose Athena file was not built (missing Git LFS objects, tool failure) is
// reported as such: build the kit with real LFS objects and re-run.
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeLegacyKey } from "../src/assets/athena-keys.mjs";
import { structuralReason } from "../src/assets/legacy-allowlist.mjs";

const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const strict = args.includes("--strict");
const wait = Number(args.find((arg) => arg.startsWith("--wait="))?.slice(7) ?? 40000);
const pages = args.filter((arg) => !arg.startsWith("--"));
if (!pages.length) pages.push("http://localhost:3000/world", "http://localhost:3000/orbit");

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  // A global Playwright is reachable through NODE_PATH, which only require() honours.
  try {
    ({ chromium } = createRequire(import.meta.url)("playwright"));
  } catch {
    chromium = undefined;
  }
}
if (!chromium) {
  console.error(
    "check:assets needs Playwright (`pnpm dlx playwright install chromium` or a global install) and a running app (`pnpm dev`).",
  );
  process.exit(2);
}

const manifestFile = path.resolve(ENGINE, "../web/public/athena/athena-manifest.runtime.json");
const manifest = JSON.parse(await readFile(manifestFile, "utf8").catch(() => '{"entries":{}}'));
const kit = JSON.parse(
  await readFile(path.join(ENGINE, "athena-assets/asset-manifest.json"), "utf8"),
);
const mapped = new Set(Object.keys(kit.legacyToAthena).map((key) => normalizeLegacyKey(key)));

const browser = await chromium.launch({
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
  ],
});
const seen = new Map();
for (const url of pages) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if (pathname.startsWith("/athena/") || pathname.startsWith("/assets/athena/"))
      seen.set(pathname, url);
  });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(wait);
  await page.close();
}
await browser.close();

const rows = { athena: [], structural: [], legacy: [] };
for (const pathname of [...seen.keys()].sort()) {
  if (pathname.startsWith("/athena/")) {
    rows.athena.push(pathname);
    continue;
  }
  const relative = decodeURIComponent(pathname.replace(/^\/assets\/athena\//, ""));
  const reason = structuralReason(relative);
  if (reason) {
    rows.structural.push(`${relative}  (${reason})`);
    continue;
  }
  const key = normalizeLegacyKey(relative);
  const hint = manifest.entries[key]
    ? "Athena file is built but this request bypassed it"
    : mapped.has(key) || mapped.has(key.replace(/\/[^/]+$/, ""))
      ? "Athena file not built (Git LFS object missing or encoder failed)"
      : "no Athena mapping";
  rows.legacy.push(`${relative}  (${hint})`);
}
const print = (title, list) => {
  console.log(`\n${title}: ${list.length}`);
  for (const line of list) console.log(`  ${line}`);
};
print("Athena", rows.athena.length > 12 ? [...rows.athena.slice(0, 12), "…"] : rows.athena);
print("Structural legacy (allow-listed)", rows.structural);
print("Legacy (not allowed)", rows.legacy);
const failed = rows.legacy.length > 0 || (strict && rows.structural.length > 0);
console.log(
  failed
    ? `\ncheck:assets FAILED${strict ? " (--strict)" : ""}`
    : "\ncheck:assets passed: every non-structural asset comes from /athena/",
);
process.exit(failed ? 1 : 0);
