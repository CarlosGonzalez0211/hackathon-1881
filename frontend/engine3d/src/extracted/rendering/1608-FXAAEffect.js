/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 992187:993118.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1608(scope) {
scope.FXAAEffect = class extends scope.Effect {
  constructor({
    blendFunction: r = scope.BlendFunction.SRC
  } = {}) {
    super("FXAAEffect", scope.fxaa_default, {
      vertexShader: scope.fxaa_default2,
      blendFunction: r,
      defines: new Map([["EDGE_THRESHOLD_MIN", "0.0312"], ["EDGE_THRESHOLD_MAX", "0.125"], ["SUBPIXEL_QUALITY", "0.75"], ["SAMPLES", "12"]])
    });
  }
  get minEdgeThreshold() {
    return Number(this.defines.get("EDGE_THRESHOLD_MIN"));
  }
  set minEdgeThreshold(r) {
    this.defines.set("EDGE_THRESHOLD_MIN", r.toFixed(12)), this.setChanged();
  }
  get maxEdgeThreshold() {
    return Number(this.defines.get("EDGE_THRESHOLD_MAX"));
  }
  set maxEdgeThreshold(r) {
    this.defines.set("EDGE_THRESHOLD_MAX", r.toFixed(12)), this.setChanged();
  }
  get subpixelQuality() {
    return Number(this.defines.get("SUBPIXEL_QUALITY"));
  }
  set subpixelQuality(r) {
    this.defines.set("SUBPIXEL_QUALITY", r.toFixed(12)), this.setChanged();
  }
  get samples() {
    return Number(this.defines.get("SAMPLES"));
  }
  set samples(r) {
    this.defines.set("SAMPLES", r.toFixed(0)), this.setChanged();
  }
};
}
