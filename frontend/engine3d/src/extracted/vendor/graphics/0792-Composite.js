/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 297363:297952.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0792(scope) {
scope.Composite = class Composite {
  constructor(e, i, s) {
    const a = s || scope.PropertyBinding.parseTrackName(i);
    this._targetGroup = e, this._bindings = e.subscribe_(i, a);
  }
  getValue(e, i) {
    this.bind();
    const s = this._targetGroup.nCachedObjects_,
      a = this._bindings[s];
    a !== void 0 && a.getValue(e, i);
  }
  setValue(e, i) {
    const s = this._bindings;
    for (let a = this._targetGroup.nCachedObjects_, o = s.length; a !== o; ++a) s[a].setValue(e, i);
  }
  bind() {
    const e = this._bindings;
    for (let i = this._targetGroup.nCachedObjects_, s = e.length; i !== s; ++i) e[i].bind();
  }
  unbind() {
    const e = this._bindings;
    for (let i = this._targetGroup.nCachedObjects_, s = e.length; i !== s; ++i) e[i].unbind();
  }
};
}
