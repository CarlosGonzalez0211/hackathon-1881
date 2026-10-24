/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 978450:979780.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1602(scope) {
scope.MaskMaterial = class extends scope.ShaderMaterial {
  constructor(r = null) {
    super({
      name: "MaskMaterial",
      uniforms: {
        maskTexture: new scope.Uniform(r),
        inputBuffer: new scope.Uniform(null),
        strength: new scope.Uniform(1)
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      fragmentShader: scope.mask_default,
      vertexShader: scope.common_default
    }), this.colorChannel = scope.ColorChannel.RED, this.maskFunction = scope.MaskFunction.DISCARD;
  }
  set inputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  setInputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  set maskTexture(r) {
    this.uniforms.maskTexture.value = r, delete this.defines.MASK_PRECISION_HIGH, r.type !== scope.UnsignedByteType && (this.defines.MASK_PRECISION_HIGH = "1"), this.needsUpdate = !0;
  }
  setMaskTexture(r) {
    this.maskTexture = r;
  }
  set colorChannel(r) {
    this.defines.COLOR_CHANNEL = r.toFixed(0), this.needsUpdate = !0;
  }
  setColorChannel(r) {
    this.colorChannel = r;
  }
  set maskFunction(r) {
    this.defines.MASK_FUNCTION = r.toFixed(0), this.needsUpdate = !0;
  }
  setMaskFunction(r) {
    this.maskFunction = r;
  }
  get inverted() {
    return this.defines.INVERTED !== void 0;
  }
  set inverted(r) {
    this.inverted && !r ? delete this.defines.INVERTED : r && (this.defines.INVERTED = "1"), this.needsUpdate = !0;
  }
  isInverted() {
    return this.inverted;
  }
  setInverted(r) {
    this.inverted = r;
  }
  get strength() {
    return this.uniforms.strength.value;
  }
  set strength(r) {
    this.uniforms.strength.value = r;
  }
  getStrength() {
    return this.strength;
  }
  setStrength(r) {
    this.strength = r;
  }
};
}
