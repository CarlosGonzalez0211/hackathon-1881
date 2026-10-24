/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 557715:558340.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1110(scope) {
scope.UniformsCache = function UniformsCache() {
  const r = {};
  return {
    get: function (e) {
      if (r[e.id] !== void 0) return r[e.id];
      let i;
      switch (e.type) {
        case "DirectionalLight":
          i = {
            direction: new scope.Vector3(),
            color: new scope.Color()
          };
          break;
        case "SpotLight":
          i = {
            position: new scope.Vector3(),
            direction: new scope.Vector3(),
            color: new scope.Color(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          i = {
            position: new scope.Vector3(),
            color: new scope.Color(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          i = {
            direction: new scope.Vector3(),
            skyColor: new scope.Color(),
            groundColor: new scope.Color()
          };
          break;
        case "RectAreaLight":
          i = {
            color: new scope.Color(),
            position: new scope.Vector3(),
            halfWidth: new scope.Vector3(),
            halfHeight: new scope.Vector3()
          };
          break;
      }
      return r[e.id] = i, i;
    }
  };
};
}
