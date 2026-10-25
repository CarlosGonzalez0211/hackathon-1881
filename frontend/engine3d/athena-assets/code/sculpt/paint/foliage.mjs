/**
 * Procedural foliage atlas, 512 x 512 RGBA PNG painted from the world palette
 * (docs/art/ART_DIRECTION.md section 3). Foliage, grass and flower cards are the only textured
 * surfaces in the kit, so this is the whole texture budget of the world.
 *
 *   const { png, rects, size } = paintFoliageAtlas({ seed: 7 });
 *
 * Layout (pixels, origin top-left):
 *   leafCluster   0,0     256x256   a fan of leaves for crown fringes
 *   bladeTuft     256,0   256x256   five to seven curved blades for grass tufts
 *   flower*       row at y = 272, five species, 96x96 each: Daisy, Cosmos, Buttercup,
 *                 Bellflower, Poppy (heads only; stems come from the card geometry)
 */
import { createNoise, lcg } from "../noise.mjs";
import { Raster, hexToRgb } from "./raster.mjs";

const PALETTE = {
  deep: "#3F7A5B",
  mid: "#6CA66E",
  light: "#A8C97A",
  ink: "#2B2936",
  warmWhite: "#FBF3E4",
  blossom: "#E9AFAA",
  gold: "#F2C36B",
  lilac: "#B7A6D6",
  terracotta: "#C9785F",
  butter: "#F3D78A",
};

const mix = (hexA, hexB, t) => {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * Math.min(1, Math.max(0, t))));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};
/** deep -> mid -> light ramp, 0..1 */
const foliage = (t) =>
  t < 0.5 ? mix(PALETTE.deep, PALETTE.mid, t * 2) : mix(PALETTE.mid, PALETTE.light, (t - 0.5) * 2);

export const FOLIAGE_ATLAS_SIZE = 512;
export const FOLIAGE_RECTS = {
  leafCluster: { x: 0, y: 0, w: 256, h: 256 },
  bladeTuft: { x: 256, y: 0, w: 256, h: 256 },
  flowerDaisy: { x: 8, y: 272, w: 96, h: 96 },
  flowerCosmos: { x: 108, y: 272, w: 96, h: 96 },
  flowerButtercup: { x: 208, y: 272, w: 96, h: 96 },
  flowerBellflower: { x: 308, y: 272, w: 96, h: 96 },
  flowerPoppy: { x: 408, y: 272, w: 96, h: 96 },
};

function paintLeafCluster(raster, random, noise) {
  const rect = FOLIAGE_RECTS.leafCluster;
  const cx = rect.x + rect.w / 2;
  const base = rect.y + rect.h - 14;
  // Back row (dark, long) first, front row (light, short) last.
  const rows = [
    { count: 11, length: 118, width: 46, spread: 1.35, shade: 0.12 },
    { count: 9, length: 98, width: 42, spread: 1.15, shade: 0.4 },
    { count: 7, length: 76, width: 36, spread: 0.85, shade: 0.7 },
  ];
  for (const row of rows)
    for (let k = 0; k < row.count; k++) {
      const u = row.count === 1 ? 0 : (k / (row.count - 1)) * 2 - 1;
      const angle = u * row.spread + (random() - 0.5) * 0.12;
      const length = row.length * (0.9 + random() * 0.2);
      raster.stamp("leaf", {
        x: cx + u * 10,
        y: base,
        angle,
        length,
        width: row.width * (0.9 + random() * 0.2),
        bend: (random() - 0.5) * 22 + u * 14,
        color: (s, t) => foliage(row.shade + s * 0.28 + (1 - Math.abs(t)) * 0.12),
        vein: PALETTE.light,
      });
    }
  raster.simplexFill(noise, rect, [PALETTE.deep, PALETTE.light], { scale: 0.045, strength: 0.18 });
}

