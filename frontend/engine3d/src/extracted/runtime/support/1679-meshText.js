/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1177023:1178320.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1679(scope) {
scope.meshText = class meshText extends scope.Mesh {
  constructor(i = {}, s = null) {
    if (!i.font) throw new Error("You must specify a .font file.");
    super(scope.startGeo);
    scope.oe(this, scope.Ni, {});
    scope.oe(this, scope.er, !1);
    scope.oe(this, scope.tr, !1);
    scope.ze(this, scope.Ni, i), scope.ze(this, scope.er, i.animationMask || !1), scope.ze(this, scope.tr, i.animationTranslate || !1), this.name = "Text (Font)", this.bboxSize = new scope.Vector2(), this.size = new scope.Vector2(), this.topAlign = 0, this.ready = scope.miscutils.deferred(), this.update().then(() => s || scope.createFontMaterial({
      font: scope.L(this, scope.Ni).font,
      animationMask: scope.L(this, scope.er),
      animationTranslate: scope.L(this, scope.tr),
      small: i.small || !1
    })).then(a => {
      this.material = a, this.ready.resolve();
    });
  }
  static getTextWithoutTags(i = "") {
    return i.replace(scope.tagsRegex, "");
  }
  _updateSize() {
    const i = this.geometry._fontMetrics;
    this.topAlign = i.size * Math.abs(i.ascent - i.descent), this.lineSize = i.size * i.lineHeight, this.bboxSize.set(Math.abs(this.geometry.boundingBox.min.x - this.geometry.boundingBox.max.x), Math.abs(this.geometry.boundingBox.min.y - this.geometry.boundingBox.max.y)), this.size.set(this.bboxSize.x, this.lineSize * Math.max(0, i.lines - 1));
  }
  setText(i = "", s = !0) {
    scope.L(this, scope.Ni).text = i, s && this.update();
  }
  async update(i = {}) {
    try {
      const s = this.geometry;
      scope.ze(this, scope.Ni, {
        ...scope.L(this, scope.Ni),
        ...i
      }), this.geometry = await scope.glyphLoader.loadGeometry(scope.L(this, scope.Ni).font, scope.L(this, scope.Ni)), this._updateSize(), s.dispose();
    } catch (s) {
      console.log("Error updating meshText geometry:", s);
    }
  }
};
}
