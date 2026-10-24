/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 958375:960111.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1582(scope) {
scope.LuminanceMaterial = class extends scope.ShaderMaterial {
  constructor(r = !1, e = null) {
    super({
      name: "LuminanceMaterial",
      defines: {
        THREE_REVISION: scope.REVISION.replace(/\D+/g, "")
      },
      uniforms: {
        inputBuffer: new scope.Uniform(null),
        threshold: new scope.Uniform(0),
        smoothing: new scope.Uniform(1),
        range: new scope.Uniform(null)
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      fragmentShader: scope.luminance_default,
      vertexShader: scope.common_default
    }), this.colorOutput = r, this.luminanceRange = e;
  }
  set inputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  setInputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  get threshold() {
    return this.uniforms.threshold.value;
  }
  set threshold(r) {
    this.smoothing > 0 || r > 0 ? this.defines.THRESHOLD = "1" : delete this.defines.THRESHOLD, this.uniforms.threshold.value = r;
  }
  getThreshold() {
    return this.threshold;
  }
  setThreshold(r) {
    this.threshold = r;
  }
  get smoothing() {
    return this.uniforms.smoothing.value;
  }
  set smoothing(r) {
    this.threshold > 0 || r > 0 ? this.defines.THRESHOLD = "1" : delete this.defines.THRESHOLD, this.uniforms.smoothing.value = r;
  }
  getSmoothingFactor() {
    return this.smoothing;
  }
  setSmoothingFactor(r) {
    this.smoothing = r;
  }
  get useThreshold() {
    return this.threshold > 0 || this.smoothing > 0;
  }
  set useThreshold(r) {}
  get colorOutput() {
    return this.defines.COLOR !== void 0;
  }
  set colorOutput(r) {
    r ? this.defines.COLOR = "1" : delete this.defines.COLOR, this.needsUpdate = !0;
  }
  isColorOutputEnabled(r) {
    return this.colorOutput;
  }
  setColorOutputEnabled(r) {
    this.colorOutput = r;
  }
  get useRange() {
    return this.luminanceRange !== null;
  }
  set useRange(r) {
    this.luminanceRange = null;
  }
  get luminanceRange() {
    return this.uniforms.range.value;
  }
  set luminanceRange(r) {
    r !== null ? this.defines.RANGE = "1" : delete this.defines.RANGE, this.uniforms.range.value = r, this.needsUpdate = !0;
  }
  getLuminanceRange() {
    return this.luminanceRange;
  }
  setLuminanceRange(r) {
    this.luminanceRange = r;
  }
};
}
