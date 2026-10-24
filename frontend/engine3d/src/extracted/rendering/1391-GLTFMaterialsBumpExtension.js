/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 854408:854959.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1391(scope) {
scope.GLTFMaterialsBumpExtension = class GLTFMaterialsBumpExtension {
  constructor(e) {
    this.parser = e, this.name = scope.EXTENSIONS.EXT_MATERIALS_BUMP;
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
    return i.bumpScale = l.bumpFactor !== void 0 ? l.bumpFactor : 1, l.bumpTexture !== void 0 && o.push(s.assignTexture(i, "bumpMap", l.bumpTexture)), Promise.all(o);
  }
};
}
