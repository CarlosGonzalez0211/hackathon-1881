import assert from "node:assert/strict";
import test from "node:test";
import {
  createAthenaToon,
  FLAT_EPSILON,
  isConvertibleMaterial,
  isGlazeSource,
  legacyPipelineChunks,
  shouldOutline,
  SOFT_FRAGMENT,
  toonOptions,
} from "../src/materials/athena-toon-material";
import type { MeshShape } from "../src/materials/athena-toon-material";
import { ensureAthenaThreeClasses } from "../src/materials/three-shims";
import { graphics } from "./helpers/recovered-graphics";

const solid: MeshShape = {
  size: [1, 1, 1],
  hasNormals: true,
  transparent: false,
  doubleSided: false,
  isPoints: false,
  isLine: false,
};

test("toon defaults follow the brief: 90/170/255 gradient, #2B2936 ink at 0.0028", () => {
  assert.deepEqual([...toonOptions.gradient], [90, 170, 255]);
  assert.equal(toonOptions.outline.color, "#2B2936");
  assert.equal(toonOptions.outline.thickness, 0.0028);
  assert.equal(toonOptions.enabled, true);
});

test("solid meshes get an ink hull", () => {
  assert.equal(shouldOutline(solid), true);
});

test("transparent, double-sided, points and lines are never outlined", () => {
  assert.equal(shouldOutline({ ...solid, transparent: true }), false);
  assert.equal(shouldOutline({ ...solid, doubleSided: true }), false);
  assert.equal(shouldOutline({ ...solid, isPoints: true }), false);
  assert.equal(shouldOutline({ ...solid, isLine: true }), false);
  assert.equal(shouldOutline({ ...solid, hasNormals: false }), false);
});

test("Plane, Circle and Shape geometries are skipped by type", () => {
  for (const geometryType of ["PlaneGeometry", "CircleGeometry", "ShapeGeometry"])
    assert.equal(shouldOutline({ ...solid, geometryType }), false, geometryType);
  assert.equal(shouldOutline({ ...solid, geometryType: "BoxGeometry" }), true);
});

test("GLB cards (no geometry type) are skipped by thickness", () => {
  assert.equal(shouldOutline({ ...solid, size: [1, FLAT_EPSILON / 2, 1] }), false);
  assert.equal(shouldOutline({ ...solid, size: [1, FLAT_EPSILON, 1] }), true);
});

test("kit guides and FX keep no hull", () => {
  assert.equal(shouldOutline({ ...solid, name: "orbit_path" }), false);
  assert.equal(shouldOutline({ ...solid, name: "curve" }), false);
  assert.equal(shouldOutline({ ...solid, name: "__ink" }), false);
});

test("only lit built-in materials convert to toon", () => {
  assert.equal(isConvertibleMaterial({ type: "MeshStandardMaterial" }), true);
  assert.equal(isConvertibleMaterial({ type: "MeshPhysicalMaterial" }), true);
  assert.equal(isConvertibleMaterial({ type: "ShaderMaterial" }), false);
  assert.equal(isConvertibleMaterial({ type: "PointsMaterial" }), false);
  assert.equal(isConvertibleMaterial(undefined), false);
});

test("legacy MRT chunks write gInfo and the shared fog only when the runtime has them", () => {
  const missing = legacyPipelineChunks({});
  assert.equal(missing.ready, false);
  assert.equal(missing.gInfo("normal"), "");
  const fogUniforms = { uFogDensity: { value: 0.011 } };
  const ready = legacyPipelineChunks({
    encoding_default: "vec2 encodeNormalSpheremap(vec3 n) { return n.xy; }",
    fog_default: "void addFog(inout vec3 c, float d) {}",
    fogUniforms,
  });
  assert.equal(ready.ready, true);
  assert.match(ready.header, /layout\(location = 1\) out highp vec4 gInfo;/);
  assert.match(ready.gInfo("normal"), /encodeNormalSpheremap\(normal\), 0\.0\)/);
  assert.equal(ready.fog("c", "d"), "addFog(c, d);");
  // Same uniform objects as legacy materials, so recolouring the fog reaches both.
  assert.equal(ready.uniforms, fogUniforms);
});

async function softToon() {
  const s = await graphics();
  s.athenaStandardPipeline = true;
  ensureAthenaThreeClasses(s);
  return { s, toon: createAthenaToon(s, { ...toonOptions, soft: true }) };
}
const compile = (material: { onBeforeCompile: (shader: object, renderer: object) => void }) => {
  const shader = {
    uniforms: {},
    vertexShader: "#include <common>\n#include <project_vertex>",
    fragmentShader: "#include <common>\n#include <opaque_fragment>",
  };
  material.onBeforeCompile(shader, {});
  return shader;
};

