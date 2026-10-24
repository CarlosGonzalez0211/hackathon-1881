/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 214367:214781.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0609(scope) {
scope.PointsMaterial = class PointsMaterial extends scope.Material {
  constructor(e) {
    super(), this.isPointsMaterial = !0, this.type = "PointsMaterial", this.color = new scope.Color(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = !0, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.alphaMap = e.alphaMap, this.size = e.size, this.sizeAttenuation = e.sizeAttenuation, this.fog = e.fog, this;
  }
};
}
