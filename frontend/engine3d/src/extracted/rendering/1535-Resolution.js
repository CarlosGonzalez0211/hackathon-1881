/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 939405:942536.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1535(scope) {
scope.Resolution = class extends scope.EventDispatcher {
  constructor(r, e = scope.AUTO_SIZE, i = scope.AUTO_SIZE, s = 1) {
    super(), this.resizable = r, this.baseSize = new scope.Vector2(1, 1), this.preferredSize = new scope.Vector2(e, i), this.target = this.preferredSize, this.s = s, this.effectiveSize = new scope.Vector2(), scope.__lifecycle.listen(this, "change", () => this.updateEffectiveSize()), this.updateEffectiveSize();
  }
  updateEffectiveSize() {
    const r = this.baseSize,
      e = this.preferredSize,
      i = this.effectiveSize,
      s = this.scale;
    e.width !== scope.AUTO_SIZE ? i.width = e.width : e.height !== scope.AUTO_SIZE ? i.width = Math.round(e.height * (r.width / Math.max(r.height, 1))) : i.width = Math.round(r.width * s), e.height !== scope.AUTO_SIZE ? i.height = e.height : e.width !== scope.AUTO_SIZE ? i.height = Math.round(e.width / Math.max(r.width / Math.max(r.height, 1), 1)) : i.height = Math.round(r.height * s);
  }
  get width() {
    return this.effectiveSize.width;
  }
  set width(r) {
    this.preferredWidth = r;
  }
  get height() {
    return this.effectiveSize.height;
  }
  set height(r) {
    this.preferredHeight = r;
  }
  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
  get scale() {
    return this.s;
  }
  set scale(r) {
    this.s !== r && (this.s = r, this.preferredSize.setScalar(scope.AUTO_SIZE), this.dispatchEvent({
      type: "change"
    }), this.resizable.setSize(this.baseSize.width, this.baseSize.height));
  }
  getScale() {
    return this.scale;
  }
  setScale(r) {
    this.scale = r;
  }
  get baseWidth() {
    return this.baseSize.width;
  }
  set baseWidth(r) {
    this.baseSize.width !== r && (this.baseSize.width = r, this.dispatchEvent({
      type: "change"
    }), this.resizable.setSize(this.baseSize.width, this.baseSize.height));
  }
  getBaseWidth() {
    return this.baseWidth;
  }
  setBaseWidth(r) {
    this.baseWidth = r;
  }
  get baseHeight() {
    return this.baseSize.height;
  }
  set baseHeight(r) {
    this.baseSize.height !== r && (this.baseSize.height = r, this.dispatchEvent({
      type: "change"
    }), this.resizable.setSize(this.baseSize.width, this.baseSize.height));
  }
  getBaseHeight() {
    return this.baseHeight;
  }
  setBaseHeight(r) {
    this.baseHeight = r;
  }
  setBaseSize(r, e) {
    (this.baseSize.width !== r || this.baseSize.height !== e) && (this.baseSize.set(r, e), this.dispatchEvent({
      type: "change"
    }), this.resizable.setSize(this.baseSize.width, this.baseSize.height));
  }
  get preferredWidth() {
    return this.preferredSize.width;
  }
  set preferredWidth(r) {
    this.preferredSize.width !== r && (this.preferredSize.width = r, this.dispatchEvent({
      type: "change"
    }), this.resizable.setSize(this.baseSize.width, this.baseSize.height));
  }
  getPreferredWidth() {
    return this.preferredWidth;
  }
  setPreferredWidth(r) {
    this.preferredWidth = r;
  }
  get preferredHeight() {
    return this.preferredSize.height;
  }
  set preferredHeight(r) {
    this.preferredSize.height !== r && (this.preferredSize.height = r, this.dispatchEvent({
      type: "change"
    }), this.resizable.setSize(this.baseSize.width, this.baseSize.height));
  }
  getPreferredHeight() {
    return this.preferredHeight;
  }
  setPreferredHeight(r) {
    this.preferredHeight = r;
  }
  setPreferredSize(r, e) {
    (this.preferredSize.width !== r || this.preferredSize.height !== e) && (this.preferredSize.set(r, e), this.dispatchEvent({
      type: "change"
    }), this.resizable.setSize(this.baseSize.width, this.baseSize.height));
  }
  copy(r) {
    this.s = r.scale, this.baseSize.set(r.baseWidth, r.baseHeight), this.preferredSize.set(r.preferredWidth, r.preferredHeight), this.dispatchEvent({
      type: "change"
    }), this.resizable.setSize(this.baseSize.width, this.baseSize.height);
  }
  static get AUTO_SIZE() {
    return scope.AUTO_SIZE;
  }
};
}
