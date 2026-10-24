/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 910547:912154.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1493(scope) {
scope.webglrenderer = class webglrenderer {
  constructor() {
    scope.Ye(this, "active", !1);
    scope.Ye(this, "webgl", null);
    scope.Ye(this, "domElement", null);
    scope.Ye(this, "info", null);
    scope.Ye(this, "clearColor", new scope.Color("#000000"));
    scope.Ye(this, "clearAlpha", 1);
  }
  init({
    shadowMap: e,
    shadowMapType: i
  } = {}) {
    this.webgl = new scope.WebGLRenderer({
      alpha: !1,
      antialias: !1,
      stencil: !1,
      depth: !1
    }), this.webgl.setClearColor(this.clearColor, this.clearAlpha), e === !0 && (this.webgl.shadowMap.enabled = !0, i && (this.webgl.shadowMap.type = i)), this.domElement = this.webgl.domElement, this.domElement.style.display = "block", this.domElement.style.position = "absolute", this.domElement.style.top = "0", this.domElement.style.left = "0", this.info = this.webgl.info, this.webgl.debug.checkShaderErrors = !1, this.webgl.capabilities.floatLinearFiltering = this.webgl.extensions.has("OES_texture_float_linear"), this.webgl.capabilities.floatRenderTarget = this.checkFloatRenderTarget();
  }
  checkFloatRenderTarget() {
    const e = new scope.WebGLRenderTarget(1, 1, {
        minFilter: scope.NearestFilter,
        magFilter: scope.NearestFilter,
        type: scope.FloatType
      }),
      i = new scope.Scene(),
      s = new scope.ShaderMaterial({
        vertexShader: " void main() { gl_Position = vec4(position, 1.0); } ",
        fragmentShader: " void main() { gl_FragColor.rgb = vec3(0.0, 1.0 / 10.0, 1.0 / 20.0); gl_FragColor.a = 1.0; } "
      });
    i.add(new scope.Mesh(scope.triangle$2, s));
    const a = this.webgl.getRenderTarget();
    this.webgl.setRenderTarget(e), this.webgl.render(i, new scope.OrthographicCamera(-1, 1, 1, -1, 0, 1));
    const o = new Float32Array(4);
    return this.webgl.readRenderTargetPixels(e, 0, 0, 1, 1, o), this.webgl.setRenderTarget(a), e.dispose(), s.dispose(), !(o[0] !== 0 || o[1] < .1 || o[2] < .05 || o[3] < 1);
  }
  dispose() {
    this.webgl.dispose(), this.webgl = null, this.domElement = null, this.info = null;
  }
};
}
