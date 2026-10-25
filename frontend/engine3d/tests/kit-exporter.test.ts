import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  GENERATED_EXTRAS,
  attachTexture,
  exportGlb,
  finalizeGlb,
} from "../athena-assets/code/sculpt/export.mjs";
import { createTools } from "../athena-assets/code/sculpt/index.mjs";
import { Raster } from "../athena-assets/code/sculpt/paint/raster.mjs";
import { graphics } from "./helpers/recovered-graphics";

/**
 * The headless exporter must produce what the recovered runtime reads. The attribute naming
 * rule (athena-assets/code/sculpt/export.mjs): name the three attribute `athena_style`; the
 * glTF exporter writes `_ATHENA_STYLE` and GLTFLoader lower-cases it to `_athena_style`.
 */
function sample() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const count = geometry.attributes.position!.count;
  geometry.setAttribute(
    "athena_style",
    new THREE.Float32BufferAttribute(new Float32Array(count).fill(7), 1),
  );
  geometry.setAttribute(
    "athena_weave",
    new THREE.Float32BufferAttribute(new Float32Array(count * 2).fill(0.5), 2),
  );
  const material = new THREE.MeshStandardMaterial({ color: "#C99232", vertexColors: false });
  material.name = "top_ochre";
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "body_mesh";
  mesh.userData.part = "top";
  const root = new THREE.Group();
  root.name = "sample";
  root.add(mesh);
  const clip = new THREE.AnimationClip("spin", 1, [
    new THREE.QuaternionKeyframeTrack(
      "body_mesh.quaternion",
      [0, 1],
      [0, 0, 0, 1, ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 1, 0)).toArray()],
    ),
  ]);
  return { root, clip };
}

const json = (glb: Buffer) => {
  const length = glb.readUInt32LE(12);
  return JSON.parse(glb.subarray(20, 20 + length).toString("utf8"));
};

test("custom attributes are written with a single underscore prefix, upper-case", async () => {
  const { root, clip } = sample();
  const glb = await exportGlb(root, [clip]);
  const primitive = json(glb).meshes[0].primitives[0];
  assert.ok(primitive.attributes._ATHENA_STYLE !== undefined, "_ATHENA_STYLE");
  assert.ok(primitive.attributes._ATHENA_WEAVE !== undefined, "_ATHENA_WEAVE");
  assert.equal(primitive.attributes.__ATHENA_STYLE, undefined, "no double underscore");
  assert.equal(primitive.attributes.athena_style, undefined);
});

test("the recovered runtime GLTFLoader reads _athena_style / _athena_weave, parts and clips", async () => {
  const { root, clip } = sample();
  const glb = await exportGlb(root, [clip]);
  const scope = await graphics();
  const gltf = await new scope.GLTFLoader().parseAsync(
    glb.buffer.slice(glb.byteOffset, glb.byteOffset + glb.byteLength),
    "",
  );
  let found:
    | {
        geometry: { attributes: Record<string, { itemSize: number; getX(i: number): number }> };
        userData: Record<string, unknown>;
      }
    | undefined;
  gltf.scene.traverse((object: typeof found & { isMesh?: boolean }) => {
    if (object?.isMesh) found = object;
  });
  assert.ok(found, "a mesh was loaded");
  const { attributes } = found.geometry;
  assert.ok(attributes._athena_style, "geometry.attributes._athena_style");
  assert.equal(attributes._athena_style.itemSize, 1);
  assert.equal(attributes._athena_style.getX(0), 7);
  assert.ok(attributes._athena_weave, "geometry.attributes._athena_weave");
  assert.equal(attributes._athena_weave.itemSize, 2);
  assert.equal(found.userData.part, "top", "userData.part round-trips as node extras");
  assert.deepEqual(
    gltf.animations.map((a: { name: string }) => a.name),
    ["spin"],
  );
});

