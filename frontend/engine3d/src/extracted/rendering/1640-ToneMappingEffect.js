/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1106060:1109724.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1640(scope) {
scope.ToneMappingEffect = class extends scope.Effect {
  constructor({
    blendFunction: r = scope.BlendFunction.SRC,
    adaptive: e = !1,
    mode: i = e ? scope.ToneMappingMode.REINHARD2_ADAPTIVE : scope.ToneMappingMode.AGX,
    resolution: s = 256,
    maxLuminance: a = 4,
    whitePoint: o = a,
    middleGrey: l = .6,
    minLuminance: c = .01,
    averageLuminance: h = 1,
    adaptationRate: d = 1
  } = {}) {
    super("ToneMappingEffect", scope.tone_mapping_default, {
      blendFunction: r,
      uniforms: new Map([["luminanceBuffer", new scope.Uniform(null)], ["maxLuminance", new scope.Uniform(a)], ["whitePoint", new scope.Uniform(o)], ["middleGrey", new scope.Uniform(l)], ["averageLuminance", new scope.Uniform(h)]])
    }), this.renderTargetLuminance = new scope.WebGLRenderTarget(1, 1, {
      minFilter: scope.LinearMipmapLinearFilter,
      depthBuffer: !1
    }), this.renderTargetLuminance.texture.generateMipmaps = !0, this.renderTargetLuminance.texture.name = "Luminance", this.luminancePass = new scope.LuminancePass({
      renderTarget: this.renderTargetLuminance
    }), this.adaptiveLuminancePass = new scope.AdaptiveLuminancePass(this.luminancePass.texture, {
      minLuminance: c,
      adaptationRate: d
    }), this.uniforms.get("luminanceBuffer").value = this.adaptiveLuminancePass.texture, this.resolution = s, this.mode = i;
  }
  get mode() {
    return Number(this.defines.get("TONE_MAPPING_MODE"));
  }
  set mode(r) {
    if (this.mode === r) return;
    const i = scope.REVISION.replace(/\D+/g, "") >= 168 ? "CineonToneMapping(texel)" : "OptimizedCineonToneMapping(texel)";
    switch (this.defines.clear(), this.defines.set("TONE_MAPPING_MODE", r.toFixed(0)), r) {
      case scope.ToneMappingMode.LINEAR:
        this.defines.set("toneMapping(texel)", "LinearToneMapping(texel)");
        break;
      case scope.ToneMappingMode.REINHARD:
        this.defines.set("toneMapping(texel)", "ReinhardToneMapping(texel)");
        break;
      case scope.ToneMappingMode.CINEON:
      case scope.ToneMappingMode.OPTIMIZED_CINEON:
        this.defines.set("toneMapping(texel)", i);
        break;
      case scope.ToneMappingMode.ACES_FILMIC:
        this.defines.set("toneMapping(texel)", "ACESFilmicToneMapping(texel)");
        break;
      case scope.ToneMappingMode.AGX:
        this.defines.set("toneMapping(texel)", "AgXToneMapping(texel)");
        break;
      case scope.ToneMappingMode.NEUTRAL:
        this.defines.set("toneMapping(texel)", "NeutralToneMapping(texel)");
        break;
      default:
        this.defines.set("toneMapping(texel)", "texel");
        break;
    }
    this.adaptiveLuminancePass.enabled = r === scope.ToneMappingMode.REINHARD2_ADAPTIVE, this.setChanged();
  }
  getMode() {
    return this.mode;
  }
  setMode(r) {
    this.mode = r;
  }
  get whitePoint() {
    return this.uniforms.get("whitePoint").value;
  }
  set whitePoint(r) {
    this.uniforms.get("whitePoint").value = r;
  }
  get middleGrey() {
    return this.uniforms.get("middleGrey").value;
  }
  set middleGrey(r) {
    this.uniforms.get("middleGrey").value = r;
  }
  get averageLuminance() {
    return this.uniforms.get("averageLuminance").value;
  }
  set averageLuminance(r) {
    this.uniforms.get("averageLuminance").value = r;
  }
  get adaptiveLuminanceMaterial() {
    return this.adaptiveLuminancePass.fullscreenMaterial;
  }
  getAdaptiveLuminanceMaterial() {
    return this.adaptiveLuminanceMaterial;
  }
  get resolution() {
    return this.luminancePass.resolution.width;
  }
  set resolution(r) {
    const e = Math.max(0, Math.ceil(Math.log2(r))),
      i = Math.pow(2, e);
    this.luminancePass.resolution.setPreferredSize(i, i), this.adaptiveLuminanceMaterial.mipLevel1x1 = e;
  }
  getResolution() {
    return this.resolution;
  }
  setResolution(r) {
    this.resolution = r;
  }
  get adaptive() {
    return this.mode === scope.ToneMappingMode.REINHARD2_ADAPTIVE;
  }
  set adaptive(r) {
    this.mode = r ? scope.ToneMappingMode.REINHARD2_ADAPTIVE : scope.ToneMappingMode.REINHARD2;
  }
  get adaptationRate() {
    return this.adaptiveLuminanceMaterial.adaptationRate;
  }
  set adaptationRate(r) {
    this.adaptiveLuminanceMaterial.adaptationRate = r;
  }
  get distinction() {
    return console.warn(this.name, "distinction was removed."), 1;
  }
  set distinction(r) {
    console.warn(this.name, "distinction was removed.");
  }
  update(r, e, i) {
    this.adaptiveLuminancePass.enabled && (this.luminancePass.render(r, e), this.adaptiveLuminancePass.render(r, null, null, i));
  }
  initialize(r, e, i) {
    this.adaptiveLuminancePass.initialize(r, e, i);
  }
};
}
