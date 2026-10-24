/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1097308:1101318.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1635(scope) {
scope.SMAAEffect = class extends scope.Effect {
  constructor({
    blendFunction: r = scope.BlendFunction.SRC,
    preset: e = scope.SMAAPreset.MEDIUM,
    edgeDetectionMode: i = scope.EdgeDetectionMode.COLOR,
    predicationMode: s = scope.PredicationMode.DISABLED
  } = {}) {
    super("SMAAEffect", scope.smaa_default, {
      vertexShader: scope.smaa_default2,
      blendFunction: r,
      attributes: scope.EffectAttribute.CONVOLUTION | scope.EffectAttribute.DEPTH,
      uniforms: new Map([["weightMap", new scope.Uniform(null)]])
    });
    let a, o;
    arguments.length > 1 && (a = arguments[0], o = arguments[1], arguments.length > 2 && (e = arguments[2]), arguments.length > 3 && (i = arguments[3])), this.renderTargetEdges = new scope.WebGLRenderTarget(1, 1, {
      depthBuffer: !1
    }), this.renderTargetEdges.texture.name = "SMAA.Edges", this.renderTargetWeights = this.renderTargetEdges.clone(), this.renderTargetWeights.texture.name = "SMAA.Weights", this.uniforms.get("weightMap").value = this.renderTargetWeights.texture, this.clearPass = new scope.ClearPass(!0, !1, !1), this.clearPass.overrideClearColor = new scope.Color(0), this.clearPass.overrideClearAlpha = 1, this.edgeDetectionPass = new scope.ShaderPass(new scope.EdgeDetectionMaterial()), this.edgeDetectionMaterial.edgeDetectionMode = i, this.edgeDetectionMaterial.predicationMode = s, this.weightsPass = new scope.ShaderPass(new scope.SMAAWeightsMaterial());
    const l = new scope.LoadingManager();
    l.onLoad = () => {
      const c = new scope.Texture(a);
      c.name = "SMAA.Search", c.magFilter = scope.NearestFilter, c.minFilter = scope.NearestFilter, c.generateMipmaps = !1, c.needsUpdate = !0, c.flipY = !0, this.weightsMaterial.searchTexture = c;
      const h = new scope.Texture(o);
      h.name = "SMAA.Area", h.magFilter = scope.LinearFilter, h.minFilter = scope.LinearFilter, h.generateMipmaps = !1, h.needsUpdate = !0, h.flipY = !1, this.weightsMaterial.areaTexture = h, this.dispatchEvent({
        type: "load"
      });
    }, l.itemStart("search"), l.itemStart("area"), a !== void 0 && o !== void 0 ? (l.itemEnd("search"), l.itemEnd("area")) : typeof Image < "u" && (a = new Image(), o = new Image(), scope.__lifecycle.listen(a, "load", () => l.itemEnd("search")), scope.__lifecycle.listen(o, "load", () => l.itemEnd("area")), a.src = scope.searchImageDataURL_default, o.src = scope.areaImageDataURL_default), this.applyPreset(e);
  }
  get edgesTexture() {
    return this.renderTargetEdges.texture;
  }
  getEdgesTexture() {
    return this.edgesTexture;
  }
  get weightsTexture() {
    return this.renderTargetWeights.texture;
  }
  getWeightsTexture() {
    return this.weightsTexture;
  }
  get edgeDetectionMaterial() {
    return this.edgeDetectionPass.fullscreenMaterial;
  }
  get colorEdgesMaterial() {
    return this.edgeDetectionMaterial;
  }
  getEdgeDetectionMaterial() {
    return this.edgeDetectionMaterial;
  }
  get weightsMaterial() {
    return this.weightsPass.fullscreenMaterial;
  }
  getWeightsMaterial() {
    return this.weightsMaterial;
  }
  setEdgeDetectionThreshold(r) {
    this.edgeDetectionMaterial.edgeDetectionThreshold = r;
  }
  setOrthogonalSearchSteps(r) {
    this.weightsMaterial.orthogonalSearchSteps = r;
  }
  applyPreset(r) {
    const e = this.edgeDetectionMaterial,
      i = this.weightsMaterial;
    switch (r) {
      case scope.SMAAPreset.LOW:
        e.edgeDetectionThreshold = .15, i.orthogonalSearchSteps = 4, i.diagonalDetection = !1, i.cornerDetection = !1;
        break;
      case scope.SMAAPreset.MEDIUM:
        e.edgeDetectionThreshold = .1, i.orthogonalSearchSteps = 8, i.diagonalDetection = !1, i.cornerDetection = !1;
        break;
      case scope.SMAAPreset.HIGH:
        e.edgeDetectionThreshold = .1, i.orthogonalSearchSteps = 16, i.diagonalSearchSteps = 8, i.cornerRounding = 25, i.diagonalDetection = !0, i.cornerDetection = !0;
        break;
      case scope.SMAAPreset.ULTRA:
        e.edgeDetectionThreshold = .05, i.orthogonalSearchSteps = 32, i.diagonalSearchSteps = 16, i.cornerRounding = 25, i.diagonalDetection = !0, i.cornerDetection = !0;
        break;
    }
  }
  setDepthTexture(r, e = scope.BasicDepthPacking) {
    this.edgeDetectionMaterial.depthBuffer = r, this.edgeDetectionMaterial.depthPacking = e;
  }
  update(r, e, i) {
    this.clearPass.render(r, this.renderTargetEdges), this.edgeDetectionPass.render(r, e, this.renderTargetEdges), this.weightsPass.render(r, this.renderTargetEdges, this.renderTargetWeights);
  }
  setSize(r, e) {
    this.edgeDetectionMaterial.setSize(r, e), this.weightsMaterial.setSize(r, e), this.renderTargetEdges.setSize(r, e), this.renderTargetWeights.setSize(r, e);
  }
  dispose() {
    const {
      searchTexture: r,
      areaTexture: e
    } = this.weightsMaterial;
    r !== null && e !== null && (r.dispose(), e.dispose()), super.dispose();
  }
  static get searchImageDataURL() {
    return scope.searchImageDataURL_default;
  }
  static get areaImageDataURL() {
    return scope.areaImageDataURL_default;
  }
};
}
