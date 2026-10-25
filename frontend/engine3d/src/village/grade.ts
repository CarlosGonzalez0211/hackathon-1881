import type { LegacyContext } from "../runtime/legacy-context";
import { LUMINOUS, type QualityTier } from "./light";
import { RADIUS, type Vec } from "./layout";

/**
 * Depth-aware aerial perspective: distance and low altitude dissolve into a sky-coloured
 * haze that warms towards the sun, so far hills read as layers of light instead of
 * geometry. Works on every material, including custom shaders without fog support.
 */
const HAZE = /* glsl */ `
uniform mat4 uInvProjection;
uniform mat4 uCameraWorld;
uniform vec3 uSun, uHaze, uHazeSun;
uniform vec2 uSunScreen;
uniform float uHazeStart, uHazeDensity, uRadius, uHazeMax, uShafts;
void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  vec3 color = inputColor.rgb;
  if (depth < 0.99999) {
    vec4 farPoint = uInvProjection * vec4(uv * 2.0 - 1.0, 1.0, 1.0);
    vec3 viewRay = farPoint.xyz / farPoint.w;
    vec3 viewPos = viewRay * (getViewZ(depth) / viewRay.z);
    vec3 world = (uCameraWorld * vec4(viewPos, 1.0)).xyz;
    vec3 ray = normalize(world - uCameraWorld[3].xyz);
    float altitude = max(0.0, length(world) - uRadius);
    float amount = 1.0 - exp(-max(0.0, length(viewPos) - uHazeStart) * uHazeDensity);
    amount *= exp(-altitude * 0.055);
    float toSun = pow(max(0.0, dot(ray, uSun)), 6.0);
    vec3 haze = mix(uHaze, uHazeSun * 1.35, toSun);
    color = mix(color, haze, clamp(amount, 0.0, uHazeMax));
  }
  // Screen-space light shafts: march towards the sun and count unoccluded sky samples.
  if (uShafts > 0.0) {
    // Only sky samples close to the sun emit, so open sky stays clean and shafts appear
    // where leaves, roofs and the student cut across the sun.
    vec2 aspectFix = vec2(aspect, 1.0);
    vec2 delta = (uv - uSunScreen) * (0.9 / 24.0);
    vec2 coord = uv;
    float decay = 1.0, light = 0.0;
    for (int i = 0; i < 24; i++) {
      coord -= delta;
      float glow = exp(-distance(coord * aspectFix, uSunScreen * aspectFix) * 7.0);
      light += step(0.99999, readDepth(clamp(coord, 0.0, 1.0))) * decay * glow;
      decay *= 0.94;
    }
    color += uHazeSun * light * 0.28 * uShafts;
  }
  outputColor = vec4(color, inputColor.a);
}`;

/** Post-tonemap painterly grade: split toning, gentle saturation, vignette and dither. */
const GRADE = /* glsl */ `
uniform vec3 uShadowTint, uHighlightTint;
uniform float uSaturation, uVignette;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 c = max(inputColor.rgb, 0.0);
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(vec3(l), c, uSaturation);
  c = mix(c, c * uShadowTint, (1.0 - smoothstep(0.0, 0.45, l)) * 0.35);
  c = mix(c, c * uHighlightTint, smoothstep(0.55, 1.0, l) * 0.3);
  vec2 d = uv - 0.5;
  c *= 1.0 - dot(d, d) * uVignette;
  c += (fract(sin(dot(uv * resolution, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  outputColor = vec4(c, inputColor.a);
}`;

export interface LuminousGrade {
  render(dt: number): void;
  setSize(width: number, height: number): void;
  tick(camera: LegacyContext, sun: Vec, overview: boolean): void;
  /** Drop the most expensive work (light shafts, deep bloom, MSAA) after sustained low FPS. */
  downgrade(): void;
  readonly tier: QualityTier;
  readonly composed: boolean;
  dispose(): void;
}

