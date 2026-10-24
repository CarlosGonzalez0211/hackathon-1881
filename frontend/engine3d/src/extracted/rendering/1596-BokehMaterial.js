/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 972923:974169.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1596(scope) {
scope.BokehMaterial = class extends scope.ShaderMaterial {
  constructor(r = !1, e = !1) {
    super({
      name: "BokehMaterial",
      defines: {
        PASS: r ? "2" : "1"
      },
      uniforms: {
        inputBuffer: new scope.Uniform(null),
        cocBuffer: new scope.Uniform(null),
        texelSize: new scope.Uniform(new scope.Vector2()),
        kernel64: new scope.Uniform(null),
        kernel16: new scope.Uniform(null),
        scale: new scope.Uniform(1)
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      fragmentShader: scope.convolution_bokeh_default,
      vertexShader: scope.common_default
    }), e && (this.defines.FOREGROUND = "1"), this.generateKernel();
  }
  set inputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  setInputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  set cocBuffer(r) {
    this.uniforms.cocBuffer.value = r;
  }
  setCoCBuffer(r) {
    this.uniforms.cocBuffer.value = r;
  }
  get scale() {
    return this.uniforms.scale.value;
  }
  set scale(r) {
    this.uniforms.scale.value = r;
  }
  getScale(r) {
    return this.scale;
  }
  setScale(r) {
    this.scale = r;
  }
  generateKernel() {
    const r = 2.39996323,
      e = new Float64Array(128),
      i = new Float64Array(32);
    let s = 0,
      a = 0;
    for (let o = 0, l = Math.sqrt(80); o < 80; ++o) {
      const c = o * r,
        h = Math.sqrt(o) / l,
        d = h * Math.cos(c),
        p = h * Math.sin(c);
      o % 5 === 0 ? (i[a++] = d, i[a++] = p) : (e[s++] = d, e[s++] = p);
    }
    this.uniforms.kernel64.value = e, this.uniforms.kernel16.value = i;
  }
  setTexelSize(r, e) {
    this.uniforms.texelSize.value.set(r, e);
  }
  setSize(r, e) {
    this.uniforms.texelSize.value.set(1 / r, 1 / e);
  }
};
}
