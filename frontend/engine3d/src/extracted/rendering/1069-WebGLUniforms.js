/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 524925:525519.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1069(scope) {
scope.WebGLUniforms = class WebGLUniforms {
  constructor(e, i) {
    this.seq = [], this.map = {};
    const s = e.getProgramParameter(i, e.ACTIVE_UNIFORMS);
    for (let a = 0; a < s; ++a) {
      const o = e.getActiveUniform(i, a),
        l = e.getUniformLocation(i, o.name);
      scope.parseUniform(o, l, this);
    }
  }
  setValue(e, i, s, a) {
    const o = this.map[i];
    o !== void 0 && o.setValue(e, s, a);
  }
  setOptional(e, i, s) {
    const a = i[s];
    a !== void 0 && this.setValue(e, s, a);
  }
  static upload(e, i, s, a) {
    for (let o = 0, l = i.length; o !== l; ++o) {
      const c = i[o],
        h = s[c.id];
      h.needsUpdate !== !1 && c.setValue(e, h.value, a);
    }
  }
  static seqWithValue(e, i) {
    const s = [];
    for (let a = 0, o = e.length; a !== o; ++a) {
      const l = e[a];
      l.id in i && s.push(l);
    }
    return s;
  }
};
}
