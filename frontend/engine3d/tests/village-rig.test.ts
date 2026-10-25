import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
import { RIG_CONTRACT } from "../athena-assets/code/rig/skeleton.mjs";
import { ClipPlayer, graftByNodeName } from "../src/athena/models";
import { mergeStaticMeshes, animatedNodeNames } from "../src/athena/merge";
import { outfitColour } from "../src/village/cloth";
import { graphics } from "./helpers/recovered-graphics";
import type { LegacyContext } from "../src/runtime/legacy-context";

/**
 * The built (meshopt-compressed) student: base + the default outfit from `RIG_CONTRACT.student`,
 * grafted, merged for rendering and played through sprint. Every outfit mesh must stay on the
 * bone the contract names, move with it exactly as the unmerged reference does, and keep its
 * painted categories.
 */
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
  for (const node of RIG_CONTRACT.people.nodes as string[])
    assert.ok(base.scene.getObjectByName(node), `the base has ${node}`);
  assert.ok(base.scene.getObjectByName("chest"), "the cape hangs from the chest node");

  const references: {
    mesh: LegacyContext;
    bone: string;
    rest: LegacyContext;
    merged?: LegacyContext;
    index?: number;
  }[] = [];
  const contract = RIG_CONTRACT.student.meshes as { file: string; name: string; bone: string }[];
  for (const name of Object.entries(RIG_CONTRACT.student.outfit).map(
    ([group, part]) => `${group}-${part}`,
  )) {
    const part = await load(name);
    for (const entry of contract.filter((e) => e.file === name)) {
      const mesh = part.scene.getObjectByName(entry.name);
      assert.ok(mesh, `${name} has ${entry.name}`);
      // Hair and shoes hang from their bone's named socket, never from a stray group.
      let owner = mesh.parent;
      while (owner && !(RIG_CONTRACT.people.animated as string[]).includes(owner.name))
        owner = owner.parent;
      assert.equal(owner?.name, entry.bone, `${entry.name} belongs to ${entry.bone}`);
      mesh.userData.refId = references.length;
      references.push({ mesh, bone: entry.bone, rest: undefined });
    }
    graftByNodeName(s, base.scene, part.scene);
  }
  assert.equal(references.length, contract.length, "every contract mesh was found");
  base.scene.updateMatrixWorld(true);
  for (const ref of references) {
    ref.mesh.updateWorldMatrix(true, false);
    ref.rest = new s.Vector3()
      .fromBufferAttribute(ref.mesh.geometry.attributes.position, 0)
      .applyMatrix4(ref.mesh.matrixWorld);
  }
  // The hood and the satchel are part of the assembled rig, behind the shoulders.
  const poncho = references.find((ref) => ref.mesh.name === "torso__top_cloth")!;
  assert.ok(poncho.mesh.parent.name === "torso", "the poncho hangs from the torso");

  // The cape colour comes from the hood's mantle category (teal), not from skin or ochre.
  const cape = outfitColour(s, base.scene);
  assert.ok(
    cape.g > cape.r && cape.b > cape.r,
    `the student's cape is teal, got ${cape.getHexString()}`,
  );

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
  expressionPlayer.update(RIG_CONTRACT.people.blink.closedAt);
  assert.ok(
    base.scene.getObjectByName("face_expression").scale.y < RIG_CONTRACT.people.blink.closed,
    "blink runs during sprint",
  );
  assert.ok(
    base.scene.getObjectByName("knee_l").quaternion.x > 0.03,
    "knees articulate independently",
  );
  expressionPlayer.update(RIG_CONTRACT.people.blink.openAt - RIG_CONTRACT.people.blink.closedAt);
  assert.ok(
    base.scene.getObjectByName("face_expression").scale.y > RIG_CONTRACT.people.blink.open,
    "eyes reopen",
  );
  expressionPlayer.dispose();
  const findReference = (id: number) => {
    let found: LegacyContext;
    referenceRoot.traverse((node: LegacyContext) => {
      if (node.userData.refId === id) found = node;
    });
    return found!;
  };
  // Every clip the avatar plays keeps the merged outfit glued to its unmerged reference.
  for (const clipName of ["sprint", "walk", "afk3_sit"]) {
    const mixers = [base.scene, referenceRoot].map((root) => {
      const mix = new s.AnimationMixer(root);
      mix.clipAction(base.animations.find((c: LegacyContext) => c.name === clipName)).play();
      return mix;
    });
    for (let frame = 0; frame < 60; frame++) {
      mixers.forEach((m) => m.update(1 / 60));
      base.scene.updateMatrixWorld(true);
      referenceRoot.updateMatrixWorld(true);
      references.forEach((ref, id) => {
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
        const reference = findReference(id);
        const expected = new s.Vector3()
          .fromBufferAttribute(reference.geometry.attributes.position, 0)
          .applyMatrix4(reference.matrixWorld);
        assert.ok(
          actual.distanceTo(expected) < 0.0001,
          `${ref.bone} follows ${clipName} at frame ${frame}`,
        );
      });
    }
  }
});
