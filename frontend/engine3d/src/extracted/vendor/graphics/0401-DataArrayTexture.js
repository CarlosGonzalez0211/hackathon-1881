/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 73184:73605.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0401(scope) {
scope.DataArrayTexture = class DataArrayTexture extends scope.Texture {
  constructor(e = null, i = 1, s = 1, a = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = {
      data: e,
      width: i,
      height: s,
      depth: a
    }, this.magFilter = scope.NearestFilter, this.minFilter = scope.NearestFilter, this.wrapR = scope.ClampToEdgeWrapping, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = new Set();
  }
  addLayerUpdate(e) {
    this.layerUpdates.add(e);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
};
}
