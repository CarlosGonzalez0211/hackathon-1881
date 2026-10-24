/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 544305:545230.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1102(scope) {
scope.WebGLShaderCache = class WebGLShaderCache {
  constructor() {
    this.shaderCache = new Map(), this.materialCache = new Map();
  }
  update(e) {
    const i = e.vertexShader,
      s = e.fragmentShader,
      a = this._getShaderStage(i),
      o = this._getShaderStage(s),
      l = this._getShaderCacheForMaterial(e);
    return l.has(a) === !1 && (l.add(a), a.usedTimes++), l.has(o) === !1 && (l.add(o), o.usedTimes++), this;
  }
  remove(e) {
    const i = this.materialCache.get(e);
    for (const s of i) s.usedTimes--, s.usedTimes === 0 && this.shaderCache.delete(s.code);
    return this.materialCache.delete(e), this;
  }
  getVertexShaderID(e) {
    return this._getShaderStage(e.vertexShader).id;
  }
  getFragmentShaderID(e) {
    return this._getShaderStage(e.fragmentShader).id;
  }
  dispose() {
    this.shaderCache.clear(), this.materialCache.clear();
  }
  _getShaderCacheForMaterial(e) {
    const i = this.materialCache;
    let s = i.get(e);
    return s === void 0 && (s = new Set(), i.set(e, s)), s;
  }
  _getShaderStage(e) {
    const i = this.shaderCache;
    let s = i.get(e);
    return s === void 0 && (s = new scope.WebGLShaderStage(e), i.set(e, s)), s;
  }
};
}