test("toon conversion carries alpha, normal, ao and emissive maps, and a copy of userData", async () => {
  const { s, toon } = await softToon();
  const alphaMap = new s.Texture(),
    normalMap = new s.Texture(),
    aoMap = new s.Texture(),
    emissiveMap = new s.Texture(),
    map = new s.Texture();
  const source = new s.MeshStandardMaterial({
    name: "leaf_card",
    map,
    alphaMap,
    normalMap,
    normalScale: new s.Vector2(0.4, 0.7),
    aoMap,
    aoMapIntensity: 0.6,
    emissive: new s.Color("#ffcc88"),
    emissiveIntensity: 0.5,
    emissiveMap,
  });
  source.userData = { athenaNoInk: true, nested: { keep: 1 } };
  const converted = toon.toonMaterial(source);
  assert.equal(converted.isMeshToonMaterial, true);
  assert.equal(converted.map, map);
  assert.equal(converted.alphaMap, alphaMap);
  assert.equal(converted.normalMap, normalMap);
  assert.equal(converted.aoMap, aoMap);
  assert.equal(converted.aoMapIntensity, 0.6);
  assert.equal(converted.emissiveMap, emissiveMap);
  assert.equal(converted.emissiveIntensity, 0.5);
  assert.deepEqual([converted.normalScale.x, converted.normalScale.y], [0.4, 0.7]);
  assert.notEqual(converted.normalScale, source.normalScale, "normalScale is copied, not shared");
  assert.notEqual(converted.userData, source.userData, "userData is a fresh object");
  assert.equal(converted.userData.athenaNoInk, true);
  assert.equal(
    converted.userData.nested,
    source.userData.nested,
    "shallow: nested values are shared",
  );
  converted.userData.added = true;
  assert.equal(source.userData.added, undefined);
  assert.equal(toon.toonMaterial(source), converted, "still cached per source material");
  // Plain materials keep their defaults.
  const bare = toon.toonMaterial(new s.MeshStandardMaterial({ name: "wall" }));
  assert.equal(bare.alphaMap, null);
  assert.equal(bare.normalMap, null);
  assert.equal(bare.aoMap, null);
  assert.equal(bare.aoMapIntensity, 1);
  assert.deepEqual([bare.normalScale.x, bare.normalScale.y], [1, 1]);
  assert.deepEqual(bare.userData, {});
  toon.dispose();
});

test("glazed tile and lacquer opt into the sheen; every other material compiles as before", async () => {
  const { s, toon } = await softToon();
  assert.equal(isGlazeSource({ name: "roof_Tile_blue" }), true);
  assert.equal(isGlazeSource({ name: "red_lacquer" }), true);
  assert.equal(isGlazeSource({ name: "glazed_ceramic" }), true);
  assert.equal(isGlazeSource({ name: "wall", userData: { athenaGlaze: true } }), true);
  assert.equal(isGlazeSource({ name: "wall", userData: { athenaGlaze: "yes" } }), false);
  assert.equal(isGlazeSource({ name: "wall" }), false);
  assert.equal(isGlazeSource({ name: "roof_tile", userData: { athenaGlaze: false } }), false);

  const plain = toon.toonMaterial(new s.MeshStandardMaterial({ name: "wall_f4e9d8" }));
  const byName = toon.toonMaterial(new s.MeshStandardMaterial({ name: "roof_tile_teal" }));
  const flagged = toon.toonMaterial(
    Object.assign(new s.MeshStandardMaterial({ name: "door" }), {
      userData: { athenaGlaze: true },
    }),
  );
  assert.equal(plain.userData.athenaGlaze, undefined);
  assert.equal(byName.userData.athenaGlaze, true);
  assert.equal(flagged.userData.athenaGlaze, true);

  assert.doesNotMatch(compile(plain).fragmentShader, /#define ATHENA_GLAZE/);
  for (const material of [byName, flagged]) {
    const shader = compile(material);
    assert.match(shader.fragmentShader, /^#define ATHENA_GLAZE\n#include <common>/);
    assert.match(shader.fragmentShader, /#ifdef ATHENA_GLAZE/, "the sheen block is present");
  }
  assert.equal(plain.customProgramCacheKey(), "athena-soft-v1");
  assert.equal(byName.customProgramCacheKey(), "athena-soft-v1-glaze");
  assert.equal(flagged.customProgramCacheKey(), "athena-soft-v1-glaze");

  // Without the define the sheen is compiled out: nothing but the guarded block mentions it.
  const unguarded = SOFT_FRAGMENT.replace(/#ifdef ATHENA_GLAZE[\s\S]*?#endif/, "");
  assert.doesNotMatch(unguarded, /athenaHalf|athenaGlint|ATHENA_GLAZE/);
  assert.match(
    SOFT_FRAGMENT,
    /#ifdef ATHENA_GLAZE[\s\S]*pow\(saturate\(dot\(athenaN, athenaHalf\)\)[\s\S]*#endif/,
  );
  toon.dispose();
});
