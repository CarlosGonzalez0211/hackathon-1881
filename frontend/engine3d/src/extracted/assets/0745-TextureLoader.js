/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 272418:272682.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0745(scope) {
scope.TextureLoader = class TextureLoader extends scope.Loader$1 {
  constructor(e) {
    super(e);
  }
  load(e, i, s, a) {
    const o = new scope.Texture(),
      l = new scope.ImageLoader(this.manager);
    return l.setCrossOrigin(this.crossOrigin), l.setPath(this.path), l.load(e, function (c) {
      o.image = c, o.needsUpdate = !0, i !== void 0 && i(o);
    }, s, a), o;
  }
};
}
