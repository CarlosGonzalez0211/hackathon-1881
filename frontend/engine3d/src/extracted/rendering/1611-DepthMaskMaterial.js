/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 995031:997430.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1611(scope) {
scope.DepthMaskMaterial = class extends scope.ShaderMaterial {
  constructor() {
    super({
      name: "DepthMaskMaterial",
      defines: {
        DEPTH_EPSILON: "0.0001",
        DEPTH_PACKING_0: "0",
        DEPTH_PACKING_1: "0",
        DEPTH_TEST_STRATEGY: scope.DepthTestStrategy.KEEP_MAX_DEPTH
      },
      uniforms: {
        inputBuffer: new scope.Uniform(null),
        depthBuffer0: new scope.Uniform(null),
        depthBuffer1: new scope.Uniform(null),
        cameraNearFar: new scope.Uniform(new scope.Vector2(1, 1))
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      fragmentShader: scope.depth_mask_default,
      vertexShader: scope.common_default
    }), this.depthMode = scope.LessDepth;
  }
  set depthBuffer0(r) {
    this.uniforms.depthBuffer0.value = r;
  }
  set depthPacking0(r) {
    this.defines.DEPTH_PACKING_0 = r.toFixed(0), this.needsUpdate = !0;
  }
  setDepthBuffer0(r, e = scope.BasicDepthPacking) {
    this.depthBuffer0 = r, this.depthPacking0 = e;
  }
  set depthBuffer1(r) {
    this.uniforms.depthBuffer1.value = r;
  }
  set depthPacking1(r) {
    this.defines.DEPTH_PACKING_1 = r.toFixed(0), this.needsUpdate = !0;
  }
  setDepthBuffer1(r, e = scope.BasicDepthPacking) {
    this.depthBuffer1 = r, this.depthPacking1 = e;
  }
  get maxDepthStrategy() {
    return Number(this.defines.DEPTH_TEST_STRATEGY);
  }
  set maxDepthStrategy(r) {
    this.defines.DEPTH_TEST_STRATEGY = r.toFixed(0), this.needsUpdate = !0;
  }
  get keepFar() {
    return this.maxDepthStrategy;
  }
  set keepFar(r) {
    this.maxDepthStrategy = r ? scope.DepthTestStrategy.KEEP_MAX_DEPTH : scope.DepthTestStrategy.DISCARD_MAX_DEPTH;
  }
  getMaxDepthStrategy() {
    return this.maxDepthStrategy;
  }
  setMaxDepthStrategy(r) {
    this.maxDepthStrategy = r;
  }
  get epsilon() {
    return Number(this.defines.DEPTH_EPSILON);
  }
  set epsilon(r) {
    this.defines.DEPTH_EPSILON = r.toFixed(16), this.needsUpdate = !0;
  }
  getEpsilon() {
    return this.epsilon;
  }
  setEpsilon(r) {
    this.epsilon = r;
  }
  get depthMode() {
    return Number(this.defines.DEPTH_MODE);
  }
  set depthMode(r) {
    let e;
    switch (r) {
      case scope.NeverDepth:
        e = "false";
        break;
      case scope.AlwaysDepth:
        e = "true";
        break;
      case scope.EqualDepth:
        e = "abs(d1 - d0) <= DEPTH_EPSILON";
        break;
      case scope.NotEqualDepth:
        e = "abs(d1 - d0) > DEPTH_EPSILON";
        break;
      case scope.LessDepth:
        e = "d0 > d1";
        break;
      case scope.LessEqualDepth:
        e = "d0 >= d1";
        break;
      case scope.GreaterEqualDepth:
        e = "d0 <= d1";
        break;
      case scope.GreaterDepth:
      default:
        e = "d0 < d1";
        break;
    }
    this.defines.DEPTH_MODE = r.toFixed(0), this.defines["depthTest(d0, d1)"] = e, this.needsUpdate = !0;
  }
  getDepthMode() {
    return this.depthMode;
  }
  setDepthMode(r) {
    this.depthMode = r;
  }
  adoptCameraSettings(r) {
    this.copyCameraSettings(r);
  }
  copyCameraSettings(r) {
    r && (this.uniforms.cameraNearFar.value.set(r.near, r.far), r instanceof scope.PerspectiveCamera ? this.defines.PERSPECTIVE_CAMERA = "1" : delete this.defines.PERSPECTIVE_CAMERA, this.needsUpdate = !0);
  }
};
}
