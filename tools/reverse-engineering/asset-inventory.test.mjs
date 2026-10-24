import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assetId, classifyAsset, inventory, repositoryRoot } from "./asset-inventory.mjs";

test("stable IDs retain format identity for sibling codec files", () => {
  assert.equal(assetId("assets/libs/draco_decoder.js"), "libs.draco_decoder.js");
  assert.notEqual(
    assetId("assets/libs/draco_decoder.js"),
    assetId("assets/libs/draco_decoder.wasm"),
  );
});
test("format classification preserves unknown resources instead of excluding them", () => {
  assert.equal(classifyAsset("assets/geometries/avatar/avatar-idle.drc"), "geometry");
  assert.equal(classifyAsset("assets/images/ui/emojis/0.icon"), "icon");
  assert.equal(classifyAsset("assets/unknown.resource"), "other");
});
test("preserved distribution has no missing or altered inventory entries", async () => {
  const source =
    process.env.ATHENA_REFERENCE_DIST ?? path.join(repositoryRoot, "references/messenger/dist");
  const actual = await inventory(source);
  const saved = JSON.parse(
    await readFile(path.join(repositoryRoot, "docs/analysis/asset-inventory.json"), "utf8"),
  );
  assert.equal(saved.count, 360);
  assert.deepEqual(actual, saved.files);
  assert.equal(
    saved.totalBytes,
    actual.reduce((sum, file) => sum + file.bytes, 0),
  );
  assert.equal(new Set(actual.map((file) => file.id)).size, actual.length);
  for (const file of actual) {
    assert.equal(file.provenance.status, "preserved-local-artifact");
    assert.ok(file.provenance.sourceUrl.startsWith("https://messenger.abeto.co/"));
    assert.match(file.sha256, /^[a-f0-9]{64}$/);
  }
});
test("NPC literal extraction references only available geometry and voices", async () => {
  const catalog = await readFile(
    path.join(repositoryRoot, "frontend/engine3d/src/assets/catalog.ts"),
    "utf8",
  );
  const npcSource = await readFile(
    path.join(repositoryRoot, "frontend/engine3d/src/config/npcs.ts"),
    "utf8",
  );
  const records = JSON.parse(
    npcSource
      .slice(npcSource.indexOf("= ") + 2)
      .trim()
      .replace(/;$/, ""),
  );
  assert.equal(records.length, 20);
  for (const npc of records) {
    for (const id of [
      npc.modelAssetId,
      npc.bonesAssetId,
      npc.voiceAssetId,
      npc.curveAssetId,
      ...npc.animations.map((animation) => animation.assetId),
    ].filter(Boolean)) {
      assert.ok(catalog.includes(`"id": "${id}"`), `${npc.id} missing ${id}`);
    }
    assert.equal(npc.position.length, 3);
    assert.ok(npc.position.every(Number.isFinite));
    assert.equal(npc.referenceSettings.id, npc.id.replace(/^npc\./, ""));
  }
});
test("decoded terrain groups cover every full-detail vertex with finite bounds", async () => {
  const inventory = JSON.parse(
    await readFile(path.join(repositoryRoot, "docs/analysis/geometry-inventory.json"), "utf8"),
  );
  assert.equal(inventory.meshes.length, 10);
  assert.equal(
    inventory.meshes.reduce((sum, mesh) => sum + mesh.groups.length, 0),
    588,
  );
  for (const mesh of inventory.meshes) {
    assert.equal(
      mesh.groups.reduce((sum, group) => sum + group.vertices, 0),
      mesh.vertices,
    );
    assert.equal(new Set(mesh.groups.map((group) => group.batchId)).size, mesh.groups.length);
    for (const group of mesh.groups) {
      assert.equal(group.geometryIdentification, "unverified");
      for (let axis = 0; axis < 3; axis++) {
        assert.ok(Number.isFinite(group.min[axis]) && Number.isFinite(group.max[axis]));
        assert.ok(group.min[axis] <= group.center[axis] && group.center[axis] <= group.max[axis]);
      }
    }
  }
});
