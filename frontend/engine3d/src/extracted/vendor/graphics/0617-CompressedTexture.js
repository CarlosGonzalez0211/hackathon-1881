/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 217438:217657.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0617(scope) {
scope.CompressedTexture = class CompressedTexture extends scope.Texture {
  constructor(e, i, s, a, o, l, c, h, d, p, f, _) {
    super(null, l, c, h, d, p, a, o, f, _), this.isCompressedTexture = !0, this.image = {
      width: i,
      height: s
    }, this.mipmaps = e, this.flipY = !1, this.generateMipmaps = !1;
  }
};
}
