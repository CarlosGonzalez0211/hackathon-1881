import { taperedTube, lathe, bakeVertexColor } from "./geometry";
import type { AthenaInstallContext } from "../athena/install";
import { loadAthenaModel } from "../athena/models";
import type { LegacyContext } from "../runtime/legacy-context";
import { toonCardMaterial } from "./shade";
import { windMaterial } from "./look";
import {
  arcDistance,
  canOccupy,
  cross,
  direction,
  mul,
  norm,
  pathDistance,
  plots,
  inWelcomeCourtyard,
  surfacePoint,
  tangent,
  waterDepth,
  mountainHeight,
  TAU,
  RADIUS,
  type Obstacle,
  type Vec,
} from "./layout";

function basis(s: LegacyContext, object: LegacyContext, up: Vec, forward: Vec) {
  object.quaternion.setFromRotationMatrix(
    new s.Matrix4().makeBasis(
      new s.Vector3(...cross(up, tangent(forward, up))),
      new s.Vector3(...up),
      new s.Vector3(...tangent(forward, up)),
    ),
  );
}

type Patch = (shader: LegacyContext) => void;
/** Chain a shader patch onto a (toon) material and give the program its own cache key. */
function patchMaterial(material: LegacyContext, key: string, patch: Patch) {
  const previous = material.onBeforeCompile.bind(material);
  const previousKey = material.customProgramCacheKey.bind(material);
  material.onBeforeCompile = (shader: LegacyContext, renderer: LegacyContext) => {
    previous(shader, renderer);
    patch(shader);
  };
  material.customProgramCacheKey = () => `${previousKey()}-${key}`;
}

/**
 * Leaves pass light: a warm glow added to the lit colour that grows when the foliage sits
 * between the eye and the sun. Spliced after the toon pipeline's own light (it needs that
 * program's `vAthenaWorld` and `uAthenaSun`).
 */
function translucent(shader: LegacyContext, base: number, backlit: number) {
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <opaque_fragment>",
    `{
  vec3 athenaEye = normalize(cameraPosition - vAthenaWorld);
  float athenaThrough = saturate(dot(-athenaEye, uAthenaSun) * 0.5 + 0.5);
  outgoingLight += diffuseColor.rgb * vec3(1.0, 0.94, 0.72) * (${base.toFixed(2)} + ${backlit.toFixed(2)} * athenaThrough * athenaThrough);
}
#include <opaque_fragment>`,
  );
}

// ------------------------------------------------------------------------------ foliage atlas
/**
 * Atlas rectangles of `paint/foliage.mjs` (FOLIAGE_RECTS) as uv rects `[u, v, du, dv]` in glTF
 * convention (v runs down the image). `tests/village-landscape.test.ts` compares them with the
 * painter so the two never drift.
 */
export const ATLAS_RECTS = {
  leafCluster: [0, 0, 0.5, 0.5],
  bladeTuft: [0.5, 0, 0.5, 0.5],
  flowerDaisy: [8 / 512, 272 / 512, 96 / 512, 96 / 512],
  flowerCosmos: [108 / 512, 272 / 512, 96 / 512, 96 / 512],
  flowerButtercup: [208 / 512, 272 / 512, 96 / 512, 96 / 512],
  flowerBellflower: [308 / 512, 272 / 512, 96 / 512, 96 / 512],
  flowerPoppy: [408 / 512, 272 / 512, 96 / 512, 96 / 512],
  blossomCluster: [0, 384 / 512, 0.25, 0.25],
  ginkgoCluster: [0.25, 384 / 512, 0.25, 0.25],
} as const;
const FLOWERS = [
  ATLAS_RECTS.flowerDaisy,
  ATLAS_RECTS.flowerCosmos,
  ATLAS_RECTS.flowerButtercup,
  ATLAS_RECTS.flowerBellflower,
  ATLAS_RECTS.flowerPoppy,
] as const;
const ATLAS_KEY = "models/nature/athena-foliage-cards.glb";

const atlases = new WeakMap<object, Promise<LegacyContext | undefined>>();
/**
 * The painted foliage atlas: it travels inside `athena-foliage-cards.glb` (the generator's
 * only textured model), so the world needs no extra texture entry. Resolves to `undefined`
 * when the kit is not built, which leaves the cards hidden.
 */
function loadAtlas(ctx: AthenaInstallContext) {
  let loading = atlases.get(ctx);
  if (!loading) {
    loading = (async () => {
      const model = await loadAthenaModel(ctx, ATLAS_KEY, { toon: false, merge: false });
      let texture: LegacyContext | undefined;
      model.root.traverse((part: LegacyContext) => {
        const map = part.isMesh && !Array.isArray(part.material) ? part.material.map : undefined;
        if (map) texture ??= map;
      });
      if (texture) {
        texture.anisotropy = 4;
        texture.needsUpdate = true;
        ctx.onDispose?.(() => texture?.dispose());
      }
      return texture;
    })().catch(() => undefined);
    atlases.set(ctx, loading);
  }
  return loading;
}

