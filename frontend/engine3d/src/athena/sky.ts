/**
 * Task 10, sky + colour grade.
 *
 * Sky: the legacy dome keeps its cloud shader (`clouds-noise-512` reaches it through the
 * texture swap) but its flat base colour becomes a vertical LUT, `sky-gradient-day.png`
 * sampled by screen height. Without the PNG (asset not built) the LUT is generated from
 * the brand sky tokens (zenith → mid → horizon), so the look holds either way.
 *
 * LUT: the post-processing grade (`outlines` pass, `lut.ktx2` → Data3DTexture) uses the
 * kit's `lut-athena-256x16.png`, a 16³ strip (16 tiles of 16×16), unpacked into a 16³
 * Data3DTexture. If it cannot be read, the legacy LUT stays.
 */
import { athenaBrand } from "@athena/brand";
import type { LegacyContext } from "../runtime/legacy-context";
import type { AthenaInstallContext } from "./install";

export const SKY_GRADIENT = "textures/sky-gradient-day.png";
export const ATHENA_LUT = "textures/lut-athena-256x16.png";

/** Vertical sky gradient from tokens (row 0 = horizon/bottom, last row = zenith). */
export function tokenSkyGradient(rows = 64) {
  const stops: [number, string][] = [
    [0, athenaBrand.colors.skyHorizon],
    [0.45, athenaBrand.colors.skyMid],
    [1, athenaBrand.colors.skyZenith],
  ];
  const rgb = (hex: string) =>
    [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  const data = new Uint8Array(rows * 4);
  for (let row = 0; row < rows; row++) {
    const t = row / (rows - 1);
    let k = 0;
    while (k < stops.length - 2 && t > stops[k + 1]![0]) k++;
    const [t0, c0] = stops[k]!;
    const [t1, c1] = stops[k + 1]!;
    const f = (t - t0) / (t1 - t0);
    const a = rgb(c0);
    const b = rgb(c1);
    for (let c = 0; c < 3; c++) data[row * 4 + c] = Math.round(a[c]! + (b[c]! - a[c]!) * f);
    data[row * 4 + 3] = 255;
  }
  return data;
}

/**
 * Unpack a 2D LUT strip (`size` tiles of size×size laid out horizontally, RGBA bytes) into
 * 3D texel order (x = red, y = green, z = blue). `greenUp`: green grows bottom → top.
 */
export function unpackLutStrip(
  strip: Uint8ClampedArray | Uint8Array,
  size: number,
  greenUp: boolean,
) {
  const width = size * size;
  const out = new Uint8Array(size * size * size * 4);
  for (let b = 0; b < size; b++)
    for (let g = 0; g < size; g++)
      for (let r = 0; r < size; r++) {
        const row = greenUp ? size - 1 - g : g;
        const source = (row * width + b * size + r) * 4;
        const target = ((b * size + g) * size + r) * 4;
        out[target] = strip[source]!;
        out[target + 1] = strip[source + 1]!;
        out[target + 2] = strip[source + 2]!;
        out[target + 3] = 255;
      }
  return out;
}

/** Whether green increases upwards in a strip (compares the top and bottom rows). */
export function lutGreenUp(strip: Uint8ClampedArray | Uint8Array, size: number) {
  const width = size * size;
  let top = 0;
  let bottom = 0;
  for (let x = 0; x < width; x++) {
    top += strip[x * 4 + 1]!;
    bottom += strip[((size - 1) * width + x) * 4 + 1]!;
  }
  return bottom < top;
}

async function readPixels(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const bitmap = await createImageBitmap(await response.blob());
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.drawImage(bitmap, 0, 0);
  const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height);
  return { data, width: bitmap.width, height: bitmap.height };
}

