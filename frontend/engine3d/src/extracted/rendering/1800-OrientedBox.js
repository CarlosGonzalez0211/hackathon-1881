/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1337867:1338537.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1800(scope) {
scope.OrientedBox = class OrientedBox {
  constructor(e, i, s) {
    this.isOrientedBox = !0, this.min = new scope.Vector3(), this.max = new scope.Vector3(), this.matrix = new scope.Matrix4(), this.invMatrix = new scope.Matrix4(), this.points = new Array(8).fill().map(() => new scope.Vector3()), this.satAxes = new Array(3).fill().map(() => new scope.Vector3()), this.satBounds = new Array(3).fill().map(() => new scope.SeparatingAxisBounds()), this.alignedSatBounds = new Array(3).fill().map(() => new scope.SeparatingAxisBounds()), this.needsUpdate = !1, e && this.min.copy(e), i && this.max.copy(i), s && this.matrix.copy(s);
  }
  set(e, i, s) {
    this.min.copy(e), this.max.copy(i), this.matrix.copy(s), this.needsUpdate = !0;
  }
  copy(e) {
    this.min.copy(e.min), this.max.copy(e.max), this.matrix.copy(e.matrix), this.needsUpdate = !0;
  }
};
}
