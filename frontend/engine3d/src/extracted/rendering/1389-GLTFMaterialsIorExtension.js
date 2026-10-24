/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 853134:853584.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1389(scope) {
scope.GLTFMaterialsIorExtension = class GLTFMaterialsIorExtension {
  constructor(e) {
    this.parser = e, this.name = scope.EXTENSIONS.KHR_MATERIALS_IOR;
  }
  getMaterialType(e) {
    const s = this.parser.json.materials[e];
    return !s.extensions || !s.extensions[this.name] ? null : scope.MeshPhysicalMaterial;
  }
  extendMaterialParams(e, i) {
    const a = this.parser.json.materials[e];
    if (!a.extensions || !a.extensions[this.name]) return Promise.resolve();
    const o = a.extensions[this.name];
    return i.ior = o.ior !== void 0 ? o.ior : 1.5, Promise.resolve();
  }
};
}
