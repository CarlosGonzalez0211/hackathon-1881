/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 852394:853134.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1388(scope) {
scope.GLTFMaterialsVolumeExtension = class GLTFMaterialsVolumeExtension {
  constructor(e) {
    this.parser = e, this.name = scope.EXTENSIONS.KHR_MATERIALS_VOLUME;
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
    i.thickness = l.thicknessFactor !== void 0 ? l.thicknessFactor : 0, l.thicknessTexture !== void 0 && o.push(s.assignTexture(i, "thicknessMap", l.thicknessTexture)), i.attenuationDistance = l.attenuationDistance || 1 / 0;
    const c = l.attenuationColor || [1, 1, 1];
    return i.attenuationColor = new scope.Color().setRGB(c[0], c[1], c[2], scope.LinearSRGBColorSpace), Promise.all(o);
  }
};
}
