/**
 * The Athena look: 3-step toon shading + inverted-hull ink outline, shared by every Athena
 * mesh. Recipe from the asset kit viewer (`athena-assets/docs/Athena Asset Kit.html`):
 * gradient 90/170/255 with nearest filtering, back-face hull pushed along the view-space
 * normal by `thickness × view depth`, ink `#2B2936`.
 *
 * Uses the recovered runtime's Three classes (`scope.MeshToonMaterial`…), never npm `three`.
 * Legacy Messenger meshes keep their own cel ShaderMaterials (they cannot be converted
 * without losing their atlas/wind/wetness logic); the screen-space `outlines` pass already
 * inks them, so mixed scenes share one look. See docs/MIGRATION.md.
 */
import type { LegacyContext } from "../runtime/legacy-context";
import { renderingDefinition } from "../config/rendering";

type Object3D = LegacyContext;
type Material = LegacyContext;

export interface AthenaToonOptions {
  readonly enabled: boolean;
  /** Gradient steps as 0–255 luminance (nearest-filtered). */
  readonly gradient: readonly number[];
  readonly outline: {
    readonly enabled: boolean;
    readonly color: string;
    /** Normal offset per metre of view depth. */
    readonly thickness: number;
  };
  /**
   * Painterly mode (the luminous village): a smooth linear ramp instead of hard bands,
   * radial sky/ground fill, cool shadow tint and a sun-backlit rim that blooms.
   */
  readonly soft?: boolean;
}

/** Uniforms shared by every soft material; the surface engine updates them per frame. */
export interface SoftLighting {
  readonly uAthenaSun: { value: LegacyContext };
  readonly uAthenaSky: { value: LegacyContext };
  readonly uAthenaGround: { value: LegacyContext };
  readonly uAthenaRim: { value: LegacyContext };
  readonly uAthenaShadow: { value: LegacyContext };
  readonly uAthenaHemi: { value: number };
  readonly uAthenaRimStrength: { value: number };
}

/** Half-Lambert ramp: a luminous shadow floor, a soft terminator and a gentle highlight. */
export function softRamp(size = 64) {
  const data = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    const x = i / (size - 1);
    const t = Math.min(1, Math.max(0, (x - 0.34) / 0.34));
    const terminator = t * t * (3 - 2 * t);
    data[i] = Math.round(255 * (0.34 + 0.58 * terminator + 0.08 * Math.max(0, (x - 0.7) / 0.3)));
  }
  return data;
}

const SOFT_VERTEX = /* glsl */ `
vec4 athenaWorld = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
  athenaWorld = instanceMatrix * athenaWorld;
#endif
vAthenaWorld = (modelMatrix * athenaWorld).xyz;`;

const SOFT_FRAGMENT = /* glsl */ `
{
  vec3 athenaN = normalize(inverseTransformDirection(normal, viewMatrix));
  vec3 athenaUp = normalize(vAthenaWorld);
  float athenaH = dot(athenaN, athenaUp) * 0.5 + 0.5;
  outgoingLight += diffuseColor.rgb * mix(uAthenaGround, uAthenaSky, athenaH) * uAthenaHemi;
  float athenaBase = max(0.02, dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)));
  float athenaLit = dot(outgoingLight, vec3(0.2126, 0.7152, 0.0722)) / athenaBase;
  outgoingLight *= mix(uAthenaShadow, vec3(1.0), smoothstep(0.3, 1.05, athenaLit));
  vec3 athenaView = normalize(cameraPosition - vAthenaWorld);
  float athenaFresnel = pow(1.0 - saturate(dot(athenaN, athenaView)), 3.0);
  float athenaBack = saturate(dot(-athenaView, uAthenaSun) * 0.5 + 0.5);
  // Silhouettes only: ground and roofs facing the sky never catch the grazing rim.
  float athenaSide = 1.0 - smoothstep(0.72, 0.97, athenaH);
  outgoingLight += uAthenaRim * athenaFresnel * athenaSide * (0.15 + 1.4 * athenaBack * athenaBack)
    * uAthenaRimStrength;
}`;

export interface MeshShape {
  /** Geometry `type` when the geometry still knows it (procedural builds). */
  readonly geometryType?: string;
  /** Local bounding-box size. */
  readonly size: readonly [number, number, number];
  readonly hasNormals: boolean;
  readonly transparent: boolean;
  readonly doubleSided: boolean;
  readonly isPoints: boolean;
  readonly isLine: boolean;
  readonly name?: string;
}

