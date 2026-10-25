import type { AthenaInstallContext } from "../athena/install";
import { localBounds } from "../athena/models";
import type { LegacyContext } from "../runtime/legacy-context";

/**
 * Signature capes and scarves. Every character gets flowing cloth cut from its own outfit
 * colour with a glowing gold hem; a damped spring lifts it with speed and lets it settle,
 * and a shared breeze keeps it alive at rest. The cloth bends in the vertex shader, so
 * twenty characters cost twenty small draws and no CPU skinning.
 */
export interface Cloth {
  readonly mesh: LegacyContext;
  /** Advance the spring: `speed` in m/s along the facing, `turn` in rad/s. */
  tick(dt: number, time: number, speed: number, turn: number, reduced: boolean): void;
}

export type ClothStyle = "cape" | "scarf";

const CLOTH_VERTEX = /* glsl */ `
float athenaK = pow(clamp(-position.y / uClothLength, 0.0, 1.0), 1.5);
float athenaEdge = abs(clothUv.x - 0.5) * 2.0;
transformed.z -= athenaK * uClothSwing.y * uClothLength;
transformed.y += athenaK * athenaK * uClothSwing.y * uClothLength * 0.4;
transformed.x += athenaK * uClothSwing.x * uClothLength;
transformed.z -= sin(uClothTime * 3.1 + position.y * 7.0 + position.x * 5.0) * 0.03 * athenaK * uClothFlutter;
transformed.x += cos(uClothTime * 2.3 + position.y * 5.0) * 0.012 * athenaK * athenaEdge * uClothFlutter;
vClothUv = clothUv;`;

const CLOTH_FRAGMENT = /* glsl */ `
float athenaHem = smoothstep(0.84, 0.86, vClothUv.y) * (1.0 - smoothstep(0.9, 0.92, vClothUv.y));
vec2 athenaCell = vec2(fract(vClothUv.x * 6.0) - 0.5, vClothUv.y - 0.7);
float athenaStar = 1.0 - smoothstep(0.03, 0.05, abs(athenaCell.x) + abs(athenaCell.y) * 1.6);
totalEmissiveRadiance += uClothGlow * (athenaHem + athenaStar * 0.8);
// Thin cloth transmits the low sun: backlit capes glow in their own colour.
totalEmissiveRadiance += diffuseColor.rgb * 0.32;`;

