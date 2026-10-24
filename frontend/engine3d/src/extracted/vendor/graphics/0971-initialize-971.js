/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 481965:483659.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0971(scope) {
scope.ShaderLib.physical = {
  uniforms: scope.mergeUniforms([scope.ShaderLib.standard.uniforms, {
    clearcoat: {
      value: 0
    },
    clearcoatMap: {
      value: null
    },
    clearcoatMapTransform: {
      value: new scope.Matrix3()
    },
    clearcoatNormalMap: {
      value: null
    },
    clearcoatNormalMapTransform: {
      value: new scope.Matrix3()
    },
    clearcoatNormalScale: {
      value: new scope.Vector2(1, 1)
    },
    clearcoatRoughness: {
      value: 0
    },
    clearcoatRoughnessMap: {
      value: null
    },
    clearcoatRoughnessMapTransform: {
      value: new scope.Matrix3()
    },
    dispersion: {
      value: 0
    },
    iridescence: {
      value: 0
    },
    iridescenceMap: {
      value: null
    },
    iridescenceMapTransform: {
      value: new scope.Matrix3()
    },
    iridescenceIOR: {
      value: 1.3
    },
    iridescenceThicknessMinimum: {
      value: 100
    },
    iridescenceThicknessMaximum: {
      value: 400
    },
    iridescenceThicknessMap: {
      value: null
    },
    iridescenceThicknessMapTransform: {
      value: new scope.Matrix3()
    },
    sheen: {
      value: 0
    },
    sheenColor: {
      value: new scope.Color(0)
    },
    sheenColorMap: {
      value: null
    },
    sheenColorMapTransform: {
      value: new scope.Matrix3()
    },
    sheenRoughness: {
      value: 1
    },
    sheenRoughnessMap: {
      value: null
    },
    sheenRoughnessMapTransform: {
      value: new scope.Matrix3()
    },
    transmission: {
      value: 0
    },
    transmissionMap: {
      value: null
    },
    transmissionMapTransform: {
      value: new scope.Matrix3()
    },
    transmissionSamplerSize: {
      value: new scope.Vector2()
    },
    transmissionSamplerMap: {
      value: null
    },
    thickness: {
      value: 0
    },
    thicknessMap: {
      value: null
    },
    thicknessMapTransform: {
      value: new scope.Matrix3()
    },
    attenuationDistance: {
      value: 0
    },
    attenuationColor: {
      value: new scope.Color(0)
    },
    specularColor: {
      value: new scope.Color(1, 1, 1)
    },
    specularColorMap: {
      value: null
    },
    specularColorMapTransform: {
      value: new scope.Matrix3()
    },
    specularIntensity: {
      value: 1
    },
    specularIntensityMap: {
      value: null
    },
    specularIntensityMapTransform: {
      value: new scope.Matrix3()
    },
    anisotropyVector: {
      value: new scope.Vector2()
    },
    anisotropyMap: {
      value: null
    },
    anisotropyMapTransform: {
      value: new scope.Matrix3()
    }
  }]),
  vertexShader: scope.ShaderChunk.meshphysical_vert,
  fragmentShader: scope.ShaderChunk.meshphysical_frag
};
}
