import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { NodeIO, getBounds, type Document, type Node } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
import { engineRoot, generatedKitRoot } from "./helpers/kit-path";

/**
 * Geometry sanity for every GLB the headless generator writes to the kit cache
 * (athena-assets/code/generate.mjs), plus rig / attribute / material checks for the spike
 * family. The cache is generated first (instant when fresh).
 */
const generator = path.join(engineRoot, "athena-assets", "code", "generate.mjs");
const run = (args: string[]) =>
  spawnSync(process.execPath, [generator, "--quiet", ...args], { encoding: "utf8" });

const generated = run([]);
assert.equal(generated.status, 0, `generate.mjs failed:\n${generated.stdout}\n${generated.stderr}`);

function listGlbs(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? listGlbs(full) : entry.name.endsWith(".glb") ? [full] : [];
  });
}
const files = listGlbs(path.join(generatedKitRoot, "models")).sort();
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const read = (file: string) => io.read(file);
const named = (file: string) => files.find((f) => f.endsWith(file))!;

test("the generator wrote at least the spike family", () => {
  assert.ok(files.length >= 5, `found ${files.length} generated GLBs`);
  for (const id of ["lathe", "sdf", "cage", "cards", "rig"])
    assert.ok(named(`athena-spike-${id}.glb`), `athena-spike-${id}.glb`);
});

for (const file of files) {
  test(`${path.relative(generatedKitRoot, file).replace(/\\/g, "/")}: clean geometry, grounded, tagged`, async () => {
    const document = await read(file);
    const root = document.getRoot();
    let triangles = 0;
    let degenerate = 0;
    for (const mesh of root.listMeshes())
      for (const primitive of mesh.listPrimitives()) {
        const position = primitive.getAttribute("POSITION")!;
        const normal = primitive.getAttribute("NORMAL");
        const count = position.getCount();
        assert.ok(normal, "normals are authored");
        const p = position.getArray()!;
        const n = normal.getArray()!;
        assert.ok(p.every(Number.isFinite), "finite positions");
        assert.ok(n.every(Number.isFinite), "finite normals");
        for (let i = 0; i < count; i++) {
          const length = Math.hypot(n[i * 3]!, n[i * 3 + 1]!, n[i * 3 + 2]!);
          assert.ok(Math.abs(length - 1) < 0.01, `unit normal at ${i}, got ${length}`);
        }
        const index = primitive.getIndices()?.getArray();
        const tris = (index ? index.length : count) / 3;
        assert.ok(Number.isInteger(tris), "whole triangles");
        if (index)
          assert.ok(
            index.every((i) => i < count),
            "indices inside the vertex range",
          );
        triangles += tris;
        for (let t = 0; t < tris; t++) {
          const [a, b, c] = [0, 1, 2].map((k) => (index ? index[t * 3 + k]! : t * 3 + k) * 3) as [
            number,
            number,
            number,
          ];
          const ux = p[b]! - p[a]!;
          const uy = p[b + 1]! - p[a + 1]!;
          const uz = p[b + 2]! - p[a + 2]!;
          const vx = p[c]! - p[a]!;
          const vy = p[c + 1]! - p[a + 1]!;
          const vz = p[c + 2]! - p[a + 2]!;
          const area = Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2;
          if (!(area > 1e-10)) degenerate++;
        }
      }
    assert.ok(triangles > 0);
    assert.ok(degenerate / triangles <= 0.02, `${degenerate}/${triangles} degenerate triangles`);

    // Contract: pivot at the base centre, +Y up.
    const bounds = getBounds(root.listScenes()[0]!);
    const size = bounds.max.map((v, i) => v - bounds.min[i]!);
    const largest = Math.max(...size);
    assert.ok(Math.abs(bounds.min[1]) <= 0.02 * size[1]! + 1e-4, `base at y=${bounds.min[1]}`);
    for (const axis of [0, 2]) {
      const centre = (bounds.max[axis]! + bounds.min[axis]!) / 2;
      assert.ok(Math.abs(centre) <= 0.05 * largest, `axis ${axis} centred (${centre})`);
    }

    // The asset build switches on these document extras.
    const extras = root.getExtras();
    assert.equal(extras.athenaGenerator, 3);
    assert.equal(extras.athenaNormals, "authored");
  });
}

