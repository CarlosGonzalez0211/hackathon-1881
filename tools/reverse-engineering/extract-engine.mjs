/**
 * Recover executable modules from the preserved shipped artifact, without eval.
 * Each top-level binding gets a source module. A scoped registry preserves the
 * original live bindings and statement order across cyclic legacy subsystems.
 * Hoisted functions are registered before ordered initializers run.
 */
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import generateModule from "@babel/generator";
import * as t from "@babel/types";
import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const traverse = traverseModule.default || traverseModule;
const generate = generateModule.default || generateModule;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = "references/messenger/dist/assets/App3D-DwM1eiaC.js";
const original = await readFile(path.join(root, sourcePath), "utf8");
// URL edits are explicit and reproducible. Shader strings are otherwise intact.
const source = original
  .replaceAll("/assets/", "/assets/athena/")
  .replaceAll('mode:"closed"', 'mode:"open"');
const ast = parse(source, { sourceType: "module" });
const output = path.join(root, "frontend/engine3d/src/extracted");
await mkdir(output, { recursive: true });
// Only this generator-owned subtree is replaced. Check the resolved boundary.
if (!output.endsWith(path.join("engine3d", "src", "extracted"))) throw Error("Unsafe output");
for (const entry of await readdir(output)) {
  await rm(path.join(output, entry), { recursive: true, force: true });
}
let programPath;
traverse(ast, {
  Program(p) {
    programPath = p;
  },
});
const programBindings = new Map(Object.entries(programPath.scope.bindings));
const lifecycleGlobals = new Set([
  "setTimeout",
  "clearTimeout",
  "setInterval",
  "clearInterval",
  "requestAnimationFrame",
  "cancelAnimationFrame",
]);
const member = (name) => t.memberExpression(t.identifier("scope"), t.identifier(name));
const lifecycle = (name) => t.memberExpression(member("__lifecycle"), t.identifier(name));

// Capture source-level references before declarations move into factory scopes.
traverse(ast, {
  Function(p) {
    // This function is serialized into an isolated Blob worker, not executed
    // in the module registry. Its browser globals must remain worker globals.
    const parent = p.parentPath;
    if (
      parent.isAssignmentExpression() &&
      t.isMemberExpression(parent.node.left) &&
      t.isIdentifier(parent.node.left.property, { name: "BasisWorker" })
    )
      p.skip();
  },
  CallExpression(p) {
    const callee = p.node.callee;
    if (!t.isMemberExpression(callee) || callee.computed) return;
    if (
      t.isIdentifier(callee.property, { name: "addEventListener" }) ||
      t.isIdentifier(callee.property, { name: "removeEventListener" })
    ) {
      const target = t.cloneNode(callee.object);
      p.node.callee = lifecycle(
        callee.property.name === "addEventListener" ? "listen" : "unlisten",
      );
      p.node.arguments.unshift(target);
    }
  },
  NewExpression: {
    exit(p) {
      if (t.isIdentifier(p.node.callee, { name: "Worker" }) && !p.scope.getBinding("Worker")) {
        p.replaceWith(t.callExpression(lifecycle("trackWorker"), [t.cloneNode(p.node, true)]));
        p.skip();
      }
    },
  },
  MemberExpression(p) {
    if (
      !p.node.computed &&
      t.isIdentifier(p.node.object, { name: "window" }) &&
      !p.scope.getBinding("window") &&
      t.isIdentifier(p.node.property) &&
      lifecycleGlobals.has(p.node.property.name)
    )
      p.replaceWith(lifecycle(p.node.property.name));
  },
  Identifier(p) {
    if (p.node.name === "scope") return;
    const binding = p.scope.getBinding(p.node.name);
    const programBinding = programBindings.get(p.node.name);
    const assignment =
      (p.parentPath.isAssignmentExpression() && p.key === "left") ||
      (p.parentPath.isUpdateExpression() && p.key === "argument") ||
      ((p.parentPath.isForInStatement() || p.parentPath.isForOfStatement()) && p.key === "left");
    if (!p.isReferencedIdentifier() && !assignment) return;
    if (!binding && lifecycleGlobals.has(p.node.name)) {
      p.replaceWith(lifecycle(p.node.name));
      return;
    }
    if (!programBinding || binding !== programBinding) return;
    if (p.parentPath.isExportSpecifier()) return;
    if (p.parentPath.isObjectProperty() && p.parent.shorthand) p.parent.shorthand = false;
    p.replaceWith(member(p.node.name));
  },
});

