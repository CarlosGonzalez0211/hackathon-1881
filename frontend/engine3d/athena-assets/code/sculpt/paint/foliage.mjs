/**
 * Procedural foliage atlas, 512 x 512 RGBA PNG painted from the world palette
 * (docs/art/ART_DIRECTION.md section 3). Foliage, grass and flower cards are the only textured
 * surfaces in the kit, so this is the whole texture budget of the world.
 *
 *   const { png, rects, size } = paintFoliageAtlas({ seed: 7 });
 *
 * Layout (pixels, origin top-left):
 *   leafCluster     0,0      256x256   an irregular fan of leaves, dark underside to lit top
 *   bladeTuft       256,0    256x256   seven blades of uneven length and lean (grass tufts)
 *   flower*         y = 272, five species, 96x96 each: Daisy, Cosmos, Buttercup, Bellflower,
 *                   Poppy (head in the upper part, painted stem and leaf below)
 *   blossomCluster  0,384    128x128   a fan of blossom-pink petals (blossom tree fringe)
 *   ginkgoCluster   128,384  128x128   a fan of ginkgo-gold leaves (the one tree in twenty)
 */
import { createNoise, lcg } from "../noise.mjs";
import { Raster, SHAPES, hexToRgb } from "./raster.mjs";

const PALETTE = {
  deep: "#3F7A5B",
  mid: "#6CA66E",
  light: "#A8C97A",
  ink: "#2B2936",
  warmWhite: "#FBF3E4",
  blossom: "#E9AFAA",
  blossomDeep: "#C98A93",
  gold: "#F2C36B",
  ginkgo: "#E9C777",
  ginkgoDeep: "#B98A3E",
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
const blossom = (t) =>
  t < 0.5
    ? mix(PALETTE.blossomDeep, PALETTE.blossom, t * 2)
    : mix(PALETTE.blossom, PALETTE.warmWhite, (t - 0.5) * 1.1);
const ginkgo = (t) =>
  t < 0.5
    ? mix(PALETTE.ginkgoDeep, PALETTE.ginkgo, t * 2)
    : mix(PALETTE.ginkgo, PALETTE.butter, (t - 0.5) * 1.2);

export const FOLIAGE_ATLAS_SIZE = 512;
export const FOLIAGE_RECTS = {
  leafCluster: { x: 0, y: 0, w: 256, h: 256 },
  bladeTuft: { x: 256, y: 0, w: 256, h: 256 },
  flowerDaisy: { x: 8, y: 272, w: 96, h: 96 },
  flowerCosmos: { x: 108, y: 272, w: 96, h: 96 },
  flowerButtercup: { x: 208, y: 272, w: 96, h: 96 },
  flowerBellflower: { x: 308, y: 272, w: 96, h: 96 },
  flowerPoppy: { x: 408, y: 272, w: 96, h: 96 },
  blossomCluster: { x: 0, y: 384, w: 128, h: 128 },
  ginkgoCluster: { x: 128, y: 384, w: 128, h: 128 },
};

/** Multiply a bottom-to-top gradient into the painted pixels of `rect` (dark underside, lit top). */
function shadeVertically(
  raster,
  rect,
  { bottom = 0.55, top = 1.08, deepen = 0.45, deep = PALETTE.deep },
) {
  const dark = hexToRgb(deep);
  for (let y = rect.y; y < rect.y + rect.h; y++) {
    const t = 1 - (y - rect.y) / rect.h; // 0 at the bottom edge, 1 at the top edge
    const gain = bottom + (top - bottom) * Math.pow(t, 0.8);
    const pull = Math.max(0, 1 - t * 1.6) * deepen;
    for (let x = rect.x; x < rect.x + rect.w; x++) {
      const i = (y * raster.width + x) * 4;
      if (!raster.data[i + 3]) continue;
      for (let k = 0; k < 3; k++) {
        const v = raster.data[i + k] * (1 - pull) + dark[k] * pull;
        raster.data[i + k] = Math.min(255, v * gain);
      }
    }
  }
}

/** A petal / leaf profile whose outer edge wavers a little (authored, not per-pixel noise). */
const rough = (shape, amplitude, frequency, phase) => (s) =>
  shape(s) *
  (1 + amplitude * Math.sin(s * frequency + phase) * Math.min(1, Math.max(0, (s - 0.35) * 2)));

function paintLeafCluster(raster, random, noise) {
  const rect = FOLIAGE_RECTS.leafCluster;
  const cx = rect.x + rect.w / 2;
  const base = rect.y + rect.h - 14;
  // A clump of broad, round-tipped leaves: back row (dark, long) first, front row (light,
  // short) last. Each leaf varies in length, lean and width and a few are missing, so the
  // dome has a scalloped, irregular outline rather than a tidy fan.
  const rows = [
    { count: 9, length: 150, width: 98, spread: 1.15, shade: 0.3, bias: 0.12 },
    { count: 8, length: 122, width: 86, spread: 0.95, shade: 0.52, bias: -0.08 },
    { count: 6, length: 92, width: 72, spread: 0.7, shade: 0.76, bias: 0.06 },
  ];
  for (const row of rows)
    for (let k = 0; k < row.count; k++) {
      const u = row.count === 1 ? 0 : (k / (row.count - 1)) * 2 - 1;
      if (random() < 0.14 && Math.abs(u) < 0.8) continue; // a gap in the clump
      const angle = u * row.spread + row.bias + (random() - 0.5) * 0.3;
      const length = row.length * (0.72 + random() * 0.46) * (1 - 0.16 * Math.abs(u) * random());
      raster.stamp(random() < 0.3 ? "leaf" : "petal", {
        x: cx + u * 16 + (random() - 0.5) * 8,
        y: base,
        angle,
        length,
        width: row.width * (0.8 + random() * 0.4),
        bend: (random() - 0.5) * 30 + u * 14,
        color: (s, t) => foliage(row.shade + s * 0.3 + (1 - Math.abs(t)) * 0.1),
        vein: PALETTE.light,
      });
    }
  // Two strays break the dome outline on the sun side.
  for (const [angle, length] of [
    [0.9, 118],
    [-1.18, 92],
  ])
    raster.stamp("leaf", {
      x: cx + angle * 8,
      y: base,
      angle,
      length,
      width: 34,
      bend: angle * 10,
      color: (s) => foliage(0.55 + s * 0.4),
    });
  raster.simplexFill(noise, rect, [PALETTE.deep, PALETTE.light], { scale: 0.045, strength: 0.16 });
  shadeVertically(raster, rect, { bottom: 0.74, top: 1.22, deepen: 0.3 });
}

function paintBladeTuft(raster, random, noise) {
  const rect = FOLIAGE_RECTS.bladeTuft;
  const cx = rect.x + rect.w / 2;
  const base = rect.y + rect.h - 6;
  // Seven blades of very different length, root spacing and lean, plus two stubs.
  const blades = [
    [-0.95, 150, -0.46, -44],
    [-0.6, 214, -0.2, -26],
    [-0.28, 172, 0.06, 18],
    [0.02, 236, 0.1, 36],
    [0.34, 128, 0.3, 20],
    [0.66, 196, 0.38, 48],
    [0.98, 104, 0.62, 30],
    [-0.1, 84, -0.5, -30],
    [0.5, 70, 0.1, -16],
  ];
  blades.forEach(([u, height, lean, bend], k) => {
    raster.stamp("blade", {
      x: cx + u * 28 + (random() - 0.5) * 6,
      y: base,
      angle: lean + (random() - 0.5) * 0.12,
      length: height * (0.94 + random() * 0.12),
      width: 24 - Math.abs(u) * 5 - (k > 6 ? 6 : 0),
      bend: bend + (random() - 0.5) * 12,
      color: (s) => foliage(0.06 + s * 0.9),
    });
  });
  raster.simplexFill(noise, rect, [PALETTE.deep, PALETTE.light], { scale: 0.05, strength: 0.14 });
  shadeVertically(raster, rect, { bottom: 0.6, top: 1.05, deepen: 0.35 });
}

/** A fan of small rounded petals or leaves: blossom and ginkgo crown fringes. */
function paintCluster(raster, random, rect, { shape, ramp, count, length, width }) {
  const cx = rect.x + rect.w / 2;
  const base = rect.y + rect.h - 8;
  for (let k = 0; k < count; k++) {
    const u = (k / (count - 1)) * 2 - 1;
    if (random() < 0.12 && Math.abs(u) < 0.7) continue;
    const layer = k % 3;
    raster.stamp(shape, {
      x: cx + u * 9 + (random() - 0.5) * 6,
      y: base - layer * 7,
      angle: u * 0.95 + 0.08 + (random() - 0.5) * 0.35,
      length: length * (0.7 + random() * 0.45) * (1 - layer * 0.12),
      width: width * (0.8 + random() * 0.4),
      bend: (random() - 0.5) * 18 + u * 8,
      color: (s) => ramp(0.2 + layer * 0.25 + s * 0.4),
    });
  }
  shadeVertically(raster, rect, { bottom: 0.78, top: 1.14, deepen: 0.25, deep: ramp(0) });
}

function paintFlowers(raster) {
  const at = (name) => {
    const r = FOLIAGE_RECTS[name];
    // The head sits in the upper part of the cell; the stem and one leaf fill the rest.
    return { cx: r.x + r.w / 2, cy: r.y + 37, floor: r.y + r.h - 1 };
  };
  const stem = ({ cx, cy, floor }, lean) => {
    raster.stamp("blade", {
      x: cx,
      y: floor,
      angle: lean * 0.05,
      length: floor - cy,
      width: 7,
      bend: lean,
      color: (s) => mix(PALETTE.deep, PALETTE.mid, s),
    });
    raster.stamp("leaf", {
      x: cx + lean * 0.12,
      y: floor - 16,
      angle: 0.95,
      length: 24,
      width: 12,
      bend: 5,
      color: (s) => mix(PALETTE.deep, PALETTE.light, s * 0.7),
    });
  };
  const petals = (
    { cx, cy },
    count,
    length,
    width,
    color,
    tip,
    offset = 0,
    bend = 0,
    wobble = 0.12,
  ) => {
    for (let k = 0; k < count; k++)
      raster.stamp(rough(SHAPES.petal, wobble, 9 + k, k * 1.7), {
        x: cx,
        y: cy,
        angle: offset + (k / count) * Math.PI * 2,
        length: length * (0.94 + (0.12 * ((k * 7) % 5)) / 4),
        width,
        bend,
        color: (s) => mix(color, tip, s * s),
      });
  };
  // Daisy: many narrow warm-white petals, gold eye.
  let c = at("flowerDaisy");
  stem(c, -5);
  petals(c, 13, 30, 11, PALETTE.warmWhite, mix(PALETTE.warmWhite, PALETTE.blossom, 0.25));
  raster.softCircle(c.cx, c.cy, 8, PALETTE.gold, { hardness: 0.8 });
  // Cosmos: eight broad blossom-pink petals with a darker throat.
  c = at("flowerCosmos");
  stem(c, 6);
  petals(
    c,
    8,
    32,
    24,
    PALETTE.blossom,
    mix(PALETTE.blossom, PALETTE.warmWhite, 0.55),
    0.2,
    0,
    0.16,
  );
  raster.softCircle(c.cx, c.cy, 7, PALETTE.terracotta, { hardness: 0.7 });
  raster.softCircle(c.cx, c.cy, 4, PALETTE.gold, { hardness: 0.9 });
  // Buttercup: five round butter-gold petals.
  c = at("flowerButtercup");
  stem(c, -3);
  petals(c, 5, 28, 28, PALETTE.gold, PALETTE.butter, 0.1, 0, 0.14);
  raster.softCircle(c.cx, c.cy, 5, PALETTE.deep, { hardness: 0.8 });
  // Bellflower: five long lilac points around a pale centre.
  c = at("flowerBellflower");
  stem(c, 4);
  petals(c, 5, 34, 18, mix(PALETTE.lilac, PALETTE.deep, 0.15), PALETTE.lilac, 0, 4, 0.1);
  raster.softCircle(c.cx, c.cy, 6, PALETTE.warmWhite, { hardness: 0.7 });
  // Poppy: four big terracotta petals, ink-dark centre.
  c = at("flowerPoppy");
  stem(c, -6);
  petals(
    c,
    4,
    31,
    34,
    PALETTE.terracotta,
    mix(PALETTE.terracotta, PALETTE.blossom, 0.45),
    0.4,
    0,
    0.18,
  );
  raster.softCircle(c.cx, c.cy, 6, PALETTE.ink, { hardness: 0.8 });
}

/** @returns {{ png: Buffer, rects: typeof FOLIAGE_RECTS, size: number }} */
export function paintFoliageAtlas({ seed = 7 } = {}) {
  const random = lcg(seed);
  const noise = createNoise(seed);
  const raster = new Raster(FOLIAGE_ATLAS_SIZE, FOLIAGE_ATLAS_SIZE);
  paintLeafCluster(raster, random, noise);
  paintBladeTuft(raster, random, noise);
  paintFlowers(raster);
  paintCluster(raster, random, FOLIAGE_RECTS.blossomCluster, {
    shape: "petal",
    ramp: blossom,
    count: 13,
    length: 58,
    width: 34,
  });
  paintCluster(raster, random, FOLIAGE_RECTS.ginkgoCluster, {
    shape: "leaf",
    ramp: ginkgo,
    count: 13,
    length: 60,
    width: 32,
  });
  raster.dilate(4);
  return { png: raster.toPng(), rects: FOLIAGE_RECTS, size: FOLIAGE_ATLAS_SIZE };
}
