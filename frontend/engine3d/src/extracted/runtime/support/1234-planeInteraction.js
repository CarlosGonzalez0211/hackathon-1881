/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 746921:748546.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1234(scope) {
scope.planeInteraction = class planeInteraction {
  constructor({
    camera: e = null,
    normal: i = new scope.Vector3(0, 0, -1),
    constant: s = scope.DEFAULT_CONSTANT
  } = {}) {
    this._camera = e, this._plane = new scope.Plane(i, s);
  }
  _unproject(e) {
    return scope._raycaster.setFromCamera(e, this._camera), scope._raycaster.ray.intersectPlane(this._plane, scope._v1$f), scope._v1$f;
  }
  getTouchPositionOnPlane(e = 0) {
    return this._unproject(scope.touches$1.get(e).position11);
  }
  getPointPositionOnPlane(e) {
    return this._unproject(e);
  }
  getPointPositionOnScreen(e) {
    return scope._v1$f.copy(e), scope._v1$f.project(this._camera), scope._v1$f.set((scope._v1$f.x + 1) / 2 * scope.client$1.screen.w, -(scope._v1$f.y - 1) / 2 * scope.client$1.screen.h, scope._v1$f.z), scope._v1$f;
  }
  setPlaneFromPoint(e) {
    return scope._v1$f.copy(this._camera.position).sub(e).normalize(), this._plane.setFromNormalAndCoplanarPoint(scope._v1$f, e), this;
  }
  setPlaneFromCameraTarget() {
    return this.setPlaneFromPoint(this._camera.target);
  }
  setPlaneFromCameraTargetAndDistance(e) {
    return scope._v1$f.copy(this._camera.position).sub(this._camera.target).normalize(), scope._v2$4.copy(scope._v1$f).negate().multiplyScalar(e).add(this._camera.position), this._plane.setFromNormalAndCoplanarPoint(scope._v1$f, scope._v2$4), this;
  }
  setPlaneFromDirectionAndPoint(e, i) {
    return scope._v1$f.copy(e).normalize(), this._plane.setFromNormalAndCoplanarPoint(scope._v1$f, i), this;
  }
  setDefaultPlane() {
    return this._plane.normal.set(0, 0, -1), this._plane.constant = scope.DEFAULT_CONSTANT, this;
  }
  setCamera(e) {
    return this._camera = e, this;
  }
  unprojectFinger(e = 0) {
    return this.setPlaneFromCameraTarget().getTouchPositionOnPlane(e);
  }
  unprojectPoint(e) {
    return this.setPlaneFromCameraTarget().getPointPositionOnPlane(e);
  }
  unprojectDistance(e, i = 0) {
    return this.setPlaneFromCameraTargetAndDistance(e).getTouchPositionOnPlane(i);
  }
  project(e) {
    return this.getPointPositionOnScreen(e);
  }
};
}
