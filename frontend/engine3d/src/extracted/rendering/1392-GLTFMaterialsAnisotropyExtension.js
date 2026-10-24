/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 854959:855633.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1392(scope) {
scope.GLTFMaterialsAnisotropyExtension = class GLTFMaterialsAnisotropyExtension {
  constructor(e) {
    this.parser = e, this.name = scope.EXTENSIONS.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(e) {
    const s = this.parser.json.materials[e];
    return !s.extensions || !s.extensions[this.name] ? null : scope.MeshPhysicalMaterial;
  }
  extendMaterialParams(e, i) {
    const s = this.parser,
      a = s.json.materials[e];
    if (!a.extensions || !a.extensions[this.name]) return Promise.resolve();
    const o = [],
      l = a.extensions[this.name];
    return l.anisotropyStrength !== void 0 && (i.anisotropy = l.anisotropyStrength), l.anisotropyRotation !== void 0 && (i.anisotropyRotation = l.anisotropyRotation), l.anisotropyTexture !== void 0 && o.push(s.assignTexture(i, "anisotropyMap", l.anisotropyTexture)), Promise.all(o);
  }
};
}
