import assert from "node:assert/strict";
import test from "node:test";
import { graphics } from "./helpers/recovered-graphics";
import {
  createAthenaToon,
  SOFT_FRAGMENT,
  softRamp,
  toonOptions,
} from "../src/materials/athena-toon-material";
import { ensureAthenaThreeClasses } from "../src/materials/three-shims";
import { createAtmosphere } from "../src/village/atmosphere";
import {
  loadVillageTexture,
  SKY_GLSL,
  SOFT_LIGHT_GLSL,
  softUniforms,
  toonCardMaterial,
} from "../src/village/shade";
import type { AthenaInstallContext } from "../src/athena/install";
import type { LegacyContext } from "../src/runtime/legacy-context";

async function village(soft = true) {
  const s = await graphics();
  s.athenaStandardPipeline = true;
  ensureAthenaThreeClasses(s);
  const toon = createAthenaToon(s, { ...toonOptions, soft });
  const disposers: (() => void)[] = [];
  const ctx = {
    scope: s,
    toon,
    onDispose: (callback: () => void) => disposers.push(callback),
  } as unknown as AthenaInstallContext;
  return { s, toon, ctx, disposers };
}

/** A stand-in for the program source three hands to `onBeforeCompile` (includes unresolved). */
const fakeShader = () => ({
  uniforms: {} as Record<string, unknown>,
  vertexShader:
    "#include <common>\n#include <beginnormal_vertex>\n#include <begin_vertex>\n#include <project_vertex>",
  fragmentShader: "#include <common>\n#include <normal_fragment_begin>\n#include <opaque_fragment>",
});
const compile = (material: LegacyContext) => {
  const shader = fakeShader();
  material.onBeforeCompile(shader, {});
  return shader;
};
const texture = (s: LegacyContext) => new s.Texture();

test("the sky shader keeps its palette lines, now spliced from SKY_GLSL", async () => {
  const s = await graphics();
  const scene = new s.Scene();
  createAtmosphere({ scope: s } as AthenaInstallContext, scene);
  const fragment: string = scene.getObjectByName("athena-painted-sky").material.fragmentShader;
  // Verbatim text from before the extraction: the shader output must not change.
  const before = [
    "        vec3 zenith=lin(vec3(.13,.36,.74)), middle=lin(vec3(.40,.70,.93));",
    "        vec3 horizon=mix(lin(vec3(.84,.89,.97)),lin(vec3(1.0,.80,.60))*1.02,pow(sunSide,2.2));",
  ].join("\n");
  assert.ok(fragment.includes(before));
  assert.equal(`        ${SKY_GLSL}`, before);
  assert.ok(
    fragment.indexOf("vec3 zenith") > fragment.indexOf("float sunSide"),
    "the palette is declared after sunSide, which it reads",
  );
});

test("SOFT_LIGHT_GLSL lights like the toon program: same uniforms, ramp and fill", () => {
  for (const uniform of [
    "uAthenaSun",
    "uAthenaSky",
    "uAthenaGround",
    "uAthenaRim",
    "uAthenaShadow",
    "uAthenaHemi",
    "uAthenaRimStrength",
  ])
    assert.match(SOFT_LIGHT_GLSL, new RegExp(`\\b${uniform}\\b`));
  // Every expression of the toon fragment that carries a tuned number appears here verbatim.
  for (const expression of [
    "mix(uAthenaGround, uAthenaSky, athenaH) * uAthenaHemi",
    "vec3(0.2126, 0.7152, 0.0722)",
    "mix(uAthenaShadow, vec3(1.0), smoothstep(0.3, 1.05, athenaLit))",
    "pow(1.0 - saturate(dot(athenaN, athenaView)), 3.0)",
    "saturate(dot(-athenaView, uAthenaSun) * 0.5 + 0.5)",
    "1.0 - smoothstep(0.72, 0.97, athenaH)",
    "(0.15 + 1.4 * athenaBack * athenaBack)",
    "* uAthenaRimStrength",
    "any(isnan(outgoingLight)) || any(isinf(outgoingLight))",
  ]) {
    assert.ok(SOFT_FRAGMENT.includes(expression), `toon fragment has ${expression}`);
    assert.ok(SOFT_LIGHT_GLSL.includes(expression), `shared chunk has ${expression}`);
  }
  assert.match(
    SOFT_LIGHT_GLSL,
    /vec3 athenaSoftLight\(vec3 albedo, vec3 lit, vec3 n, vec3 worldPos\)/,
  );
});

