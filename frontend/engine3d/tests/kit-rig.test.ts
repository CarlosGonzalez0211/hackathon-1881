import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { NodeIO, type Animation, type Document, type Node } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { RIG_CONTRACT } from "../athena-assets/code/rig/skeleton.mjs";
import { engineRoot, generatedKitRoot } from "./helpers/kit-path";

/**
 * The character rig contract (`RIG_CONTRACT`, athena-assets/code/rig/skeleton.mjs) against
 * the GLBs the generator writes: node tree, clips, blink, knees and elbows, part tags,
 * vertex attributes, materials, file lists and budgets of the avatar, the 19 NPC files and Lumen.
 */
const generator = path.join(engineRoot, "athena-assets", "code", "generate.mjs");
const generated = spawnSync(process.execPath, [generator, "--quiet", "--only=characters"], {
  encoding: "utf8",
});
assert.equal(generated.status, 0, `generate.mjs failed:\n${generated.stdout}\n${generated.stderr}`);

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const models = path.join(generatedKitRoot, "models");
const people = RIG_CONTRACT.people;
const animalIds = Object.keys(RIG_CONTRACT.animals);
const staticIds = people.staticFiles as readonly string[];
const humanNpcs = RIG_CONTRACT.files.npcs
  .map((file: string) => file.replace(/^athena-npc-|\.glb$/g, ""))
  .filter((id: string) => !animalIds.includes(id) && !staticIds.includes(id));

const load = (folder: string, file: string) => io.read(path.join(models, folder, file));
const nodesOf = (document: Document) => document.getRoot().listNodes();
const named = (document: Document, name: string) =>
  nodesOf(document).find((node) => node.getName() === name);
const parentName = (node: Node) => node.getParentNode()?.getName();
const clipOf = (document: Document, name: string) =>
  document
    .getRoot()
    .listAnimations()
    .find((animation) => animation.getName() === name);
const channel = (animation: Animation, node: string, path: string) =>
  animation
    .listChannels()
    .find((c) => c.getTargetNode()?.getName() === node && c.getTargetPath() === path);

/** Linear sample of a channel at time `t`. */
function sample(animation: Animation, node: string, path: string, t: number): number[] {
  const c = channel(animation, node, path);
  assert.ok(c, `${animation.getName()} animates ${node}.${path}`);
  const sampler = c.getSampler()!;
  const times = sampler.getInput()!.getArray()!;
  const values = sampler.getOutput()!.getArray()!;
  const width = sampler.getOutput()!.getElementSize();
  let i = 0;
  while (i < times.length - 2 && times[i + 1]! <= t) i++;
  const span = times[i + 1]! - times[i]!;
  const k = span > 0 ? Math.min(1, Math.max(0, (t - times[i]!) / span)) : 0;
  return Array.from(
    { length: width },
    (_, j) => values[i * width + j]! * (1 - k) + values[(i + 1) * width + j]! * k,
  );
}

/** Largest spread of any component of a channel over the clip. */
function range(animation: Animation, node: string, path: string) {
  const c = channel(animation, node, path);
  if (!c) return 0;
  const output = c.getSampler()!.getOutput()!;
  const values = output.getArray()!;
  const width = output.getElementSize();
  let widest = 0;
  for (let j = 0; j < width; j++) {
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = j; i < values.length; i += width) {
      lo = Math.min(lo, values[i]!);
      hi = Math.max(hi, values[i]!);
    }
    widest = Math.max(widest, hi - lo);
  }
  return widest;
}

function primitivesOf(document: Document) {
  return document
    .getRoot()
    .listMeshes()
    .flatMap((mesh) => mesh.listPrimitives());
}

test("the contract's file lists exist in the folders the runtime loads them from", () => {
  for (const [folder, files] of Object.entries(RIG_CONTRACT.files))
    for (const file of files as string[])
      assert.ok(fs.existsSync(path.join(models, folder, file)), `${folder}/${file}`);
  assert.equal(RIG_CONTRACT.files.npcs.length, 19);
  assert.equal(RIG_CONTRACT.files.avatar.length, 1 + 7 + 9 + 7 + 7 + 1);
});

