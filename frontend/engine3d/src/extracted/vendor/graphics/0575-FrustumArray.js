/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 190982:192827.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0575(scope) {
scope.FrustumArray = class FrustumArray {
  constructor() {
    this.coordinateSystem = scope.WebGLCoordinateSystem;
  }
  intersectsObject(e, i) {
    if (!i.isArrayCamera || i.cameras.length === 0) return !1;
    for (let s = 0; s < i.cameras.length; s++) {
      const a = i.cameras[s];
      if (scope._projScreenMatrix$2.multiplyMatrices(a.projectionMatrix, a.matrixWorldInverse), scope._frustum$1.setFromProjectionMatrix(scope._projScreenMatrix$2, a.coordinateSystem, a.reversedDepth), scope._frustum$1.intersectsObject(e)) return !0;
    }
    return !1;
  }
  intersectsSprite(e, i) {
    if (!i || !i.cameras || i.cameras.length === 0) return !1;
    for (let s = 0; s < i.cameras.length; s++) {
      const a = i.cameras[s];
      if (scope._projScreenMatrix$2.multiplyMatrices(a.projectionMatrix, a.matrixWorldInverse), scope._frustum$1.setFromProjectionMatrix(scope._projScreenMatrix$2, a.coordinateSystem, a.reversedDepth), scope._frustum$1.intersectsSprite(e)) return !0;
    }
    return !1;
  }
  intersectsSphere(e, i) {
    if (!i || !i.cameras || i.cameras.length === 0) return !1;
    for (let s = 0; s < i.cameras.length; s++) {
      const a = i.cameras[s];
      if (scope._projScreenMatrix$2.multiplyMatrices(a.projectionMatrix, a.matrixWorldInverse), scope._frustum$1.setFromProjectionMatrix(scope._projScreenMatrix$2, a.coordinateSystem, a.reversedDepth), scope._frustum$1.intersectsSphere(e)) return !0;
    }
    return !1;
  }
  intersectsBox(e, i) {
    if (!i || !i.cameras || i.cameras.length === 0) return !1;
    for (let s = 0; s < i.cameras.length; s++) {
      const a = i.cameras[s];
      if (scope._projScreenMatrix$2.multiplyMatrices(a.projectionMatrix, a.matrixWorldInverse), scope._frustum$1.setFromProjectionMatrix(scope._projScreenMatrix$2, a.coordinateSystem, a.reversedDepth), scope._frustum$1.intersectsBox(e)) return !0;
    }
    return !1;
  }
  containsPoint(e, i) {
    if (!i || !i.cameras || i.cameras.length === 0) return !1;
    for (let s = 0; s < i.cameras.length; s++) {
      const a = i.cameras[s];
      if (scope._projScreenMatrix$2.multiplyMatrices(a.projectionMatrix, a.matrixWorldInverse), scope._frustum$1.setFromProjectionMatrix(scope._projScreenMatrix$2, a.coordinateSystem, a.reversedDepth), scope._frustum$1.containsPoint(e)) return !0;
    }
    return !1;
  }
  clone() {
    return new scope.FrustumArray();
  }
};
}