/** Per-instance atlas rectangle and spherical shading normal for an alpha-card material. */
function atlasCards(
  ctx: AthenaInstallContext,
  wind: { value: number },
  { glow, tinted = false }: { glow?: readonly [number, number]; tinted?: boolean } = {},
) {
  const material = toonCardMaterial(ctx, null, {
    sphericalNormals: true,
    wind,
    alphaTest: tinted ? 0.5 : 0.45,
  });
  patchMaterial(
    material,
    `atlas-rect-v2${glow ? "-glow" : ""}${tinted ? "-tint" : ""}`,
    (shader) => {
      if (glow) translucent(shader, glow[0], glow[1]);
      if (tinted) {
        // Crown fringe: the atlas supplies only the leaf shapes and their light-to-dark
        // variation; the hue is the crown's own (instance colour), so the cards sit in the mass.
        shader.fragmentShader = shader.fragmentShader
          .replace(
            "#include <map_fragment>",
            `#ifdef USE_MAP
  vec4 athenaTexel = texture2D( map, vMapUv );
  diffuseColor.rgb *= clamp( dot( athenaTexel.rgb, vec3( 0.2126, 0.7152, 0.0722 ) ) / 0.32, 0.45, 1.45 );
  diffuseColor.a *= athenaTexel.a;
#endif`,
          )
          .replace("* uAthenaRimStrength;", "* uAthenaRimStrength * 0.0;");
      }
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\n#ifdef USE_INSTANCING\n  attribute vec4 aAtlasRect;\n#endif",
        )
        .replace(
          "#include <uv_vertex>",
          `#include <uv_vertex>
#if defined( USE_MAP ) && defined( USE_INSTANCING )
  vMapUv = vec2( aAtlasRect.x + uv.x * aAtlasRect.z, aAtlasRect.y + ( 1.0 - uv.y ) * aAtlasRect.w );
#endif`,
        );
    },
  );
  return material;
}