test("spike-lathe: scalloped rim, gilt accent and an emissive window patch", async () => {
  const document = await read(named("athena-spike-lathe.glb"));
  const materials = new Map(
    document
      .getRoot()
      .listMaterials()
      .map((m) => [m.getName(), m]),
  );
  assert.deepEqual([...materials.keys()].sort(), ["gilt", "wall", "window_glow"]);
  assert.ok(
    materials
      .get("window_glow")!
      .getEmissiveFactor()
      .some((v) => v > 0),
  );
  assert.ok(materials.get("window_glow")!.getExtension("KHR_materials_emissive_strength"));
  const wall = document
    .getRoot()
    .listMeshes()
    .flatMap((m) => m.listPrimitives())
    .find((p) => p.getMaterial() === materials.get("wall"))!;
  assert.ok(wall.getAttribute("COLOR_0"), "baked vertex colour");
  // The rim is scalloped: its radius varies with the angle.
  const p = wall.getAttribute("POSITION")!.getArray()!;
  const top = Math.max(...Array.from({ length: p.length / 3 }, (_, i) => p[i * 3 + 1]!));
  const radii = Array.from({ length: p.length / 3 }, (_, i) => i)
    .filter((i) => p[i * 3 + 1]! > top - 0.03)
    .map((i) => Math.hypot(p[i * 3]!, p[i * 3 + 2]!));
  assert.ok(Math.max(...radii) - Math.min(...radii) > 0.01, "rim radius varies");
});

test("spike-sdf: at most 1200 welded triangles, dark bottom and light top", async () => {
  const document = await read(named("athena-spike-sdf.glb"));
  const primitive = document.getRoot().listMeshes()[0]!.listPrimitives()[0]!;
  assert.ok(primitive.getIndices()!.getCount() / 3 <= 1200);
  const p = primitive.getAttribute("POSITION")!.getArray()!;
  assert.ok(
    primitive.getAttribute("POSITION")!.getCount() <=
      (primitive.getIndices()!.getCount() / 3) * 1.2,
    "vertices are shared (welded), not a triangle soup",
  );
  const c = primitive.getAttribute("COLOR_0")!.getArray()!;
  const brightness = (i: number) => c[i * 3]! + c[i * 3 + 1]! + c[i * 3 + 2]!;
  const order = Array.from({ length: p.length / 3 }, (_, i) => i).sort(
    (a, b) => p[a * 3 + 1]! - p[b * 3 + 1]!,
  );
  const avg = (ids: number[]) => ids.reduce((s, i) => s + brightness(i), 0) / ids.length;
  const slice = Math.floor(order.length / 4);
  assert.ok(avg(order.slice(-slice)) > avg(order.slice(0, slice)), "light top, dark bottom");
});

