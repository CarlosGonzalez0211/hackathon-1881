/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 158984:159861.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0524(scope) {
scope.Camera = class Camera extends scope.Object3D {
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new scope.Matrix4(), this.projectionMatrix = new scope.Matrix4(), this.projectionMatrixInverse = new scope.Matrix4(), this.coordinateSystem = scope.WebGLCoordinateSystem, this._reversedDepth = !1;
  }
  get reversedDepth() {
    return this._reversedDepth;
  }
  copy(e, i) {
    return super.copy(e, i), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this.coordinateSystem = e.coordinateSystem, this;
  }
  getWorldDirection(e) {
    return super.getWorldDirection(e).negate();
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  updateWorldMatrix(e, i) {
    super.updateWorldMatrix(e, i), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  clone() {
    return new this.constructor().copy(this);
  }
};
}
