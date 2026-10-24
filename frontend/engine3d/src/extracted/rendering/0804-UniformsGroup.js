/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 317035:317760.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0804(scope) {
scope.UniformsGroup = class UniformsGroup extends scope.EventDispatcher {
  constructor() {
    super(), this.isUniformsGroup = !0, Object.defineProperty(this, "id", {
      value: scope._id$3++
    }), this.name = "", this.usage = scope.StaticDrawUsage, this.uniforms = [];
  }
  add(e) {
    return this.uniforms.push(e), this;
  }
  remove(e) {
    const i = this.uniforms.indexOf(e);
    return i !== -1 && this.uniforms.splice(i, 1), this;
  }
  setName(e) {
    return this.name = e, this;
  }
  setUsage(e) {
    return this.usage = e, this;
  }
  dispose() {
    this.dispatchEvent({
      type: "dispose"
    });
  }
  copy(e) {
    this.name = e.name, this.usage = e.usage;
    const i = e.uniforms;
    this.uniforms.length = 0;
    for (let s = 0, a = i.length; s < a; s++) {
      const o = Array.isArray(i[s]) ? i[s] : [i[s]];
      for (let l = 0; l < o.length; l++) this.uniforms.push(o[l].clone());
    }
    return this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
};
}
