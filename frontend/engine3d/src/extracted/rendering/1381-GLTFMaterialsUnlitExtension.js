/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 847449:847935.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1381(scope) {
scope.GLTFMaterialsUnlitExtension = class GLTFMaterialsUnlitExtension {
  constructor() {
    this.name = scope.EXTENSIONS.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return scope.MeshBasicMaterial;
  }
  extendParams(e, i, s) {
    const a = [];
    e.color = new scope.Color(1, 1, 1), e.opacity = 1;
    const o = i.pbrMetallicRoughness;
    if (o) {
      if (Array.isArray(o.baseColorFactor)) {
        const l = o.baseColorFactor;
        e.color.setRGB(l[0], l[1], l[2], scope.LinearSRGBColorSpace), e.opacity = l[3];
      }
      o.baseColorTexture !== void 0 && a.push(s.assignTexture(e, "map", o.baseColorTexture, scope.SRGBColorSpace));
    }
    return Promise.all(a);
  }
};
}
