/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 951406:953023.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1574(scope) {
scope.Effect = class extends scope.EventDispatcher {
  constructor(r, e, {
    attributes: i = scope.EffectAttribute.NONE,
    blendFunction: s = scope.BlendFunction.NORMAL,
    defines: a = new Map(),
    uniforms: o = new Map(),
    extensions: l = null,
    vertexShader: c = null
  } = {}) {
    super(), this.name = r, this.renderer = null, this.attributes = i, this.fragmentShader = e, this.vertexShader = c, this.defines = a, this.uniforms = o, this.extensions = l, this.blendMode = new scope.BlendMode(s), scope.__lifecycle.listen(this.blendMode, "change", h => this.setChanged()), this._inputColorSpace = scope.LinearSRGBColorSpace, this._outputColorSpace = scope.NoColorSpace;
  }
  get inputColorSpace() {
    return this._inputColorSpace;
  }
  set inputColorSpace(r) {
    this._inputColorSpace = r, this.setChanged();
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(r) {
    this._outputColorSpace = r, this.setChanged();
  }
  set mainScene(r) {}
  set mainCamera(r) {}
  getName() {
    return this.name;
  }
  setRenderer(r) {
    this.renderer = r;
  }
  getDefines() {
    return this.defines;
  }
  getUniforms() {
    return this.uniforms;
  }
  getExtensions() {
    return this.extensions;
  }
  getBlendMode() {
    return this.blendMode;
  }
  getAttributes() {
    return this.attributes;
  }
  setAttributes(r) {
    this.attributes = r, this.setChanged();
  }
  getFragmentShader() {
    return this.fragmentShader;
  }
  setFragmentShader(r) {
    this.fragmentShader = r, this.setChanged();
  }
  getVertexShader() {
    return this.vertexShader;
  }
  setVertexShader(r) {
    this.vertexShader = r, this.setChanged();
  }
  setChanged() {
    this.dispatchEvent({
      type: "change"
    });
  }
  setDepthTexture(r, e = scope.BasicDepthPacking) {}
  update(r, e, i) {}
  setSize(r, e) {}
  initialize(r, e, i) {}
  dispose() {
    for (const r of Object.keys(this)) {
      const e = this[r];
      (e instanceof scope.WebGLRenderTarget || e instanceof scope.Material || e instanceof scope.Texture || e instanceof scope.Pass) && this[r].dispose();
    }
  }
};
}