/** One quad (or a cross of `count` quads) standing on y = 0, uv 0..1, dark base to lit top. */
function cardGeometry(
  s: LegacyContext,
  width: number,
  height: number,
  count: number,
  bottom: number,
  top: number,
) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  for (let k = 0; k < count; k++) {
    const angle = (k / count) * Math.PI;
    const x = Math.cos(angle) * (width / 2);
    const z = -Math.sin(angle) * (width / 2);
    const base = positions.length / 3;
    positions.push(-x, 0, -z, x, 0, z, x, height, z, -x, height, -z);
    uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
    colors.push(bottom, bottom, bottom, bottom, bottom, bottom, top, top, top, top, top, top);
    for (let v = 0; v < 4; v++) normals.push(Math.sin(angle), 0, Math.cos(angle));
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new s.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new s.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("color", new s.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  return geometry;
}

// ------------------------------------------------------------------------------ trees
type Species = "broadleaf" | "cypress" | "blossom";
interface Profile {
  readonly key: string;
  /** Crown ellipsoid in tree space (for the shadow proxy and the fringe): centre, radii. */
  readonly centre: Vec;
  readonly radii: Vec;
  /** Base size range (a tree is scaled 0.85 .. 1.2 of this). */
  readonly size: number;
  readonly fringe: { width: number; height: number };
  /** The crown's baked ramp (deep at `lo`, light at `hi`), to tint the fringe like the crown. */
  readonly ramp: { deep: string; light: string; lo: number; hi: number; curve: number };
}
const SPECIES: Record<Species, Profile> = {
  broadleaf: {
    key: "models/nature/athena-tree-broadleaf",
    centre: [0.1, 3.5, 0],
    radii: [1.75, 1.1, 1.5],
    size: 1,
    fringe: { width: 0.95, height: 0.8 },
    ramp: { deep: "#3f7a5b", light: "#a8c97a", lo: 2.4, hi: 4.7, curve: 0.95 },
  },
  cypress: {
    key: "models/nature/athena-tree-cypress",
    centre: [0.1, 3.7, 0],
    radii: [0.75, 2.4, 0.75],
    size: 1.05,
    fringe: { width: 0.42, height: 0.4 },
    ramp: { deep: "#3f7a5b", light: "#8db677", lo: 1.25, hi: 6.3, curve: 1.15 },
  },
  blossom: {
    key: "models/nature/athena-tree-blossom",
    centre: [0.05, 2.8, 0],
    radii: [2.1, 0.95, 1.85],
    size: 1,
    fringe: { width: 1.1, height: 0.85 },
    ramp: { deep: "#c98a93", light: "#f3c9c4", lo: 2.05, hi: 3.8, curve: 0.85 },
  },
};
/** Cypress silhouette radius at height y (the profile of `nature.mjs`, ring bulges smoothed out). */
const SPIRE: readonly (readonly [number, number])[] = [
  [1.25, 0.0],
  [1.8, 0.8],
  [2.6, 0.62],
  [3.4, 0.54],
  [4.2, 0.42],
  [4.95, 0.28],
  [5.6, 0.1],
];
function spireRadius(y: number) {
  for (let i = 1; i < SPIRE.length; i++) {
    const [y1, r1] = SPIRE[i]!;
    if (y <= y1) {
      const [y0, r0] = SPIRE[i - 1]!;
      return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
  }
  return 0;
}
const SPECIES_ORDER: Species[] = ["broadleaf", "cypress", "blossom"];
/** A blossom tree grows only within this arc distance of a topic house. */
const BLOSSOM_RANGE = 9;
/** Where the sun sits when nothing else says (the surface engine retunes the uniform). */
const DEFAULT_SUN: Vec = [0, 0.3, 0.95];

/** Float copy of a loaded mesh with its node transform baked in (the kit is meshopt-quantised). */
function bakedGeometry(s: LegacyContext, mesh: LegacyContext) {
  mesh.updateWorldMatrix(true, false);
  const source = mesh.geometry;
  const geometry = new s.BufferGeometry();
  for (const [name, size] of [
    ["position", 3],
    ["normal", 3],
    ["color", 3],
  ] as const) {
    const attribute = source.attributes[name];
    if (!attribute) continue;
    const array = new Float32Array(attribute.count * size);
    for (let i = 0; i < attribute.count; i++) {
      array[i * size] = attribute.getX(i);
      array[i * size + 1] = attribute.getY(i);
      array[i * size + 2] = attribute.getZ(i);
    }
    geometry.setAttribute(name, new s.BufferAttribute(array, size));
  }
  if (!geometry.attributes.color)
    geometry.setAttribute(
      "color",
      new s.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3).fill(1), 3),
    );
  geometry.setIndex(
    source.index
      ? new s.BufferAttribute(Uint32Array.from(source.index.array as ArrayLike<number>), 1)
      : null,
  );
  geometry.applyMatrix4(mesh.matrixWorld);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/** `{ crown, trunk }` geometries of a tree GLB: parts are told apart by material name. */
async function loadTree(ctx: AthenaInstallContext, key: string) {
  const model = await loadAthenaModel(ctx, key, { toon: false, merge: false });
  const s = ctx.scope;
  model.root.updateMatrixWorld(true);
  const crown: LegacyContext[] = [];
  const trunk: LegacyContext[] = [];
  model.root.traverse((part: LegacyContext) => {
    if (!part.isMesh || part.isSkinnedMesh) return;
    (/bark|trunk/i.test(String(part.material?.name)) ? trunk : crown).push(bakedGeometry(s, part));
  });
  const merged = (list: LegacyContext[]) =>
    list.length > 1 ? s.mergeGeometries(list, false) : list[0];
  return { crown: merged(crown), trunk: merged(trunk) };
}

/** A stand-in crown and trunk until the kit loads: same pivot, same gradient, no wait. */
function placeholder(s: LegacyContext, species: Species) {
  const profile = SPECIES[species];
  const deep = new s.Color(species === "blossom" ? "#c98a93" : "#3f7a5b");
  const light = new s.Color(species === "blossom" ? "#f3c9c4" : "#a8c97a");
  const mixed = new s.Color();
  const [cx, cy, cz] = profile.centre;
  const [rx, ry, rz] = profile.radii;
  let crown: LegacyContext;
  if (species === "cypress") {
    crown = lathe(
      s,
      [
        [0.0, 1.25],
        [0.8, 1.8],
        [0.6, 3.2],
        [0.35, 4.8],
        [0.0, 6.3],
      ],
      10,
    );
  } else {
    crown = new s.SphereGeometry(1, 10, 7);
    const position = crown.attributes.position;
    for (let i = 0; i < position.count; i++)
      position.setXYZ(
        i,
        cx + position.getX(i) * rx,
        cy + position.getY(i) * ry,
        cz + position.getZ(i) * rz,
      );
    crown.computeVertexNormals();
  }
  crown.computeBoundingBox();
  const lo = crown.boundingBox.min.y;
  const span = crown.boundingBox.max.y - lo || 1;
  bakeVertexColor(s, crown, (p: LegacyContext) => {
    mixed.copy(deep).lerp(light, Math.min(1, Math.max(0, (p.y - lo) / span)));
    return [mixed.r, mixed.g, mixed.b];
  });
  const trunk = taperedTube(s, 0.12, 0.3, 3.2, 6, 3);
  trunk.translate(0.1, 1.6, 0);
  const brown = new s.Color("#8a6a53");
  bakeVertexColor(s, trunk, (p: LegacyContext) => {
    const k = 0.55 + 0.45 * Math.min(1, p.y / 1.2);
    return [brown.r * k, brown.g * k, brown.b * k];
  });
  return { crown, trunk };
}

/**
 * Sculpted foliage: three tree species (round broadleaf, cypress spire, blossom near houses)
 * with crowns that run from deep foliage at the base to light at the top, leaning trunks with a
 * root flare and one branch, and a fringe of painted leaf cards. One instance per tree for
 * each part; everything builds synchronously from placeholders and swaps in the kit geometry
 * when it resolves (a missing kit keeps the placeholders, which is what the tests see).
 */
export function createGroves(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  points: Vec[],
  time: { value: number },
  low = false,
) {
  const s = ctx.scope;
  const sunValue = ctx.toon?.lighting?.uAthenaSun?.value;
  const sun: Vec = sunValue ? [sunValue.x, sunValue.y, sunValue.z] : DEFAULT_SUN;

  const leaf = ctx.toon.toonMaterial(
    new s.MeshStandardMaterial({ color: "#ffffff", vertexColors: true, roughness: 1 }),
  );
  const bark = ctx.toon.toonMaterial(
    new s.MeshStandardMaterial({ color: "#ffffff", vertexColors: true, roughness: 1 }),
  );
  windMaterial(leaf, time);
  windMaterial(bark, time);
  // The one tree in twenty that turns ginkgo gold keeps the gradient's light and shade.
  patchMaterial(leaf, "ginkgo-v5", (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\n#ifdef USE_INSTANCING\n  attribute float aGinkgo;\n#endif",
      )
      .replace(
        "#include <color_vertex>",
        `#include <color_vertex>
#if defined( USE_COLOR ) && defined( USE_INSTANCING )
  float athenaLuma = dot( vColor, vec3( 0.2126, 0.7152, 0.0722 ) );
  float athenaRamp = clamp( ( position.y - 2.3 ) / 2.2, 0.0, 1.0 );
  vec3 athenaGold = mix( vec3( 0.479, 0.287, 0.048 ), vec3( 0.888, 0.644, 0.195 ), athenaRamp );
  athenaGold *= 0.74 * ( 0.8 + 0.4 * clamp( athenaLuma / 0.34, 0.0, 1.0 ) );
  vColor = mix( vColor, athenaGold, aGinkgo );
#endif`,
      );
    // No rim on crowns: a pale silhouette edge is what makes foliage read as plastic.
    shader.fragmentShader = shader.fragmentShader.replace(
      "* uAthenaRimStrength;",
      "* uAthenaRimStrength * 0.0;",
    );
    translucent(shader, 0.1, 0.1);
  });

  // Species per tree: the blossom is only planted close to a house (the topic houses).
  const species: Species[] = points.map((up, i) => {
    if (i % 20 === 7) return "broadleaf";
    const wanted = SPECIES_ORDER[i % 3]!;
    if (wanted !== "blossom") return wanted;
    return plots.some((plot) => arcDistance(up, plot.up) < BLOSSOM_RANGE) ? "blossom" : "broadleaf";
  });
  const ginkgo = points.map((_, i) => i % 20 === 7);

  const crowns: LegacyContext[] = [];
  const trunks: LegacyContext[] = [];
  const meshes = new Map<Species, { crown: LegacyContext; trunk: LegacyContext }>();
  const members = new Map<Species, number[]>();
  for (const name of SPECIES_ORDER) {
    const list = points.flatMap((_, i) => (species[i] === name ? [i] : []));
    members.set(name, list);
    if (!list.length) continue;
    const stand = placeholder(s, name);
    const crown = new s.InstancedMesh(stand.crown, leaf, Math.max(1, list.length));
    crown.count = list.length;
    crown.name = `athena-tree-crowns-${name}`;
    // Crowns cast through the proxy below and never receive: the proxy would shade them.
    crown.castShadow = false;
    crown.receiveShadow = false;
    const trunk = new s.InstancedMesh(stand.trunk, bark, Math.max(1, list.length));
    trunk.count = list.length;
    trunk.name = `athena-tree-trunks-${name}`;
    trunk.castShadow = true;
    trunk.receiveShadow = false;
    crown.geometry.setAttribute(
      "aGinkgo",
      new s.InstancedBufferAttribute(
        Float32Array.from({ length: Math.max(1, list.length) }, (_, k) =>
          list[k] !== undefined && ginkgo[list[k]!] ? 1 : 0,
        ),
        1,
      ),
    );
    meshes.set(name, { crown, trunk });
    crowns.push(crown);
    trunks.push(trunk);
  }

  // The shadow proxy: one low-poly ellipsoid per tree (the real crowns do not cast).
  const shadows = new s.InstancedMesh(
    new s.SphereGeometry(1, 6, 4),
    new s.MeshBasicMaterial({ colorWrite: false, depthWrite: false }),
    points.length,
  );
  shadows.name = "athena-grove-shadow-proxy";
  shadows.castShadow = true;

  // The fringe: six painted leaf cards per tree around the crown, shaded as part of it.
  const fringe = new s.InstancedMesh(
    cardGeometry(s, 1, 1, 1, 0.82, 1),
    atlasCards(ctx, time, { glow: [0.1, 0.1], tinted: true }),
    points.length * 6,
  );
  fringe.name = "athena-crown-fringe";
  fringe.castShadow = false;
  fringe.visible = false;
  const cardNormals = new Float32Array(points.length * 6 * 3);
  const cardRects = new Float32Array(points.length * 6 * 4);

  const object = new s.Object3D();
  const parent = new s.Object3D();
  const card = new s.Object3D();
  const matrix = new s.Matrix4();
  const tint = new s.Color();
  const sunDirection = norm(sun);
  const seen = new Map<Species, number>();
  points.forEach((up, i) => {
    const name = species[i]!;
    const profile = SPECIES[name];
    const slot = seen.get(name) ?? 0;
    seen.set(name, slot + 1);
    const size = profile.size * (0.85 + (i % 9) * 0.04);
    // +X of the model is the staircase side: turn it toward the sun, with a little yaw drift.
    const toward = tangent(sunDirection, up);
    const drift = Math.sin(i * 2.4) * 0.5;
    const heading = norm([
      toward[0] * Math.cos(drift) + cross(up, toward)[0] * Math.sin(drift),
      toward[1] * Math.cos(drift) + cross(up, toward)[1] * Math.sin(drift),
      toward[2] * Math.cos(drift) + cross(up, toward)[2] * Math.sin(drift),
    ]);
    parent.position.set(...surfacePoint(up, -0.08));
    basis(s, parent, up, cross(heading, up));
    parent.scale.setScalar(size);
    parent.updateMatrix();
    const target = meshes.get(name)!;
    target.crown.setMatrixAt(slot, parent.matrix);
    target.trunk.setMatrixAt(slot, parent.matrix);
    const shade = 0.93 + ((i * 7) % 5) * 0.03;
    target.crown.setColorAt(slot, tint.setRGB(shade, shade, shade));
    target.trunk.setColorAt(slot, tint.setRGB(1, 1, 1));
    object.position.set(...profile.centre);
    object.rotation.set(0, 0, 0);
    object.scale.set(...(profile.radii.map((r) => r * 1.02) as unknown as Vec));
    object.updateMatrix();
    shadows.setMatrixAt(i, matrix.multiplyMatrices(parent.matrix, object.matrix));

    // Six cards lying on the crown surface (tangent to it, never standing off it), more of
    // them toward the lit upper half, each tinted like the crown at its height.
    const [cx, cy, cz] = profile.centre;
    const [rx, ry, rz] = profile.radii;
    const inverse = new s.Matrix4();
    const ramp = profile.ramp;
    const deep = new s.Color(ramp.deep);
    const light = new s.Color(ramp.light);
    const gold = new s.Color("#f2d27a");
    for (let k = 0; k < 6; k++) {
      const theta = (k / 6) * TAU + i * 0.83 + Math.sin(i + k * 1.7) * 0.25;
      const along = [0.05, 0.3, 0.55, 0.18, 0.42, 0.1][(k + i) % 6]!;
      let px: number, py: number, pz: number;
      const outward = new s.Vector3();
      if (name === "cypress") {
        // The spire: follow its silhouette, not an ellipsoid.
        py = 1.95 + along * 3.4;
        const r = spireRadius(py) * 0.85;
        px = cx + Math.cos(theta) * r;
        pz = cz + Math.sin(theta) * r;
        outward.set(Math.cos(theta), 0.3, Math.sin(theta)).normalize();
      } else {
        const phi = 0.05 + along * 1.0;
        px = cx + Math.cos(theta) * Math.cos(phi) * rx * 0.84;
        py = cy + Math.sin(phi) * ry * 0.88;
        pz = cz + Math.sin(theta) * Math.cos(phi) * rz * 0.84;
        outward
          .set((px - cx) / (rx * rx), (py - cy) / (ry * ry), (pz - cz) / (rz * rz))
          .normalize();
      }
      // z = surface normal, y = the surface's uphill tangent, x across it.
      const z = outward.clone();
      const y = new s.Vector3(0, 1, 0).addScaledVector(z, -z.y);
      if (y.lengthSq() < 1e-4) y.set(1, 0, 0);
      y.normalize();
      const x = new s.Vector3().crossVectors(y, z).normalize();
      card.position.set(px, py, pz).addScaledVector(z, 0.02);
      card.quaternion.setFromRotationMatrix(matrix.makeBasis(x, y, z));
      card.rotateZ(Math.sin(i * 2.1 + k * 1.3) * 0.7);
      const grown = 0.85 + 0.3 * Math.abs(Math.sin(i * 1.3 + k));
      card.scale.set(profile.fringe.width * grown, profile.fringe.height * grown, 1);
      card.updateMatrix();
      const index = i * 6 + k;
      fringe.setMatrixAt(index, matrix.multiplyMatrices(parent.matrix, card.matrix));
      // The shading normal lives in the card's own space: undo the card rotation.
      inverse.makeRotationFromQuaternion(card.quaternion).invert();
      const n = outward.clone().applyMatrix4(inverse);
      cardNormals.set([n.x, n.y, n.z], index * 3);
      cardRects.set(ATLAS_RECTS.leafCluster, index * 4);
      // The crown's colour at this height, a touch darker (x 0.9): the card is part of the mass.
      const t = Math.pow(
        Math.min(1, Math.max(0, (py - ramp.lo) / (ramp.hi - ramp.lo))),
        ramp.curve,
      );
      tint.copy(deep).lerp(light, t);
      if (ginkgo[i]) {
        // Gold on the crown and on its fringe alike, the fringe slightly darker.
        const rampT = Math.min(1, Math.max(0, (py - 2.3) / 2.2));
        tint.set("#b8923e").lerp(gold, rampT).multiplyScalar(0.7);
      } else tint.multiplyScalar(0.9);
      fringe.setColorAt(index, tint);
    }
  });
  fringe.geometry.setAttribute("aCardNormal", new s.InstancedBufferAttribute(cardNormals, 3));
  fringe.geometry.setAttribute("aAtlasRect", new s.InstancedBufferAttribute(cardRects, 4));

  const all = [...crowns, ...trunks, shadows, ...(low ? [] : [fringe])];
  for (const mesh of all) {
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    root.add(mesh);
  }

  // Kit geometry: swap it in when each species resolves (crown LOD on the low tier).
  const swap = (mesh: LegacyContext, geometry: LegacyContext | undefined, keep?: string[]) => {
    if (!geometry) return;
    for (const name of keep ?? []) {
      const attribute = mesh.geometry.attributes[name];
      if (attribute) geometry.setAttribute(name, attribute);
    }
    const previous = mesh.geometry;
    mesh.geometry = geometry;
    mesh.computeBoundingSphere();
    previous.dispose?.();
  };
  const disposed = () => ctx.lifecycle?.disposed === true;
  for (const name of SPECIES_ORDER) {
    const target = meshes.get(name);
    if (!target) continue;
    void (async () => {
      try {
        const kit = await loadTree(ctx, `${SPECIES[name].key}${low ? "-lod" : ""}.glb`);
        if (disposed()) return;
        swap(target.crown, kit.crown, ["aGinkgo"]);
        // The low tier keeps the LOD file's stub trunk: no branch, a quarter of the triangles.
        swap(target.trunk, kit.trunk);
      } catch {
        /* the placeholder stays: the kit is not built */
      }
    })();
  }
  if (!low)
    void loadAtlas(ctx).then((texture) => {
      if (!texture || disposed()) return;
      fringe.material.map = texture;
      fringe.material.needsUpdate = true;
      fringe.visible = true;
    });
  return { crowns, trunks, fringe, shadows };
}

