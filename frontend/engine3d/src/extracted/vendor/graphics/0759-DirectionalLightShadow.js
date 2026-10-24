/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 279967:280112.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0759(scope) {
scope.DirectionalLightShadow = class DirectionalLightShadow extends scope.LightShadow {
  constructor() {
    super(new scope.OrthographicCamera(-5, 5, 5, -5, .5, 500)), this.isDirectionalLightShadow = !0;
  }
};
}
