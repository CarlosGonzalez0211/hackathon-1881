/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 59576:59963.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0391(scope) {
scope.serializeImage = function serializeImage(r) {
  return typeof HTMLImageElement < "u" && r instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && r instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && r instanceof ImageBitmap ? scope.ImageUtils.getDataURL(r) : r.data ? {
    data: Array.from(r.data),
    width: r.width,
    height: r.height,
    type: r.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
};
}
