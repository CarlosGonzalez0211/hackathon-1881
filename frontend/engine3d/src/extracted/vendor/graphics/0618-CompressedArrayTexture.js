/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 217657:217953.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0618(scope) {
scope.CompressedArrayTexture = class CompressedArrayTexture extends scope.CompressedTexture {
  constructor(e, i, s, a, o, l) {
    super(e, i, s, o, l), this.isCompressedArrayTexture = !0, this.image.depth = a, this.wrapR = scope.ClampToEdgeWrapping, this.layerUpdates = new Set();
  }
  addLayerUpdate(e) {
    this.layerUpdates.add(e);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
};
}
