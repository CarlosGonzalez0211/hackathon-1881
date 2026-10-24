/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1102042:1103390.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1637(scope) {
scope.AdaptiveLuminanceMaterial = class extends scope.ShaderMaterial {
  constructor() {
    super({
      name: "AdaptiveLuminanceMaterial",
      defines: {
        MIP_LEVEL_1X1: "0.0"
      },
      uniforms: {
        luminanceBuffer0: new scope.Uniform(null),
        luminanceBuffer1: new scope.Uniform(null),
        minLuminance: new scope.Uniform(.01),
        deltaTime: new scope.Uniform(0),
        tau: new scope.Uniform(1)
      },
      extensions: {
        shaderTextureLOD: !0
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      fragmentShader: scope.adaptive_luminance_default,
      vertexShader: scope.common_default
    });
  }
  set luminanceBuffer0(r) {
    this.uniforms.luminanceBuffer0.value = r;
  }
  setLuminanceBuffer0(r) {
    this.uniforms.luminanceBuffer0.value = r;
  }
  set luminanceBuffer1(r) {
    this.uniforms.luminanceBuffer1.value = r;
  }
  setLuminanceBuffer1(r) {
    this.uniforms.luminanceBuffer1.value = r;
  }
  set mipLevel1x1(r) {
    this.defines.MIP_LEVEL_1X1 = r.toFixed(1), this.needsUpdate = !0;
  }
  setMipLevel1x1(r) {
    this.mipLevel1x1 = r;
  }
  set deltaTime(r) {
    this.uniforms.deltaTime.value = r;
  }
  setDeltaTime(r) {
    this.uniforms.deltaTime.value = r;
  }
  get minLuminance() {
    return this.uniforms.minLuminance.value;
  }
  set minLuminance(r) {
    this.uniforms.minLuminance.value = r;
  }
  getMinLuminance() {
    return this.uniforms.minLuminance.value;
  }
  setMinLuminance(r) {
    this.uniforms.minLuminance.value = r;
  }
  get adaptationRate() {
    return this.uniforms.tau.value;
  }
  set adaptationRate(r) {
    this.uniforms.tau.value = r;
  }
  getAdaptationRate() {
    return this.uniforms.tau.value;
  }
  setAdaptationRate(r) {
    this.uniforms.tau.value = r;
  }
};
}
