/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 159931:162472.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0528(scope) {
scope.PerspectiveCamera = class PerspectiveCamera extends scope.Camera {
  constructor(e = 50, i = 1, s = .1, a = 2e3) {
    super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = s, this.far = a, this.focus = 10, this.aspect = i, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
  }
  copy(e, i) {
    return super.copy(e, i), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this;
  }
  setFocalLength(e) {
    const i = .5 * this.getFilmHeight() / e;
    this.fov = scope.RAD2DEG * 2 * Math.atan(i), this.updateProjectionMatrix();
  }
  getFocalLength() {
    const e = Math.tan(scope.DEG2RAD * .5 * this.fov);
    return .5 * this.getFilmHeight() / e;
  }
  getEffectiveFOV() {
    return scope.RAD2DEG * 2 * Math.atan(Math.tan(scope.DEG2RAD * .5 * this.fov) / this.zoom);
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  getViewBounds(e, i, s) {
    scope._v3$1.set(-1, -1, .5).applyMatrix4(this.projectionMatrixInverse), i.set(scope._v3$1.x, scope._v3$1.y).multiplyScalar(-e / scope._v3$1.z), scope._v3$1.set(1, 1, .5).applyMatrix4(this.projectionMatrixInverse), s.set(scope._v3$1.x, scope._v3$1.y).multiplyScalar(-e / scope._v3$1.z);
  }
  getViewSize(e, i) {
    return this.getViewBounds(e, scope._minTarget, scope._maxTarget), i.subVectors(scope._maxTarget, scope._minTarget);
  }
  setViewOffset(e, i, s, a, o, l) {
    this.aspect = e / i, this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = i, this.view.offsetX = s, this.view.offsetY = a, this.view.width = o, this.view.height = l, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = this.near;
    let i = e * Math.tan(scope.DEG2RAD * .5 * this.fov) / this.zoom,
      s = 2 * i,
      a = this.aspect * s,
      o = -.5 * a;
    const l = this.view;
    if (this.view !== null && this.view.enabled) {
      const h = l.fullWidth,
        d = l.fullHeight;
      o += l.offsetX * a / h, i -= l.offsetY * s / d, a *= l.width / h, s *= l.height / d;
    }
    const c = this.filmOffset;
    c !== 0 && (o += e * c / this.getFilmWidth()), this.projectionMatrix.makePerspective(o, o + a, i, i - s, e, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const i = super.toJSON(e);
    return i.object.fov = this.fov, i.object.zoom = this.zoom, i.object.near = this.near, i.object.far = this.far, i.object.focus = this.focus, i.object.aspect = this.aspect, this.view !== null && (i.object.view = Object.assign({}, this.view)), i.object.filmGauge = this.filmGauge, i.object.filmOffset = this.filmOffset, i;
  }
};
}
