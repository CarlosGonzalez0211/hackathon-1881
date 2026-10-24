/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 963489:963932.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1586(scope) {
scope.DownsamplingMaterial = class extends scope.ShaderMaterial {
  constructor() {
    super({
      name: "DownsamplingMaterial",
      uniforms: {
        inputBuffer: new scope.Uniform(null),
        texelSize: new scope.Uniform(new scope.Vector2())
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      fragmentShader: scope.convolution_downsampling_default,
      vertexShader: scope.convolution_downsampling_default2
    });
  }
  set inputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  setSize(r, e) {
    this.uniforms.texelSize.value.set(1 / r, 1 / e);
  }
};
}
