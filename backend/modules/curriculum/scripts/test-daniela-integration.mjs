import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readdirSync, realpathSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Fetch explicitly before running; use a pinned resolved revision for this entire run.
const root = fileURLToPath(new URL("../../../../", import.meta.url));
const ref = process.argv[2] ?? "origin/feat/learning-policy-freeze";
const run = (command, args, options = {}) =>
  execFileSync(command, args, { cwd: root, stdio: "inherit", ...options });
const sha = run("git", ["rev-parse", "--verify", `${ref}^{commit}`], { stdio: "pipe" })
  .toString()
  .trim();
const checkout = mkdtempSync(join(tmpdir(), "athena-daniela-integration-"));
try {
  console.log(`Testing Daniela ${ref} at ${sha}`);
  run("pnpm", ["--filter", "@athena/curriculum...", "build"]);
  const archive = run(
    "git",
    ["archive", sha, "shared", "backend/modules/learning", "tsconfig.base.json"],
    { stdio: "pipe" },
  );
  run("tar", ["-xf", "-", "-C", checkout], {
    input: archive,
    stdio: ["pipe", "inherit", "inherit"],
  });
  const dependencies = join(checkout, "node_modules");
  mkdirSync(join(dependencies, "@athena"), { recursive: true });
  const linked = new Set();
  for (const source of [
    "node_modules",
    "backend/api/node_modules",
    "backend/modules/learning/node_modules",
  ]) {
    for (const entry of readdirSync(resolve(root, source))) {
      if (entry.startsWith(".") || entry === "@athena" || linked.has(entry)) continue;
      symlinkSync(realpathSync(resolve(root, source, entry)), join(dependencies, entry), "dir");
      linked.add(entry);
    }
  }
  symlinkSync(join(checkout, "shared"), join(dependencies, "@athena/shared"), "dir");
  symlinkSync(
    resolve(root, "backend/modules/platform"),
    join(dependencies, "@athena/platform"),
    "dir",
  );
  const tsc = resolve(root, "node_modules/typescript/bin/tsc");
  run(process.execPath, [tsc, "-p", join(checkout, "shared/tsconfig.json")]);
  run(process.execPath, [tsc, "-p", join(checkout, "backend/modules/learning/tsconfig.json")]);
  run(
    "pnpm",
    [
      "--filter",
      "@athena/api",
      "exec",
      "tsx",
      "--test",
      resolve(root, "backend/modules/curriculum/tests/daniela-service.integration.mjs"),
    ],
    {
      env: { ...process.env, DANIELA_INTEGRATION_CHECKOUT: checkout, DANIELA_INTEGRATION_SHA: sha },
    },
  );
} finally {
  rmSync(checkout, { recursive: true, force: true });
}