test("exported documents carry the extras the asset build switches on", async () => {
  const { root } = sample();
  const glb = await finalizeGlb(await exportGlb(root), { extras: { athenaKeepHierarchy: true } });
  const document = await new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .readBinary(new Uint8Array(glb));
  assert.deepEqual(document.getRoot().getExtras(), {
    ...GENERATED_EXTRAS,
    athenaKeepHierarchy: true,
  });
});

test("vertex colours export as Float32 COLOR_0 and emissive intensity as emissive strength", async () => {
  const geometry = new THREE.PlaneGeometry(1, 1);
  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(new Float32Array(12).fill(0.5), 3),
  );
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, emissive: "#F6C46A" });
  material.emissiveIntensity = 0.8;
  material.name = "window_glow";
  const glb = await exportGlb(new THREE.Mesh(geometry, material));
  const parsed = json(glb);
  assert.ok(parsed.meshes[0].primitives[0].attributes.COLOR_0 !== undefined);
  assert.equal(
    parsed.accessors[parsed.meshes[0].primitives[0].attributes.COLOR_0].componentType,
    5126,
  );
  assert.equal(
    parsed.materials[0].extensions.KHR_materials_emissive_strength.emissiveStrength,
    0.8,
  );
});

test("PNG textures attach after export without touching any THREE texture", async () => {
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial());
  (plane.material as THREE.MeshStandardMaterial).name = "leaf_card";
  const glb = await exportGlb(plane);
  assert.equal(json(glb).images, undefined, "no image before attaching");
  const png = new Raster(4, 4).fill("#6CA66E").toPng();
  const withTexture = await attachTexture(glb, png, ["leaf_card"]);
  const document = await new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .readBinary(new Uint8Array(withTexture));
  const material = document.getRoot().listMaterials()[0]!;
  assert.equal(material.getAlphaMode(), "MASK");
  assert.equal(material.getAlphaCutoff(), 0.5);
  assert.deepEqual(material.getBaseColorTexture()!.getSize(), [4, 4]);
  await assert.rejects(() => attachTexture(glb, png, ["missing_material"]), /no material named/);
});

test("toolkit operations are deterministic and geometry-valid", async () => {
  const T = createTools(THREE);
  const build = async () => {
    const vase = T.lathe(
      [
        [0, 0],
        [0.2, 0, 1],
        [0.3, 0.3],
        [0.1, 0.7],
        [0.2, 0.9, 1],
        [0.15, 0.8],
        [0, 0.5],
      ],
      { segments: 16, scallop: { folds: 4, depth: 0.1 } },
    );
    const tube = T.sweep(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.2, 0.5, 0),
        new THREE.Vector3(0, 1, 0.2),
      ]),
      { radius: (t: number) => 0.05 * (1 - t), caps: "round" },
    );
    const blob = await T.polygonise(
      T.sdf.smin(0.1, T.sdf.sphere([0, 0, 0], 0.3), T.sdf.capsule([0, 0, 0], [0.4, 0.2, 0], 0.15)),
      { size: 32, maxTriangles: 300 },
    );
    return { vase, tube, blob };
  };
  const a = await build();
  const b = await build();
  for (const key of ["vase", "tube", "blob"] as const) {
    const geometry = a[key];
    assert.deepEqual(
      Array.from(geometry.attributes.position!.array),
      Array.from(b[key].attributes.position!.array),
      `${key} is deterministic`,
    );
    assert.ok(Array.from(geometry.attributes.normal!.array).every(Number.isFinite));
    assert.equal(T.degenerateTriangles(geometry), 0, `${key} has no zero-area triangles`);
  }
  assert.ok(a.blob.index!.count / 3 <= 300);
  // Seeded noise is repeatable and different seeds differ.
  assert.equal(T.createNoise(5).noise3(0.3, 0.4, 0.5), T.createNoise(5).noise3(0.3, 0.4, 0.5));
  assert.notEqual(T.createNoise(5).noise3(0.3, 0.4, 0.5), T.createNoise(6).noise3(0.3, 0.4, 0.5));
});