const FLAT_GEOMETRIES = new Set([
  "PlaneGeometry",
  "CircleGeometry",
  "ShapeGeometry",
  "RingGeometry",
]);
/** Below this thickness (m) a mesh is a card/decal; a hull would show as a black slab. */
export const FLAT_EPSILON = 0.02;
/** Parts smaller than this (bounding-box diagonal, kit metres) get no hull (kit viewer rule). */
export const MIN_OUTLINE_SIZE = 0.12;
/** Guides and FX that the kit viewer never outlines. */
const NO_OUTLINE_NAME = /^(__ink|orbit_path|curve|dash|crater|cloud|prominence|flare|points)/;

/**
 * Whether a mesh gets an ink hull. Skips Points/Lines, transparent and double-sided
 * materials, tiny parts ({@link MIN_OUTLINE_SIZE}), and flat cards: Plane/Circle/Shape/Ring
 * geometries, or (for GLB geometry, which loses its type) any mesh thinner than
 * {@link FLAT_EPSILON} on some axis.
 */
export function shouldOutline(shape: MeshShape) {
  if (shape.isPoints || shape.isLine || shape.transparent || shape.doubleSided) return false;
  if (!shape.hasNormals) return false;
  if (shape.geometryType && FLAT_GEOMETRIES.has(shape.geometryType)) return false;
  if (shape.name && NO_OUTLINE_NAME.test(shape.name)) return false;
  if (Math.hypot(...shape.size) < MIN_OUTLINE_SIZE) return false;
  return Math.min(...shape.size) >= FLAT_EPSILON;
}

/** Whether a material can become MeshToonMaterial without losing behaviour. */
export function isConvertibleMaterial(material: { type?: string } | undefined) {
  return (
    !!material &&
    [
      "MeshStandardMaterial",
      "MeshPhysicalMaterial",
      "MeshLambertMaterial",
      "MeshPhongMaterial",
    ].includes(material.type ?? "")
  );
}

export const toonOptions: AthenaToonOptions = renderingDefinition.toon;

/**
 * The recovered renderer draws the scene into two targets (MRT): colour (alpha = surface
 * id) and `gInfo` = (depth, sphere-mapped view normal, screen-space outline weight), which
 * the `outlines`/`waterPass` post passes read. A material that writes only `gl_FragColor`
 * fails with "missing fragment shader outputs", so Athena materials write `gInfo` too, and
 * use the legacy fog (`fog_default` + shared `fogUniforms`) so one fog covers both worlds.
 * Their screen-space outline weight is 0: Athena meshes are inked by the hull instead.
 */
export function legacyPipelineChunks(scope: LegacyContext) {
  const ready =
    !scope.athenaStandardPipeline &&
    typeof scope.encoding_default === "string" &&
    typeof scope.fog_default === "string";
  return {
    ready,
    header: ready
      ? `layout(location = 1) out highp vec4 gInfo;\nvarying vec2 vHighPrecisionZW;\n${scope.encoding_default}\n${scope.fog_default}\n`
      : "",
    gInfo: (normal: string) =>
      ready
        ? `gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), encodeNormalSpheremap(${normal}), 0.0);`
        : "",
    fog: (color: string, depth: string) => (ready ? `addFog(${color}, ${depth});` : ""),
    uniforms: (ready ? scope.fogUniforms : {}) as Record<string, { value: unknown }>,
  };
}

