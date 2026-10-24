/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1112199:1115079.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1643(scope) {
scope.EffectMaterial = class extends scope.ShaderMaterial {
  constructor(r, e, i, s, a = !1) {
    super({
      name: "EffectMaterial",
      defines: {
        THREE_REVISION: scope.REVISION.replace(/\D+/g, ""),
        DEPTH_PACKING: "0",
        ENCODE_OUTPUT: "1"
      },
      uniforms: {
        inputBuffer: new scope.Uniform(null),
        depthBuffer: new scope.Uniform(null),
        resolution: new scope.Uniform(new scope.Vector2()),
        texelSize: new scope.Uniform(new scope.Vector2()),
        cameraNear: new scope.Uniform(.3),
        cameraFar: new scope.Uniform(1e3),
        aspect: new scope.Uniform(1),
        time: new scope.Uniform(0)
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      dithering: a
    }), r && this.setShaderParts(r), e && this.setDefines(e), i && this.setUniforms(i), this.copyCameraSettings(s);
  }
  set inputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  setInputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  get depthBuffer() {
    return this.uniforms.depthBuffer.value;
  }
  set depthBuffer(r) {
    this.uniforms.depthBuffer.value = r;
  }
  get depthPacking() {
    return Number(this.defines.DEPTH_PACKING);
  }
  set depthPacking(r) {
    this.defines.DEPTH_PACKING = r.toFixed(0), this.needsUpdate = !0;
  }
  setDepthBuffer(r, e = scope.BasicDepthPacking) {
    this.depthBuffer = r, this.depthPacking = e;
  }
  setShaderData(r) {
    this.setShaderParts(r.shaderParts), this.setDefines(r.defines), this.setUniforms(r.uniforms), this.setExtensions(r.extensions);
  }
  setShaderParts(r) {
    return this.fragmentShader = scope.effect_default.replace(scope.EffectShaderSection.FRAGMENT_HEAD, r.get(scope.EffectShaderSection.FRAGMENT_HEAD) || "").replace(scope.EffectShaderSection.FRAGMENT_MAIN_UV, r.get(scope.EffectShaderSection.FRAGMENT_MAIN_UV) || "").replace(scope.EffectShaderSection.FRAGMENT_MAIN_IMAGE, r.get(scope.EffectShaderSection.FRAGMENT_MAIN_IMAGE) || ""), this.vertexShader = scope.effect_default2.replace(scope.EffectShaderSection.VERTEX_HEAD, r.get(scope.EffectShaderSection.VERTEX_HEAD) || "").replace(scope.EffectShaderSection.VERTEX_MAIN_SUPPORT, r.get(scope.EffectShaderSection.VERTEX_MAIN_SUPPORT) || ""), this.needsUpdate = !0, this;
  }
  setDefines(r) {
    for (const e of r.entries()) this.defines[e[0]] = e[1];
    return this.needsUpdate = !0, this;
  }
  setUniforms(r) {
    for (const e of r.entries()) this.uniforms[e[0]] = e[1];
    return this;
  }
  setExtensions(r) {
    this.extensions = {};
    for (const e of r) this.extensions[e] = !0;
    return this;
  }
  get encodeOutput() {
    return this.defines.ENCODE_OUTPUT !== void 0;
  }
  set encodeOutput(r) {
    this.encodeOutput !== r && (r ? this.defines.ENCODE_OUTPUT = "1" : delete this.defines.ENCODE_OUTPUT, this.needsUpdate = !0);
  }
  isOutputEncodingEnabled(r) {
    return this.encodeOutput;
  }
  setOutputEncodingEnabled(r) {
    this.encodeOutput = r;
  }
  get time() {
    return this.uniforms.time.value;
  }
  set time(r) {
    this.uniforms.time.value = r;
  }
  setDeltaTime(r) {
    this.uniforms.time.value += r;
  }
  adoptCameraSettings(r) {
    this.copyCameraSettings(r);
  }
  copyCameraSettings(r) {
    r && (this.uniforms.cameraNear.value = r.near, this.uniforms.cameraFar.value = r.far, r instanceof scope.PerspectiveCamera ? this.defines.PERSPECTIVE_CAMERA = "1" : delete this.defines.PERSPECTIVE_CAMERA, this.needsUpdate = !0);
  }
  setSize(r, e) {
    const i = this.uniforms;
    i.resolution.value.set(r, e), i.texelSize.value.set(1 / r, 1 / e), i.aspect.value = r / e;
  }
  static get Section() {
    return scope.EffectShaderSection;
  }
};
}
