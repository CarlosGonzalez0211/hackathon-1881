/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 545312:555760.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1104(scope) {
scope.WebGLPrograms = function WebGLPrograms(r, e, i, s, a, o, l) {
  const c = new scope.Layers(),
    h = new scope.WebGLShaderCache(),
    d = new Set(),
    p = [],
    f = a.logarithmicDepthBuffer,
    _ = a.vertexTextures;
  let x = a.precision;
  const b = {
    MeshDepthMaterial: "depth",
    MeshDistanceMaterial: "distanceRGBA",
    MeshNormalMaterial: "normal",
    MeshBasicMaterial: "basic",
    MeshLambertMaterial: "lambert",
    MeshPhongMaterial: "phong",
    MeshToonMaterial: "toon",
    MeshStandardMaterial: "physical",
    MeshPhysicalMaterial: "physical",
    MeshMatcapMaterial: "matcap",
    LineBasicMaterial: "basic",
    LineDashedMaterial: "dashed",
    PointsMaterial: "points",
    ShadowMaterial: "shadow",
    SpriteMaterial: "sprite"
  };
  function T(F) {
    return d.add(F), F === 0 ? "uv" : `uv${F}`;
  }
  function M(F, k, W, $, Z) {
    const J = $.fog,
      se = Z.geometry,
      re = F.isMeshStandardMaterial ? $.environment : null,
      he = (F.isMeshStandardMaterial ? i : e).get(F.envMap || re),
      ee = he && he.mapping === scope.CubeUVReflectionMapping ? he.image.height : null,
      Ie = b[F.type];
    F.precision !== null && (x = a.getMaxPrecision(F.precision), x !== F.precision && console.warn("THREE.WebGLProgram.getParameters:", F.precision, "not supported, using", x, "instead."));
    const Te = se.morphAttributes.position || se.morphAttributes.normal || se.morphAttributes.color,
      Ue = Te !== void 0 ? Te.length : 0;
    let nt = 0;
    se.morphAttributes.position !== void 0 && (nt = 1), se.morphAttributes.normal !== void 0 && (nt = 2), se.morphAttributes.color !== void 0 && (nt = 3);
    let mt, ve, ne, z;
    if (Ie) {
      const It = scope.ShaderLib[Ie];
      mt = It.vertexShader, ve = It.fragmentShader;
    } else mt = F.vertexShader, ve = F.fragmentShader, h.update(F), ne = h.getVertexShaderID(F), z = h.getFragmentShaderID(F);
    const V = r.getRenderTarget(),
      _e = r.state.buffers.depth.getReversed(),
      Le = Z.isInstancedMesh === !0,
      pe = Z.isBatchedMesh === !0,
      Fe = !!F.map,
      st = !!F.matcap,
      j = !!he,
      De = !!F.aoMap,
      Pe = !!F.lightMap,
      Oe = !!F.bumpMap,
      Be = !!F.normalMap,
      le = !!F.displacementMap,
      Y = !!F.emissiveMap,
      Xe = !!F.metalnessMap,
      vt = !!F.roughnessMap,
      St = F.anisotropy > 0,
      K = F.clearcoat > 0,
      G = F.dispersion > 0,
      fe = F.iridescence > 0,
      Re = F.sheen > 0,
      Ve = F.transmission > 0,
      Me = St && !!F.anisotropyMap,
      ot = K && !!F.clearcoatMap,
      tt = K && !!F.clearcoatNormalMap,
      ut = K && !!F.clearcoatRoughnessMap,
      ft = fe && !!F.iridescenceMap,
      Ge = fe && !!F.iridescenceThicknessMap,
      ce = Re && !!F.sheenColorMap,
      xe = Re && !!F.sheenRoughnessMap,
      be = !!F.specularMap,
      Ce = !!F.specularColorMap,
      $e = !!F.specularIntensityMap,
      ie = Ve && !!F.transmissionMap,
      Ne = Ve && !!F.thicknessMap,
      je = !!F.gradientMap,
      rt = !!F.alphaMap,
      Ke = F.alphaTest > 0,
      ke = !!F.alphaHash,
      ct = !!F.extensions;
    let wt = scope.NoToneMapping;
    F.toneMapped && (V === null || V.isXRRenderTarget === !0) && (wt = r.toneMapping);
    const Pt = {
      shaderID: Ie,
      shaderType: F.type,
      shaderName: F.name,
      vertexShader: mt,
      fragmentShader: ve,
      defines: F.defines,
      customVertexShaderID: ne,
      customFragmentShaderID: z,
      isRawShaderMaterial: F.isRawShaderMaterial === !0,
      glslVersion: F.glslVersion,
      precision: x,
      batching: pe,
      batchingColor: pe && Z._colorsTexture !== null,
      instancing: Le,
      instancingColor: Le && Z.instanceColor !== null,
      instancingMorph: Le && Z.morphTexture !== null,
      supportsVertexTextures: _,
      outputColorSpace: V === null ? r.outputColorSpace : V.isXRRenderTarget === !0 ? V.texture.colorSpace : scope.LinearSRGBColorSpace,
      alphaToCoverage: !!F.alphaToCoverage,
      map: Fe,
      matcap: st,
      envMap: j,
      envMapMode: j && he.mapping,
      envMapCubeUVHeight: ee,
      aoMap: De,
      lightMap: Pe,
      bumpMap: Oe,
      normalMap: Be,
      displacementMap: _ && le,
      emissiveMap: Y,
      normalMapObjectSpace: Be && F.normalMapType === scope.ObjectSpaceNormalMap,
      normalMapTangentSpace: Be && F.normalMapType === scope.TangentSpaceNormalMap,
      metalnessMap: Xe,
      roughnessMap: vt,
      anisotropy: St,
      anisotropyMap: Me,
      clearcoat: K,
      clearcoatMap: ot,
      clearcoatNormalMap: tt,
      clearcoatRoughnessMap: ut,
      dispersion: G,
      iridescence: fe,
      iridescenceMap: ft,
      iridescenceThicknessMap: Ge,
      sheen: Re,
      sheenColorMap: ce,
      sheenRoughnessMap: xe,
      specularMap: be,
      specularColorMap: Ce,
      specularIntensityMap: $e,
      transmission: Ve,
      transmissionMap: ie,
      thicknessMap: Ne,
      gradientMap: je,
      opaque: F.transparent === !1 && F.blending === scope.NormalBlending && F.alphaToCoverage === !1,
      alphaMap: rt,
      alphaTest: Ke,
      alphaHash: ke,
      combine: F.combine,
      mapUv: Fe && T(F.map.channel),
      aoMapUv: De && T(F.aoMap.channel),
      lightMapUv: Pe && T(F.lightMap.channel),
      bumpMapUv: Oe && T(F.bumpMap.channel),
      normalMapUv: Be && T(F.normalMap.channel),
      displacementMapUv: le && T(F.displacementMap.channel),
      emissiveMapUv: Y && T(F.emissiveMap.channel),
      metalnessMapUv: Xe && T(F.metalnessMap.channel),
      roughnessMapUv: vt && T(F.roughnessMap.channel),
      anisotropyMapUv: Me && T(F.anisotropyMap.channel),
      clearcoatMapUv: ot && T(F.clearcoatMap.channel),
      clearcoatNormalMapUv: tt && T(F.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: ut && T(F.clearcoatRoughnessMap.channel),
      iridescenceMapUv: ft && T(F.iridescenceMap.channel),
      iridescenceThicknessMapUv: Ge && T(F.iridescenceThicknessMap.channel),
      sheenColorMapUv: ce && T(F.sheenColorMap.channel),
      sheenRoughnessMapUv: xe && T(F.sheenRoughnessMap.channel),
      specularMapUv: be && T(F.specularMap.channel),
      specularColorMapUv: Ce && T(F.specularColorMap.channel),
      specularIntensityMapUv: $e && T(F.specularIntensityMap.channel),
      transmissionMapUv: ie && T(F.transmissionMap.channel),
      thicknessMapUv: Ne && T(F.thicknessMap.channel),
      alphaMapUv: rt && T(F.alphaMap.channel),
      vertexTangents: !!se.attributes.tangent && (Be || St),
      vertexColors: F.vertexColors,
      vertexAlphas: F.vertexColors === !0 && !!se.attributes.color && se.attributes.color.itemSize === 4,
      pointsUvs: Z.isPoints === !0 && !!se.attributes.uv && (Fe || rt),
      fog: !!J,
      useFog: F.fog === !0,
      fogExp2: !!J && J.isFogExp2,
      flatShading: F.flatShading === !0 && F.wireframe === !1,
      sizeAttenuation: F.sizeAttenuation === !0,
      logarithmicDepthBuffer: f,
      reversedDepthBuffer: _e,
      skinning: Z.isSkinnedMesh === !0,
      morphTargets: se.morphAttributes.position !== void 0,
      morphNormals: se.morphAttributes.normal !== void 0,
      morphColors: se.morphAttributes.color !== void 0,
      morphTargetsCount: Ue,
      morphTextureStride: nt,
      numDirLights: k.directional.length,
      numPointLights: k.point.length,
      numSpotLights: k.spot.length,
      numSpotLightMaps: k.spotLightMap.length,
      numRectAreaLights: k.rectArea.length,
      numHemiLights: k.hemi.length,
      numDirLightShadows: k.directionalShadowMap.length,
      numPointLightShadows: k.pointShadowMap.length,
      numSpotLightShadows: k.spotShadowMap.length,
      numSpotLightShadowsWithMaps: k.numSpotLightShadowsWithMaps,
      numLightProbes: k.numLightProbes,
      numClippingPlanes: l.numPlanes,
      numClipIntersection: l.numIntersection,
      dithering: F.dithering,
      shadowMapEnabled: r.shadowMap.enabled && W.length > 0,
      shadowMapType: r.shadowMap.type,
      toneMapping: wt,
      decodeVideoTexture: Fe && F.map.isVideoTexture === !0 && scope.ColorManagement.getTransfer(F.map.colorSpace) === scope.SRGBTransfer,
      decodeVideoTextureEmissive: Y && F.emissiveMap.isVideoTexture === !0 && scope.ColorManagement.getTransfer(F.emissiveMap.colorSpace) === scope.SRGBTransfer,
      premultipliedAlpha: F.premultipliedAlpha,
      doubleSided: F.side === scope.DoubleSide,
      flipSided: F.side === scope.BackSide,
      useDepthPacking: F.depthPacking >= 0,
      depthPacking: F.depthPacking || 0,
      index0AttributeName: F.index0AttributeName,
      extensionClipCullDistance: ct && F.extensions.clipCullDistance === !0 && s.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (ct && F.extensions.multiDraw === !0 || pe) && s.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: s.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: F.customProgramCacheKey()
    };
    return Pt.vertexUv1s = d.has(1), Pt.vertexUv2s = d.has(2), Pt.vertexUv3s = d.has(3), d.clear(), Pt;
  }
  function w(F) {
    const k = [];
    if (F.shaderID ? k.push(F.shaderID) : (k.push(F.customVertexShaderID), k.push(F.customFragmentShaderID)), F.defines !== void 0) for (const W in F.defines) k.push(W), k.push(F.defines[W]);
    return F.isRawShaderMaterial === !1 && (D(k, F), R(k, F), k.push(r.outputColorSpace)), k.push(F.customProgramCacheKey), k.join();
  }
  function D(F, k) {
    F.push(k.precision), F.push(k.outputColorSpace), F.push(k.envMapMode), F.push(k.envMapCubeUVHeight), F.push(k.mapUv), F.push(k.alphaMapUv), F.push(k.lightMapUv), F.push(k.aoMapUv), F.push(k.bumpMapUv), F.push(k.normalMapUv), F.push(k.displacementMapUv), F.push(k.emissiveMapUv), F.push(k.metalnessMapUv), F.push(k.roughnessMapUv), F.push(k.anisotropyMapUv), F.push(k.clearcoatMapUv), F.push(k.clearcoatNormalMapUv), F.push(k.clearcoatRoughnessMapUv), F.push(k.iridescenceMapUv), F.push(k.iridescenceThicknessMapUv), F.push(k.sheenColorMapUv), F.push(k.sheenRoughnessMapUv), F.push(k.specularMapUv), F.push(k.specularColorMapUv), F.push(k.specularIntensityMapUv), F.push(k.transmissionMapUv), F.push(k.thicknessMapUv), F.push(k.combine), F.push(k.fogExp2), F.push(k.sizeAttenuation), F.push(k.morphTargetsCount), F.push(k.morphAttributeCount), F.push(k.numDirLights), F.push(k.numPointLights), F.push(k.numSpotLights), F.push(k.numSpotLightMaps), F.push(k.numHemiLights), F.push(k.numRectAreaLights), F.push(k.numDirLightShadows), F.push(k.numPointLightShadows), F.push(k.numSpotLightShadows), F.push(k.numSpotLightShadowsWithMaps), F.push(k.numLightProbes), F.push(k.shadowMapType), F.push(k.toneMapping), F.push(k.numClippingPlanes), F.push(k.numClipIntersection), F.push(k.depthPacking);
  }
  function R(F, k) {
    c.disableAll(), k.supportsVertexTextures && c.enable(0), k.instancing && c.enable(1), k.instancingColor && c.enable(2), k.instancingMorph && c.enable(3), k.matcap && c.enable(4), k.envMap && c.enable(5), k.normalMapObjectSpace && c.enable(6), k.normalMapTangentSpace && c.enable(7), k.clearcoat && c.enable(8), k.iridescence && c.enable(9), k.alphaTest && c.enable(10), k.vertexColors && c.enable(11), k.vertexAlphas && c.enable(12), k.vertexUv1s && c.enable(13), k.vertexUv2s && c.enable(14), k.vertexUv3s && c.enable(15), k.vertexTangents && c.enable(16), k.anisotropy && c.enable(17), k.alphaHash && c.enable(18), k.batching && c.enable(19), k.dispersion && c.enable(20), k.batchingColor && c.enable(21), k.gradientMap && c.enable(22), F.push(c.mask), c.disableAll(), k.fog && c.enable(0), k.useFog && c.enable(1), k.flatShading && c.enable(2), k.logarithmicDepthBuffer && c.enable(3), k.reversedDepthBuffer && c.enable(4), k.skinning && c.enable(5), k.morphTargets && c.enable(6), k.morphNormals && c.enable(7), k.morphColors && c.enable(8), k.premultipliedAlpha && c.enable(9), k.shadowMapEnabled && c.enable(10), k.doubleSided && c.enable(11), k.flipSided && c.enable(12), k.useDepthPacking && c.enable(13), k.dithering && c.enable(14), k.transmission && c.enable(15), k.sheen && c.enable(16), k.opaque && c.enable(17), k.pointsUvs && c.enable(18), k.decodeVideoTexture && c.enable(19), k.decodeVideoTextureEmissive && c.enable(20), k.alphaToCoverage && c.enable(21), F.push(c.mask);
  }
  function P(F) {
    const k = b[F.type];
    let W;
    if (k) {
      const $ = scope.ShaderLib[k];
      W = scope.UniformsUtils.clone($.uniforms);
    } else W = F.uniforms;
    return W;
  }
  function U(F, k) {
    let W;
    for (let $ = 0, Z = p.length; $ < Z; $++) {
      const J = p[$];
      if (J.cacheKey === k) {
        W = J, ++W.usedTimes;
        break;
      }
    }
    return W === void 0 && (W = new scope.WebGLProgram(r, k, F, o), p.push(W)), W;
  }
  function O(F) {
    if (--F.usedTimes === 0) {
      const k = p.indexOf(F);
      p[k] = p[p.length - 1], p.pop(), F.destroy();
    }
  }
  function N(F) {
    h.remove(F);
  }
  function H() {
    h.dispose();
  }
  return {
    getParameters: M,
    getProgramCacheKey: w,
    getUniforms: P,
    acquireProgram: U,
    releaseProgram: O,
    releaseShaderCache: N,
    programs: p,
    dispose: H
  };
};
}
