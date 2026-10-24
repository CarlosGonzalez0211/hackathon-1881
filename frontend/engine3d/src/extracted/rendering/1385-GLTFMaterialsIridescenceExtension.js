/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 849812:850885.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1385(scope) {
scope.GLTFMaterialsIridescenceExtension = class GLTFMaterialsIridescenceExtension {
  constructor(e) {
    this.parser = e, this.name = scope.EXTENSIONS.KHR_MATERIALS_IRIDESCENCE;
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
    return l.iridescenceFactor !== void 0 && (i.iridescence = l.iridescenceFactor), l.iridescenceTexture !== void 0 && o.push(s.assignTexture(i, "iridescenceMap", l.iridescenceTexture)), l.iridescenceIor !== void 0 && (i.iridescenceIOR = l.iridescenceIor), i.iridescenceThicknessRange === void 0 && (i.iridescenceThicknessRange = [100, 400]), l.iridescenceThicknessMinimum !== void 0 && (i.iridescenceThicknessRange[0] = l.iridescenceThicknessMinimum), l.iridescenceThicknessMaximum !== void 0 && (i.iridescenceThicknessRange[1] = l.iridescenceThicknessMaximum), l.iridescenceThicknessTexture !== void 0 && o.push(s.assignTexture(i, "iridescenceThicknessMap", l.iridescenceThicknessTexture)), Promise.all(o);
  }
};
}
