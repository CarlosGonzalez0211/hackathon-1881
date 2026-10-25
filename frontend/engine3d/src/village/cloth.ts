import type { AthenaInstallContext } from "../athena/install";
import { localBounds } from "../athena/models";
import type { LegacyContext } from "../runtime/legacy-context";

/**
 * Signature capes. Every character gets flowing cloth cut from its own outfit
 * colour with a glowing gold hem; a damped spring lifts it with speed and lets it settle,
 * and a shared breeze keeps it alive at rest. The cloth bends in the vertex shader, so
 * twenty characters cost twenty small draws and no CPU skinning.
 */
export interface Cloth {
  readonly mesh: LegacyContext;
  /** Advance the spring: `speed` in m/s along the facing, `turn` in rad/s. */
  tick(dt: number, time: number, speed: number, turn: number, reduced: boolean): void;
}

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
// Thin cloth transmits the low sun: with the sun behind the wearer the cape glows in its own
// colour, warmed by the light passing through, and stays softly lit from the front.
vec3 athenaSun = normalize(vec3(-0.4, 0.8, 0.6));
#if NUM_DIR_LIGHTS > 0
  athenaSun = directionalLights[0].direction;
#endif
vec3 athenaView = normalize(vViewPosition);
float athenaThrough = pow(clamp(dot(athenaSun, -athenaView) * 0.5 + 0.5, 0.0, 1.0), 2.0);
float athenaThin = 1.0 - 0.45 * abs(dot(normalize(normal), athenaSun));
totalEmissiveRadiance += diffuseColor.rgb * (0.2 + 0.62 * athenaThrough * athenaThin) * mix(vec3(1.0), vec3(1.12, 0.92, 0.7), athenaThrough);`;

function capeGeometry(s: LegacyContext, width: number, length: number) {
  const columns = 10,
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
      const flare = 0.62 + 0.38 * v;
      const across = (u - 0.5) * width * flare;
      const hem = 1 - 0.1 * Math.pow(Math.abs(u - 0.5) * 2, 2);
      const wrap = Math.pow(Math.abs(u - 0.5) * 2, 2) * width * 0.28 * (1 - v * 0.6);
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
  // Own attribute name, so the shared toon program never confuses it with texture UVs.
  geometry.setAttribute("clothUv", new s.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("color", new s.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * The cape colour of a wearer. Characters are vertex-coloured: the mantle (`athena_style` 5)
 * names it outright; otherwise the cloth (style 4 or woven 7). Either way the colour is the
 * dominant hue (the most vertices of one of twelve hue bins, near-greys ignored), so a gold hem
 * or a pale lining never outvotes the body of the garment.
 */
export function outfitColour(s: LegacyContext, root: LegacyContext) {
  const bins = (): { r: number; g: number; b: number; n: number }[] =>
    Array.from({ length: 12 }, () => ({ r: 0, g: 0, b: 0, n: 0 }));
  const mantle = bins();
  const cloth = bins();
  const tint = new s.Color();
  const hsl = { h: 0, s: 0, l: 0 };
  root.traverse((mesh: LegacyContext) => {
    if (!mesh.isMesh) return;
    const colors = mesh.geometry?.attributes?.color;
    const styles = mesh.geometry?.attributes?._athena_style;
    if (colors && styles) {
      for (let i = 0; i < colors.count; i++) {
        const style = Math.round(styles.getX(i));
        if (style !== 5 && style !== 4 && style !== 7) continue;
        tint.setRGB(colors.getX(i), colors.getY(i), colors.getZ(i));
        tint.getHSL(hsl);
        if (hsl.s < 0.12) continue;
        const bin = (style === 5 ? mantle : cloth)[Math.min(11, Math.floor(hsl.h * 12))]!;
        bin.r += tint.r;
        bin.g += tint.g;
        bin.b += tint.b;
        bin.n++;
      }
      return;
    }
    // Legacy models without painted categories: the saturated material colours.
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      if (
        !material?.color ||
        /skin|hair|eye|blush|lips|sole|shoe|paper|ink/.test(String(material.name ?? ""))
      )
        continue;
      material.color.getHSL(hsl);
      if (hsl.s < 0.12) continue;
      const bin = cloth[Math.min(11, Math.floor(hsl.h * 12))]!;
      bin.r += material.color.r;
      bin.g += material.color.g;
      bin.b += material.color.b;
      bin.n++;
    }
  });
  const dominant = (list: { r: number; g: number; b: number; n: number }[]) =>
    list.reduce((best, bin) => (bin.n > best.n ? bin : best), list[0]!);
  const mantleBin = dominant(mantle);
  const pick = mantleBin.n > 0 ? mantleBin : dominant(cloth);
  return pick.n > 0
    ? new s.Color(pick.r / pick.n, pick.g / pick.n, pick.b / pick.n)
    : new s.Color("#b5432f");
}

/**
 * Hang a cape from the wearer's shoulders. It parents to the chest/torso node when the rig
 * has one, so it follows the upper body through every clip.
 */
export function dressWithCloth(
  ctx: AthenaInstallContext,
  root: LegacyContext,
  colour?: LegacyContext,
): Cloth | undefined {
  const s = ctx.scope;
  if (!s.BufferGeometry || !s.MeshStandardMaterial) return undefined;
  const bounds = localBounds(s, root);
  const height = bounds.max.y - bounds.min.y;
  if (!(height > 0.2)) return undefined;
  const width = height * 0.34,
    length = height * 0.5;
  const tint = colour ?? outfitColour(s, root);
  const base = new s.MeshStandardMaterial({
    color: tint,
    vertexColors: true,
    side: s.DoubleSide,
    roughness: 1,
  });
  const material = ctx.toon.toonMaterial(base);
  const uniforms = {
    uClothSwing: { value: new s.Vector2(0, 0.06) },
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
  cloth.customProgramCacheKey = () => `${previousKey()}-cloth-v2`;
  ctx.onDispose(() => {
    cloth.dispose();
    base.dispose();
  });
  const mesh = new s.Mesh(capeGeometry(s, width, length), cloth);
  mesh.name = "athena-signature-cape";
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  mesh.raycast = () => {};
  mesh.userData.athenaNoInk = true;
  const parent =
    root.getObjectByName("chest") ?? root.getObjectByName("torso") ?? root.getObjectByName("body");
  root.updateMatrixWorld(true);
  // The rig's `chest` node sits on the shoulder line at the back of the torso: the cape hangs
  // from it, never from satchels or packs that stick out. Legacy models without a chest node
  // fall back to the garment bounds.
  const chest = root.getObjectByName("chest");
  const rootInverse = root.matrixWorld.clone().invert();
  let anchor: LegacyContext;
  if (chest) {
    anchor = chest.getWorldPosition(new s.Vector3()).applyMatrix4(rootInverse);
    anchor.x = 0;
    anchor.z -= height * 0.014;
  } else {
    const garment = root.getObjectByName("shirt") ?? root.getObjectByName("top_detail") ?? parent;
    const back = garment ? new s.Box3().setFromObject(garment) : undefined;
    back?.applyMatrix4(rootInverse);
    const torsoTop = back && !back.isEmpty() ? back.max.y : bounds.min.y + height * 0.74;
    anchor = new s.Vector3(
      0,
      Math.min(torsoTop - height * 0.03, bounds.min.y + height * 0.76),
      back && !back.isEmpty() ? back.min.z + height * 0.012 : bounds.min.z,
    );
  }
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
  const rest = 0.06;
  const swing = { x: 0, y: rest, vx: 0, vy: 0 };
  return {
    mesh,
    tick(dt, time, speed, turn, reduced) {
      if (reduced) {
        uniforms.uClothSwing.value.set(0, rest);
        uniforms.uClothFlutter.value = 0;
        return;
      }
      const lift = rest + Math.min(1.25, speed * 0.2);
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
