/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 157054:158984.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0523(scope) {
scope.ShaderMaterial = class ShaderMaterial extends scope.Material {
  constructor(e) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = scope.default_vertex, this.fragmentShader = scope.default_fragment, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
      clipCullDistance: !1,
      multiDraw: !1
    }, this.defaultAttributeValues = {
      color: [1, 1, 1],
      uv: [0, 0],
      uv1: [0, 0]
    }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = scope.cloneUniforms(e.uniforms), this.uniformsGroups = scope.cloneUniformsGroups(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
  }
  toJSON(e) {
    const i = super.toJSON(e);
    i.glslVersion = this.glslVersion, i.uniforms = {};
    for (const a in this.uniforms) {
      const l = this.uniforms[a].value;
      l && l.isTexture ? i.uniforms[a] = {
        type: "t",
        value: l.toJSON(e).uuid
      } : l && l.isColor ? i.uniforms[a] = {
        type: "c",
        value: l.getHex()
      } : l && l.isVector2 ? i.uniforms[a] = {
        type: "v2",
        value: l.toArray()
      } : l && l.isVector3 ? i.uniforms[a] = {
        type: "v3",
        value: l.toArray()
      } : l && l.isVector4 ? i.uniforms[a] = {
        type: "v4",
        value: l.toArray()
      } : l && l.isMatrix3 ? i.uniforms[a] = {
        type: "m3",
        value: l.toArray()
      } : l && l.isMatrix4 ? i.uniforms[a] = {
        type: "m4",
        value: l.toArray()
      } : i.uniforms[a] = {
        value: l
      };
    }
    Object.keys(this.defines).length > 0 && (i.defines = this.defines), i.vertexShader = this.vertexShader, i.fragmentShader = this.fragmentShader, i.lights = this.lights, i.clipping = this.clipping;
    const s = {};
    for (const a in this.extensions) this.extensions[a] === !0 && (s[a] = !0);
    return Object.keys(s).length > 0 && (i.extensions = s), i;
  }
};
}
