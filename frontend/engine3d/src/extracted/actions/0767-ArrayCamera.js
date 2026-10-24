/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 285033:285167.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0767(scope) {
scope.ArrayCamera = class ArrayCamera extends scope.PerspectiveCamera {
  constructor(e = []) {
    super(), this.isArrayCamera = !0, this.isMultiViewCamera = !1, this.cameras = e;
  }
};
}
