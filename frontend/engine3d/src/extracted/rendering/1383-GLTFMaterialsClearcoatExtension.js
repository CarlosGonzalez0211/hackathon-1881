/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 848305:849329.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1383(scope) {
scope.GLTFMaterialsClearcoatExtension = class GLTFMaterialsClearcoatExtension {
  constructor(e) {
    this.parser = e, this.name = scope.EXTENSIONS.KHR_MATERIALS_CLEARCOAT;
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
    if (l.clearcoatFactor !== void 0 && (i.clearcoat = l.clearcoatFactor), l.clearcoatTexture !== void 0 && o.push(s.assignTexture(i, "clearcoatMap", l.clearcoatTexture)), l.clearcoatRoughnessFactor !== void 0 && (i.clearcoatRoughness = l.clearcoatRoughnessFactor), l.clearcoatRoughnessTexture !== void 0 && o.push(s.assignTexture(i, "clearcoatRoughnessMap", l.clearcoatRoughnessTexture)), l.clearcoatNormalTexture !== void 0 && (o.push(s.assignTexture(i, "clearcoatNormalMap", l.clearcoatNormalTexture)), l.clearcoatNormalTexture.scale !== void 0)) {
      const c = l.clearcoatNormalTexture.scale;
      i.clearcoatNormalScale = new scope.Vector2(c, c);
    }
    return Promise.all(o);
  }
};
}
