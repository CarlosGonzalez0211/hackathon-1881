/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 942683:943733.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1538(scope) {
scope.Selection = class extends Set {
  constructor(r, e = scope.idManager.getNextId()) {
    super(), this.exclusive = !1, this._layer = e, (this._layer < 1 || this._layer > 31) && (console.warn("Layer out of range, resetting to 2"), scope.idManager.reset(2), this._layer = scope.idManager.getNextId()), r !== void 0 && this.set(r);
  }
  get layer() {
    return this._layer;
  }
  set layer(r) {
    const e = this._layer;
    for (const i of this) i.layers.disable(e), i.layers.enable(r);
    this._layer = r;
  }
  getLayer() {
    return this.layer;
  }
  setLayer(r) {
    this.layer = r;
  }
  isExclusive() {
    return this.exclusive;
  }
  setExclusive(r) {
    this.exclusive = r;
  }
  clear() {
    const r = this.layer;
    for (const e of this) e.layers.disable(r);
    return super.clear();
  }
  set(r) {
    this.clear();
    for (const e of r) this.add(e);
    return this;
  }
  indexOf(r) {
    return this.has(r) ? 0 : -1;
  }
  add(r) {
    return this.exclusive ? r.layers.set(this.layer) : r.layers.enable(this.layer), super.add(r);
  }
  delete(r) {
    return this.has(r) && r.layers.disable(this.layer), super.delete(r);
  }
  toggle(r) {
    let e;
    return this.has(r) ? (this.delete(r), e = !1) : (this.add(r), e = !0), e;
  }
  setVisible(r) {
    for (const e of this) r ? e.layers.enable(0) : e.layers.disable(0);
    return this;
  }
};
}
