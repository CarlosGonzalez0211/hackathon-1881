/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 853584:854408.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1390(scope) {
scope.GLTFMaterialsSpecularExtension = class GLTFMaterialsSpecularExtension {
  constructor(e) {
    this.parser = e, this.name = scope.EXTENSIONS.KHR_MATERIALS_SPECULAR;
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
    i.specularIntensity = l.specularFactor !== void 0 ? l.specularFactor : 1, l.specularTexture !== void 0 && o.push(s.assignTexture(i, "specularIntensityMap", l.specularTexture));
    const c = l.specularColorFactor || [1, 1, 1];
    return i.specularColor = new scope.Color().setRGB(c[0], c[1], c[2], scope.LinearSRGBColorSpace), l.specularColorTexture !== void 0 && o.push(s.assignTexture(i, "specularColorMap", l.specularColorTexture, scope.SRGBColorSpace)), Promise.all(o);
  }
};
}