export function installAthenaSky(ctx: AthenaInstallContext) {
  if (!ctx.enabled) return;
  const { scope } = ctx;

  // Sky gradient LUT.
  const gradientUrl = ctx.resolve(SKY_GRADIENT);
  const fallback = tokenSkyGradient();
  const gradient = new scope.DataTexture(fallback, 1, fallback.length / 4, scope.RGBAFormat);
  gradient.colorSpace = scope.SRGBColorSpace;
  gradient.magFilter = gradient.minFilter = scope.LinearFilter;
  gradient.needsUpdate = true;
  if (gradientUrl?.kind === "texture")
    readPixels(gradientUrl.url)
      .then(({ data, width, height }) => {
        // One column, bottom row first (DataTexture row 0 is v = 0, the screen bottom).
        const column = new Uint8Array(height * 4);
        const x = Math.floor(width / 2);
        for (let y = 0; y < height; y++)
          column.set(
            data.subarray(
              ((height - 1 - y) * width + x) * 4,
              ((height - 1 - y) * width + x) * 4 + 4,
            ),
            y * 4,
          );
        gradient.image = { data: column, width: 1, height };
        gradient.needsUpdate = true;
      })
      .catch((error) => console.warn("[Athena] sky gradient unavailable; token gradient", error));

  const init = scope.sky.prototype.init;
  scope.sky.prototype.init = function (this: LegacyContext) {
    init.call(this);
    const material = this.mesh.material;
    // Clouds: sky-mid towards the top of the screen, horizon cream near the horizon, so
    // they read as soft shapes over the zenith → horizon gradient (brand guide 03, sky).
    material.uniforms.uColor1.value.set(athenaBrand.colors.skyMid);
    material.uniforms.uColor2.value.set(athenaBrand.colors.skyMid);
    material.uniforms.uColor3.value.set(athenaBrand.colors.skyHorizon);
    material.uniforms.tSkyGradient = { value: gradient };
    material.fragmentShader = material.fragmentShader
      .replace("uniform vec3 uColor1;", "uniform vec3 uColor1;\nuniform sampler2D tSkyGradient;")
      .replace(
        "vec3 color = mix(uColor1, cloudColor, blend);",
        "vec3 skyBase = texture2D(tSkyGradient, vec2(0.5, screenUv.y)).rgb;\n" +
          "                    vec3 color = mix(skyBase, cloudColor, blend);",
      );
    material.needsUpdate = true;
  };

  // Colour grade LUT.
  const lutUrl = ctx.resolve(ATHENA_LUT);
  const load = scope.textureLoader.load.bind(scope.textureLoader);
  if (lutUrl?.kind === "texture")
    scope.textureLoader.load = (relative?: string, mode = "default", ...args: unknown[]) => {
      if (relative !== "lut.ktx2") return load(relative, mode, ...args);
      const size = 16;
      const texture = new scope.Data3DTexture(
        new Uint8Array(size * size * size * 4),
        size,
        size,
        size,
      );
      texture.format = scope.RGBAFormat;
      texture.magFilter = texture.minFilter = /tetrahedral/i.test(String(mode))
        ? scope.NearestFilter
        : scope.LinearFilter;
      texture.unpackAlignment = 1;
      readPixels(lutUrl.url)
        .then(({ data, width, height }) => {
          if (width !== size * size || height !== size) throw new Error(`LUT ${width}x${height}`);
          texture.image.data = unpackLutStrip(data, size, lutGreenUp(data, size));
          texture.needsUpdate = true;
        })
        .catch((error) => {
          console.warn("[Athena] Athena LUT unavailable; legacy grade kept", error);
          const legacy = load(relative, mode, ...args);
          const adopt = () => {
            if (!legacy.image?.data) return void ctx.lifecycle.setTimeout(adopt, 100);
            texture.image = legacy.image;
            texture.needsUpdate = true;
          };
          adopt();
        });
      return texture;
    };
  ctx.onDispose(() => {
    scope.sky.prototype.init = init;
    scope.textureLoader.load = load;
    gradient.dispose();
  });
}