function checkPeopleTree(document: Document, label: string) {
  const names = nodesOf(document).map((node) => node.getName());
  assert.equal(new Set(names).size, names.length, `${label}: node names are unique`);
  for (const node of people.nodes as string[]) assert.ok(names.includes(node), `${label}: ${node}`);
  for (const [child, parent] of Object.entries(people.parents as Record<string, string>))
    assert.equal(
      parentName(named(document, child)!),
      parent,
      `${label}: ${child} hangs from ${parent}`,
    );
  // Knees and elbows are real, separate joints.
  for (const joint of people.joints as string[])
    assert.ok(named(document, joint), `${label}: ${joint}`);
}

function checkBlink(document: Document, label: string) {
  const blink = clipOf(document, people.blink.clip);
  assert.ok(blink, `${label}: ${people.blink.clip}`);
  assert.equal(blink.listChannels().length, 1, `${label}: blink moves only one node`);
  assert.equal(blink.listChannels()[0]!.getTargetNode()!.getName(), people.blink.node);
  const closed = sample(blink, people.blink.node, "scale", people.blink.closedAt);
  const open = sample(blink, people.blink.node, "scale", people.blink.openAt);
  assert.ok(
    closed[1]! < people.blink.closed,
    `${label}: eyes shut at ${people.blink.closedAt}s (${closed[1]})`,
  );
  assert.ok(
    open[1]! > people.blink.open,
    `${label}: eyes open at ${people.blink.openAt}s (${open[1]})`,
  );
}

test("avatar base: complete node tree, all eleven clips, blink, articulated knees and elbows", async () => {
  const base = await load("avatar", "athena-avatar-base.glb");
  checkPeopleTree(base, "avatar base");
  const clips = base.getRoot().listAnimations();
  assert.deepEqual(
    clips.map((clip) => clip.getName()).sort(),
    [...people.clips].sort(),
    "the avatar keeps every clip name",
  );
  checkBlink(base, "avatar base");
  for (const name of people.locomotion as string[]) {
    const clip = clipOf(base, name)!;
    for (const joint of people.joints as string[])
      // A jump holds its tucked pose (a constant bend away from rest); a stride swings the joint.
      assert.ok(
        name === "air" ? !!channel(clip, joint, "rotation") : range(clip, joint, "rotation") > 0.05,
        `${name} articulates ${joint}`,
      );
    // The stride swings the legs from the hip as well.
    assert.ok(!!channel(clip, "leg_l", "rotation"), `${name} swings leg_l`);
  }
  // Sitting drops the body and folds the legs.
  const sit = clipOf(base, "afk3_sit")!;
  assert.ok(channel(sit, "body", "translation"), "afk3_sit drops the body to the ground");
  for (const leg of ["leg_l", "leg_r"])
    assert.ok(channel(sit, leg, "rotation"), `afk3_sit folds ${leg}`);
  // Every animated target is a node of the tree.
  for (const clip of clips)
    for (const c of clip.listChannels())
      assert.ok(
        people.animated.includes(c.getTargetNode()!.getName()),
        `${clip.getName()} -> ${c.getTargetNode()!.getName()}`,
      );
});

test("avatar base: painted categories, skin first, three pose-independent materials", async () => {
  const base = await load("avatar", "athena-avatar-base.glb");
  const primitives = primitivesOf(base);
  assert.ok(primitives.length > 0);
  for (const primitive of primitives) {
    assert.ok(primitive.getAttribute("COLOR_0"), "baked vertex colour");
    assert.ok(primitive.getAttribute("_ATHENA_STYLE"), "athena_style is exported as _ATHENA_STYLE");
    assert.ok(primitive.getAttribute("_ATHENA_WEAVE"), "the avatar's attribute set is uniform");
    assert.ok(primitive.getAttribute("NORMAL"), "authored normals");
  }
  const styles = new Set<number>();
  for (const primitive of primitives)
    for (const value of primitive.getAttribute("_ATHENA_STYLE")!.getArray()!)
      styles.add(Math.round(value));
  for (const style of [RIG_CONTRACT.styles.skin, RIG_CONTRACT.styles.eye])
    assert.ok(styles.has(style), `base carries style ${style}`);
  assert.ok(
    nodesOf(base).every(
      (node) => !node.getMesh() || RIG_CONTRACT.parts.includes(node.getExtras().part as string),
    ),
    "every mesh node is tagged with a part",
  );
});

