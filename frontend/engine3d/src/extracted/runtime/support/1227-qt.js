/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 742193:746677.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1227(scope) {
scope.qt = class qt {
  constructor({
    meshes: e = [],
    camera: i = null,
    onHover: s = null,
    onTouch: a = null,
    onMove: o = null,
    onDrag: l = null,
    onClick: c = null,
    ctx: h = null,
    performant: d = !1,
    performantMode: p = "bounding_sphere",
    finger: f = 0,
    interactWhileTouching: _ = !1,
    domNodeCursor: x = document.body,
    hoverCursor: b = !1,
    grabCursor: T = !1
  } = {}) {
    if (!i) throw new Error("mesh interaction needs a camera");
    this._meshes = Array.isArray(e) ? e : [e], this._camera = i, this._onHover = s, this._onTouch = a, this._onMove = o, this._onDrag = l, this._onClick = c, this._ctx = h, this._performant = d, this._performantMode = scope.L(qt, scope.Hs)[p.toUpperCase()], this._finger = f, this._eventsID = this._finger === 0 ? "touch" : `touch${this._finger + 1}`, this._interactWhileTouching = _, this._touchPressed = !1, this._hoverCursor = b, this._grabCursor = T && !b, this._domNodeCursor = x, this._raycaster = new scope.Raycaster(), this._enabled = !1, this.hovering = !1, this.hoveringElement = -1, this.hoveringSubelement = -1, this.touching = !1, this.touchingElement = -1, this.touchingSubelement = -1, this.dragging = !1;
  }
  _castRay(e, i) {
    if (this._raycaster.setFromCamera(e.position11, this._camera), !this._performant) return this._checkIntersections(i, this._raycaster.intersectObjects(this._meshes, !1));
    const s = [],
      a = this._performantMode === scope.L(qt, scope.Hs).BOUNDING_SPHERE,
      o = a ? scope._sphere : scope._box,
      l = a ? "Sphere" : "Box",
      c = `bounding${l}`,
      h = `computeBounding${l}`,
      d = `intersects${l}`;
    this._meshes.forEach(p => {
      if (!p.isMesh && !p.isSpecialCaseemptyMesh || !p.layers.test(this._raycaster.layers)) return;
      const f = p[c] !== void 0 ? p : p.geometry;
      f[c] === null && f[h](), this._raycaster.ray[d](o.copy(f[c]).applyMatrix4(p.matrixWorld)) && s.push({
        object: p
      });
    }), this._checkIntersections(i, s);
  }
  _performHover(e = [], i = "hover_out", s = null, a = -1) {
    this.hovering = i === "hover_in", this.hoveringElement = s, this.hoveringSubelement = a, this._callBack(this._onHover, i, e), this._hoverCursor && (this._domNodeCursor.style.cursor = this.hovering ? "pointer" : ""), this._grabCursor && !this.dragging && (this._domNodeCursor.style.cursor = this.hovering ? "grab" : "");
  }
  _performTouch(e = [], i = "touch_end", s = null, a = -1) {
    this.touching = i === "touch_start", this.touchingElement = s, this.touchingSubelement = a, this._callBack(this._onTouch, i, e), this._grabCursor && (this._domNodeCursor.style.cursor = this.touching ? "grabbing" : this.hovering ? "grab" : "");
  }
  _checkIntersections(e, i) {
    if (i.length > 0) {
      if (e === scope.L(qt, scope.ii).TOUCH_START || e === scope.L(qt, scope.ii).TOUCH_MOVE) {
        const s = this._meshes.indexOf(i[0].object);
        let a = -1;
        typeof i[0].instanceId == "number" ? a = i[0].instanceId : typeof i[0].batchId == "number" && (a = i[0].batchId), this.hovering && (this.hoveringElement !== s || this.hoveringSubelement !== a) && this._performHover(), !this.hovering && (this._interactWhileTouching || !this._touchPressed) && this._performHover(i, "hover_in", s, a), e === scope.L(qt, scope.ii).TOUCH_START ? (this.touching && (this.touchingElement !== s || this.touchingSubelement !== a) && this._performTouch(), !this.touching && (this._interactWhileTouching || !this._touchPressed) && (this._performTouch(i, "touch_start", s, a), this.dragging = !0)) : this._callBack(this._onMove, "move", i);
      } else e === scope.L(qt, scope.ii).CLICK && this._callBack(this._onClick, "click", i);
    } else this.hovering && this._performHover();
    e === scope.L(qt, scope.ii).TOUCH_END && (this.hovering && scope.touches$1.get(this._finger).input === "touch" && this._performHover(), this.touching && this._performTouch(), this.dragging = !1), e === scope.L(qt, scope.ii).TOUCH_MOVE && this.dragging && this._callBack(this._onDrag, "drag", i);
  }
  _callBack(e, i, s) {
    e && e.call(this._ctx, {
      action: i,
      finger: this._finger,
      interactions: s,
      event: scope.touches$1.get(this._finger)
    });
  }
  _onTouchStart(e) {
    this._castRay(e, scope.L(qt, scope.ii).TOUCH_START), this._touchPressed = !0;
  }
  _onTouchMove(e) {
    this._castRay(e, scope.L(qt, scope.ii).TOUCH_MOVE);
  }
  _onTouchEnd(e) {
    this._touchPressed = !1, this._castRay(e, scope.L(qt, scope.ii).TOUCH_END);
  }
  _onTouchClick(e) {
    this._castRay(e, scope.L(qt, scope.ii).CLICK);
  }
  enable() {
    this._enabled || (this._enabled = !0, (this._onTouch || this._onHover || this._onDrag) && scope.events$1.on(`${this._eventsID}_start`, this._onTouchStart, this), (this._onHover || this._onMove || this._onDrag) && scope.events$1.on(`${this._eventsID}_move`, this._onTouchMove, this), (this._onTouch || this._onHover || this._onDrag) && scope.events$1.on(`${this._eventsID}_end`, this._onTouchEnd, this), this._onClick && scope.events$1.on(`${this._eventsID}_click`, this._onTouchClick, this), this._onTouchMove(scope.touches$1.get(this._finger)));
  }
  disable() {
    this._enabled && (this._enabled = !1, this._touchPressed = !1, scope.events$1.off(`${this._eventsID}_start`, this._onTouchStart, this), scope.events$1.off(`${this._eventsID}_move`, this._onTouchMove, this), scope.events$1.off(`${this._eventsID}_end`, this._onTouchEnd, this), scope.events$1.off(`${this._eventsID}_click`, this._onTouchClick, this), this._checkIntersections(scope.L(qt, scope.ii).TOUCH_END, []));
  }
  dispose() {
    this.disable();
  }
};
}
