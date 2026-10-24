/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 851783:852394.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1387(scope) {
scope.GLTFMaterialsTransmissionExtension = class GLTFMaterialsTransmissionExtension {
  constructor(e) {
    this.parser = e, this.name = scope.EXTENSIONS.KHR_MATERIALS_TRANSMISSION;
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
    return l.transmissionFactor !== void 0 && (i.transmission = l.transmissionFactor), l.transmissionTexture !== void 0 && o.push(s.assignTexture(i, "transmissionMap", l.transmissionTexture)), Promise.all(o);
  }
};
}
