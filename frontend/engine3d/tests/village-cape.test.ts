import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
import { RIG_CONTRACT } from "../athena-assets/code/rig/skeleton.mjs";
import { ClipPlayer } from "../src/athena/models";
import { dressWithCloth } from "../src/village/cloth";
import { graphics } from "./helpers/recovered-graphics";
import type { LegacyContext } from "../src/runtime/legacy-context";

/**
 * Capes hang from the chest node: at the shoulder line, against the back of the garment (not
 * inside it, not floating behind a satchel), and follow the torso bone.
 */
test("capes attach at the shoulders of every caped character", async () => {
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
  const ctx = {
    scope: s,
    toon: { toonMaterial: (material: LegacyContext) => material },
    onDispose() {},
  } as unknown as Parameters<typeof dressWithCloth>[0];
  // Same list as `CAPELESS` in src/village/scene.ts (Lumen has no file in npcs/).
  const capeless = new Set(["study-trio", "owl-sage", "hare-pip", "visitor-orbi"]);
  const ids = (RIG_CONTRACT.files.npcs as string[])
    .map((file) => file.replace(/^athena-npc-|\.glb$/g, ""))
    .filter((id) => !capeless.has(id));
  assert.equal(ids.length, 15);
  for (const id of ids) {
    const key = `models/npcs/athena-npc-${id}.glb`;
    const doc = await io.read(
      fileURLToPath(new URL(manifest.entries[key].url.slice(1), publicRoot)),
    );
    for (const ext of doc.getRoot().listExtensionsUsed()) ext.dispose();
    const bytes = await io.writeBinary(doc);
    const gltf = await loader.parseAsync(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      "",
    );
    const root = gltf.scene;
    root.updateMatrixWorld(true);
    const box = new s.Box3().setFromObject(root);
    const height = box.max.y - box.min.y;
    const cloth = dressWithCloth(ctx, root);
    assert.ok(cloth, `${id} gets a cape`);
    root.updateMatrixWorld(true);
    const anchor = cloth.mesh.getWorldPosition(new s.Vector3());
    const ratio = (anchor.y - box.min.y) / height;
    assert.ok(
      ratio > 0.55 && ratio < 0.85,
      `${id}: the cape starts at the shoulders (${ratio.toFixed(2)})`,
    );
    assert.ok(Math.abs(anchor.x) < 0.02, `${id}: the cape is centred on the back`);
    assert.equal(cloth.mesh.parent.name, "chest", `${id}: the cape follows the chest node`);
    // Just below the capelet's hem, ignoring packs that sit behind the cape plane, the rearmost
    // vertex is the back of the garment: the cape hangs from beneath the capelet against it.
    let back = Infinity;
    const v = new s.Vector3();
    root.traverse((mesh: LegacyContext) => {
      if (!mesh.isMesh || mesh === cloth.mesh) return;
      const p = mesh.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld);
        if (
          Math.abs(v.y - (anchor.y - 0.12 * height)) < 0.03 &&
          Math.abs(v.x) < 0.1 &&
          v.z > anchor.z - 0.015
        )
          back = Math.min(back, v.z);
      }
    });
    assert.ok(
      anchor.z < back + 0.03 && anchor.z > back - 0.1,
      `${id}: the cape lies on the back (cape z ${anchor.z.toFixed(3)}, back ${back.toFixed(3)})`,
    );
    // The cape stays level with the shoulders while walking.
    const player = new ClipPlayer(s, root, gltf.animations);
    player.play("walk");
    player.update(0.4);
    root.updateMatrixWorld(true);
    const walking = cloth.mesh.getWorldPosition(new s.Vector3());
    assert.ok(
      Number.isFinite(walking.y) && Math.abs(walking.y - anchor.y) < 0.08,
      `${id}: shoulders stay level while walking`,
    );
    player.dispose();
  }
});
