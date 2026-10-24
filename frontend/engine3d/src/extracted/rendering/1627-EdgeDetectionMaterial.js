/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1014758:1017884.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1627(scope) {
scope.EdgeDetectionMaterial = class extends scope.ShaderMaterial {
  constructor(r = new scope.Vector2(), e = scope.EdgeDetectionMode.COLOR) {
    super({
      name: "EdgeDetectionMaterial",
      defines: {
        THREE_REVISION: scope.REVISION.replace(/\D+/g, ""),
        LOCAL_CONTRAST_ADAPTATION_FACTOR: "2.0",
        EDGE_THRESHOLD: "0.1",
        DEPTH_THRESHOLD: "0.01",
        PREDICATION_MODE: "0",
        PREDICATION_THRESHOLD: "0.01",
        PREDICATION_SCALE: "2.0",
        PREDICATION_STRENGTH: "1.0",
        DEPTH_PACKING: "0"
      },
      uniforms: {
        inputBuffer: new scope.Uniform(null),
        depthBuffer: new scope.Uniform(null),
        predicationBuffer: new scope.Uniform(null),
        texelSize: new scope.Uniform(r)
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      fragmentShader: scope.edge_detection_default,
      vertexShader: scope.edge_detection_default2
    }), this.edgeDetectionMode = e;
  }
  set depthBuffer(r) {
    this.uniforms.depthBuffer.value = r;
  }
  set depthPacking(r) {
    this.defines.DEPTH_PACKING = r.toFixed(0), this.needsUpdate = !0;
  }
  setDepthBuffer(r, e = scope.BasicDepthPacking) {
    this.depthBuffer = r, this.depthPacking = e;
  }
  get edgeDetectionMode() {
    return Number(this.defines.EDGE_DETECTION_MODE);
  }
  set edgeDetectionMode(r) {
    this.defines.EDGE_DETECTION_MODE = r.toFixed(0), this.needsUpdate = !0;
  }
  getEdgeDetectionMode() {
    return this.edgeDetectionMode;
  }
  setEdgeDetectionMode(r) {
    this.edgeDetectionMode = r;
  }
  get localContrastAdaptationFactor() {
    return Number(this.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR);
  }
  set localContrastAdaptationFactor(r) {
    this.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR = r.toFixed("6"), this.needsUpdate = !0;
  }
  getLocalContrastAdaptationFactor() {
    return this.localContrastAdaptationFactor;
  }
  setLocalContrastAdaptationFactor(r) {
    this.localContrastAdaptationFactor = r;
  }
  get edgeDetectionThreshold() {
    return Number(this.defines.EDGE_THRESHOLD);
  }
  set edgeDetectionThreshold(r) {
    this.defines.EDGE_THRESHOLD = r.toFixed("6"), this.defines.DEPTH_THRESHOLD = (r * .1).toFixed("6"), this.needsUpdate = !0;
  }
  getEdgeDetectionThreshold() {
    return this.edgeDetectionThreshold;
  }
  setEdgeDetectionThreshold(r) {
    this.edgeDetectionThreshold = r;
  }
  get predicationMode() {
    return Number(this.defines.PREDICATION_MODE);
  }
  set predicationMode(r) {
    this.defines.PREDICATION_MODE = r.toFixed(0), this.needsUpdate = !0;
  }
  getPredicationMode() {
    return this.predicationMode;
  }
  setPredicationMode(r) {
    this.predicationMode = r;
  }
  set predicationBuffer(r) {
    this.uniforms.predicationBuffer.value = r;
  }
  setPredicationBuffer(r) {
    this.uniforms.predicationBuffer.value = r;
  }
  get predicationThreshold() {
    return Number(this.defines.PREDICATION_THRESHOLD);
  }
  set predicationThreshold(r) {
    this.defines.PREDICATION_THRESHOLD = r.toFixed("6"), this.needsUpdate = !0;
  }
  getPredicationThreshold() {
    return this.predicationThreshold;
  }
  setPredicationThreshold(r) {
    this.predicationThreshold = r;
  }
  get predicationScale() {
    return Number(this.defines.PREDICATION_SCALE);
  }
  set predicationScale(r) {
    this.defines.PREDICATION_SCALE = r.toFixed("6"), this.needsUpdate = !0;
  }
  getPredicationScale() {
    return this.predicationScale;
  }
  setPredicationScale(r) {
    this.predicationScale = r;
  }
  get predicationStrength() {
    return Number(this.defines.PREDICATION_STRENGTH);
  }
  set predicationStrength(r) {
    this.defines.PREDICATION_STRENGTH = r.toFixed("6"), this.needsUpdate = !0;
  }
  getPredicationStrength() {
    return this.predicationStrength;
  }
  setPredicationStrength(r) {
    this.predicationStrength = r;
  }
  setSize(r, e) {
    this.uniforms.texelSize.value.set(1 / r, 1 / e);
  }
};
}
