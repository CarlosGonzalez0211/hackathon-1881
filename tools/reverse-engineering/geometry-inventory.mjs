/** Decode captured Draco meshes to technical metadata only; no semantic labels inferred. */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { repositoryRoot } from "./asset-inventory.mjs";
const sourceRoot = path.join(repositoryRoot, "references/messenger/dist/assets");
const module = { exports: {} };
const context = vm.createContext({
  module,
  exports: module.exports,
  console,
  WebAssembly,
  TextDecoder,
  TextEncoder,
  setTimeout,
  clearTimeout,
});
const wrapper = (
  await readFile(path.join(sourceRoot, "libs/draco/draco_wasm_wrapper.js"), "utf8")
).replace("export default DracoDecoderModule;", "module.exports = DracoDecoderModule;");
vm.runInContext(wrapper, context, { timeout: 10000 });
const createDecoder = module.exports;
const draco = await createDecoder({
  wasmBinary: await readFile(path.join(sourceRoot, "libs/draco/draco_decoder.wasm")),
});
const meshes = [];
for (let chunk = 0; chunk < 10; chunk++) {
  const relative = `geometries/planets/present/full_${chunk}.drc`;
  const bytes = await readFile(path.join(sourceRoot, relative));
  const buffer = new draco.DecoderBuffer();
  buffer.Init(new Int8Array(bytes), bytes.length);
  const decoder = new draco.Decoder();
  const mesh = new draco.Mesh();
  const status = decoder.DecodeBufferToMesh(buffer, mesh);
  if (!status.ok()) throw new Error(status.error_msg());
  const geometryMetadata = decoder.GetMetadata(mesh);
  const geometryQuerier = new draco.MetadataQuerier();
  const info =
    geometryMetadata && geometryMetadata.ptr && geometryQuerier.HasEntry(geometryMetadata, "info")
      ? JSON.parse(geometryQuerier.GetStringEntry(geometryMetadata, "info"))
      : null;
  draco.destroy(geometryQuerier);
  const attributes = [];
  for (let index = 0; index < mesh.num_attributes(); index++) {
    const attribute = decoder.GetAttribute(mesh, index);
    const metadata = decoder.GetAttributeMetadata(mesh, index);
    const metadataQuerier = new draco.MetadataQuerier();
    const names = [];
    if (metadata && metadata.ptr) {
      for (let entry = 0; entry < metadataQuerier.NumEntries(metadata); entry++) {
        const name = metadataQuerier.GetEntryName(metadata, entry);
        names.push({ name, value: metadataQuerier.GetStringEntry(metadata, name) });
      }
    }
    attributes.push({
      index,
      uniqueId: attribute.unique_id(),
      components: attribute.num_components(),
      type: attribute.attribute_type(),
      dataType: attribute.data_type(),
      metadata: names,
    });
    draco.destroy(metadataQuerier);
  }
  const groups = [];
  if (info) {
    const positionIndex = info.attributes.findIndex((attribute) => attribute[0] === "position");
    const batchIndex = info.attributes.findIndex((attribute) => attribute[0] === "batchId");
    if (positionIndex >= 0 && batchIndex >= 0) {
      const positions = new draco.DracoFloat32Array();
      const batchIds = new draco.DracoFloat32Array();
      decoder.GetAttributeFloatForAllPoints(
        mesh,
        decoder.GetAttributeByUniqueId(mesh, positionIndex),
        positions,
      );
      decoder.GetAttributeFloatForAllPoints(
        mesh,
        decoder.GetAttributeByUniqueId(mesh, batchIndex),
        batchIds,
      );
      const byBatch = new Map();
      for (let vertex = 0; vertex < mesh.num_points(); vertex++) {
        const batchId = batchIds.GetValue(vertex);
        if (!byBatch.has(batchId))
          byBatch.set(batchId, {
            batchId,
            vertices: 0,
            min: [Infinity, Infinity, Infinity],
            max: [-Infinity, -Infinity, -Infinity],
            geometryIdentification: "unverified",
          });
        const group = byBatch.get(batchId);
        group.vertices++;
        for (let axis = 0; axis < 3; axis++) {
          const value = positions.GetValue(vertex * 3 + axis);
          group.min[axis] = Math.min(group.min[axis], value);
          group.max[axis] = Math.max(group.max[axis], value);
        }
      }
      groups.push(
        ...[...byBatch.values()]
          .sort((a, b) => a.batchId - b.batchId)
          .map((group) => ({
            ...group,
            center: group.min.map((value, axis) => (value + group.max[axis]) / 2),
          })),
      );
      draco.destroy(positions);
      draco.destroy(batchIds);
    }
  }
  meshes.push({
    path: relative,
    chunk,
    vertices: mesh.num_points(),
    faces: mesh.num_faces(),
    attributes,
    originalMetadata: info,
    groups,
  });
  draco.destroy(mesh);
  draco.destroy(decoder);
  draco.destroy(buffer);
}
await writeFile(
  path.join(repositoryRoot, "docs/analysis/geometry-inventory.json"),
  JSON.stringify(
    {
      note: "Decoded technical attribute metadata. No semantic building or tree attribution established.",
      meshes,
    },
    null,
    2,
  ) + "\n",
);
const terrainGroups = meshes.flatMap((mesh) =>
  mesh.groups.map((group) => ({
    id: `terrain.chunk-${mesh.chunk}.batch-${group.batchId}`,
    assetId: `geometries.planets.present.full_${mesh.chunk}.drc`,
    chunk: mesh.chunk,
    batchId: group.batchId,
    enabled: true,
    offset: [0, 0, 0],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    bounds: { min: group.min, max: group.max, center: group.center },
    geometryIdentification: "unverified",
  })),
);
await writeFile(
  path.join(repositoryRoot, "frontend/engine3d/src/config/terrain-groups.ts"),
  `// Generated by tools/reverse-engineering/geometry-inventory.mjs. Technical IDs are not semantic model names.\n/* eslint-disable no-loss-of-precision -- generated geometry data */\nimport type { GeometryGroupDefinition } from '../types';\nexport const terrainGroups: readonly GeometryGroupDefinition[] = ${JSON.stringify(terrainGroups, null, 2)};\n`,
);
console.log(
  JSON.stringify(
    meshes.map((mesh) => ({
      chunk: mesh.chunk,
      vertices: mesh.vertices,
      faces: mesh.faces,
      groups: mesh.groups.length,
      attributeNames: mesh.originalMetadata?.attributes.map((attribute) => attribute[0]),
    })),
    null,
    2,
  ),
);