function paintBladeTuft(raster, random, noise) {
  const rect = FOLIAGE_RECTS.bladeTuft;
  const cx = rect.x + rect.w / 2;
  const base = rect.y + rect.h - 6;
  const count = 7;
  for (let k = 0; k < count; k++) {
    const u = (k / (count - 1)) * 2 - 1;
    const height = (k % 2 ? 190 : 225) * (0.9 + random() * 0.15);
    raster.stamp("blade", {
      x: cx + u * 22,
      y: base,
      angle: u * 0.32,
      length: height,
      width: 26 - Math.abs(u) * 6,
      bend: u * 26 + (random() - 0.5) * 18,
      color: (s) => foliage(0.1 + s * 0.85),
    });
  }
  raster.simplexFill(noise, rect, [PALETTE.deep, PALETTE.light], { scale: 0.05, strength: 0.14 });
}

function paintFlowers(raster) {
  const at = (name) => {
    const r = FOLIAGE_RECTS[name];
    return { cx: r.x + r.w / 2, cy: r.y + r.h / 2 };
  };
  const petals = ({ cx, cy }, count, length, width, color, tip, offset = 0, bend = 0) => {
    for (let k = 0; k < count; k++)
      raster.stamp("petal", {
        x: cx,
        y: cy,
        angle: offset + (k / count) * Math.PI * 2,
        length,
        width,
        bend,
        color: (s) => mix(color, tip, s * s),
      });
  };
  // Daisy: many narrow warm-white petals, gold eye.
  let c = at("flowerDaisy");
  petals(c, 14, 40, 14, PALETTE.warmWhite, mix(PALETTE.warmWhite, PALETTE.blossom, 0.25));
  raster.softCircle(c.cx, c.cy, 11, PALETTE.gold, { hardness: 0.8 });
  // Cosmos: eight broad blossom-pink petals with a darker throat.
  c = at("flowerCosmos");
  petals(c, 8, 42, 30, PALETTE.blossom, mix(PALETTE.blossom, PALETTE.warmWhite, 0.55), 0.2);
  raster.softCircle(c.cx, c.cy, 9, PALETTE.terracotta, { hardness: 0.7 });
  raster.softCircle(c.cx, c.cy, 5, PALETTE.gold, { hardness: 0.9 });
  // Buttercup: five round butter-gold petals.
  c = at("flowerButtercup");
  petals(c, 5, 36, 34, PALETTE.gold, PALETTE.butter, 0.1);
  raster.softCircle(c.cx, c.cy, 7, PALETTE.deep, { hardness: 0.8 });
  // Bellflower: five long lilac points around a pale centre.
  c = at("flowerBellflower");
  petals(c, 5, 44, 22, mix(PALETTE.lilac, PALETTE.deep, 0.15), PALETTE.lilac, 0, 4);
  raster.softCircle(c.cx, c.cy, 8, PALETTE.warmWhite, { hardness: 0.7 });
  // Poppy: four big terracotta petals, ink-dark centre.
  c = at("flowerPoppy");
  petals(c, 4, 40, 44, PALETTE.terracotta, mix(PALETTE.terracotta, PALETTE.blossom, 0.45), 0.4);
  raster.softCircle(c.cx, c.cy, 8, PALETTE.ink, { hardness: 0.8 });
}

/** @returns {{ png: Buffer, rects: typeof FOLIAGE_RECTS, size: number }} */
export function paintFoliageAtlas({ seed = 7 } = {}) {
  const random = lcg(seed);
  const noise = createNoise(seed);
  const raster = new Raster(FOLIAGE_ATLAS_SIZE, FOLIAGE_ATLAS_SIZE);
  paintLeafCluster(raster, random, noise);
  paintBladeTuft(raster, random, noise);
  paintFlowers(raster);
  raster.dilate(4);
  return { png: raster.toPng(), rects: FOLIAGE_RECTS, size: FOLIAGE_ATLAS_SIZE };
}
