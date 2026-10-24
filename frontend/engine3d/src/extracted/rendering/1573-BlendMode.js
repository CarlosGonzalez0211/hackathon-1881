/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 950939:951405.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1573(scope) {
scope.BlendMode = class extends scope.EventDispatcher {
  constructor(r, e = 1) {
    super(), this._blendFunction = r, this.opacity = new scope.Uniform(e);
  }
  getOpacity() {
    return this.opacity.value;
  }
  setOpacity(r) {
    this.opacity.value = r;
  }
  get blendFunction() {
    return this._blendFunction;
  }
  set blendFunction(r) {
    this._blendFunction = r, this.dispatchEvent({
      type: "change"
    });
  }
  getBlendFunction() {
    return this.blendFunction;
  }
  setBlendFunction(r) {
    this.blendFunction = r;
  }
  getShaderCode() {
    return scope.blendFunctions.get(this.blendFunction);
  }
};
}
