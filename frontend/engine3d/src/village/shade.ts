import type { AthenaInstallContext } from "../athena/install";
import { createSoftLighting, type SoftLighting } from "../materials/athena-toon-material";
import type { LegacyContext } from "../runtime/legacy-context";
import { windMaterial } from "./look";

/**
 * Shared shading helpers for the few things the toon conversion cannot reach: alpha cards
 * (leaf fringes, grass tufts, flowers, glyphs) and the remaining hand-written ShaderMaterials
 * (clouds, mist, water, FX) that should still light like the rest of the world.
 */

/**
 * The golden-hour sky palette: deep azure zenith, turquoise middle and a peach horizon that
 * warms toward the sun. Author the numbers here once; `atmosphere.ts` splices this exact text
 * into its sky shader and other shaders (haze, distant cloud) may reuse it. It expects the
 * sky shader's `lin(vec3)` (display to linear) and a `float sunSide` (0 away from the sun,
 * 1 toward it) in scope, and declares `zenith`, `middle` and `horizon`.
 */
export const SKY_GLSL = `vec3 zenith=lin(vec3(.13,.36,.74)), middle=lin(vec3(.40,.70,.93));
        vec3 horizon=mix(lin(vec3(.84,.89,.97)),lin(vec3(1.0,.80,.60))*1.02,pow(sunSide,2.2));`;

/**
 * The painterly light of `SOFT_FRAGMENT` (athena-toon-material.ts) as a function a
 * `ShaderMaterial` can call: half-Lambert ramp, radial sky/ground fill, cool shadow tint and
 * the sun-backlit silhouette rim. Declares the same uniforms as the toon program, so feed it
 * {@link softUniforms}. Keep the two in step: `tests/village-shade.test.ts` compares them.
 *
 * - `athenaRamp(x)`: the toon ramp for `x = dot(N, L) * 0.5 + 0.5`.
 * - `athenaSoftLight(albedo, lit, n, worldPos)`: `lit` is the colour after direct light (for
 *   example `albedo * sunColor * athenaRamp(dot(n, uAthenaSun) * 0.5 + 0.5)`), `n` the world
 *   normal and `worldPos` the world position (the planet is centred on the origin, so its
 *   direction is local up). Returns the finished colour, free of NaN and Inf.
 *
 * `uAthenaSun` points toward the sun. The camera position comes from three's `cameraPosition`.
 */
export const SOFT_LIGHT_GLSL = /* glsl */ `
#ifndef saturate
  #define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform vec3 uAthenaSun, uAthenaSky, uAthenaGround, uAthenaRim, uAthenaShadow;
uniform float uAthenaHemi, uAthenaRimStrength;
float athenaRamp(float x) {
  float t = clamp((x - 0.34) / 0.34, 0.0, 1.0);
  float terminator = t * t * (3.0 - 2.0 * t);
  return 0.34 + 0.58 * terminator + 0.08 * max(0.0, (x - 0.7) / 0.3);
}
vec3 athenaSoftLight(vec3 albedo, vec3 lit, vec3 n, vec3 worldPos) {
  vec3 outgoingLight = lit;
  vec3 athenaN = normalize(n);
  vec3 athenaUp = normalize(worldPos);
  float athenaH = dot(athenaN, athenaUp) * 0.5 + 0.5;
  outgoingLight += albedo * mix(uAthenaGround, uAthenaSky, athenaH) * uAthenaHemi;
  float athenaBase = max(0.02, dot(albedo, vec3(0.2126, 0.7152, 0.0722)));
  float athenaLit = dot(outgoingLight, vec3(0.2126, 0.7152, 0.0722)) / athenaBase;
  outgoingLight *= mix(uAthenaShadow, vec3(1.0), smoothstep(0.3, 1.05, athenaLit));
  vec3 athenaView = normalize(cameraPosition - worldPos);
  float athenaFresnel = pow(1.0 - saturate(dot(athenaN, athenaView)), 3.0);
  float athenaBack = saturate(dot(-athenaView, uAthenaSun) * 0.5 + 0.5);
  float athenaSide = 1.0 - smoothstep(0.72, 0.97, athenaH);
  outgoingLight += uAthenaRim * athenaFresnel * athenaSide * (0.15 + 1.4 * athenaBack * athenaBack)
    * uAthenaRimStrength;
  if (any(isnan(outgoingLight)) || any(isinf(outgoingLight))) outgoingLight = albedo * 0.5;
  return outgoingLight;
}`;

const fallbackLighting = new WeakMap<object, SoftLighting>();

/**
 * The uniforms {@link SOFT_LIGHT_GLSL} reads. These are the very objects the toon conversion
 * shares (`ctx.toon.lighting`), so a ShaderMaterial built with them follows the sun and sky
 * the surface engine drives each frame. When the toon is not in soft mode they fall back to
 * golden-hour defaults, one set per context, so callers never branch.
 */
export function softUniforms(ctx: AthenaInstallContext): SoftLighting {
  const shared = ctx.toon?.lighting;
  if (shared) return shared;
  let fallback = fallbackLighting.get(ctx);
  if (!fallback) fallbackLighting.set(ctx, (fallback = createSoftLighting(ctx.scope)));
  return fallback;
}

