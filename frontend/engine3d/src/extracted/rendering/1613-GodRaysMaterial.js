/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 998175:1000104.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1613(scope) {
scope.GodRaysMaterial = class extends scope.ShaderMaterial {
  constructor(r) {
    super({
      name: "GodRaysMaterial",
      defines: {
        SAMPLES_INT: "60",
        SAMPLES_FLOAT: "60.0"
      },
      uniforms: {
        inputBuffer: new scope.Uniform(null),
        lightPosition: new scope.Uniform(r),
        density: new scope.Uniform(1),
        decay: new scope.Uniform(1),
        weight: new scope.Uniform(1),
        exposure: new scope.Uniform(1),
        clampMax: new scope.Uniform(1)
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      fragmentShader: scope.convolution_god_rays_default,
      vertexShader: scope.common_default
    });
  }
  set inputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  setInputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  get lightPosition() {
    return this.uniforms.lightPosition.value;
  }
  getLightPosition() {
    return this.uniforms.lightPosition.value;
  }
  setLightPosition(r) {
    this.uniforms.lightPosition.value = r;
  }
  get density() {
    return this.uniforms.density.value;
  }
  set density(r) {
    this.uniforms.density.value = r;
  }
  getDensity() {
    return this.uniforms.density.value;
  }
  setDensity(r) {
    this.uniforms.density.value = r;
  }
  get decay() {
    return this.uniforms.decay.value;
  }
  set decay(r) {
    this.uniforms.decay.value = r;
  }
  getDecay() {
    return this.uniforms.decay.value;
  }
  setDecay(r) {
    this.uniforms.decay.value = r;
  }
  get weight() {
    return this.uniforms.weight.value;
  }
  set weight(r) {
    this.uniforms.weight.value = r;
  }
  getWeight() {
    return this.uniforms.weight.value;
  }
  setWeight(r) {
    this.uniforms.weight.value = r;
  }
  get exposure() {
    return this.uniforms.exposure.value;
  }
  set exposure(r) {
    this.uniforms.exposure.value = r;
  }
  getExposure() {
    return this.uniforms.exposure.value;
  }
  setExposure(r) {
    this.uniforms.exposure.value = r;
  }
  get maxIntensity() {
    return this.uniforms.clampMax.value;
  }
  set maxIntensity(r) {
    this.uniforms.clampMax.value = r;
  }
  getMaxIntensity() {
    return this.uniforms.clampMax.value;
  }
  setMaxIntensity(r) {
    this.uniforms.clampMax.value = r;
  }
  get samples() {
    return Number(this.defines.SAMPLES_INT);
  }
  set samples(r) {
    const e = Math.floor(r);
    this.defines.SAMPLES_INT = e.toFixed(0), this.defines.SAMPLES_FLOAT = e.toFixed(1), this.needsUpdate = !0;
  }
  getSamples() {
    return this.samples;
  }
  setSamples(r) {
    this.samples = r;
  }
};
}