// ------------------------------------------------------------------------------ meadows
/**
 * Small-scale depth: tufts of painted blades (one card cross per point, two greens and a
 * straw tint beside the paths) and a few large wildflowers (five species, high tier only).
 * The cards come from the foliage atlas; they appear once it has loaded.
 */
export function createMeadows(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  obstacles: readonly Obstacle[],
  time: { value: number },
  low: boolean,
) {
  const s = ctx.scope;
  const points: Vec[] = [];
  const count = low ? 1700 : 6200;
  for (let i = 0; i < count; i++) {
    const up = direction(i * 2.399963, Math.asin(1 - (2 * (i + 0.5)) / count));
    const path = pathDistance(up);
    if (
      inWelcomeCourtyard(up) ||
      path < 1.58 ||
      waterDepth(up) > 0.03 ||
      mountainHeight(up) > 0.8 ||
      !canOccupy(up, obstacles, 0.1)
    )
      continue;
    points.push(up);
  }
  const tufts = new s.InstancedMesh(
    cardGeometry(s, 0.46, 0.43, 2, 0.8, 1),
    atlasCards(ctx, time),
    points.length,
  );
  tufts.name = "athena-flowing-meadow";
  tufts.visible = false;
  const tuftNormals = new Float32Array(points.length * 3);
  const tuftRects = new Float32Array(points.length * 4);
  const greens = ["#ffffff", "#e8f2c0"].map((hex) => new s.Color(hex));
  const straw = new s.Color(1.4, 1.05, 0.55);
  const object = new s.Object3D();
  points.forEach((up, i) => {
    const near = pathDistance(up) < 2.7 && i % 3 !== 0;
    object.position.set(...surfacePoint(up, -0.015));
    basis(s, object, up, [Math.sin(i * 1.9), 0.1, Math.cos(i * 1.9)]);
    object.rotateX(0.14 * Math.sin(i * 3.1));
    object.rotateZ(0.12 * Math.cos(i * 2.3));
    object.scale.setScalar(0.6 + (((i * 5) % 7) / 6) * 0.7);
    object.updateMatrix();
    tufts.setMatrixAt(i, object.matrix);
    tufts.setColorAt(i, near ? straw : greens[i % 2]!);
    tuftNormals.set([0, 1, 0], i * 3);
    tuftRects.set(ATLAS_RECTS.bladeTuft, i * 4);
  });
  tufts.geometry.setAttribute("aCardNormal", new s.InstancedBufferAttribute(tuftNormals, 3));
  tufts.geometry.setAttribute("aAtlasRect", new s.InstancedBufferAttribute(tuftRects, 4));

  const meshes = [tufts];
  if (!low) {
    // Fewer, larger flowers: one in nine, more beside the paths.
    const flowerPoints = points.filter(
      (up, i) => i % 9 === 0 || (pathDistance(up) < 3.1 && i % 5 === 0),
    );
    const flowers = new s.InstancedMesh(
      cardGeometry(s, 0.7, 0.7, 2, 0.8, 1),
      atlasCards(ctx, time),
      flowerPoints.length,
    );
    flowers.name = "athena-wildflower-gardens";
    flowers.visible = false;
    const flowerNormals = new Float32Array(flowerPoints.length * 3);
    const flowerRects = new Float32Array(flowerPoints.length * 4);
    flowerPoints.forEach((up, i) => {
      object.position.set(...surfacePoint(up, -0.01));
      basis(s, object, up, [Math.sin(i * 1.57), 0.1, Math.cos(i * 1.57)]);
      object.rotateX(0.1 * Math.sin(i * 1.3));
      object.scale.setScalar(0.85 + (i % 5) * 0.1);
      object.updateMatrix();
      flowers.setMatrixAt(i, object.matrix);
      flowers.setColorAt(i, greens[0]!);
      flowerNormals.set([0, 1, 0], i * 3);
      flowerRects.set(FLOWERS[(i * 7 + (i >> 2)) % FLOWERS.length]!, i * 4);
    });
    flowers.geometry.setAttribute("aCardNormal", new s.InstancedBufferAttribute(flowerNormals, 3));
    flowers.geometry.setAttribute("aAtlasRect", new s.InstancedBufferAttribute(flowerRects, 4));
    meshes.push(flowers);
  }
  for (const mesh of meshes) {
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    mesh.frustumCulled = true;
    root.add(mesh);
  }
  void loadAtlas(ctx).then((texture) => {
    if (!texture || ctx.lifecycle?.disposed) return;
    for (const mesh of meshes) {
      mesh.material.map = texture;
      mesh.material.needsUpdate = true;
      mesh.visible = true;
    }
  });
  return { meshes };
}