function group(name, start, code) {
  const lower = name.toLowerCase();
  if (/^(app3d|loader|unsupported|root(?:_|\$|$))/.test(lower)) return "vendor/svelte";
  if (
    /^(npc|quest|introtexts|introdata|introdialogue|progress$|save$|areallquests|end.?screen|checklist)/.test(
      lower,
    )
  )
    return "demo";
  if (/^(characters?$|.*avatar.*|accessories|character|emoji|emote)/.test(lower))
    return "characters";
  if (/^(intro.?scene|present.?scene|planet$|maincontroller|scenes$)/.test(lower)) return "scenes";
  if (
    /^(terrain|planetmesh|waterfall|water$|watermaterial|beach|grass|butterfl|birds|sky|cables|smoke|atmosphere|galax|particles|tree)/.test(
      lower,
    )
  )
    return "world";
  if (
    /^(geometryloader|textureloader|glyphloader|.*loader|.*worker.*|.*processor|set.*path|disposegeometr|disposetexture|disposeglyph|disposegltf)/.test(
      lower,
    )
  )
    return "assets";
  if (/^(audio|setaudiobuffer|disposeaudio)/.test(lower)) return "audio";
  if (/^(controls|touches|keys|wheel|gamepad|meshinteraction|.*camera.*|collision)/.test(lower))
    return "actions";
  if (
    /^(global|events|client|renderinfo|miscutils|math$|storage|adaptive|scene$|effectcomposerextended)/.test(
      lower,
    )
  )
    return "runtime";
  if (/shader|material|uniform|pass$|outlines|postprocess|_default$/.test(lower))
    return "rendering";
  // Library lineage ranges are recorded, not a claim of recovered author filenames.
  if (start < source.indexOf("const REVISION=")) return "vendor/svelte";
  if (start < source.indexOf('const key="App3D_data"')) return "vendor/graphics";
  if (code.includes("WebGL") || /^[A-Z]/.test(name)) return "rendering";
  return "runtime/support";
}

const steps = [];
const hoists = [];
const records = [];
let counter = 0;
async function emit(node, label, hoisted, metadata = {}) {
  const id = String(counter++).padStart(4, "0");
  const printed = generate(node, { comments: false, compact: false }).code;
  const subsystem = group(label, metadata.start ?? 0, printed);
  const safe = label.replace(/[^a-zA-Z0-9_$-]/g, "_");
  const relative = `${subsystem}/${id}-${safe}.js`;
  const filename = path.join(output, relative);
  await mkdir(path.dirname(filename), { recursive: true });
  const fn = `step${id}`;
  const text = `/* Extracted from ${sourcePath}; ${metadata.start ?? 0}:${metadata.end ?? 0}.\n * Original code by abeto and bundled library authors. See references/messenger. */\nexport function ${fn}(scope) {\n${printed}\n}\n`;
  await writeFile(filename, text);
  const record = {
    id: fn,
    symbol: label,
    module: relative,
    subsystem,
    source: sourcePath,
    range: { start: metadata.start ?? 0, end: metadata.end ?? 0 },
    sha256: createHash("sha256").update(text).digest("hex"),
    hoisted,
  };
  records.push(record);
  (hoisted ? hoists : steps).push(record);
}

for (const node of ast.program.body) {
  if (t.isExportNamedDeclaration(node) || t.isExportDefaultDeclaration(node)) continue;
  if (t.isFunctionDeclaration(node)) {
    const name = node.id.name;
    const fn = t.functionExpression(node.id, node.params, node.body, node.generator, node.async);
    await emit(
      t.expressionStatement(t.assignmentExpression("=", member(name), fn)),
      name,
      true,
      node,
    );
  } else if (t.isClassDeclaration(node)) {
    const name = node.id.name;
    await emit(
      t.expressionStatement(
        t.assignmentExpression(
          "=",
          member(name),
          t.classExpression(node.id, node.superClass, node.body, node.decorators || []),
        ),
      ),
      name,
      false,
      node,
    );
  } else if (t.isVariableDeclaration(node)) {
    for (const declaration of node.declarations) {
      if (!declaration.init) continue;
      if (!t.isIdentifier(declaration.id))
        throw Error("Review top-level destructuring before extraction");
      await emit(
        t.expressionStatement(
          t.assignmentExpression("=", member(declaration.id.name), declaration.init),
        ),
        declaration.id.name,
        false,
        { start: declaration.start, end: declaration.end },
      );
    }
  } else await emit(node, `initialize-${counter}`, false, node);
}
const imports = records.map((r) => `import { ${r.id} } from './${r.module}';`).join("\n");
await writeFile(
  path.join(output, "index.js"),
  `${imports}\n\n/** Per-instance live binding registry; no original bundle is loaded. */\nexport function initializeExtracted(scope) {\n${[...hoists, ...steps].map((r) => `  ${r.id}(scope);`).join("\n")}\n  return scope;\n}\n`,
);
await writeFile(
  path.join(output, "index.d.ts"),
  "export declare function initializeExtracted(scope: Record<string, unknown>): Record<string, unknown>;\n",
);
await writeFile(
  path.join(root, "tools/reverse-engineering/symbol-map.json"),
  JSON.stringify(
    {
      source: sourcePath,
      sourceSha256: createHash("sha256").update(original).digest("hex"),
      strategy: "AST live-binding factories with original ordered initialization",
      modules: records,
    },
    null,
    2,
  ),
);
// Keep readable, isolated worker sources, and serve those exact generated files.
const workersPath = path.join(root, "frontend/engine3d/src/workers");
await mkdir(workersPath, { recursive: true });
const assetRoot = path.join(root, "references/messenger/dist/assets");
for (const filename of await readdir(assetRoot)) {
  if (!filename.includes("worker-") || !filename.endsWith(".js")) continue;
  const input = await readFile(path.join(assetRoot, filename), "utf8");
  const tree = parse(input, { sourceType: "script" });
  const readable = generate(tree, { comments: true, compact: false }).code.replaceAll(
    "/assets/",
    "/assets/athena/",
  );
  await writeFile(path.join(workersPath, filename), readable);
  await writeFile(path.join(root, "frontend/web/public/assets/athena", filename), readable);
}
console.log(
  `Extracted ${records.length} ordered modules (${hoists.length} hoisted functions); workers preserved as readable source.`,
);
