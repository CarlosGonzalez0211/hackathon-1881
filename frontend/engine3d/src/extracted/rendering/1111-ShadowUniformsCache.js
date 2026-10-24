/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 558340:558880.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1111(scope) {
scope.ShadowUniformsCache = function ShadowUniformsCache() {
  const r = {};
  return {
    get: function (e) {
      if (r[e.id] !== void 0) return r[e.id];
      let i;
      switch (e.type) {
        case "DirectionalLight":
          i = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new scope.Vector2()
          };
          break;
        case "SpotLight":
          i = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new scope.Vector2()
          };
          break;
        case "PointLight":
          i = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new scope.Vector2(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return r[e.id] = i, i;
    }
  };
};
}
