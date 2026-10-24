/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 273533:275405.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0750(scope) {
scope.LightShadow = class LightShadow {
  constructor(e) {
    this.camera = e, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new scope.Vector2(512, 512), this.mapType = scope.UnsignedByteType, this.map = null, this.mapPass = null, this.matrix = new scope.Matrix4(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new scope.Frustum(), this._frameExtents = new scope.Vector2(1, 1), this._viewportCount = 1, this._viewports = [new scope.Vector4(0, 0, 1, 1)];
  }
  getViewportCount() {
    return this._viewportCount;
  }
  getFrustum() {
    return this._frustum;
  }
  updateMatrices(e) {
    const i = this.camera,
      s = this.matrix;
    scope._lightPositionWorld$1.setFromMatrixPosition(e.matrixWorld), i.position.copy(scope._lightPositionWorld$1), scope._lookTarget$1.setFromMatrixPosition(e.target.matrixWorld), i.lookAt(scope._lookTarget$1), i.updateMatrixWorld(), scope._projScreenMatrix$1.multiplyMatrices(i.projectionMatrix, i.matrixWorldInverse), this._frustum.setFromProjectionMatrix(scope._projScreenMatrix$1, i.coordinateSystem, i.reversedDepth), i.reversedDepth ? s.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, 1, 0, 0, 0, 0, 1) : s.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1), s.multiply(scope._projScreenMatrix$1);
  }
  getViewport(e) {
    return this._viewports[e];
  }
  getFrameExtents() {
    return this._frameExtents;
  }
  dispose() {
    this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
  }
  copy(e) {
    return this.camera = e.camera.clone(), this.intensity = e.intensity, this.bias = e.bias, this.radius = e.radius, this.autoUpdate = e.autoUpdate, this.needsUpdate = e.needsUpdate, this.normalBias = e.normalBias, this.blurSamples = e.blurSamples, this.mapSize.copy(e.mapSize), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    const e = {};
    return this.intensity !== 1 && (e.intensity = this.intensity), this.bias !== 0 && (e.bias = this.bias), this.normalBias !== 0 && (e.normalBias = this.normalBias), this.radius !== 1 && (e.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (e.mapSize = this.mapSize.toArray()), e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e;
  }
};
}
