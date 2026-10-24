/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 275405:275870.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0751(scope) {
scope.SpotLightShadow = class SpotLightShadow extends scope.LightShadow {
  constructor() {
    super(new scope.PerspectiveCamera(50, 1, .5, 500)), this.isSpotLightShadow = !0, this.focus = 1, this.aspect = 1;
  }
  updateMatrices(e) {
    const i = this.camera,
      s = scope.RAD2DEG * 2 * e.angle * this.focus,
      a = this.mapSize.width / this.mapSize.height * this.aspect,
      o = e.distance || i.far;
    (s !== i.fov || a !== i.aspect || o !== i.far) && (i.fov = s, i.aspect = a, i.far = o, i.updateProjectionMatrix()), super.updateMatrices(e);
  }
  copy(e) {
    return super.copy(e), this.focus = e.focus, this;
  }
};
}