function clothGeometry(s: LegacyContext, width: number, length: number, style: ClothStyle) {
  const columns = style === "cape" ? 10 : 4,
    rows = 16;
  const positions: number[] = [],
    uvs: number[] = [],
    colors: number[] = [],
    indices: number[] = [];
  for (let y = 0; y <= rows; y++)
    for (let x = 0; x <= columns; x++) {
      const u = x / columns,
        v = y / rows;
      // Capes widen towards a softly rounded hem and wrap around the shoulders.
      const flare = style === "cape" ? 0.62 + 0.38 * v : 1;
      const across = (u - 0.5) * width * flare;
      const hem = style === "cape" ? 1 - 0.1 * Math.pow(Math.abs(u - 0.5) * 2, 2) : 1;
      const wrap =
        style === "cape" ? Math.pow(Math.abs(u - 0.5) * 2, 2) * width * 0.28 * (1 - v * 0.6) : 0;
      positions.push(across, -v * length * hem, wrap);
      uvs.push(u, v);
      colors.push(1 - v * 0.32, 1 - v * 0.38, 1 - v * 0.2);
    }
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < columns; x++) {
      const a = y * (columns + 1) + x,
        b = a + columns + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  // Own attribute name: the built-in `uv` is only declared when a material uses maps.
  geometry.setAttribute("clothUv", new s.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("color", new s.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** The most saturated outfit colour (tops first), so each cape belongs to its wearer. */
export function outfitColour(s: LegacyContext, root: LegacyContext) {
  let best: LegacyContext | undefined,
    score = -1;
  const hsl = { h: 0, s: 0, l: 0 };
  root.traverse((mesh: LegacyContext) => {
    if (!mesh.isMesh) return;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      if (!material?.color) continue;
      const name = String(material.name ?? "");
      if (/skin|hair|eye|blush|lips|sole|shoe|paper|ink/.test(name)) continue;
      material.color.getHSL(hsl);
      const value = hsl.s * (1 - Math.abs(hsl.l - 0.45)) + (/^top/.test(name) ? 0.3 : 0);
      if (value > score) {
        score = value;
        best = material.color;
      }
    }
  });
  return best ? new s.Color().copy(best) : new s.Color("#b5432f");
}

/**
 * Hang cloth from the wearer's shoulders. It parents to the chest/torso node when the rig
 * has one, so it follows the upper body through every clip.
 */
export function dressWithCloth(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  style: ClothStyle,
  colour?: LegacyContext,
): Cloth | undefined {
  const s = ctx.scope;
  if (!s.BufferGeometry || !s.MeshStandardMaterial) return undefined;
  const bounds = localBounds(s, root);
  const height = bounds.max.y - bounds.min.y;
  if (!(height > 0.2)) return undefined;
  const width = style === "cape" ? height * 0.34 : height * 0.1,
    length = style === "cape" ? height * 0.5 : height * 0.44;
  const tint = colour ?? outfitColour(s, root);
  const base = new s.MeshStandardMaterial({
    color: tint,
    vertexColors: true,
    side: s.DoubleSide,
    roughness: 1,
  });
  const material = ctx.toon.toonMaterial(base);
  const uniforms = {
    uClothSwing: { value: new s.Vector2(0, style === "scarf" ? 0.42 : 0.06) },
    uClothLength: { value: length },
    uClothTime: { value: 0 },
    uClothFlutter: { value: 1 },
    uClothGlow: { value: new s.Color(1.25, 0.82, 0.32) },
  };
  // Per-wearer uniforms on a material that shares one program with every other cloth.
  const cloth = material.clone();
  const previous = material.onBeforeCompile.bind(material);
  const previousKey = material.customProgramCacheKey.bind(material);
  cloth.onBeforeCompile = (shader: LegacyContext, renderer: LegacyContext) => {
    previous(shader, renderer);
    Object.assign(shader.uniforms, uniforms);
    const header =
      "attribute vec2 clothUv; uniform vec2 uClothSwing; uniform float uClothLength, uClothTime, uClothFlutter; varying vec2 vClothUv;\n";
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${header}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\n${CLOTH_VERTEX}`);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform vec3 uClothGlow; varying vec2 vClothUv;",
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>\n${CLOTH_FRAGMENT}`,
      );
  };
  cloth.customProgramCacheKey = () => `${previousKey()}-cloth-v1`;
  ctx.onDispose(() => {
    cloth.dispose();
    base.dispose();
  });
  const mesh = new s.Mesh(clothGeometry(s, width, length, style), cloth);
  mesh.name = style === "cape" ? "athena-signature-cape" : "athena-traveller-scarf";
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  mesh.raycast = () => {};
  mesh.userData.athenaNoInk = true;
  const parent =
    root.getObjectByName("chest") ?? root.getObjectByName("torso") ?? root.getObjectByName("body");
  root.updateMatrixWorld(true);
  // Shoulder line on the garment itself, never on satchels, books or packs that stick out:
  // the cloth must lie against the back, not hover behind the widest prop.
  const garment = root.getObjectByName("shirt") ?? root.getObjectByName("top_detail") ?? parent;
  const back = garment ? new s.Box3().setFromObject(garment) : undefined;
  back?.applyMatrix4(root.matrixWorld.clone().invert());
  const torsoTop = back && !back.isEmpty() ? back.max.y : bounds.min.y + height * 0.74;
  const anchor = new s.Vector3(
    0,
    Math.min(torsoTop - height * 0.03, bounds.min.y + height * 0.76),
    back && !back.isEmpty() ? back.min.z + height * 0.012 : bounds.min.z,
  );
  if (parent) {
    const world = anchor.clone().applyMatrix4(root.matrixWorld);
    parent.add(mesh);
    parent.worldToLocal(world);
    mesh.position.copy(world);
    // Cancel any rotation/scale the bone carries so the cloth hangs along the body.
    const inverse = parent.getWorldQuaternion(new s.Quaternion()).invert();
    mesh.quaternion.copy(inverse.multiply(root.getWorldQuaternion(new s.Quaternion())));
    const scale = parent.getWorldScale(new s.Vector3());
    const rootScale = root.getWorldScale(new s.Vector3());
    mesh.scale.set(rootScale.x / scale.x, rootScale.y / scale.y, rootScale.z / scale.z);
  } else {
    root.add(mesh);
    mesh.position.copy(anchor);
  }
  ctx.onDispose(() => mesh.geometry.dispose());
  const rest = style === "scarf" ? 0.42 : 0.06;
  const swing = { x: 0, y: rest, vx: 0, vy: 0 };
  return {
    mesh,
    tick(dt, time, speed, turn, reduced) {
      if (reduced) {
        uniforms.uClothSwing.value.set(0, rest);
        uniforms.uClothFlutter.value = 0;
        return;
      }
      const lift = rest + Math.min(1.25, speed * (style === "scarf" ? 0.32 : 0.2));
      const side = Math.max(-0.6, Math.min(0.6, -turn * 0.18));
      // Critically damped-ish spring: quick to lift, gentle to settle.
      const k = 38,
        c = 7.5;
      swing.vx += (k * (side - swing.x) - c * swing.vx) * dt;
      swing.vy += (k * (lift - swing.y) - c * swing.vy) * dt;
      swing.x += swing.vx * dt;
      swing.y += swing.vy * dt;
      uniforms.uClothSwing.value.set(swing.x, Math.max(0, swing.y));
      uniforms.uClothTime.value = time;
      uniforms.uClothFlutter.value = 0.6 + Math.min(1.6, speed * 0.4);
    },
  };
}
