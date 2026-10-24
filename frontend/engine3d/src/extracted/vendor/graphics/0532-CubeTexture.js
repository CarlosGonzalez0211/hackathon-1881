/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 164615:164829.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0532(scope) {
scope.CubeTexture = class CubeTexture extends scope.Texture {
  constructor(e = [], i = scope.CubeReflectionMapping, s, a, o, l, c, h, d, p) {
    super(e, i, s, a, o, l, c, h, d, p), this.isCubeTexture = !0, this.flipY = !1;
  }
  get images() {
    return this.image;
  }
  set images(e) {
    this.image = e;
  }
};
}
