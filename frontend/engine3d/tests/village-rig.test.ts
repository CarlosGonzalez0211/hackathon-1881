import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
import { ClipPlayer, graftByNodeName } from "../src/athena/models";
import { mergeStaticMeshes, animatedNodeNames } from "../src/athena/merge";
import { graphics } from "./helpers/recovered-graphics";
import type { LegacyContext } from "../src/runtime/legacy-context";

test("built outfit keeps head and both feet attached through sprint and merging", async () => {
  const s = await graphics();
  await MeshoptDecoder.ready;
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ "meshopt.decoder": MeshoptDecoder });
  const publicRoot = new URL("../../web/public/", import.meta.url);
  const manifest = JSON.parse(
    await fs.readFile(new URL("athena/athena-manifest.runtime.json", publicRoot), "utf8"),
  );
  const loader = new s.GLTFLoader();
  async function load(name: string) {
    const key = `models/avatar/athena-avatar-${name}.glb`;
    const doc = await io.read(
      fileURLToPath(new URL(manifest.entries[key].url.slice(1), publicRoot)),
    );
    for (const ext of doc.getRoot().listExtensionsUsed()) ext.dispose();
    const bytes = await io.writeBinary(doc);
    return loader.parseAsync(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      "",
    );
  }
  const base = await load("base");
  const references: {
    mesh: LegacyContext;
    bone: string;
    rest: LegacyContext;
    merged?: LegacyContext;
    index?: number;
  }[] = [];
  for (const name of [
    "hair-bob",
    "top-poncho",
    "bottom-trousers",
    "shoes-boots",
    "acc-scarf-satchel",
  ]) {
    const part = await load(name);
    if (name === "hair-bob")
      assert.equal(part.scene.getObjectByName("hair_cap").parent.name, "hair");
    if (name === "shoes-boots") {
      assert.equal(part.scene.getObjectByName("upper").parent.parent.name, "knee_l");
      assert.equal(part.scene.getObjectByName("knee_l").parent.name, "leg_l");
      assert.equal(part.scene.getObjectByName("upper_1").parent.parent.name, "knee_r");
    }
    graftByNodeName(s, base.scene, part.scene);
  }
  base.scene.updateMatrixWorld(true);
  for (const [name, bone] of [
    ["hair_cap", "hair"],
    ["upper", "knee_l"],
    ["upper_1", "knee_r"],
    ["traveller_hood", "head"],
    ["canvas_pack", "torso"],
    ["lamp_light", "elbow_l"],
    ["book_pages", "elbow_r"],
  ]) {
    const mesh = base.scene.getObjectByName(name);
    mesh.updateWorldMatrix(true, false);
    const rest = new s.Vector3()
      .fromBufferAttribute(mesh.geometry.attributes.position, 0)
      .applyMatrix4(mesh.matrixWorld);
    references.push({ mesh, bone: bone!, rest });
  }
  const pack = base.scene.getObjectByName("canvas_pack");
  assert.ok(
    pack.getWorldPosition(new s.Vector3()).z < -0.2,
    "backpack clears the cape behind the body",
  );
  assert.ok(base.scene.getObjectByName("traveller_hood"), "the hood is part of the assembled rig");
  // Retain independent reference meshes under the original animated sockets.
  const referenceRoot = base.scene.clone(true);
  mergeStaticMeshes(s, base.scene, animatedNodeNames(base.animations));
  for (const name of animatedNodeNames(base.animations))
    assert.ok(base.scene.getObjectByName(name), `animation target ${name} survives`);
  base.scene.traverse((mesh: LegacyContext) => {
    if (!mesh.isMesh) return;
    assert.ok(
      mesh.geometry.attributes._athena_style,
      "painted material categories survive batching",
    );
    for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
      const v = new s.Vector3()
        .fromBufferAttribute(mesh.geometry.attributes.position, i)
        .applyMatrix4(mesh.matrixWorld);
      for (const ref of references)
        if (v.distanceTo(ref.rest) < 0.00001) {
          if (mesh.isSkinnedMesh)
            assert.equal(
              mesh.skeleton.bones[mesh.geometry.attributes.skinIndex.getX(i)].name,
              ref.bone,
            );
          else {
            let node = mesh.parent;
            while (node && node.name !== ref.bone) node = node.parent;
            assert.ok(node, "rigid material stays under its animated bone");
          }
          ref.merged = mesh;
          ref.index = i;
        }
    }
  });
  const expressionPlayer = new ClipPlayer(s, base.scene, base.animations);
  expressionPlayer.play("sprint");
  expressionPlayer.update(3.82);
  assert.ok(
    base.scene.getObjectByName("face_expression").scale.y < 0.2,
    "blink runs during sprint",
  );
  assert.ok(
    base.scene.getObjectByName("knee_l").quaternion.x > 0.03,
    "knees articulate independently",
  );
  expressionPlayer.update(0.3);
  assert.ok(base.scene.getObjectByName("face_expression").scale.y > 0.99, "eyes reopen");
  expressionPlayer.dispose();
  const mixers = [base.scene, referenceRoot].map((root) => {
    const mix = new s.AnimationMixer(root);
    mix.clipAction(base.animations.find((c: LegacyContext) => c.name === "sprint")).play();
    return mix;
  });
  for (let frame = 0; frame < 60; frame++) {
    mixers.forEach((m) => m.update(1 / 60));
    base.scene.updateMatrixWorld(true);
    referenceRoot.updateMatrixWorld(true);
    for (const ref of references) {
      assert.ok(ref.merged, `${ref.mesh.name} is preserved in the assembled model`);
      const mesh = ref.merged;
      let actual = new s.Vector3().fromBufferAttribute(
        mesh.geometry.attributes.position,
        ref.index,
      );
      if (mesh.isSkinnedMesh) {
        mesh.skeleton.update();
        actual = mesh.applyBoneTransform(ref.index, actual);
      }
      actual.applyMatrix4(mesh.matrixWorld);
      const reference = referenceRoot.getObjectByName(ref.mesh.name);
      const expected = new s.Vector3()
        .fromBufferAttribute(reference.geometry.attributes.position, 0)
        .applyMatrix4(reference.matrixWorld);
      assert.ok(
        actual.distanceTo(expected) < 0.0001,
        `${ref.bone} follows sprint at frame ${frame}`,
      );
    }
  }
});
