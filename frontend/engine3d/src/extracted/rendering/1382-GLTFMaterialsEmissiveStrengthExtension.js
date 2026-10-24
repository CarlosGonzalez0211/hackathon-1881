/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 847935:848305.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1382(scope) {
scope.GLTFMaterialsEmissiveStrengthExtension = class GLTFMaterialsEmissiveStrengthExtension {
  constructor(e) {
    this.parser = e, this.name = scope.EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(e, i) {
    const a = this.parser.json.materials[e];
    if (!a.extensions || !a.extensions[this.name]) return Promise.resolve();
    const o = a.extensions[this.name].emissiveStrength;
    return o !== void 0 && (i.emissiveIntensity = o), Promise.resolve();
  }
};
}
