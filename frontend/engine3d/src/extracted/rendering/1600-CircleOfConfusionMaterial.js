/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 975445:977386.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1600(scope) {
scope.CircleOfConfusionMaterial = class extends scope.ShaderMaterial {
  constructor(r) {
    super({
      name: "CircleOfConfusionMaterial",
      defines: {
        DEPTH_PACKING: "0"
      },
      uniforms: {
        depthBuffer: new scope.Uniform(null),
        focusDistance: new scope.Uniform(0),
        focusRange: new scope.Uniform(0),
        cameraNear: new scope.Uniform(.3),
        cameraFar: new scope.Uniform(1e3)
      },
      blending: scope.NoBlending,
      toneMapped: !1,
      depthWrite: !1,
      depthTest: !1,
      fragmentShader: scope.circle_of_confusion_default,
      vertexShader: scope.common_default
    }), this.uniforms.focalLength = this.uniforms.focusRange, this.copyCameraSettings(r);
  }
  get near() {
    return this.uniforms.cameraNear.value;
  }
  get far() {
    return this.uniforms.cameraFar.value;
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
  get focusDistance() {
    return this.uniforms.focusDistance.value;
  }
  set focusDistance(r) {
    this.uniforms.focusDistance.value = r;
  }
  get worldFocusDistance() {
    return -scope.orthographicDepthToViewZ(this.focusDistance, this.near, this.far);
  }
  set worldFocusDistance(r) {
    this.focusDistance = scope.viewZToOrthographicDepth(-r, this.near, this.far);
  }
  getFocusDistance(r) {
    this.uniforms.focusDistance.value = r;
  }
  setFocusDistance(r) {
    this.uniforms.focusDistance.value = r;
  }
  get focalLength() {
    return this.focusRange;
  }
  set focalLength(r) {
    this.focusRange = r;
  }
  get focusRange() {
    return this.uniforms.focusRange.value;
  }
  set focusRange(r) {
    this.uniforms.focusRange.value = r;
  }
  get worldFocusRange() {
    return -scope.orthographicDepthToViewZ(this.focusRange, this.near, this.far);
  }
  set worldFocusRange(r) {
    this.focusRange = scope.viewZToOrthographicDepth(-r, this.near, this.far);
  }
  getFocalLength(r) {
    return this.focusRange;
  }
  setFocalLength(r) {
    this.focusRange = r;
  }
  adoptCameraSettings(r) {
    this.copyCameraSettings(r);
  }
  copyCameraSettings(r) {
    r && (this.uniforms.cameraNear.value = r.near, this.uniforms.cameraFar.value = r.far, r instanceof scope.PerspectiveCamera ? this.defines.PERSPECTIVE_CAMERA = "1" : delete this.defines.PERSPECTIVE_CAMERA, this.needsUpdate = !0);
  }
};
}
