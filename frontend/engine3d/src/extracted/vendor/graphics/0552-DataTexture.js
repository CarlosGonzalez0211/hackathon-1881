/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 180351:180610.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0552(scope) {
scope.DataTexture = class DataTexture extends scope.Texture {
  constructor(e = null, i = 1, s = 1, a, o, l, c, h, d = scope.NearestFilter, p = scope.NearestFilter, f, _) {
    super(null, l, c, h, d, p, a, o, f, _), this.isDataTexture = !0, this.image = {
      data: e,
      width: i,
      height: s
    }, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
};
}
