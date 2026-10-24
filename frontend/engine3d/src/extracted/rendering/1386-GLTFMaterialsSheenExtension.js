/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 850885:851783.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1386(scope) {
scope.GLTFMaterialsSheenExtension = class GLTFMaterialsSheenExtension {
  constructor(e) {
    this.parser = e, this.name = scope.EXTENSIONS.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(e) {
    const s = this.parser.json.materials[e];
    return !s.extensions || !s.extensions[this.name] ? null : scope.MeshPhysicalMaterial;
  }
  extendMaterialParams(e, i) {
    const s = this.parser,
      a = s.json.materials[e];
    if (!a.extensions || !a.extensions[this.name]) return Promise.resolve();
    const o = [];
    i.sheenColor = new scope.Color(0, 0, 0), i.sheenRoughness = 0, i.sheen = 1;
    const l = a.extensions[this.name];
    if (l.sheenColorFactor !== void 0) {
      const c = l.sheenColorFactor;
      i.sheenColor.setRGB(c[0], c[1], c[2], scope.LinearSRGBColorSpace);
    }
    return l.sheenRoughnessFactor !== void 0 && (i.sheenRoughness = l.sheenRoughnessFactor), l.sheenColorTexture !== void 0 && o.push(s.assignTexture(i, "sheenColorMap", l.sheenColorTexture, scope.SRGBColorSpace)), l.sheenRoughnessTexture !== void 0 && o.push(s.assignTexture(i, "sheenRoughnessMap", l.sheenRoughnessTexture)), Promise.all(o);
  }
};
}
