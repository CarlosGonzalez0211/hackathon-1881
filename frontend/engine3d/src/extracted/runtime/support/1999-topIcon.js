/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1554570:1559298.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1999(scope) {
scope.topIcon = class topIcon extends scope.Group {
  constructor({
    object: i = null,
    iconFiles: s = [],
    color1: a = "#f5fdff",
    color2: o = "#a7c3fb",
    colorHighlight: l = "#47ebcf",
    sizeActive: c = .35,
    sizeInactive: h = .35,
    center: d = "bottom",
    offset: p = [0, .1, 0],
    wiggleDirection: f = [0, 1, 0],
    materialGenerator: _ = scope.createMaterial$1
  } = {}) {
    super();
    scope.oe(this, scope.Cr, new scope.Vector3());
    this.name = `icon - ${i.name}`, this.visible = !1, this.ready = scope.miscutils.deferred(), this._object = i, this._iconFiles = s, this._sizeActive = c, this._sizeInactive = h, this._center = d, this._offset = new scope.Vector3().fromArray(p), this._wiggleDirection = new scope.Vector3().fromArray(f), this._materialGenerator = _, this._color1 = new scope.Color(a), this._color2 = new scope.Color(o), this._colorHighlight = new scope.Color(l), this._colorTarget = this._color2.clone(), this._active = !0, this._visibilityDistance = 20, this._isClose = !1, this._show = 1, this._hasUpdatedOnce = !1, this._createIcons();
  }
  async _createIcons() {
    var o, l, c, h;
    const i = this._iconFiles.map(d => Promise.all([scope.glyphLoader.loadTexture(d, "band"), scope.glyphLoader.loadTexture(d, "curve"), scope.glyphLoader.loadGeometry(d, {
        size: 1
      })])),
      [s, a] = await Promise.all(i);
    [s[2], a[2]].forEach((d, p) => {
      this._center === "bottom" ? d.translate(0, d.boundingBox.max.y, 0) : this._center === "up" && d.translate(0, d.boundingBox.min.y, 0);
      const f = p === 0 ? this._sizeInactive : this._sizeActive;
      d.scale(f, f, f);
    }), this._inactiveIcon = new scope.Mesh(s[2], this._materialGenerator("inactive")), this._inactiveIcon.name = "inactive", this._inactiveIcon.originalScale = this._inactiveIcon.scale.clone(), (o = this._inactiveIcon.material.uniforms.uColor1) == null || o.value.copy(this._color1), (l = this._inactiveIcon.material.uniforms.uColor2) == null || l.value.copy(this._color2), this._inactiveIcon.material.uniforms.tBand.value = s[0], this._inactiveIcon.material.uniforms.tCurve.value = s[1], this._inactiveIcon.material.uniforms.uShowDistance.value = this._visibilityDistance, this._inactiveIcon.material.uniforms.uWiggleDir.value.copy(this._wiggleDirection), this.add(this._inactiveIcon), this._activeIcon = new scope.Mesh(a[2], this._materialGenerator("active")), this._activeIcon.name = "active", this._activeIcon.visible = !1, this._activeIcon.originalScale = this._activeIcon.scale.clone(), (c = this._activeIcon.material.uniforms.uColor1) == null || c.value.copy(this._color1), (h = this._activeIcon.material.uniforms.uColor2) == null || h.value.copy(this._color2), this._activeIcon.material.uniforms.tBand.value = a[0], this._activeIcon.material.uniforms.tCurve.value = a[1], this._activeIcon.material.uniforms.uShowDistance.value = this._visibilityDistance, this._inactiveIcon.material.uniforms.uWiggleDir.value.copy(this._wiggleDirection), this._activeIcon.material.uniforms.uScale.value = 0, this.add(this._activeIcon), this._object.add(this), this.ready.resolve();
  }
  pulse() {
    [this._activeIcon, this._inactiveIcon].forEach(i => {
      i.material.uniforms.uPulse && scope.createTween(i.material.uniforms.uPulse, {
        to: {
          value: 1
        },
        duration: .15,
        ease: "power2.out",
        onComplete: () => {
          scope.createTween(i.material.uniforms.uPulse, {
            to: {
              value: 0
            },
            duration: .2,
            ease: "power2.out"
          });
        }
      });
    });
  }
  updateMatrixWorld(i) {
    var o, l;
    if (scope.miscutils.hasRunThisFrame(this)) return;
    if (!this._hasUpdatedOnce || !this._object.isWorldSecret) {
      this._hasUpdatedOnce = !0;
      const c = this._object.geometry || this._object._bboxMesh.geometry;
      this.position.set(0, Math.abs(c.boundingBox.min.y) + Math.abs(c.boundingBox.max.y), 0).add(this._offset), super.updateMatrixWorld(i), (this._object.isWorldSecret ? this._object._secretMesh : this._object).getWorldPosition(scope.L(this, scope.Cr));
    }
    if (this.visible = this._active && this._object._scene.camera.position.distanceTo(scope.L(this, scope.Cr)) < this._visibilityDistance, this._isClose !== this._object._isClose) {
      this._isClose = this._object._isClose;
      const c = this._isClose ? "_inactiveIcon" : "_activeIcon",
        h = this._isClose ? "_activeIcon" : "_inactiveIcon";
      scope.createTween(this[h].material.uniforms.uScale, {
        to: {
          value: 0
        }
      }), scope.createTween(this[c].material.uniforms.uScale, {
        to: {
          value: 0
        },
        duration: .2,
        ease: "power2.out",
        onComplete: () => {
          this[c].visible = !1, this[h].visible = !0, scope.createTween(this[h].material.uniforms.uScale, {
            to: {
              value: 1
            },
            duration: .5,
            ease: "elastic.out(1, 0.75)"
          });
        }
      }), scope.events$1.emit("topicon_change", {
        object: this._object,
        visible: this.visible,
        isClose: this._isClose,
        questEnabled: !!this._object._questEnabled
      });
    }
    let s = !1;
    this._object.isWorldNPC ? (this._object._talking || !this._object._textsObjectRef.length) && (s = !0) : this._object.isWorldSecret ? (!this._object._canBeDiscovered || this._object._discovered) && (s = !0) : typeof this._object._inactiveState == "boolean" && (s = this._object._inactiveState), this._show = scope.math.lerpFPS(this._show, s ? 0 : 1, .2), this._inactiveIcon.material.uniforms.uShow.value = this._show, this._activeIcon.material.uniforms.uShow.value = this._show;
    const a = scope.math.lerpCoefFPS(.05);
    (o = this._inactiveIcon.material.uniforms.uColor2) == null || o.value.lerp(this._colorTarget, a), (l = this._activeIcon.material.uniforms.uColor2) == null || l.value.lerp(this._colorTarget, a);
  }
};
}
