/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 252660:253115.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0695(scope) {
scope.MeshDistanceMaterial = class MeshDistanceMaterial extends scope.Material {
  constructor(e) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
  }
};
}
