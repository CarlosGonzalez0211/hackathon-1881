/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 532054:544295.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1100(scope) {
scope.WebGLProgram = function WebGLProgram(r, e, i, s) {
  const a = r.getContext(),
    o = i.defines;
  let l = i.vertexShader,
    c = i.fragmentShader;
  const h = scope.generateShadowMapTypeDefine(i),
    d = scope.generateEnvMapTypeDefine(i),
    p = scope.generateEnvMapModeDefine(i),
    f = scope.generateEnvMapBlendingDefine(i),
    _ = scope.generateCubeUVSize(i),
    x = scope.generateVertexExtensions(i),
    b = scope.generateDefines(o),
    T = a.createProgram();
  let M,
    w,
    D = i.glslVersion ? "#version " + i.glslVersion + `
` : "";
  i.isRawShaderMaterial ? (M = ["#define SHADER_TYPE " + i.shaderType, "#define SHADER_NAME " + i.shaderName, b].filter(scope.filterEmptyLine).join(`
`), M.length > 0 && (M += `
`), w = ["#define SHADER_TYPE " + i.shaderType, "#define SHADER_NAME " + i.shaderName, b].filter(scope.filterEmptyLine).join(`
`), w.length > 0 && (w += `
`)) : (M = [scope.generatePrecision(i), "#define SHADER_TYPE " + i.shaderType, "#define SHADER_NAME " + i.shaderName, b, i.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "", i.batching ? "#define USE_BATCHING" : "", i.batchingColor ? "#define USE_BATCHING_COLOR" : "", i.instancing ? "#define USE_INSTANCING" : "", i.instancingColor ? "#define USE_INSTANCING_COLOR" : "", i.instancingMorph ? "#define USE_INSTANCING_MORPH" : "", i.useFog && i.fog ? "#define USE_FOG" : "", i.useFog && i.fogExp2 ? "#define FOG_EXP2" : "", i.map ? "#define USE_MAP" : "", i.envMap ? "#define USE_ENVMAP" : "", i.envMap ? "#define " + p : "", i.lightMap ? "#define USE_LIGHTMAP" : "", i.aoMap ? "#define USE_AOMAP" : "", i.bumpMap ? "#define USE_BUMPMAP" : "", i.normalMap ? "#define USE_NORMALMAP" : "", i.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", i.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", i.displacementMap ? "#define USE_DISPLACEMENTMAP" : "", i.emissiveMap ? "#define USE_EMISSIVEMAP" : "", i.anisotropy ? "#define USE_ANISOTROPY" : "", i.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "", i.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", i.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", i.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", i.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", i.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", i.specularMap ? "#define USE_SPECULARMAP" : "", i.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", i.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", i.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", i.metalnessMap ? "#define USE_METALNESSMAP" : "", i.alphaMap ? "#define USE_ALPHAMAP" : "", i.alphaHash ? "#define USE_ALPHAHASH" : "", i.transmission ? "#define USE_TRANSMISSION" : "", i.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", i.thicknessMap ? "#define USE_THICKNESSMAP" : "", i.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", i.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", i.mapUv ? "#define MAP_UV " + i.mapUv : "", i.alphaMapUv ? "#define ALPHAMAP_UV " + i.alphaMapUv : "", i.lightMapUv ? "#define LIGHTMAP_UV " + i.lightMapUv : "", i.aoMapUv ? "#define AOMAP_UV " + i.aoMapUv : "", i.emissiveMapUv ? "#define EMISSIVEMAP_UV " + i.emissiveMapUv : "", i.bumpMapUv ? "#define BUMPMAP_UV " + i.bumpMapUv : "", i.normalMapUv ? "#define NORMALMAP_UV " + i.normalMapUv : "", i.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + i.displacementMapUv : "", i.metalnessMapUv ? "#define METALNESSMAP_UV " + i.metalnessMapUv : "", i.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + i.roughnessMapUv : "", i.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + i.anisotropyMapUv : "", i.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + i.clearcoatMapUv : "", i.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + i.clearcoatNormalMapUv : "", i.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + i.clearcoatRoughnessMapUv : "", i.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + i.iridescenceMapUv : "", i.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + i.iridescenceThicknessMapUv : "", i.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + i.sheenColorMapUv : "", i.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + i.sheenRoughnessMapUv : "", i.specularMapUv ? "#define SPECULARMAP_UV " + i.specularMapUv : "", i.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + i.specularColorMapUv : "", i.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + i.specularIntensityMapUv : "", i.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + i.transmissionMapUv : "", i.thicknessMapUv ? "#define THICKNESSMAP_UV " + i.thicknessMapUv : "", i.vertexTangents && i.flatShading === !1 ? "#define USE_TANGENT" : "", i.vertexColors ? "#define USE_COLOR" : "", i.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", i.vertexUv1s ? "#define USE_UV1" : "", i.vertexUv2s ? "#define USE_UV2" : "", i.vertexUv3s ? "#define USE_UV3" : "", i.pointsUvs ? "#define USE_POINTS_UV" : "", i.flatShading ? "#define FLAT_SHADED" : "", i.skinning ? "#define USE_SKINNING" : "", i.morphTargets ? "#define USE_MORPHTARGETS" : "", i.morphNormals && i.flatShading === !1 ? "#define USE_MORPHNORMALS" : "", i.morphColors ? "#define USE_MORPHCOLORS" : "", i.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + i.morphTextureStride : "", i.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + i.morphTargetsCount : "", i.doubleSided ? "#define DOUBLE_SIDED" : "", i.flipSided ? "#define FLIP_SIDED" : "", i.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", i.shadowMapEnabled ? "#define " + h : "", i.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", i.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "", i.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "", i.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "", "uniform mat4 modelMatrix;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform mat4 viewMatrix;", "uniform mat3 normalMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", "#ifdef USE_INSTANCING", "	attribute mat4 instanceMatrix;", "#endif", "#ifdef USE_INSTANCING_COLOR", "	attribute vec3 instanceColor;", "#endif", "#ifdef USE_INSTANCING_MORPH", "	uniform sampler2D morphTexture;", "#endif", "attribute vec3 position;", "attribute vec3 normal;", "attribute vec2 uv;", "#ifdef USE_UV1", "	attribute vec2 uv1;", "#endif", "#ifdef USE_UV2", "	attribute vec2 uv2;", "#endif", "#ifdef USE_UV3", "	attribute vec2 uv3;", "#endif", "#ifdef USE_TANGENT", "	attribute vec4 tangent;", "#endif", "#if defined( USE_COLOR_ALPHA )", "	attribute vec4 color;", "#elif defined( USE_COLOR )", "	attribute vec3 color;", "#endif", "#ifdef USE_SKINNING", "	attribute vec4 skinIndex;", "	attribute vec4 skinWeight;", "#endif", `
`].filter(scope.filterEmptyLine).join(`
`), w = [scope.generatePrecision(i), "#define SHADER_TYPE " + i.shaderType, "#define SHADER_NAME " + i.shaderName, b, i.useFog && i.fog ? "#define USE_FOG" : "", i.useFog && i.fogExp2 ? "#define FOG_EXP2" : "", i.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "", i.map ? "#define USE_MAP" : "", i.matcap ? "#define USE_MATCAP" : "", i.envMap ? "#define USE_ENVMAP" : "", i.envMap ? "#define " + d : "", i.envMap ? "#define " + p : "", i.envMap ? "#define " + f : "", _ ? "#define CUBEUV_TEXEL_WIDTH " + _.texelWidth : "", _ ? "#define CUBEUV_TEXEL_HEIGHT " + _.texelHeight : "", _ ? "#define CUBEUV_MAX_MIP " + _.maxMip + ".0" : "", i.lightMap ? "#define USE_LIGHTMAP" : "", i.aoMap ? "#define USE_AOMAP" : "", i.bumpMap ? "#define USE_BUMPMAP" : "", i.normalMap ? "#define USE_NORMALMAP" : "", i.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", i.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", i.emissiveMap ? "#define USE_EMISSIVEMAP" : "", i.anisotropy ? "#define USE_ANISOTROPY" : "", i.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "", i.clearcoat ? "#define USE_CLEARCOAT" : "", i.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", i.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", i.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", i.dispersion ? "#define USE_DISPERSION" : "", i.iridescence ? "#define USE_IRIDESCENCE" : "", i.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", i.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", i.specularMap ? "#define USE_SPECULARMAP" : "", i.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", i.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", i.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", i.metalnessMap ? "#define USE_METALNESSMAP" : "", i.alphaMap ? "#define USE_ALPHAMAP" : "", i.alphaTest ? "#define USE_ALPHATEST" : "", i.alphaHash ? "#define USE_ALPHAHASH" : "", i.sheen ? "#define USE_SHEEN" : "", i.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", i.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", i.transmission ? "#define USE_TRANSMISSION" : "", i.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", i.thicknessMap ? "#define USE_THICKNESSMAP" : "", i.vertexTangents && i.flatShading === !1 ? "#define USE_TANGENT" : "", i.vertexColors || i.instancingColor || i.batchingColor ? "#define USE_COLOR" : "", i.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", i.vertexUv1s ? "#define USE_UV1" : "", i.vertexUv2s ? "#define USE_UV2" : "", i.vertexUv3s ? "#define USE_UV3" : "", i.pointsUvs ? "#define USE_POINTS_UV" : "", i.gradientMap ? "#define USE_GRADIENTMAP" : "", i.flatShading ? "#define FLAT_SHADED" : "", i.doubleSided ? "#define DOUBLE_SIDED" : "", i.flipSided ? "#define FLIP_SIDED" : "", i.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", i.shadowMapEnabled ? "#define " + h : "", i.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "", i.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "", i.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "", i.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "", i.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "", i.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "", "uniform mat4 viewMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", i.toneMapping !== scope.NoToneMapping ? "#define TONE_MAPPING" : "", i.toneMapping !== scope.NoToneMapping ? scope.ShaderChunk.tonemapping_pars_fragment : "", i.toneMapping !== scope.NoToneMapping ? scope.getToneMappingFunction("toneMapping", i.toneMapping) : "", i.dithering ? "#define DITHERING" : "", i.opaque ? "#define OPAQUE" : "", scope.ShaderChunk.colorspace_pars_fragment, scope.getTexelEncodingFunction("linearToOutputTexel", i.outputColorSpace), scope.getLuminanceFunction(), i.useDepthPacking ? "#define DEPTH_PACKING " + i.depthPacking : "", `
`].filter(scope.filterEmptyLine).join(`
`)), l = scope.resolveIncludes(l), l = scope.replaceLightNums(l, i), l = scope.replaceClippingPlaneNums(l, i), c = scope.resolveIncludes(c), c = scope.replaceLightNums(c, i), c = scope.replaceClippingPlaneNums(c, i), l = scope.unrollLoops(l), c = scope.unrollLoops(c), i.isRawShaderMaterial !== !0 && (D = `#version 300 es
`, M = [x, "#define attribute in", "#define varying out", "#define texture2D texture"].join(`
`) + `
` + M, w = ["#define varying in", i.glslVersion === scope.GLSL3 ? "" : "layout(location = 0) out highp vec4 pc_fragColor;", i.glslVersion === scope.GLSL3 ? "" : "#define gl_FragColor pc_fragColor", "#define gl_FragDepthEXT gl_FragDepth", "#define texture2D texture", "#define textureCube texture", "#define texture2DProj textureProj", "#define texture2DLodEXT textureLod", "#define texture2DProjLodEXT textureProjLod", "#define textureCubeLodEXT textureLod", "#define texture2DGradEXT textureGrad", "#define texture2DProjGradEXT textureProjGrad", "#define textureCubeGradEXT textureGrad"].join(`
`) + `
` + w);
  const R = D + M + l,
    P = D + w + c,
    U = scope.WebGLShader(a, a.VERTEX_SHADER, R),
    O = scope.WebGLShader(a, a.FRAGMENT_SHADER, P);
  a.attachShader(T, U), a.attachShader(T, O), i.index0AttributeName !== void 0 ? a.bindAttribLocation(T, 0, i.index0AttributeName) : i.morphTargets === !0 && a.bindAttribLocation(T, 0, "position"), a.linkProgram(T);
  function N(W) {
    if (r.debug.checkShaderErrors) {
      const $ = a.getProgramInfoLog(T) || "",
        Z = a.getShaderInfoLog(U) || "",
        J = a.getShaderInfoLog(O) || "",
        se = $.trim(),
        re = Z.trim(),
        he = J.trim();
      let ee = !0,
        Ie = !0;
      if (a.getProgramParameter(T, a.LINK_STATUS) === !1) {
        if (ee = !1, typeof r.debug.onShaderError == "function") r.debug.onShaderError(a, T, U, O);else {
          const Te = scope.getShaderErrors(a, U, "vertex"),
            Ue = scope.getShaderErrors(a, O, "fragment");
          console.error("THREE.WebGLProgram: Shader Error " + a.getError() + " - VALIDATE_STATUS " + a.getProgramParameter(T, a.VALIDATE_STATUS) + `

Material Name: ` + W.name + `
Material Type: ` + W.type + `

Program Info Log: ` + se + `
` + Te + `
` + Ue);
        }
      } else se !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", se) : (re === "" || he === "") && (Ie = !1);
      Ie && (W.diagnostics = {
        runnable: ee,
        programLog: se,
        vertexShader: {
          log: re,
          prefix: M
        },
        fragmentShader: {
          log: he,
          prefix: w
        }
      });
    }
    a.deleteShader(U), a.deleteShader(O), H = new scope.WebGLUniforms(a, T), F = scope.fetchAttributeLocations(a, T);
  }
  let H;
  this.getUniforms = function () {
    return H === void 0 && N(this), H;
  };
  let F;
  this.getAttributes = function () {
    return F === void 0 && N(this), F;
  };
  let k = i.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function () {
    return k === !1 && (k = a.getProgramParameter(T, scope.COMPLETION_STATUS_KHR)), k;
  }, this.destroy = function () {
    s.releaseStatesOfProgram(this), a.deleteProgram(T), this.program = void 0;
  }, this.type = i.shaderType, this.name = i.shaderName, this.id = scope.programIdCount++, this.cacheKey = e, this.usedTimes = 1, this.program = T, this.vertexShader = U, this.fragmentShader = O, this;
};
}
