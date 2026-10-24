/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 278191:279967.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0758(scope) {
scope.OrthographicCamera = class OrthographicCamera extends scope.Camera {
  constructor(e = -1, i = 1, s = 1, a = -1, o = .1, l = 2e3) {
    super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = i, this.top = s, this.bottom = a, this.near = o, this.far = l, this.updateProjectionMatrix();
  }
  copy(e, i) {
    return super.copy(e, i), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this;
  }
  setViewOffset(e, i, s, a, o, l) {
    this.view === null && (this.view = {
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
    const e = (this.right - this.left) / (2 * this.zoom),
      i = (this.top - this.bottom) / (2 * this.zoom),
      s = (this.right + this.left) / 2,
      a = (this.top + this.bottom) / 2;
    let o = s - e,
      l = s + e,
      c = a + i,
      h = a - i;
    if (this.view !== null && this.view.enabled) {
      const d = (this.right - this.left) / this.view.fullWidth / this.zoom,
        p = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      o += d * this.view.offsetX, l = o + d * this.view.width, c -= p * this.view.offsetY, h = c - p * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(o, l, c, h, this.near, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const i = super.toJSON(e);
    return i.object.zoom = this.zoom, i.object.left = this.left, i.object.right = this.right, i.object.top = this.top, i.object.bottom = this.bottom, i.object.near = this.near, i.object.far = this.far, this.view !== null && (i.object.view = Object.assign({}, this.view)), i;
  }
};
}