for (const [group, names] of Object.entries({
  hair: ["bob", "crop", "long", "ponytail", "curls", "braids", "swept"],
  top: ["poncho", "tee", "hoodie", "stripe", "jacket", "raincoat", "cardigan", "vest", "labcoat"],
  bottom: ["shorts", "trousers", "skirt", "overalls", "cargo", "leggings", "wide"],
  shoes: ["boots", "sneakers", "sandals", "rainboots", "clogs", "loafers", "hiking"],
})) {
  test(`avatar ${group} parts carry only their own tag, on the shared node tree`, async () => {
    for (const name of names) {
      const part = await load("avatar", `athena-avatar-${group}-${name}.glb`);
      checkPeopleTree(part, `${group}-${name}`);
      assert.equal(
        part.getRoot().listAnimations().length,
        0,
        `${group}-${name} has no clips of its own`,
      );
      const tagged = nodesOf(part).filter((node) => node.getMesh());
      assert.ok(tagged.length > 0, `${group}-${name} has geometry`);
      for (const node of tagged)
        assert.equal(node.getExtras().part, group, `${group}-${name}: ${node.getName()}`);
      for (const primitive of primitivesOf(part)) {
        assert.ok(primitive.getAttribute("_ATHENA_STYLE"));
        assert.ok(primitive.getAttribute("_ATHENA_WEAVE"));
      }
    }
  });
}

test("the student's outfit meshes sit on the bones the contract names", async () => {
  for (const { file, name, bone } of RIG_CONTRACT.student.meshes as {
    file: string;
    name: string;
    bone: string;
  }[]) {
    const part = await load("avatar", `athena-avatar-${file}.glb`);
    const mesh = named(part, name);
    assert.ok(mesh?.getMesh(), `${file} has ${name}`);
    // The mesh hangs from its bone directly, or from an unanimated socket below it (a hand).
    let node: Node | null = mesh.getParentNode();
    while (node && !people.animated.includes(node.getName())) node = node.getParentNode();
    assert.equal(node?.getName(), bone, `${name} follows ${bone}`);
  }
  const scarf = await load("avatar", "athena-avatar-acc-scarf-satchel.glb");
  const glowing = scarf
    .getRoot()
    .listMaterials()
    .filter((material) => material.getEmissiveFactor().some((v) => v > 0))
    .map((material) => material.getName());
  assert.deepEqual(glowing, ["lamp_light"], "the staff lantern is the only glow of the student");
});

test("the poncho is woven; hoods and capes are mantle-coloured", async () => {
  const poncho = await load("avatar", "athena-avatar-top-poncho.glb");
  const styles = new Set<number>();
  for (const primitive of primitivesOf(poncho))
    for (const value of primitive.getAttribute("_ATHENA_STYLE")!.getArray()!)
      styles.add(Math.round(value));
  assert.ok(styles.has(RIG_CONTRACT.styles.woven), "poncho motif style");
  assert.ok(
    styles.has(RIG_CONTRACT.styles.mantle),
    "hood style (cloth.ts reads the cape colour from it)",
  );
});

test("human NPC files: same node tree, walk/idle/talk/blink, one plain material, no weave", async () => {
  assert.equal(humanNpcs.length, 15);
  for (const id of humanNpcs) {
    const npc = await load("npcs", `athena-npc-${id}.glb`);
    checkPeopleTree(npc, id);
    assert.deepEqual(
      npc
        .getRoot()
        .listAnimations()
        .map((clip) => clip.getName())
        .sort(),
      [...people.npcClips].sort(),
      `${id}: the clips surface.ts plays`,
    );
    checkBlink(npc, id);
    const walk = clipOf(npc, "walk")!;
    for (const joint of people.joints as string[])
      assert.ok(range(walk, joint, "rotation") > 0.05, `${id} walk: ${joint}`);
    const materials = npc
      .getRoot()
      .listMaterials()
      .map((material) => material.getName());
    for (const material of materials)
      assert.ok(
        material === RIG_CONTRACT.npcMaterial || RIG_CONTRACT.glowMaterials.includes(material),
        `${id}: material ${material}`,
      );
    for (const primitive of primitivesOf(npc)) {
      assert.ok(
        primitive.getAttribute("_ATHENA_STYLE") && primitive.getAttribute("COLOR_0"),
        `${id}: painted`,
      );
      assert.ok(!primitive.getAttribute("_ATHENA_WEAVE"), `${id}: no weave attribute`);
    }
    // Bones carry at most one plain primitive each (the runtime merge makes two skinned draws).
    const plain = nodesOf(npc).filter((node) => node.getMesh());
    const perBone = new Map<string, number>();
    for (const node of plain) {
      const bone = node.getParentNode()?.getName() ?? "";
      perBone.set(bone, (perBone.get(bone) ?? 0) + 1);
    }
    assert.ok(Math.max(...perBone.values()) <= 3, `${id}: meshes are merged per bone`);
    const styles = new Set<number>();
    for (const primitive of primitivesOf(npc))
      for (const value of primitive.getAttribute("_ATHENA_STYLE")!.getArray()!)
        styles.add(Math.round(value));
    for (const style of [
      RIG_CONTRACT.styles.skin,
      RIG_CONTRACT.styles.hair,
      RIG_CONTRACT.styles.eye,
    ])
      assert.ok(styles.has(style), `${id}: style ${style}`);
  }
});

