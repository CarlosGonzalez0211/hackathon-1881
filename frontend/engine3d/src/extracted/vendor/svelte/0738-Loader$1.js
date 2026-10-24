/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 268038:268587.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0738(scope) {
scope.Loader$1 = class {
  constructor(e) {
    this.manager = e !== void 0 ? e : scope.DefaultLoadingManager, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {};
  }
  load() {}
  loadAsync(e, i) {
    const s = this;
    return new Promise(function (a, o) {
      s.load(e, a, i, o);
    });
  }
  parse() {}
  setCrossOrigin(e) {
    return this.crossOrigin = e, this;
  }
  setWithCredentials(e) {
    return this.withCredentials = e, this;
  }
  setPath(e) {
    return this.path = e, this;
  }
  setResourcePath(e) {
    return this.resourcePath = e, this;
  }
  setRequestHeader(e) {
    return this.requestHeader = e, this;
  }
  abort() {
    return this;
  }
};
}
