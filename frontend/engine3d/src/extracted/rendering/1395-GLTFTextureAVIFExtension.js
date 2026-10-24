/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 856523:856918.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1395(scope) {
scope.GLTFTextureAVIFExtension = class GLTFTextureAVIFExtension {
  constructor(e) {
    this.parser = e, this.name = scope.EXTENSIONS.EXT_TEXTURE_AVIF;
  }
  loadTexture(e) {
    const i = this.name,
      s = this.parser,
      a = s.json,
      o = a.textures[e];
    if (!o.extensions || !o.extensions[i]) return null;
    const l = o.extensions[i],
      c = a.images[l.source];
    let h = s.textureLoader;
    if (c.uri) {
      const d = s.options.manager.getHandler(c.uri);
      d !== null && (h = d);
    }
    return s.loadTextureImage(e, l.source, h);
  }
};
}
