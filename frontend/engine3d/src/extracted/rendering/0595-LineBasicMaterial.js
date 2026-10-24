/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 210390:210812.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0595(scope) {
scope.LineBasicMaterial = class LineBasicMaterial extends scope.Material {
  constructor(e) {
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new scope.Color(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.linewidth = e.linewidth, this.linecap = e.linecap, this.linejoin = e.linejoin, this.fog = e.fog, this;
  }
};
}
