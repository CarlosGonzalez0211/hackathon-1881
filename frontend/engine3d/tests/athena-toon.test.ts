import assert from "node:assert/strict";
import test from "node:test";
import {
  FLAT_EPSILON,
  isConvertibleMaterial,
  legacyPipelineChunks,
  shouldOutline,
  toonOptions,
} from "../src/materials/athena-toon-material";
import type { MeshShape } from "../src/materials/athena-toon-material";

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