export function createLuminousGrade(
  s: LegacyContext,
  renderer: LegacyContext,
  scene: LegacyContext,
  camera: LegacyContext,
  initialTier: QualityTier,
): LuminousGrade {
  let tier = initialTier;
  const available = !!(
    s.EffectComposer &&
    s.EffectPass &&
    s.RenderPass &&
    s.Effect &&
    s.BloomEffect &&
    s.ToneMappingEffect
  );
  if (!available) {
    return {
      tier,
      composed: false,
      render: () => renderer.render(scene, camera),
      setSize: () => {},
      tick: () => {},
      downgrade: () => {},
      dispose: () => {},
    };
  }

  renderer.toneMapping = s.NoToneMapping;
  const composer = new s.EffectComposer(renderer, {
    frameBufferType: s.HalfFloatType,
    multisampling: tier === "high" ? 4 : 2,
  });
  composer.addPass(new s.RenderPass(scene, camera));

  const hazeUniforms = {
    uInvProjection: new s.Uniform(new s.Matrix4()),
    uCameraWorld: new s.Uniform(new s.Matrix4()),
    uSun: new s.Uniform(new s.Vector3(0, 1, 0)),
    uHaze: new s.Uniform(new s.Color(LUMINOUS.haze)),
    uHazeSun: new s.Uniform(new s.Color(LUMINOUS.hazeSun)),
    uHazeStart: new s.Uniform(16),
    uHazeDensity: new s.Uniform(0.016),
    uHazeMax: new s.Uniform(0.6),
    uRadius: new s.Uniform(RADIUS),
    uSunScreen: new s.Uniform(new s.Vector2(0.5, 0.8)),
    uShafts: new s.Uniform(0),
  };
  const sunPoint = new s.Vector3(),
    cameraForward = new s.Vector3();
  const haze = new s.Effect("LuminousHaze", HAZE, {
    attributes: s.EffectAttribute.DEPTH,
    uniforms: new Map(Object.entries(hazeUniforms)),
  });
  const grade = new s.Effect("LuminousGrade", GRADE, {
    uniforms: new Map([
      ["uShadowTint", new s.Uniform(new s.Color("#a6b4ff"))],
      ["uHighlightTint", new s.Uniform(new s.Color("#ffe6c4"))],
      ["uSaturation", new s.Uniform(1.14)],
      ["uVignette", new s.Uniform(0.7)],
    ]),
  });
  let bloom: LegacyContext, pass: LegacyContext;
  const toneMapping = new s.ToneMappingEffect({ mode: s.ToneMappingMode.ACES_FILMIC });

  function build() {
    if (pass) {
      composer.removePass(pass);
      pass.dispose();
    }
    bloom?.dispose();
    bloom = new s.BloomEffect({
      luminanceThreshold: 1.15,
      luminanceSmoothing: 0.4,
      intensity: tier === "high" ? 0.75 : 0.6,
      radius: 0.8,
      levels: tier === "high" ? 7 : 5,
      mipmapBlur: true,
    });
    pass = new s.EffectPass(camera, haze, bloom, toneMapping, grade);
    composer.addPass(pass);
  }
  build();

  return {
    get tier() {
      return tier;
    },
    composed: true,
    render(dt) {
      composer.render(dt);
    },
    setSize(width, height) {
      composer.setSize(width, height);
    },
    tick(cam, sun, overview) {
      hazeUniforms.uSun.value.set(...sun);
      sunPoint
        .set(...sun)
        .multiplyScalar(100)
        .add(cam.position)
        .project(cam);
      hazeUniforms.uSunScreen.value.set(sunPoint.x * 0.5 + 0.5, sunPoint.y * 0.5 + 0.5);
      cam.getWorldDirection(cameraForward);
      const facing = cameraForward.dot(sunPoint.set(...sun));
      hazeUniforms.uShafts.value =
        tier === "high" && !overview ? 0.38 * Math.max(0, Math.min(1, (facing - 0.05) / 0.4)) : 0;
      hazeUniforms.uInvProjection.value.copy(cam.projectionMatrixInverse);
      hazeUniforms.uCameraWorld.value.copy(cam.matrixWorld);
      hazeUniforms.uHazeStart.value = overview ? 44 : 16;
      hazeUniforms.uHazeDensity.value = overview ? 0.01 : 0.016;
    },
    downgrade() {
      if (tier === "low") return;
      tier = "low";
      composer.multisampling = 2;
      build();
    },
    dispose() {
      composer.dispose();
      haze.dispose();
      grade.dispose();
      toneMapping.dispose();
      bloom?.dispose();
    },
  };
}
