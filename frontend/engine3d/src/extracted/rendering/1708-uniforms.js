/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1220471:1220758.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1708(scope) {
scope.uniforms = scope.UniformsUtils.merge([scope.UniformsLib.common, scope.UniformsLib.lights, {
  emissive: {
    value: new scope.Color(0)
  },
  specular: {
    value: new scope.Color(1118481)
  },
  shininess: {
    value: 1
  },
  uShowChars: {
    value: 1
  },
  tColors: {
    value: null
  },
  tNoise: {
    value: null
  },
  tNoiseTerrain: {
    value: null
  },
  ...scope.fogUniforms,
  uFadeDistance: {
    value: 100
  }
}]);
}
