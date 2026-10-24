/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 477760:481964.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0970(scope) {
scope.ShaderLib = {
  basic: {
    uniforms: scope.mergeUniforms([scope.UniformsLib.common, scope.UniformsLib.specularmap, scope.UniformsLib.envmap, scope.UniformsLib.aomap, scope.UniformsLib.lightmap, scope.UniformsLib.fog]),
    vertexShader: scope.ShaderChunk.meshbasic_vert,
    fragmentShader: scope.ShaderChunk.meshbasic_frag
  },
  lambert: {
    uniforms: scope.mergeUniforms([scope.UniformsLib.common, scope.UniformsLib.specularmap, scope.UniformsLib.envmap, scope.UniformsLib.aomap, scope.UniformsLib.lightmap, scope.UniformsLib.emissivemap, scope.UniformsLib.bumpmap, scope.UniformsLib.normalmap, scope.UniformsLib.displacementmap, scope.UniformsLib.fog, scope.UniformsLib.lights, {
      emissive: {
        value: new scope.Color(0)
      }
    }]),
    vertexShader: scope.ShaderChunk.meshlambert_vert,
    fragmentShader: scope.ShaderChunk.meshlambert_frag
  },
  phong: {
    uniforms: scope.mergeUniforms([scope.UniformsLib.common, scope.UniformsLib.specularmap, scope.UniformsLib.envmap, scope.UniformsLib.aomap, scope.UniformsLib.lightmap, scope.UniformsLib.emissivemap, scope.UniformsLib.bumpmap, scope.UniformsLib.normalmap, scope.UniformsLib.displacementmap, scope.UniformsLib.fog, scope.UniformsLib.lights, {
      emissive: {
        value: new scope.Color(0)
      },
      specular: {
        value: new scope.Color(1118481)
      },
      shininess: {
        value: 30
      }
    }]),
    vertexShader: scope.ShaderChunk.meshphong_vert,
    fragmentShader: scope.ShaderChunk.meshphong_frag
  },
  standard: {
    uniforms: scope.mergeUniforms([scope.UniformsLib.common, scope.UniformsLib.envmap, scope.UniformsLib.aomap, scope.UniformsLib.lightmap, scope.UniformsLib.emissivemap, scope.UniformsLib.bumpmap, scope.UniformsLib.normalmap, scope.UniformsLib.displacementmap, scope.UniformsLib.roughnessmap, scope.UniformsLib.metalnessmap, scope.UniformsLib.fog, scope.UniformsLib.lights, {
      emissive: {
        value: new scope.Color(0)
      },
      roughness: {
        value: 1
      },
      metalness: {
        value: 0
      },
      envMapIntensity: {
        value: 1
      }
    }]),
    vertexShader: scope.ShaderChunk.meshphysical_vert,
    fragmentShader: scope.ShaderChunk.meshphysical_frag
  },
  toon: {
    uniforms: scope.mergeUniforms([scope.UniformsLib.common, scope.UniformsLib.aomap, scope.UniformsLib.lightmap, scope.UniformsLib.emissivemap, scope.UniformsLib.bumpmap, scope.UniformsLib.normalmap, scope.UniformsLib.displacementmap, scope.UniformsLib.gradientmap, scope.UniformsLib.fog, scope.UniformsLib.lights, {
      emissive: {
        value: new scope.Color(0)
      }
    }]),
    vertexShader: scope.ShaderChunk.meshtoon_vert,
    fragmentShader: scope.ShaderChunk.meshtoon_frag
  },
  matcap: {
    uniforms: scope.mergeUniforms([scope.UniformsLib.common, scope.UniformsLib.bumpmap, scope.UniformsLib.normalmap, scope.UniformsLib.displacementmap, scope.UniformsLib.fog, {
      matcap: {
        value: null
      }
    }]),
    vertexShader: scope.ShaderChunk.meshmatcap_vert,
    fragmentShader: scope.ShaderChunk.meshmatcap_frag
  },
  points: {
    uniforms: scope.mergeUniforms([scope.UniformsLib.points, scope.UniformsLib.fog]),
    vertexShader: scope.ShaderChunk.points_vert,
    fragmentShader: scope.ShaderChunk.points_frag
  },
  dashed: {
    uniforms: scope.mergeUniforms([scope.UniformsLib.common, scope.UniformsLib.fog, {
      scale: {
        value: 1
      },
      dashSize: {
        value: 1
      },
      totalSize: {
        value: 2
      }
    }]),
    vertexShader: scope.ShaderChunk.linedashed_vert,
    fragmentShader: scope.ShaderChunk.linedashed_frag
  },
  depth: {
    uniforms: scope.mergeUniforms([scope.UniformsLib.common, scope.UniformsLib.displacementmap]),
    vertexShader: scope.ShaderChunk.depth_vert,
    fragmentShader: scope.ShaderChunk.depth_frag
  },
  normal: {
    uniforms: scope.mergeUniforms([scope.UniformsLib.common, scope.UniformsLib.bumpmap, scope.UniformsLib.normalmap, scope.UniformsLib.displacementmap, {
      opacity: {
        value: 1
      }
    }]),
    vertexShader: scope.ShaderChunk.meshnormal_vert,
    fragmentShader: scope.ShaderChunk.meshnormal_frag
  },
  sprite: {
    uniforms: scope.mergeUniforms([scope.UniformsLib.sprite, scope.UniformsLib.fog]),
    vertexShader: scope.ShaderChunk.sprite_vert,
    fragmentShader: scope.ShaderChunk.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: {
        value: new scope.Matrix3()
      },
      t2D: {
        value: null
      },
      backgroundIntensity: {
        value: 1
      }
    },
    vertexShader: scope.ShaderChunk.background_vert,
    fragmentShader: scope.ShaderChunk.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: {
        value: null
      },
      flipEnvMap: {
        value: -1
      },
      backgroundBlurriness: {
        value: 0
      },
      backgroundIntensity: {
        value: 1
      },
      backgroundRotation: {
        value: new scope.Matrix3()
      }
    },
    vertexShader: scope.ShaderChunk.backgroundCube_vert,
    fragmentShader: scope.ShaderChunk.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: {
        value: null
      },
      tFlip: {
        value: -1
      },
      opacity: {
        value: 1
      }
    },
    vertexShader: scope.ShaderChunk.cube_vert,
    fragmentShader: scope.ShaderChunk.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: {
        value: null
      }
    },
    vertexShader: scope.ShaderChunk.equirect_vert,
    fragmentShader: scope.ShaderChunk.equirect_frag
  },
  distanceRGBA: {
    uniforms: scope.mergeUniforms([scope.UniformsLib.common, scope.UniformsLib.displacementmap, {
      referencePosition: {
        value: new scope.Vector3()
      },
      nearDistance: {
        value: 1
      },
      farDistance: {
        value: 1e3
      }
    }]),
    vertexShader: scope.ShaderChunk.distanceRGBA_vert,
    fragmentShader: scope.ShaderChunk.distanceRGBA_frag
  },
  shadow: {
    uniforms: scope.mergeUniforms([scope.UniformsLib.lights, scope.UniformsLib.fog, {
      color: {
        value: new scope.Color(0)
      },
      opacity: {
        value: 1
      }
    }]),
    vertexShader: scope.ShaderChunk.shadow_vert,
    fragmentShader: scope.ShaderChunk.shadow_frag
  }
};
}