/** Patch a built-in (toon) material so it renders into the legacy MRT pipeline. */
function joinLegacyPipeline(scope: LegacyContext, material: Material) {
  const chunks = legacyPipelineChunks(scope);
  if (!chunks.ready) return;
  material.onBeforeCompile = (shader: LegacyContext) => {
    Object.assign(shader.uniforms, chunks.uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vHighPrecisionZW;")
      .replace(
        "#include <project_vertex>",
        "#include <project_vertex>\nvHighPrecisionZW = gl_Position.zw;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${chunks.header}`)
      .replace(
        "#include <opaque_fragment>",
        `${chunks.fog("outgoingLight", "vViewPosition.z")}\n#include <opaque_fragment>\n${chunks.gInfo("normal")}`,
      );
  };
  material.customProgramCacheKey = () => "athena-toon-mrt";
}

const INK_VERTEX = /* glsl */ `
uniform float thickness;
varying vec2 vHighPrecisionZW;
varying float vDepth;
#include <common>
#include <skinning_pars_vertex>
void main() {
  vec3 transformed = position;
  vec3 objectNormal = normal;
  // Skinned hulls follow their mesh (merge.ts turns node-animated characters into one
  // SkinnedMesh); the chunks are no-ops without USE_SKINNING.
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <skinning_vertex>
  #ifdef USE_INSTANCING
    transformed = (instanceMatrix * vec4(transformed, 1.0)).xyz;
    objectNormal = mat3(instanceMatrix) * objectNormal;
  #endif
  vec4 mv = modelViewMatrix * vec4(transformed, 1.0);
  vec3 n = normalize(normalMatrix * objectNormal);
  mv.xyz += n * thickness * (-mv.z);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
  vHighPrecisionZW = gl_Position.zw;
}`;
const inkFragment = (chunks: ReturnType<typeof legacyPipelineChunks>) => /* glsl */ `
uniform vec3 inkColor;
varying float vDepth;
${chunks.ready ? chunks.header : "varying vec2 vHighPrecisionZW;"}
void main() {
  vec3 color = inkColor;
  ${chunks.fog("color", "vDepth")}
  gl_FragColor = vec4(color, 1.0);
  ${chunks.gInfo("vec3(0.0, 0.0, 1.0)")}
}`;

export interface AthenaToon {
  readonly options: AthenaToonOptions;
  /** Present in soft mode: per-frame light uniforms shared by every converted material. */
  readonly lighting?: SoftLighting;
  /** Toon material for `material` (cached per source material). */
  toonMaterial(material: Material): Material;
  /** Convert materials and add ink hulls below `root`. Idempotent. */
  apply(root: Object3D): Object3D;
  /** Fade every toon material and hull under `root` (house crossfades). */
  setOpacity(root: Object3D, opacity: number): void;
  dispose(): void;
}

export function createAthenaToon(
  scope: LegacyContext,
  options: AthenaToonOptions = toonOptions,
): AthenaToon {
  // Created on first use, so a scope without Three classes (tests, degraded runtime) is fine.
  let resources: { gradientMap: LegacyContext; ink: Material } | undefined;
  const gpu = () => {
    if (resources) return resources;
    const ramp = options.soft ? softRamp() : new Uint8Array(options.gradient);
    const gradientMap = new scope.DataTexture(ramp, ramp.length, 1, scope.RedFormat);
    gradientMap.minFilter = gradientMap.magFilter = options.soft
      ? scope.LinearFilter
      : scope.NearestFilter;
    gradientMap.generateMipmaps = false;
    gradientMap.needsUpdate = true;
    const chunks = legacyPipelineChunks(scope);
    const ink = new scope.ShaderMaterial({
      name: "athena_ink",
      side: scope.BackSide,
      uniforms: {
        ...chunks.uniforms,
        thickness: { value: options.outline.thickness },
        inkColor: { value: new scope.Color(options.outline.color) },
      },
      vertexShader: INK_VERTEX,
      fragmentShader: inkFragment(chunks),
    });
    owned.add(ink);
    resources = { gradientMap, ink };
    return resources;
  };
  const cache = new Map<Material, Material>();
  const owned = new Set<Material>();
  const lighting: SoftLighting | undefined =
    options.soft && scope.Vector3
      ? {
          uAthenaSun: { value: new scope.Vector3(0, 0.3, 0.95) },
          uAthenaSky: { value: new scope.Color("#9fc9e6") },
          uAthenaGround: { value: new scope.Color("#c99c6a") },
          uAthenaRim: { value: new scope.Color(1.0, 0.82, 0.6) },
          uAthenaShadow: { value: new scope.Color("#aab2e2") },
          uAthenaHemi: { value: 0.26 },
          uAthenaRimStrength: { value: 0.85 },
        }
      : undefined;

  /** Chain the painterly light onto a converted material (after any pipeline patch). */
  function soften(material: Material) {
    if (!lighting) return;
    const previous = material.onBeforeCompile.bind(material);
    material.onBeforeCompile = (shader: LegacyContext, renderer: LegacyContext) => {
      previous(shader, renderer);
      Object.assign(shader.uniforms, lighting);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vAthenaWorld;")
        .replace("#include <project_vertex>", `#include <project_vertex>\n${SOFT_VERTEX}`);
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
varying vec3 vAthenaWorld;
uniform vec3 uAthenaSun, uAthenaSky, uAthenaGround, uAthenaRim, uAthenaShadow;
uniform float uAthenaHemi, uAthenaRimStrength;`,
        )
        .replace("#include <opaque_fragment>", `${SOFT_FRAGMENT}\n#include <opaque_fragment>`);
    };
    material.customProgramCacheKey = () => "athena-soft-v1";
  }

  function toonMaterial(source: Material): Material {
    if (!options.enabled || !isConvertibleMaterial(source)) return source;
    const cached = cache.get(source);
    if (cached) return cached;
    const toon: Material = new scope.MeshToonMaterial({
      name: source.name,
      color: source.color,
      map: source.map ?? null,
      gradientMap: gpu().gradientMap,
      vertexColors: source.vertexColors,
      transparent: source.transparent,
      opacity: source.opacity,
      side: source.side,
      depthWrite: source.depthWrite,
      // Painterly mode never shows facets: smooth normals carry the soft ramp.
      flatShading: options.soft ? false : source.flatShading,
      alphaTest: source.alphaTest,
    });
    if (source.emissive) {
      toon.emissive.copy(source.emissive);
      toon.emissiveIntensity = source.emissiveIntensity;
      toon.emissiveMap = source.emissiveMap ?? null;
    }
    joinLegacyPipeline(scope, toon);
    soften(toon);
    cache.set(source, toon);
    owned.add(toon);
    return toon;
  }

  function hullFor(mesh: Object3D) {
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const geometry = mesh.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const size = geometry.boundingBox.getSize(new scope.Vector3());
    const worldScale = mesh.getWorldScale(new scope.Vector3());
    const shape: MeshShape = {
      geometryType: geometry.type,
      size: [size.x * worldScale.x, size.y * worldScale.y, size.z * worldScale.z],
      hasNormals: !!geometry.attributes.normal,
      transparent: !!material?.transparent,
      doubleSided: material?.side === scope.DoubleSide,
      isPoints: !!mesh.isPoints,
      isLine: !!mesh.isLine,
      name: mesh.name,
    };
    if (!options.outline.enabled || mesh.userData.athenaNoInk || !shouldOutline(shape))
      return undefined;
    const { ink } = gpu();
    const hull = mesh.isInstancedMesh
      ? new scope.InstancedMesh(geometry, ink, mesh.count)
      : mesh.isSkinnedMesh
        ? new scope.SkinnedMesh(geometry, ink)
        : new scope.Mesh(geometry, ink);
    if (mesh.isSkinnedMesh) {
      hull.bind(mesh.skeleton, mesh.bindMatrix);
      hull.boundingSphere = mesh.boundingSphere;
    }
    if (mesh.isInstancedMesh) {
      hull.instanceMatrix = mesh.instanceMatrix;
      hull.frustumCulled = mesh.frustumCulled;
    }
    hull.name = "__ink";
    hull.castShadow = false;
    hull.receiveShadow = false;
    hull.raycast = () => {};
    hull.userData.athenaInk = true;
    return hull;
  }

  return {
    options,
    lighting,
    toonMaterial,
    apply(root) {
      if (root.userData.athenaToon) return root;
      root.userData.athenaToon = true;
      const meshes: Object3D[] = [];
      root.updateMatrixWorld(true);
      root.traverse((object: Object3D) => {
        if ((object.isMesh || object.isInstancedMesh) && !object.userData.athenaInk)
          meshes.push(object);
      });
      for (const mesh of meshes) {
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map(toonMaterial)
          : toonMaterial(mesh.material);
        const hull = hullFor(mesh);
        if (hull) mesh.add(hull);
      }
      return root;
    },
    setOpacity(root, opacity) {
      root.traverse((object: Object3D) => {
        if (!object.material || object.userData.athenaInk) {
          if (object.userData.athenaInk) object.visible = opacity >= 0.999;
          return;
        }
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          material.userData.athenaOpaque ??= !material.transparent;
          material.userData.athenaDepthWrite ??= material.depthWrite;
          const opaque = opacity >= 0.999;
          material.transparent = !opaque || !material.userData.athenaOpaque;
          material.opacity = opacity;
          material.depthWrite = opaque && material.userData.athenaDepthWrite;
        }
      });
    },
    dispose() {
      for (const material of owned) material.dispose();
      owned.clear();
      cache.clear();
      resources?.gradientMap.dispose();
      resources = undefined;
    },
  };
}
