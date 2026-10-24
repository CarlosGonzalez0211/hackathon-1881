/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 855633:856128.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1393(scope) {
scope.GLTFTextureBasisUExtension = class GLTFTextureBasisUExtension {
  constructor(e) {
    this.parser = e, this.name = scope.EXTENSIONS.KHR_TEXTURE_BASISU;
  }
  loadTexture(e) {
    const i = this.parser,
      s = i.json,
      a = s.textures[e];
    if (!a.extensions || !a.extensions[this.name]) return null;
    const o = a.extensions[this.name],
      l = i.options.ktx2Loader;
    if (!l) {
      if (s.extensionsRequired && s.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
      return null;
    }
    return i.loadTextureImage(e, o.source, l);
  }
};
}
