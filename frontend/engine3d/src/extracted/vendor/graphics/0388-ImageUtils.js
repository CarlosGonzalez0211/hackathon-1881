/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 57459:58706.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0388(scope) {
scope.ImageUtils = class ImageUtils {
  static getDataURL(e, i = "image/png") {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u") return e.src;
    let s;
    if (e instanceof HTMLCanvasElement) s = e;else {
      scope._canvas === void 0 && (scope._canvas = scope.createElementNS("canvas")), scope._canvas.width = e.width, scope._canvas.height = e.height;
      const a = scope._canvas.getContext("2d");
      e instanceof ImageData ? a.putImageData(e, 0, 0) : a.drawImage(e, 0, 0, e.width, e.height), s = scope._canvas;
    }
    return s.toDataURL(i);
  }
  static sRGBToLinear(e) {
    if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
      const i = scope.createElementNS("canvas");
      i.width = e.width, i.height = e.height;
      const s = i.getContext("2d");
      s.drawImage(e, 0, 0, e.width, e.height);
      const a = s.getImageData(0, 0, e.width, e.height),
        o = a.data;
      for (let l = 0; l < o.length; l++) o[l] = scope.SRGBToLinear(o[l] / 255) * 255;
      return s.putImageData(a, 0, 0), i;
    } else if (e.data) {
      const i = e.data.slice(0);
      for (let s = 0; s < i.length; s++) i instanceof Uint8Array || i instanceof Uint8ClampedArray ? i[s] = Math.floor(scope.SRGBToLinear(i[s] / 255) * 255) : i[s] = scope.SRGBToLinear(i[s]);
      return {
        data: i,
        width: e.width,
        height: e.height
      };
    } else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
  }
};
}
