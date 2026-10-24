/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 965397:966035.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1589(scope) {
scope.UpsamplingMaterial = class extends scope.ShaderMaterial {
  constructor() {
    super({
      name: "UpsamplingMaterial",
      uniforms: {
        inputBuffer: new scope.Uniform(null),
        supportBuffer: new scope.Uniform(null),
        texelSize: new scope.Uniform(new scope.Vector2()),
        radius: new scope.Uniform(.85)
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      fragmentShader: scope.convolution_upsampling_default,
      vertexShader: scope.convolution_upsampling_default2
    });
  }
  set inputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  set supportBuffer(r) {
    this.uniforms.supportBuffer.value = r;
  }
  get radius() {
    return this.uniforms.radius.value;
  }
  set radius(r) {
    this.uniforms.radius.value = r;
  }
  setSize(r, e) {
    this.uniforms.texelSize.value.set(1 / r, 1 / e);
  }
};
}
