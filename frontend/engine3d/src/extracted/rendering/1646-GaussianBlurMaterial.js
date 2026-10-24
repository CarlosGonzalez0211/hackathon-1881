/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1115838:1116893.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1646(scope) {
scope.GaussianBlurMaterial = class extends scope.ShaderMaterial {
  constructor({
    kernelSize: r = 35
  } = {}) {
    super({
      name: "GaussianBlurMaterial",
      uniforms: {
        inputBuffer: new scope.Uniform(null),
        texelSize: new scope.Uniform(new scope.Vector2()),
        direction: new scope.Uniform(new scope.Vector2()),
        kernel: new scope.Uniform(null),
        scale: new scope.Uniform(1)
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      fragmentShader: scope.convolution_gaussian_default,
      vertexShader: scope.convolution_gaussian_default2
    }), this._kernelSize = 0, this.kernelSize = r;
  }
  set inputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  get kernelSize() {
    return this._kernelSize;
  }
  set kernelSize(r) {
    this._kernelSize = r, this.generateKernel(r);
  }
  get direction() {
    return this.uniforms.direction.value;
  }
  get scale() {
    return this.uniforms.scale.value;
  }
  set scale(r) {
    this.uniforms.scale.value = r;
  }
  generateKernel(r) {
    const e = new scope.GaussKernel(r),
      i = e.linearSteps,
      s = new Float64Array(i * 2);
    for (let a = 0, o = 0; a < i; ++a) s[o++] = e.linearOffsets[a], s[o++] = e.linearWeights[a];
    this.uniforms.kernel.value = s, this.defines.STEPS = i.toFixed(0), this.needsUpdate = !0;
  }
  setSize(r, e) {
    this.uniforms.texelSize.value.set(1 / r, 1 / e);
  }
};
}