test("spike-cage: a subdivided cage, smooth and closed", async () => {
  const document = await read(named("athena-spike-cage.glb"));
  const primitive = document.getRoot().listMeshes()[0]!.listPrimitives()[0]!;
  // 12 cage triangles, Loop-subdivided twice: 12 * 4^2.
  assert.equal(primitive.getIndices()!.getCount() / 3, 192);
  const edges = new Map<string, number>();
  const index = primitive.getIndices()!.getArray()!;
  for (let t = 0; t < index.length; t += 3)
    for (const [a, b] of [
      [0, 1],
      [1, 2],
      [2, 0],
    ] as const) {
      const x = index[t + a]!;
      const y = index[t + b]!;
      const key = x < y ? `${x}_${y}` : `${y}_${x}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  assert.ok(
    [...edges.values()].every((v) => v === 2),
    "every edge is shared by two triangles",
  );
});

test("spike-cards: alpha-masked atlas texture, parent-sphere centres, glTF uv origin", async () => {
  const document = await read(named("athena-spike-cards.glb"));
  const material = document.getRoot().listMaterials()[0]!;
  assert.equal(material.getName(), "leaf_card");
  assert.equal(material.getAlphaMode(), "MASK");
  assert.equal(material.getAlphaCutoff(), 0.5);
  assert.ok(material.getDoubleSided());
  const texture = material.getBaseColorTexture()!;
  assert.equal(texture.getMimeType(), "image/png");
  assert.deepEqual(texture.getSize(), [512, 512]);
  const primitive = document.getRoot().listMeshes()[0]!.listPrimitives()[0]!;
  assert.equal(primitive.getIndices()!.getCount() / 3, 16, "8 cards, 2 triangles each");
  const centre = primitive.getAttribute("_ATHENA_CENTER");
  assert.ok(centre, "athena_center is exported as _ATHENA_CENTER");
  assert.equal(centre.getType(), "VEC3");
  const uv = primitive.getAttribute("TEXCOORD_0")!.getArray()!;
  // The leaf cluster is the top-left 256 x 256 of the atlas.
  assert.ok(
    uv.every((v) => v >= 0 && v <= 0.5),
    "uv inside the leaf-cluster rect",
  );
});

function nodeByName(document: Document, name: string): Node {
  const found = document
    .getRoot()
    .listNodes()
    .filter((node) => node.getName() === name);
  assert.equal(found.length, 1, `exactly one node named ${name}`);
  return found[0]!;
}

test("spike-rig: joint hierarchy, part tags, clips and character attributes", async () => {
  const document = await read(named("athena-spike-rig.glb"));
  const nodes = document.getRoot().listNodes();
  const names = nodes.map((n) => n.getName());
  assert.equal(new Set(names).size, names.length, "node names are unique per model");

  const parentOf = (name: string) => nodeByName(document, name).getParentNode()?.getName();
  const hierarchy: Record<string, string> = {
    hip: "body",
    leg_l: "hip",
    knee_l: "leg_l",
    leg_r: "hip",
    knee_r: "leg_r",
    torso: "hip",
    arm_l: "torso",
    elbow_l: "arm_l",
    hand_l: "elbow_l",
    arm_r: "torso",
    elbow_r: "arm_r",
    hand_r: "elbow_r",
    head: "torso",
    head_geo: "head",
    face_expression: "head",
  };
  for (const [child, parent] of Object.entries(hierarchy))
    assert.equal(parentOf(child), parent, `${child} under ${parent}`);

  const meshNodes = nodes.filter((n) => n.getMesh());
  assert.ok(meshNodes.length >= 10);
  for (const node of meshNodes)
    assert.equal(typeof node.getExtras().part, "string", `${node.getName()} has userData.part`);
  assert.deepEqual([...new Set(meshNodes.map((n) => n.getExtras().part))].sort(), [
    "base",
    "bottom",
    "hair",
    "shoes",
    "top",
  ]);

  const clips = document.getRoot().listAnimations();
  assert.deepEqual(clips.map((a) => a.getName()).sort(), ["expression_blink", "idle", "walk"]);
  const targets = new Set(names);
  for (const clip of clips)
    for (const channel of clip.listChannels())
      assert.ok(targets.has(channel.getTargetNode()!.getName()), "channels target real nodes");
  const walk = clips.find((a) => a.getName() === "walk")!;
  assert.ok(walk.listChannels().length >= 8);

  // Style 1 (skin), 2 (hair), 7 (woven + weave uv) per the character shader contract.
  const styles = new Set<number>();
  for (const node of meshNodes)
    for (const primitive of node.getMesh()!.listPrimitives()) {
      const style = primitive.getAttribute("_ATHENA_STYLE");
      assert.ok(style, `${node.getName()} has _ATHENA_STYLE`);
      assert.ok(primitive.getAttribute("_ATHENA_WEAVE"), `${node.getName()} has _ATHENA_WEAVE`);
      for (const value of style.getArray()!) styles.add(value);
    }
  for (const expected of [1, 2, 7]) assert.ok(styles.has(expected), `style ${expected} present`);
  const woven = nodeByName(document, "chest").getMesh()!.listPrimitives()[0]!;
  assert.ok(
    woven
      .getAttribute("_ATHENA_WEAVE")!
      .getArray()!
      .some((v) => v > 0),
    "the woven torso carries weave coordinates",
  );
});

test("the built output keeps the spike rig and attributes (asset build round trip)", async (t) => {
  const manifestFile = path.join(
    engineRoot,
    "..",
    "web",
    "public",
    "athena",
    "athena-manifest.runtime.json",
  );
  if (!fs.existsSync(manifestFile))
    return t.skip("run `pnpm --filter @athena/engine3d build:assets`");
  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  const entry = manifest.entries["models/spike/athena-spike-rig.glb"];
  if (!entry) return t.skip("the last asset build ran with ATHENA_KIT_SOURCE=legacy");
  await MeshoptDecoder.ready;
  const decoder = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ "meshopt.decoder": MeshoptDecoder });
  const built = await decoder.read(
    path.join(engineRoot, "..", "web", "public", entry.url.slice(1)),
  );
  const names = built
    .getRoot()
    .listNodes()
    .map((n) => n.getName());
  for (const name of ["body", "hip", "knee_l", "elbow_r", "hand_l", "head_geo", "face_expression"])
    assert.ok(names.includes(name), `${name} survives the asset build`);
  assert.equal(built.getRoot().listAnimations().length, 3);
  const attributes = new Set(
    built
      .getRoot()
      .listMeshes()
      .flatMap((m) => m.listPrimitives().flatMap((p) => p.listSemantics())),
  );
  assert.ok(attributes.has("_ATHENA_STYLE") && attributes.has("_ATHENA_WEAVE"));
  assert.equal(built.getRoot().getExtras().athenaGenerator, 3);
});

test("regenerating into a clean directory is byte-for-byte deterministic", () => {
  const sums = (directory: string) =>
    Object.fromEntries(
      listGlbs(path.join(directory, "models")).map((f) => [
        path.relative(directory, f),
        createHash("sha256").update(fs.readFileSync(f)).digest("hex"),
      ]),
    );
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "athena-kit-"));
  try {
    const result = run([`--out=${temporary}`, "--only=spike"]);
    assert.equal(result.status, 0, result.stderr);
    const again = sums(temporary);
    const original = sums(generatedKitRoot);
    for (const [file, hash] of Object.entries(again)) assert.equal(original[file], hash, file);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
