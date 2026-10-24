/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1026141:1029004.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1630(scope) {
scope.SMAAWeightsMaterial = class extends scope.ShaderMaterial {
  constructor(r = new scope.Vector2(), e = new scope.Vector2()) {
    super({
      name: "SMAAWeightsMaterial",
      defines: {
        MAX_SEARCH_STEPS_INT: "16",
        MAX_SEARCH_STEPS_FLOAT: "16.0",
        MAX_SEARCH_STEPS_DIAG_INT: "8",
        MAX_SEARCH_STEPS_DIAG_FLOAT: "8.0",
        CORNER_ROUNDING: "25",
        CORNER_ROUNDING_NORM: "0.25",
        AREATEX_MAX_DISTANCE: "16.0",
        AREATEX_MAX_DISTANCE_DIAG: "20.0",
        AREATEX_PIXEL_SIZE: "(1.0 / vec2(160.0, 560.0))",
        AREATEX_SUBTEX_SIZE: "(1.0 / 7.0)",
        SEARCHTEX_SIZE: "vec2(66.0, 33.0)",
        SEARCHTEX_PACKED_SIZE: "vec2(64.0, 16.0)"
      },
      uniforms: {
        inputBuffer: new scope.Uniform(null),
        searchTexture: new scope.Uniform(null),
        areaTexture: new scope.Uniform(null),
        resolution: new scope.Uniform(e),
        texelSize: new scope.Uniform(r)
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      fragmentShader: scope.smaa_weights_default,
      vertexShader: scope.smaa_weights_default2
    });
  }
  set inputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  setInputBuffer(r) {
    this.uniforms.inputBuffer.value = r;
  }
  get searchTexture() {
    return this.uniforms.searchTexture.value;
  }
  set searchTexture(r) {
    this.uniforms.searchTexture.value = r;
  }
  get areaTexture() {
    return this.uniforms.areaTexture.value;
  }
  set areaTexture(r) {
    this.uniforms.areaTexture.value = r;
  }
  setLookupTextures(r, e) {
    this.searchTexture = r, this.areaTexture = e;
  }
  get orthogonalSearchSteps() {
    return Number(this.defines.MAX_SEARCH_STEPS_INT);
  }
  set orthogonalSearchSteps(r) {
    const e = Math.min(Math.max(r, 0), 112);
    this.defines.MAX_SEARCH_STEPS_INT = e.toFixed("0"), this.defines.MAX_SEARCH_STEPS_FLOAT = e.toFixed("1"), this.needsUpdate = !0;
  }
  setOrthogonalSearchSteps(r) {
    this.orthogonalSearchSteps = r;
  }
  get diagonalSearchSteps() {
    return Number(this.defines.MAX_SEARCH_STEPS_DIAG_INT);
  }
  set diagonalSearchSteps(r) {
    const e = Math.min(Math.max(r, 0), 20);
    this.defines.MAX_SEARCH_STEPS_DIAG_INT = e.toFixed("0"), this.defines.MAX_SEARCH_STEPS_DIAG_FLOAT = e.toFixed("1"), this.needsUpdate = !0;
  }
  setDiagonalSearchSteps(r) {
    this.diagonalSearchSteps = r;
  }
  get diagonalDetection() {
    return this.defines.DISABLE_DIAG_DETECTION === void 0;
  }
  set diagonalDetection(r) {
    r ? delete this.defines.DISABLE_DIAG_DETECTION : this.defines.DISABLE_DIAG_DETECTION = "1", this.needsUpdate = !0;
  }
  isDiagonalDetectionEnabled() {
    return this.diagonalDetection;
  }
  setDiagonalDetectionEnabled(r) {
    this.diagonalDetection = r;
  }
  get cornerRounding() {
    return Number(this.defines.CORNER_ROUNDING);
  }
  set cornerRounding(r) {
    const e = Math.min(Math.max(r, 0), 100);
    this.defines.CORNER_ROUNDING = e.toFixed("4"), this.defines.CORNER_ROUNDING_NORM = (e / 100).toFixed("4"), this.needsUpdate = !0;
  }
  setCornerRounding(r) {
    this.cornerRounding = r;
  }
  get cornerDetection() {
    return this.defines.DISABLE_CORNER_DETECTION === void 0;
  }
  set cornerDetection(r) {
    r ? delete this.defines.DISABLE_CORNER_DETECTION : this.defines.DISABLE_CORNER_DETECTION = "1", this.needsUpdate = !0;
  }
  isCornerRoundingEnabled() {
    return this.cornerDetection;
  }
  setCornerRoundingEnabled(r) {
    this.cornerDetection = r;
  }
  setSize(r, e) {
    const i = this.uniforms;
    i.texelSize.value.set(1 / r, 1 / e), i.resolution.value.set(r, e);
  }
};
}
