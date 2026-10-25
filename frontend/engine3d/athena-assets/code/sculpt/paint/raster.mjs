/**
 * A tiny RGBA raster for painting atlases in Node (no canvas, no DOM). Straight (non
 * premultiplied) 8-bit RGBA, "over" compositing, deterministic.
 *
 *   const r = new Raster(256, 256);
 *   r.softCircle(128, 128, 60, "#6CA66E", { hardness: 0.4 });
 *   r.stamp(leaf, { x, y, angle, length, width, color });   // leaf / blade / petal shapes
 *   r.simplexFill(noise, rect, ["#3F7A5B", "#A8C97A"], { scale: 0.03 });   // tint existing paint
 *   r.dilate(4);                                            // bleed colour under transparent edges
 *   const png = r.toPng();
 *
 * Shapes are analytic (a width profile along a bent centreline) and antialiased by 3x3
 * supersampling, so stamps stay crisp at any size.
 */
import { PNG } from "pngjs";

export function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Width profiles: `w(s)` in 0..1 along the shape (0 base, 1 tip). */
export const SHAPES = {
  /** Pointed leaf, widest a third of the way up. */
  leaf: (s) => Math.pow(Math.sin(Math.PI * Math.pow(s, 0.75)), 0.85),
  /** Grass blade: wide at the root, tapering to a point. */
  blade: (s) => Math.pow(1 - s, 0.9) * Math.min(1, s * 12 + 0.35),
  /** Round petal: narrow base, full belly, soft tip. */
  petal: (s) => Math.pow(Math.sin(Math.PI * Math.pow(s, 0.6)), 0.7),
};

export class Raster {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }

  fill(hex, alpha = 255) {
    const [r, g, b] = hexToRgb(hex);
    for (let i = 0; i < this.data.length; i += 4) this.data.set([r, g, b, alpha], i);
    return this;
  }

  /** Composite one pixel (colour rgb 0..255, coverage 0..1) over what is there. */
  blend(x, y, rgb, coverage) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height || coverage <= 0) return;
    const i = (y * this.width + x) * 4;
    const dstA = this.data[i + 3] / 255;
    const outA = coverage + dstA * (1 - coverage);
    for (let k = 0; k < 3; k++)
      this.data[i + k] =
        (rgb[k] * coverage + this.data[i + k] * dstA * (1 - coverage)) / (outA || 1);
    this.data[i + 3] = outA * 255;
  }

  softCircle(cx, cy, radius, hex, { hardness = 0.5, alpha = 1 } = {}) {
    const rgb = hexToRgb(hex);
    for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++)
      for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / radius;
        if (d >= 1) continue;
        const falloff = d <= hardness ? 1 : 1 - (d - hardness) / (1 - hardness || 1);
        this.blend(x, y, rgb, falloff * falloff * (3 - 2 * falloff) * alpha);
      }
    return this;
  }

  /**
   * Stamp an analytic shape. Its base sits at (x, y), it points along `angle` (radians, 0 =
   * up the image), is `length` long and `width` wide at its widest, and bends by `bend`
   * (sideways offset of the tip, in pixels). `color` is a hex, or `(s, t) => hex` where s is
   * 0..1 along the shape and t -1..1 across it. `vein` draws a lighter midrib.
   */
  stamp(shape, { x, y, angle = 0, length, width, bend = 0, color, vein, alpha = 1 }) {
    const profile = typeof shape === "string" ? SHAPES[shape] : shape;
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    const margin = Math.ceil(length + width + Math.abs(bend)) + 2;
    const colorAt = typeof color === "function" ? color : () => color;
    const veinRgb = vein ? hexToRgb(vein) : null;
    for (let py = Math.floor(y - margin); py <= Math.ceil(y + margin); py++)
      for (let px = Math.floor(x - margin); px <= Math.ceil(x + margin); px++) {
        // Cheap reject at the pixel centre before the 3x3 supersample.
        const cx = px + 0.5 - x;
        const cy = py + 0.5 - y;
        const cs = (cx * sa - cy * ca) / length;
        if (cs < -0.08 || cs > 1.08) continue;
        if (Math.abs(cx * ca + cy * sa - bend * cs * cs) > width / 2 + 2) continue;
        let hits = 0;
        let sSum = 0;
        let tSum = 0;
        for (let sy = 0; sy < 3; sy++)
          for (let sx = 0; sx < 3; sx++) {
            // Pixel sample in the shape's frame: v along (up the shape), u across.
            const dx = px + (sx + 0.5) / 3 - x;
            const dy = py + (sy + 0.5) / 3 - y;
            const along = dx * sa - dy * ca;
            const across0 = dx * ca + dy * sa;
            const s = along / length;
            if (s < 0 || s > 1) continue;
            const across = across0 - bend * s * s;
            const half = (profile(s) * width) / 2;
            if (half <= 0 || Math.abs(across) > half) continue;
            hits++;
            sSum += s;
            tSum += across / half;
          }
        if (!hits) continue;
        const s = sSum / hits;
        const t = tSum / hits;
        const rgb = hexToRgb(colorAt(s, t));
        if (veinRgb && Math.abs(t) < 0.12)
          for (let k = 0; k < 3; k++) rgb[k] = (rgb[k] + veinRgb[k]) / 2;
        this.blend(px, py, rgb, (hits / 9) * alpha);
      }
    return this;
  }

  /**
   * Recolour existing pixels inside `rect` (alpha untouched) by mixing two colours with
   * fractal simplex noise: `noise.fbm3(x * scale, y * scale, seed)`.
   */
  simplexFill(noise, rect, [hexA, hexB], { scale = 0.03, strength = 0.6, z = 0 } = {}) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    for (let y = rect.y; y < rect.y + rect.h; y++)
      for (let x = rect.x; x < rect.x + rect.w; x++) {
        const i = (y * this.width + x) * 4;
        if (!this.data[i + 3]) continue;
        const t = Math.min(1, Math.max(0, noise.fbm3(x * scale, y * scale, z) * 0.5 + 0.5));
        for (let k = 0; k < 3; k++)
          this.data[i + k] =
            this.data[i + k] * (1 - strength) + (a[k] + (b[k] - a[k]) * t) * strength;
      }
    return this;
  }

  /** Copy colour into fully transparent pixels next to painted ones (no dark mip fringes). */
  dilate(passes = 3) {
    const { width, height, data } = this;
    const painted = new Uint8Array(width * height);
    for (let p = 0; p < painted.length; p++) painted[p] = data[p * 4 + 3] > 0 ? 1 : 0;
    for (let pass = 0; pass < passes; pass++) {
      const grown = [];
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          if (painted[y * width + x]) continue;
          let r = 0;
          let g = 0;
          let b = 0;
          let n = 0;
          for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ]) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height || !painted[ny * width + nx])
              continue;
            const j = (ny * width + nx) * 4;
            r += data[j];
            g += data[j + 1];
            b += data[j + 2];
            n++;
          }
          if (n) grown.push([y * width + x, r / n, g / n, b / n]);
        }
      for (const [p, r, g, b] of grown) {
        data.set([r, g, b], p * 4);
        painted[p] = 1;
      }
    }
    return this;
  }

  toPng() {
    const png = new PNG({ width: this.width, height: this.height });
    png.data = Buffer.from(this.data.buffer, this.data.byteOffset, this.data.byteLength);
    return PNG.sync.write(png);
  }
}