test("the study trio is static: one merged mesh, no clips", async () => {
  for (const id of staticIds) {
    const trio = await load("npcs", `athena-npc-${id}.glb`);
    assert.equal(trio.getRoot().listAnimations().length, 0, "no clips");
    assert.equal(nodesOf(trio).filter((node) => node.getMesh()).length, 1, "one mesh");
    assert.equal(trio.getRoot().listMaterials().length, 1);
  }
});

test("Lumen and the visitors keep their nodes, clips and glow", async () => {
  for (const [id, spec] of Object.entries(RIG_CONTRACT.animals) as [
    string,
    { nodes: string[]; clips: string[] },
  ][]) {
    const file =
      id === "cat-lumen"
        ? ["characters", "athena-npc-cat-lumen.glb"]
        : ["npcs", `athena-npc-${id}.glb`];
    const document = await load(file[0]!, file[1]!);
    for (const node of spec.nodes) assert.ok(named(document, node), `${id}: ${node}`);
    assert.deepEqual(
      document
        .getRoot()
        .listAnimations()
        .map((clip) => clip.getName())
        .sort(),
      [...spec.clips].sort(),
      `${id}: clips`,
    );
    for (const clip of document.getRoot().listAnimations())
      for (const c of clip.listChannels())
        assert.ok(
          spec.nodes.includes(c.getTargetNode()!.getName()),
          `${id}: ${clip.getName()} -> ${c.getTargetNode()!.getName()}`,
        );
    for (const material of document.getRoot().listMaterials()) {
      const glows = material.getEmissiveFactor().some((v) => v > 0);
      assert.equal(
        glows,
        RIG_CONTRACT.glowMaterials.includes(material.getName()),
        `${id}: ${material.getName()}`,
      );
    }
  }
  const lumen = await load("characters", "athena-npc-cat-lumen.glb");
  checkBlink(lumen, "lumen");
  assert.ok(
    lumen
      .getRoot()
      .listMaterials()
      .some((material) => material.getName() === "charm_glow"),
    "Lumen's charm glows",
  );
});

test("triangle budgets of the contract", async () => {
  const triangles = (document: Document) =>
    primitivesOf(document).reduce(
      (sum, primitive) => sum + (primitive.getIndices()?.getCount() ?? 0) / 3,
      0,
    );
  const base = await load("avatar", "athena-avatar-base.glb");
  assert.ok(triangles(base) <= RIG_CONTRACT.budgets.avatarBaseTriangles);
  for (const file of RIG_CONTRACT.files.avatar.filter((f: string) => !f.endsWith("-base.glb"))) {
    const part = await load("avatar", file);
    // The asset build simplifies; the generator's own output may exceed the limit by half.
    assert.ok(
      triangles(part) <= RIG_CONTRACT.budgets.avatarPartTriangles * 1.5,
      `${file}: ${triangles(part)}`,
    );
  }
  for (const file of RIG_CONTRACT.files.npcs) {
    const npc = await load("npcs", file);
    assert.ok(
      triangles(npc) <= RIG_CONTRACT.budgets.characterTriangles * 1.8,
      `${file}: ${triangles(npc)} before simplification`,
    );
  }
});