test("athenaRamp in GLSL is the toon gradient map", () => {
  const body = /float athenaRamp\(float x\) \{([^}]*)\}/.exec(SOFT_LIGHT_GLSL)![1]!;
  const js = body
    .replaceAll("float ", "let ")
    .replace(/\bclamp\(/g, "clampTo(")
    .replace(/\bmax\(/g, "Math.max(");
  const ramp = new Function("x", "clampTo", js) as (
    x: number,
    clampTo: (v: number, lo: number, hi: number) => number,
  ) => number;
  const clampTo = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const reference = softRamp(64);
  for (let i = 0; i < 64; i++)
    assert.ok(
      Math.abs(ramp(i / 63, clampTo) * 255 - reference[i]!) <= 0.5 + 1e-9,
      `ramp step ${i}`,
    );
});

test("softUniforms hands out the toon's shared uniform objects, or stable defaults", async () => {
  const { ctx, toon } = await village(true);
  const shared = softUniforms(ctx);
  assert.equal(shared, toon.lighting);
  for (const key of Object.keys(toon.lighting!) as (keyof typeof shared)[])
    assert.equal(shared[key], toon.lighting![key], key);
  const plain = await village(false);
  assert.equal(plain.toon.lighting, undefined);
  const fallback = softUniforms(plain.ctx);
  assert.equal(fallback, softUniforms(plain.ctx), "one fallback per context");
  assert.equal(fallback.uAthenaHemi.value, 0.26);
  assert.ok(Math.abs(fallback.uAthenaSun.value.z - 0.95) < 1e-12);
  assert.ok(fallback.uAthenaShadow.value.isColor);
});

test("toonCardMaterial builds a double-sided, alpha-tested, vertex-coloured toon material", async () => {
  const { s, ctx, disposers } = await village();
  const map = texture(s);
  const material = toonCardMaterial(ctx, map, { tint: "#88aa66" });
  assert.equal(material.isMeshToonMaterial, true);
  assert.equal(material.map, map);
  assert.equal(material.alphaTest, 0.45);
  assert.equal(material.side, s.DoubleSide);
  assert.equal(material.transparent, false);
  assert.equal(material.vertexColors, true);
  assert.equal(material.color.getHexString(), "88aa66");
  assert.equal(toonCardMaterial(ctx, map, { alphaTest: 0.2 }).alphaTest, 0.2);
  assert.equal(disposers.length, 2, "each card material registers its disposal");
  let disposed = 0;
  material.addEventListener("dispose", () => disposed++);
  for (const dispose of disposers) dispose();
  assert.equal(disposed, 1);
  // Soft lighting is still chained underneath.
  const shader = compile(toonCardMaterial(ctx, map));
  assert.match(shader.fragmentShader, /varying vec3 vAthenaWorld;/);
});

test("spherical cards shade from aCardNormal on both faces", async () => {
  const { s, ctx } = await village();
  const material = toonCardMaterial(ctx, texture(s), { sphericalNormals: true });
  const shader = compile(material);
  assert.match(shader.vertexShader, /#ifdef USE_INSTANCING\s+attribute vec3 aCardNormal;\s+#endif/);
  assert.match(shader.vertexShader, /#include <beginnormal_vertex>\s+#ifdef USE_INSTANCING/);
  assert.match(shader.vertexShader, /objectNormal = aCardNormal \/ aCardLength;/);
  assert.match(
    shader.fragmentShader,
    /#include <normal_fragment_begin>\s+#ifdef DOUBLE_SIDED\s+normal \*= faceDirection;\s+#endif/,
  );
  // Without the option the shader is the plain toon one.
  const plain = compile(toonCardMaterial(ctx, texture(s)));
  assert.doesNotMatch(plain.vertexShader, /aCardNormal/);
  assert.doesNotMatch(plain.fragmentShader, /faceDirection/);
});

test("wind chains the shared breeze onto a card material", async () => {
  const { s, ctx } = await village();
  const wind = { value: 0 };
  const shader = compile(toonCardMaterial(ctx, texture(s), { sphericalNormals: true, wind }));
  assert.equal(shader.uniforms.uBreeze, wind, "the clock is shared, not copied");
  assert.match(shader.vertexShader, /uniform float uBreeze;/);
  assert.match(shader.vertexShader, /transformed\.x \+= sin\(uBreeze/);
  assert.match(shader.vertexShader, /aCardNormal/, "both patches apply");
});

test("every card variant compiles its own program", async () => {
  const { s, ctx } = await village();
  const map = texture(s);
  const wind = { value: 0 };
  const keys = [
    toonCardMaterial(ctx, map),
    toonCardMaterial(ctx, map, { sphericalNormals: true }),
    toonCardMaterial(ctx, map, { wind }),
    toonCardMaterial(ctx, map, { sphericalNormals: true, wind }),
  ].map((material) => material.customProgramCacheKey());
  assert.equal(new Set(keys).size, 4, keys.join(" | "));
  for (const key of keys) assert.match(key, /-card-v1/);
  assert.match(keys[2]!, /-breeze-v1$/);
  // Another material of the same kind shares the program (the key is deterministic).
  assert.equal(toonCardMaterial(ctx, map).customProgramCacheKey(), keys[0]);
  // And none collides with the plain toon program.
  const ordinary = ctx.toon.toonMaterial(new s.MeshStandardMaterial({ map }));
  assert.ok(!keys.includes(ordinary.customProgramCacheKey()));
});

test("cards still work when the toon conversion is off", async () => {
  const s = await graphics();
  s.athenaStandardPipeline = true;
  const toon = createAthenaToon(s, { ...toonOptions, enabled: false });
  const ctx = { scope: s, toon } as unknown as AthenaInstallContext;
  const material = toonCardMaterial(ctx, texture(s), { sphericalNormals: true });
  assert.equal(material.isMeshStandardMaterial, true);
  assert.match(compile(material).vertexShader, /aCardNormal/);
});

test("loadVillageTexture resolves, configures and disposes manifest textures", async () => {
  const loaded: string[] = [];
  class FakeTextures {
    load(url: string, onLoad: (t: LegacyContext) => void) {
      loaded.push(url);
      onLoad({
        url,
        dispose() {
          this.disposed = true;
        },
        disposed: false,
      } as LegacyContext);
    }
  }
  const disposers: (() => void)[] = [];
  const ctx = {
    scope: { SRGBColorSpace: "srgb", TextureLoader: FakeTextures },
    resolve: (key: string) =>
      key === "textures/leaf-atlas.png" ? { url: "/a/leaf-atlas.png" } : undefined,
    onDispose: (callback: () => void) => disposers.push(callback),
  } as unknown as AthenaInstallContext;
  const atlas = (await loadVillageTexture(ctx, "textures/leaf-atlas.png"))!;
  assert.deepEqual(loaded, ["/a/leaf-atlas.png"]);
  assert.equal(atlas.colorSpace, "srgb");
  assert.equal(atlas.anisotropy, 4);
  assert.equal(atlas.needsUpdate, true);
  assert.equal(await loadVillageTexture(ctx, "textures/leaf-atlas.png"), atlas, "cached per key");
  assert.equal(loaded.length, 1);
  assert.equal(disposers.length, 1);
  disposers[0]!();
  assert.equal(atlas.disposed, true);
  assert.equal(await loadVillageTexture(ctx, "textures/missing.png"), undefined);
});

test("ktx2 textures go through the runtime's ktx2Loader", async () => {
  const used: string[] = [];
  const ktx2Loader = {
    load(url: string, onLoad: (t: LegacyContext) => void) {
      used.push(url);
      onLoad({ dispose() {} });
    },
  };
  const make = (scope: LegacyContext) =>
    ({
      scope,
      resolve: () => ({ url: "/a/leaf.ktx2" }),
      onDispose() {},
    }) as unknown as AthenaInstallContext;
  const texture = (await loadVillageTexture(make({ SRGBColorSpace: "srgb", ktx2Loader }), "leaf"))!;
  assert.deepEqual(used, ["/a/leaf.ktx2"]);
  assert.equal(texture.colorSpace, "srgb");
  assert.equal(
    await loadVillageTexture(make({ SRGBColorSpace: "srgb", TextureLoader: class {} }), "leaf"),
    undefined,
    "a ktx2 file without a ktx2 loader is skipped, not mis-decoded",
  );
});
