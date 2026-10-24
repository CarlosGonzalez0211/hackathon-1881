/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 954129:955171.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1579(scope) {
scope.KawaseBlurMaterial = class extends scope.ShaderMaterial {
  constructor(r = new scope.Vector4()) {
    super({
      name: "KawaseBlurMaterial",
      uniforms: {
        inputBuffer: new scope.Uniform(null),
        texelSize: new scope.Uniform(new scope.Vector4()),
        scale: new scope.Uniform(1),
        kernel: new scope.Uniform(0)
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      fragmentShader: scope.convolution_kawase_default,
      vertexShader: scope.convolution_kawase_default2
    }), this.setTexelSize(r.x, r.y), this.kernelSize = scope.KernelSize.MEDIUM;
  }
  set inputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  setInputBuffer(r) {
    this.inputBuffer = r;
  }
  get kernelSequence() {
    return scope.kernelPresets[this.kernelSize];
  }
  get scale() {
    return this.uniforms.scale.value;
  }
  set scale(r) {
    this.uniforms.scale.value = r;
  }
  getScale() {
    return this.uniforms.scale.value;
  }
  setScale(r) {
    this.uniforms.scale.value = r;
  }
  getKernel() {
    return null;
  }
  get kernel() {
    return this.uniforms.kernel.value;
  }
  set kernel(r) {
    this.uniforms.kernel.value = r;
  }
  setKernel(r) {
    this.kernel = r;
  }
  setTexelSize(r, e) {
    this.uniforms.texelSize.value.set(r, e, r * .5, e * .5);
  }
  setSize(r, e) {
    const i = 1 / r,
      s = 1 / e;
    this.uniforms.texelSize.value.set(i, s, i * .5, s * .5);
  }
};
}
