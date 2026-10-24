/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 926037:926502.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1521(scope) {
scope.CopyMaterial = class extends scope.ShaderMaterial {
  constructor() {
    super({
      name: "CopyMaterial",
      uniforms: {
        inputBuffer: new scope.Uniform(null),
        opacity: new scope.Uniform(1)
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      fragmentShader: scope.copy_default,
      vertexShader: scope.common_default
    });
  }
  set inputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  setInputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  getOpacity(r) {
    return this.uniforms.opacity.value;
  }
  setOpacity(r) {
    this.uniforms.opacity.value = r;
  }
};
}