export interface ToonCardOptions {
  /** Colour multiplied into the texture (default white). */
  readonly tint?: string | number | LegacyContext;
  /**
   * Shade each instance with its own `aCardNormal` (an `InstancedBufferAttribute`, vec3, in the
   * instance's local space: rotate a crown-outward direction by the inverse of the instance
   * rotation) so scattered cards read as one rounded mass. Lit from both sides, so the back
   * of a card is as bright as its front. Without it the geometry normal is used and
   * three's usual double-sided flip applies.
   */
  readonly sphericalNormals?: boolean;
  /** Shared breeze clock; applies the same bend as the trees (`windMaterial`). */
  readonly wind?: { value: number };
  /** Coverage threshold (default 0.45): cut-out edges stay crisp with no sorting. */
  readonly alphaTest?: number;
}

/** Vertex-shader tokens a card material patches: exported so tests and docs name them once. */
export const CARD_TOKENS = {
  attribute: "aCardNormal",
  normalOverride: "objectNormal = aCardNormal / aCardLength;",
  faceFlipUndo: "normal *= faceDirection;",
} as const;

/**
 * Alpha-tested card material in the world's toon look: a `MeshStandardMaterial` (map, alpha
 * test, double sided, vertex colours, opaque so no sorting) converted by `ctx.toon`. The
 * geometry needs a `color` attribute (see `bakeVertexColor`) because vertex colours are on.
 * It owns its programs: the cache key ends in `-card-v1` plus one suffix per option, and wind
 * adds `-breeze-v1`.
 */
export function toonCardMaterial(
  ctx: AthenaInstallContext,
  texture: LegacyContext | null,
  { tint, sphericalNormals = false, wind, alphaTest = 0.45 }: ToonCardOptions = {},
) {
  const s = ctx.scope;
  const base = new s.MeshStandardMaterial({
    map: texture,
    alphaTest,
    side: s.DoubleSide,
    transparent: false,
    vertexColors: true,
    roughness: 1,
    ...(tint === undefined ? {} : { color: tint }),
  });
  const material = ctx.toon.toonMaterial(base);
  if (sphericalNormals) {
    const previous = material.onBeforeCompile.bind(material);
    const previousKey = material.customProgramCacheKey.bind(material);
    material.onBeforeCompile = (shader: LegacyContext, renderer: LegacyContext) => {
      previous(shader, renderer);
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\n#ifdef USE_INSTANCING\n  attribute vec3 aCardNormal;\n#endif",
        )
        // A missing attribute reads as (0, 0, 0): keep the geometry normal then.
        .replace(
          "#include <beginnormal_vertex>",
          `#include <beginnormal_vertex>
#ifdef USE_INSTANCING
  float aCardLength = length(aCardNormal);
  if (aCardLength > 1e-4) ${CARD_TOKENS.normalOverride}
#endif`,
        );
      // The shared chunk flips the normal on back faces; a spherical normal is the same on
      // both sides of the card, so multiplying by the (+-1) direction again restores it.
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <normal_fragment_begin>",
        `#include <normal_fragment_begin>
#ifdef DOUBLE_SIDED
  ${CARD_TOKENS.faceFlipUndo}
#endif`,
      );
    };
    material.customProgramCacheKey = () => `${previousKey()}-card-v1-sphere`;
  } else {
    const previousKey = material.customProgramCacheKey.bind(material);
    material.customProgramCacheKey = () => `${previousKey()}-card-v1`;
  }
  if (wind) windMaterial(material, wind);
  ctx.onDispose?.(() => {
    material.dispose();
    if (material !== base) base.dispose();
  });
  return material;
}

const textureCache = new WeakMap<object, Map<string, Promise<LegacyContext | undefined>>>();

/**
 * Loads a manifest texture for the village (card atlases, masks): resolves `key` through
 * `ctx.resolve`, reads `.ktx2` with the runtime's `ktx2Loader` and anything else with
 * `TextureLoader`, then sets sRGB colour space and 4x anisotropy. One texture per key and
 * context, disposed with the context. Resolves to `undefined` when the key or a loader is
 * missing, so a world without the file still builds; a failed download rejects.
 */
export function loadVillageTexture(ctx: AthenaInstallContext, key: string) {
  let byKey = textureCache.get(ctx);
  if (!byKey) textureCache.set(ctx, (byKey = new Map()));
  const known = byKey.get(key);
  if (known) return known;
  const s = ctx.scope;
  const url = ctx.resolve(key)?.url;
  const loader = !url
    ? undefined
    : url.toLowerCase().endsWith(".ktx2")
      ? s.ktx2Loader
      : s.TextureLoader
        ? new s.TextureLoader()
        : undefined;
  const loading =
    !url || !loader
      ? Promise.resolve(undefined)
      : new Promise<LegacyContext | undefined>((resolve, reject) => {
          loader.load(
            url,
            (texture: LegacyContext) => {
              texture.colorSpace = s.SRGBColorSpace ?? "srgb";
              texture.anisotropy = 4;
              texture.needsUpdate = true;
              ctx.onDispose?.(() => texture.dispose());
              resolve(texture);
            },
            undefined,
            reject,
          );
        });
  byKey.set(key, loading);
  return loading;
}
