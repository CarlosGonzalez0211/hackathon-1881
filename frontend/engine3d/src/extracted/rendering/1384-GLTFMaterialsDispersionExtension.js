/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 849329:849812.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1384(scope) {
scope.GLTFMaterialsDispersionExtension = class GLTFMaterialsDispersionExtension {
  constructor(e) {
    this.parser = e, this.name = scope.EXTENSIONS.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(e) {
    const s = this.parser.json.materials[e];
    return !s.extensions || !s.extensions[this.name] ? null : scope.MeshPhysicalMaterial;
  }
  extendMaterialParams(e, i) {
    const a = this.parser.json.materials[e];
    if (!a.extensions || !a.extensions[this.name]) return Promise.resolve();
    const o = a.extensions[this.name];
    return i.dispersion = o.dispersion !== void 0 ? o.dispersion : 0, Promise.resolve();
  }
};
}
