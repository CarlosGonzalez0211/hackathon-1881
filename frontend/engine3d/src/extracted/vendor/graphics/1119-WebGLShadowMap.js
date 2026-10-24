/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 566151:571152.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1119(scope) {
scope.WebGLShadowMap = function WebGLShadowMap(r, e, i) {
  let s = new scope.Frustum();
  const a = new scope.Vector2(),
    o = new scope.Vector2(),
    l = new scope.Vector4(),
    c = new scope.MeshDepthMaterial({
      depthPacking: scope.RGBADepthPacking
    }),
    h = new scope.MeshDistanceMaterial(),
    d = {},
    p = i.maxTextureSize,
    f = {
      [scope.FrontSide]: scope.BackSide,
      [scope.BackSide]: scope.FrontSide,
      [scope.DoubleSide]: scope.DoubleSide
    },
    _ = new scope.ShaderMaterial({
      defines: {
        VSM_SAMPLES: 8
      },
      uniforms: {
        shadow_pass: {
          value: null
        },
        resolution: {
          value: new scope.Vector2()
        },
        radius: {
          value: 4
        }
      },
      vertexShader: scope.vertex$i,
      fragmentShader: scope.fragment$i
    }),
    x = _.clone();
  x.defines.HORIZONTAL_PASS = 1;
  const b = new scope.BufferGeometry();
  b.setAttribute("position", new scope.BufferAttribute(new Float32Array([-1, -1, .5, 3, -1, .5, -1, 3, .5]), 3));
  const T = new scope.Mesh(b, _),
    M = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = scope.PCFShadowMap;
  let w = this.type;
  this.render = function (O, N, H) {
    if (M.enabled === !1 || M.autoUpdate === !1 && M.needsUpdate === !1 || O.length === 0) return;
    const F = r.getRenderTarget(),
      k = r.getActiveCubeFace(),
      W = r.getActiveMipmapLevel(),
      $ = r.state;
    $.setBlending(scope.NoBlending), $.buffers.depth.getReversed() === !0 ? $.buffers.color.setClear(0, 0, 0, 0) : $.buffers.color.setClear(1, 1, 1, 1), $.buffers.depth.setTest(!0), $.setScissorTest(!1);
    const Z = w !== scope.VSMShadowMap && this.type === scope.VSMShadowMap,
      J = w === scope.VSMShadowMap && this.type !== scope.VSMShadowMap;
    for (let se = 0, re = O.length; se < re; se++) {
      const he = O[se],
        ee = he.shadow;
      if (ee === void 0) {
        console.warn("THREE.WebGLShadowMap:", he, "has no shadow.");
        continue;
      }
      if (ee.autoUpdate === !1 && ee.needsUpdate === !1) continue;
      a.copy(ee.mapSize);
      const Ie = ee.getFrameExtents();
      if (a.multiply(Ie), o.copy(ee.mapSize), (a.x > p || a.y > p) && (a.x > p && (o.x = Math.floor(p / Ie.x), a.x = o.x * Ie.x, ee.mapSize.x = o.x), a.y > p && (o.y = Math.floor(p / Ie.y), a.y = o.y * Ie.y, ee.mapSize.y = o.y)), ee.map === null || Z === !0 || J === !0) {
        const Ue = this.type !== scope.VSMShadowMap ? {
          minFilter: scope.NearestFilter,
          magFilter: scope.NearestFilter
        } : {};
        ee.map !== null && ee.map.dispose(), ee.map = new scope.WebGLRenderTarget(a.x, a.y, Ue), ee.map.texture.name = he.name + ".shadowMap", ee.camera.updateProjectionMatrix();
      }
      r.setRenderTarget(ee.map), r.clear();
      const Te = ee.getViewportCount();
      for (let Ue = 0; Ue < Te; Ue++) {
        const nt = ee.getViewport(Ue);
        l.set(o.x * nt.x, o.y * nt.y, o.x * nt.z, o.y * nt.w), $.viewport(l), ee.updateMatrices(he, Ue), s = ee.getFrustum(), P(N, H, ee.camera, he, this.type);
      }
      ee.isPointLightShadow !== !0 && this.type === scope.VSMShadowMap && D(ee, H), ee.needsUpdate = !1;
    }
    w = this.type, M.needsUpdate = !1, r.setRenderTarget(F, k, W);
  };
  function D(O, N) {
    const H = e.update(T);
    _.defines.VSM_SAMPLES !== O.blurSamples && (_.defines.VSM_SAMPLES = O.blurSamples, x.defines.VSM_SAMPLES = O.blurSamples, _.needsUpdate = !0, x.needsUpdate = !0), O.mapPass === null && (O.mapPass = new scope.WebGLRenderTarget(a.x, a.y)), _.uniforms.shadow_pass.value = O.map.texture, _.uniforms.resolution.value = O.mapSize, _.uniforms.radius.value = O.radius, r.setRenderTarget(O.mapPass), r.clear(), r.renderBufferDirect(N, null, H, _, T, null), x.uniforms.shadow_pass.value = O.mapPass.texture, x.uniforms.resolution.value = O.mapSize, x.uniforms.radius.value = O.radius, r.setRenderTarget(O.map), r.clear(), r.renderBufferDirect(N, null, H, x, T, null);
  }
  function R(O, N, H, F) {
    let k = null;
    const W = H.isPointLight === !0 ? O.customDistanceMaterial : O.customDepthMaterial;
    if (W !== void 0) k = W;else if (k = H.isPointLight === !0 ? h : c, r.localClippingEnabled && N.clipShadows === !0 && Array.isArray(N.clippingPlanes) && N.clippingPlanes.length !== 0 || N.displacementMap && N.displacementScale !== 0 || N.alphaMap && N.alphaTest > 0 || N.map && N.alphaTest > 0 || N.alphaToCoverage === !0) {
      const $ = k.uuid,
        Z = N.uuid;
      let J = d[$];
      J === void 0 && (J = {}, d[$] = J);
      let se = J[Z];
      se === void 0 && (se = k.clone(), J[Z] = se, scope.__lifecycle.listen(N, "dispose", U)), k = se;
    }
    if (k.visible = N.visible, k.wireframe = N.wireframe, F === scope.VSMShadowMap ? k.side = N.shadowSide !== null ? N.shadowSide : N.side : k.side = N.shadowSide !== null ? N.shadowSide : f[N.side], k.alphaMap = N.alphaMap, k.alphaTest = N.alphaToCoverage === !0 ? .5 : N.alphaTest, k.map = N.map, k.clipShadows = N.clipShadows, k.clippingPlanes = N.clippingPlanes, k.clipIntersection = N.clipIntersection, k.displacementMap = N.displacementMap, k.displacementScale = N.displacementScale, k.displacementBias = N.displacementBias, k.wireframeLinewidth = N.wireframeLinewidth, k.linewidth = N.linewidth, H.isPointLight === !0 && k.isMeshDistanceMaterial === !0) {
      const $ = r.properties.get(k);
      $.light = H;
    }
    return k;
  }
  function P(O, N, H, F, k) {
    if (O.visible === !1) return;
    if (O.layers.test(N.layers) && (O.isMesh || O.isLine || O.isPoints) && (O.castShadow || O.receiveShadow && k === scope.VSMShadowMap) && (!O.frustumCulled || s.intersectsObject(O))) {
      O.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse, O.matrixWorld);
      const Z = e.update(O),
        J = O.material;
      if (Array.isArray(J)) {
        const se = Z.groups;
        for (let re = 0, he = se.length; re < he; re++) {
          const ee = se[re],
            Ie = J[ee.materialIndex];
          if (Ie && Ie.visible) {
            const Te = R(O, Ie, F, k);
            O.onBeforeShadow(r, O, N, H, Z, Te, ee), r.renderBufferDirect(H, null, Z, Te, O, ee), O.onAfterShadow(r, O, N, H, Z, Te, ee);
          }
        }
      } else if (J.visible) {
        const se = R(O, J, F, k);
        O.onBeforeShadow(r, O, N, H, Z, se, null), r.renderBufferDirect(H, null, Z, se, O, null), O.onAfterShadow(r, O, N, H, Z, se, null);
      }
    }
    const $ = O.children;
    for (let Z = 0, J = $.length; Z < J; Z++) P($[Z], N, H, F, k);
  }
  function U(O) {
    scope.__lifecycle.unlisten(O.target, "dispose", U);
    for (const H in d) {
      const F = d[H],
        k = O.target.uuid;
      k in F && (F[k].dispose(), delete F[k]);
    }
  }
};
}
