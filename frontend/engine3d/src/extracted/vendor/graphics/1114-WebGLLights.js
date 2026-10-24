/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 559017:564340.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1114(scope) {
scope.WebGLLights = function WebGLLights(r) {
  const e = new scope.UniformsCache(),
    i = scope.ShadowUniformsCache(),
    s = {
      version: 0,
      hash: {
        directionalLength: -1,
        pointLength: -1,
        spotLength: -1,
        rectAreaLength: -1,
        hemiLength: -1,
        numDirectionalShadows: -1,
        numPointShadows: -1,
        numSpotShadows: -1,
        numSpotMaps: -1,
        numLightProbes: -1
      },
      ambient: [0, 0, 0],
      probe: [],
      directional: [],
      directionalShadow: [],
      directionalShadowMap: [],
      directionalShadowMatrix: [],
      spot: [],
      spotLightMap: [],
      spotShadow: [],
      spotShadowMap: [],
      spotLightMatrix: [],
      rectArea: [],
      rectAreaLTC1: null,
      rectAreaLTC2: null,
      point: [],
      pointShadow: [],
      pointShadowMap: [],
      pointShadowMatrix: [],
      hemi: [],
      numSpotLightShadowsWithMaps: 0,
      numLightProbes: 0
    };
  for (let d = 0; d < 9; d++) s.probe.push(new scope.Vector3());
  const a = new scope.Vector3(),
    o = new scope.Matrix4(),
    l = new scope.Matrix4();
  function c(d) {
    let p = 0,
      f = 0,
      _ = 0;
    for (let F = 0; F < 9; F++) s.probe[F].set(0, 0, 0);
    let x = 0,
      b = 0,
      T = 0,
      M = 0,
      w = 0,
      D = 0,
      R = 0,
      P = 0,
      U = 0,
      O = 0,
      N = 0;
    d.sort(scope.shadowCastingAndTexturingLightsFirst);
    for (let F = 0, k = d.length; F < k; F++) {
      const W = d[F],
        $ = W.color,
        Z = W.intensity,
        J = W.distance,
        se = W.shadow && W.shadow.map ? W.shadow.map.texture : null;
      if (W.isAmbientLight) p += $.r * Z, f += $.g * Z, _ += $.b * Z;else if (W.isLightProbe) {
        for (let re = 0; re < 9; re++) s.probe[re].addScaledVector(W.sh.coefficients[re], Z);
        N++;
      } else if (W.isDirectionalLight) {
        const re = e.get(W);
        if (re.color.copy(W.color).multiplyScalar(W.intensity), W.castShadow) {
          const he = W.shadow,
            ee = i.get(W);
          ee.shadowIntensity = he.intensity, ee.shadowBias = he.bias, ee.shadowNormalBias = he.normalBias, ee.shadowRadius = he.radius, ee.shadowMapSize = he.mapSize, s.directionalShadow[x] = ee, s.directionalShadowMap[x] = se, s.directionalShadowMatrix[x] = W.shadow.matrix, D++;
        }
        s.directional[x] = re, x++;
      } else if (W.isSpotLight) {
        const re = e.get(W);
        re.position.setFromMatrixPosition(W.matrixWorld), re.color.copy($).multiplyScalar(Z), re.distance = J, re.coneCos = Math.cos(W.angle), re.penumbraCos = Math.cos(W.angle * (1 - W.penumbra)), re.decay = W.decay, s.spot[T] = re;
        const he = W.shadow;
        if (W.map && (s.spotLightMap[U] = W.map, U++, he.updateMatrices(W), W.castShadow && O++), s.spotLightMatrix[T] = he.matrix, W.castShadow) {
          const ee = i.get(W);
          ee.shadowIntensity = he.intensity, ee.shadowBias = he.bias, ee.shadowNormalBias = he.normalBias, ee.shadowRadius = he.radius, ee.shadowMapSize = he.mapSize, s.spotShadow[T] = ee, s.spotShadowMap[T] = se, P++;
        }
        T++;
      } else if (W.isRectAreaLight) {
        const re = e.get(W);
        re.color.copy($).multiplyScalar(Z), re.halfWidth.set(W.width * .5, 0, 0), re.halfHeight.set(0, W.height * .5, 0), s.rectArea[M] = re, M++;
      } else if (W.isPointLight) {
        const re = e.get(W);
        if (re.color.copy(W.color).multiplyScalar(W.intensity), re.distance = W.distance, re.decay = W.decay, W.castShadow) {
          const he = W.shadow,
            ee = i.get(W);
          ee.shadowIntensity = he.intensity, ee.shadowBias = he.bias, ee.shadowNormalBias = he.normalBias, ee.shadowRadius = he.radius, ee.shadowMapSize = he.mapSize, ee.shadowCameraNear = he.camera.near, ee.shadowCameraFar = he.camera.far, s.pointShadow[b] = ee, s.pointShadowMap[b] = se, s.pointShadowMatrix[b] = W.shadow.matrix, R++;
        }
        s.point[b] = re, b++;
      } else if (W.isHemisphereLight) {
        const re = e.get(W);
        re.skyColor.copy(W.color).multiplyScalar(Z), re.groundColor.copy(W.groundColor).multiplyScalar(Z), s.hemi[w] = re, w++;
      }
    }
    M > 0 && (r.has("OES_texture_float_linear") === !0 ? (s.rectAreaLTC1 = scope.UniformsLib.LTC_FLOAT_1, s.rectAreaLTC2 = scope.UniformsLib.LTC_FLOAT_2) : (s.rectAreaLTC1 = scope.UniformsLib.LTC_HALF_1, s.rectAreaLTC2 = scope.UniformsLib.LTC_HALF_2)), s.ambient[0] = p, s.ambient[1] = f, s.ambient[2] = _;
    const H = s.hash;
    (H.directionalLength !== x || H.pointLength !== b || H.spotLength !== T || H.rectAreaLength !== M || H.hemiLength !== w || H.numDirectionalShadows !== D || H.numPointShadows !== R || H.numSpotShadows !== P || H.numSpotMaps !== U || H.numLightProbes !== N) && (s.directional.length = x, s.spot.length = T, s.rectArea.length = M, s.point.length = b, s.hemi.length = w, s.directionalShadow.length = D, s.directionalShadowMap.length = D, s.pointShadow.length = R, s.pointShadowMap.length = R, s.spotShadow.length = P, s.spotShadowMap.length = P, s.directionalShadowMatrix.length = D, s.pointShadowMatrix.length = R, s.spotLightMatrix.length = P + U - O, s.spotLightMap.length = U, s.numSpotLightShadowsWithMaps = O, s.numLightProbes = N, H.directionalLength = x, H.pointLength = b, H.spotLength = T, H.rectAreaLength = M, H.hemiLength = w, H.numDirectionalShadows = D, H.numPointShadows = R, H.numSpotShadows = P, H.numSpotMaps = U, H.numLightProbes = N, s.version = scope.nextVersion++);
  }
  function h(d, p) {
    let f = 0,
      _ = 0,
      x = 0,
      b = 0,
      T = 0;
    const M = p.matrixWorldInverse;
    for (let w = 0, D = d.length; w < D; w++) {
      const R = d[w];
      if (R.isDirectionalLight) {
        const P = s.directional[f];
        P.direction.setFromMatrixPosition(R.matrixWorld), a.setFromMatrixPosition(R.target.matrixWorld), P.direction.sub(a), P.direction.transformDirection(M), f++;
      } else if (R.isSpotLight) {
        const P = s.spot[x];
        P.position.setFromMatrixPosition(R.matrixWorld), P.position.applyMatrix4(M), P.direction.setFromMatrixPosition(R.matrixWorld), a.setFromMatrixPosition(R.target.matrixWorld), P.direction.sub(a), P.direction.transformDirection(M), x++;
      } else if (R.isRectAreaLight) {
        const P = s.rectArea[b];
        P.position.setFromMatrixPosition(R.matrixWorld), P.position.applyMatrix4(M), l.identity(), o.copy(R.matrixWorld), o.premultiply(M), l.extractRotation(o), P.halfWidth.set(R.width * .5, 0, 0), P.halfHeight.set(0, R.height * .5, 0), P.halfWidth.applyMatrix4(l), P.halfHeight.applyMatrix4(l), b++;
      } else if (R.isPointLight) {
        const P = s.point[_];
        P.position.setFromMatrixPosition(R.matrixWorld), P.position.applyMatrix4(M), _++;
      } else if (R.isHemisphereLight) {
        const P = s.hemi[T];
        P.direction.setFromMatrixPosition(R.matrixWorld), P.direction.transformDirection(M), T++;
      }
    }
  }
  return {
    setup: c,
    setupView: h,
    state: s
  };
};
}