// ------------------------------------------------------------------------------ clouds
/**
 * Soft cumulus orbit the globe and face the camera in both walking and aerial views. Each
 * cloud is one of four authored silhouettes (a cumulus heap, a tower, a long bank, a pair),
 * painted in two tones: a flat violet underside and a sun-lit cream top with a warm ridge on
 * its upper edge, plus HDR silver linings when backlit. A tilted ring of larger banks reads
 * as a sea of cloud around the floating world from above.
 */
export function createCloudBelt(ctx: AthenaInstallContext, root: LegacyContext) {
  const s = ctx.scope,
    group = new s.Group();
  group.name = "athena-drifting-cloud-belt";
  const uniforms = {
    uSun: ctx.toon?.lighting?.uAthenaSun ?? { value: new s.Vector3(0, 0.3, 0.95) },
  };
  const material = new s.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: `
      uniform vec3 uSun;
      varying vec2 vUv; varying float vSeed; varying vec3 vSunView;
      void main(){
        vUv=uv;
        vec4 center=modelMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0);
        // Seed from the fixed instance offset, not the rotating world position, so each
        // cloud keeps its shape while the belt drifts.
        vSeed=dot(instanceMatrix[3].xyz,vec3(.131,.173,.117));
        vSunView=normalize((viewMatrix*vec4(uSun,0.0)).xyz);
        vec4 view=viewMatrix*center;
        float scale=length(instanceMatrix[0].xyz);
        view.xy+=position.xy*scale;
        gl_Position=projectionMatrix*view;
      }
    `,
    fragmentShader: `
      varying vec2 vUv; varying float vSeed; varying vec3 vSunView;
      float h(float n){return fract(sin(n)*43758.5453);}
      vec3 lin(vec3 c){return pow(c,vec3(2.2));}
      // Four authored silhouettes: seven blobs each (centre x, centre y, radius).
      const vec3 SHAPES[28] = vec3[28](
        vec3(-.95,-.10,.28), vec3(-.58,.02,.40), vec3(-.12,.12,.52), vec3(.38,.05,.44),
        vec3(.82,-.04,.32), vec3(.12,-.16,.36), vec3(-.3,.3,.27),
        vec3(-.62,-.10,.32), vec3(-.2,.0,.44), vec3(.0,.34,.36), vec3(.04,.64,.25),
        vec3(.5,-.06,.40), vec3(.92,-.14,.27), vec3(-.05,.12,.4),
        vec3(-1.15,-.14,.24), vec3(-.74,-.06,.31), vec3(-.28,-.02,.36), vec3(.22,-.04,.35),
        vec3(.7,-.08,.31), vec3(1.12,-.14,.23), vec3(0.0,.12,.27),
        vec3(-.75,-.04,.38), vec3(-.4,.2,.31), vec3(-.05,.0,.30), vec3(.3,.06,.43),
        vec3(.64,.24,.29), vec3(1.0,-.08,.27), vec3(.2,.3,.25)
      );
      void main(){
        vec2 p=(vUv-.5)*vec2(2.8,1.5);
        int shape=int(clamp(floor(h(vSeed*3.17+1.3)*4.0),0.0,3.0));
        float alpha=0.0, front=-1.0, edge=1.0;
        vec3 n=vec3(0.0,0.0,1.0);
        for(int i=0;i<7;i++){
          vec3 blob=SHAPES[shape*7+i];
          // A little per-cloud variation so two banks of one silhouette are not twins.
          blob.xy+=(vec2(h(vSeed+float(i)),h(vSeed*1.7+float(i)))-.5)*.08;
          vec2 d=(p-blob.xy)/blob.z;
          float q=dot(d,d);
          if(q<1.0){
            float z=sqrt(1.0-q)*blob.z;
            if(z>front){front=z;n=normalize(vec3(d,sqrt(1.0-q)));}
          }
          alpha=max(alpha,1.0-smoothstep(.80,1.0,q));
          edge=min(edge,sqrt(q)-1.0);
        }
        alpha*=smoothstep(-.44,-.26,p.y);
        if(alpha<.01) discard;
        float lit=dot(n,vSunView)*.5+.5;
        vec3 cream=lin(vec3(1.0,.97,.93)), violet=lin(vec3(.64,.62,.86)), warm=lin(vec3(1.0,.84,.60));
        // Two painted tones: a flat violet belly under a lit cream top, soft only at the seam.
        vec3 c=mix(violet,cream,smoothstep(.40,.52,lit));
        c=mix(c,violet*.94,smoothstep(.06,-.2,p.y));
        // The ridge: a warm lit edge along the upper outline.
        float ridge=smoothstep(.45,.85,n.y)*(1.0-smoothstep(.0,.38,front));
        c=mix(c,warm*1.08,ridge*.85);
        float back=clamp(-vSunView.z,0.0,1.0);
        float rim=pow(1.0-n.z,2.4);
        c+=lin(vec3(1.0,.8,.55))*rim*(.25+1.7*back*back);
        gl_FragColor=vec4(c,alpha*.97);
      }
    `,
  });
  const high = 18,
    banks = 14;
  const mesh = new s.InstancedMesh(new s.PlaneGeometry(6.0, 2.8), material, high + banks);
  mesh.name = "athena-painted-cloud-banks";
  const obj = new s.Object3D();
  for (let i = 0; i < high; i++) {
    const lon = (i * TAU) / high + Math.sin(i * 1.3) * 0.2,
      lat = 0.25 + Math.sin(i * 2.4) * 0.85,
      up = direction(lon, lat);
    obj.position.set(...mul(up, RADIUS + 12 + (i % 3) * 1.8));
    obj.scale.setScalar(0.9 + (i % 4) * 0.18);
    obj.updateMatrix();
    mesh.setMatrixAt(i, obj.matrix);
  }
  // The bank ring is tilted so it crosses the aerial view as a soft diagonal belt.
  const tilt = 0.42;
  for (let i = 0; i < banks; i++) {
    const a = (i * TAU) / banks;
    const x = Math.cos(a),
      z = Math.sin(a);
    const v: [number, number, number] = [x, z * Math.sin(tilt), z * Math.cos(tilt)];
    obj.position.set(...mul(v, RADIUS + 10.5 + (i % 2) * 1.6));
    obj.scale.setScalar(2.1 + (i % 3) * 0.45);
    obj.updateMatrix();
    mesh.setMatrixAt(high + i, obj.matrix);
  }
  mesh.computeBoundingSphere();
  group.add(mesh);
  root.add(group);
  return {
    tick(time: number) {
      group.rotation.y = time * 0.008;
    },
  };
}
