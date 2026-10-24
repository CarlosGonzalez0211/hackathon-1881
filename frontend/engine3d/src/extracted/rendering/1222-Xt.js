/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 737834:741970.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1222(scope) {
scope.Xt = class Xt {
  constructor({
    nodes: e = [],
    onHover: i = null,
    onTouch: s = null,
    onMove: a = null,
    onDrag: o = null,
    onClick: l = null,
    ctx: c = null,
    disablePointerEvents: h = !0,
    hoverCursor: d = !1,
    grabCursor: p = !1
  } = {}) {
    scope.oe(this, scope.Vs, e => !scope.touches$1.allowTouchStart && e.preventDefault());
    this._enabled = !1, this._nodes = Array.isArray(e) ? e : [e], this._onHover = i, this._onTouch = s, this._onMove = a, this._onDrag = o, this._onClick = l, this._ctx = c, this._touchStartCbs = this._nodes.map((f, _) => x => this._handleEvent(x, scope.L(Xt, scope.gi).TOUCH_START, f, _)), this._touchMoveCbs = this._nodes.map((f, _) => x => this._handleEvent(x, scope.L(Xt, scope.gi).TOUCH_MOVE, f, _)), this._touchEndCbs = this._nodes.map((f, _) => x => this._handleEvent(x, scope.L(Xt, scope.gi).TOUCH_END, f, _)), this._disablePointerEvents = h, this._disablePointerEvents && this._nodes.forEach(f => f.style.pointerEvents = "none"), this._hoverCursor = d, this._grabCursor = p && !d, this.starts = this._nodes.map(() => ({
      position: {
        x: 0,
        y: 0
      },
      time: 0
    })), this.hovering = this._nodes.map(() => !1), this.touching = this._nodes.map(() => !1), this.dragging = this._nodes.map(() => !1);
  }
  _performHover(e, i, s, a) {
    this.hovering[a] = i === "hover_in", this._callBack(this._onHover, i, s, a, e), this._hoverCursor && (s.style.cursor = this.hovering[a] ? "pointer" : ""), this._grabCursor && !this.dragging[a] && (s.style.cursor = this.hovering[a] ? "grab" : "");
  }
  _performTouch(e, i, s, a) {
    const o = i === "touch_start";
    if (this.touching[a] = o, this._callBack(this._onTouch, i, s, a, e), this._grabCursor && (s.style.cursor = this.touching[a] ? "grabbing" : this.hovering[a] ? "grab" : ""), o) this.starts[a].position.x = (e == null ? void 0 : e.clientX) || 0, this.starts[a].position.y = (e == null ? void 0 : e.clientY) || 0, this.starts[a].time = scope.renderInfo.time;else {
      const l = (e == null ? void 0 : e.clientX) || 0,
        c = (e == null ? void 0 : e.clientY) || 0,
        h = Math.sqrt(Math.pow(l - this.starts[a].position.x, 2) + Math.pow(c - this.starts[a].position.y, 2)),
        d = scope.renderInfo.time - this.starts[a].time;
      if (h >= scope.L(Xt, scope.jr) || d >= scope.L(Xt, scope.Kr) || e.pointerType === "mouse" && e.button !== 0 || e.type === "pointerout") return;
      this._callBack(this._onClick, "click", s, a, e);
    }
  }
  _handleEvent(e, i, s, a) {
    i === scope.L(Xt, scope.gi).TOUCH_START || i === scope.L(Xt, scope.gi).TOUCH_MOVE ? (this.hovering[a] || this._performHover(e, "hover_in", s, a), i === scope.L(Xt, scope.gi).TOUCH_START ? this.touching[a] || (this._performTouch(e, "touch_start", s, a), this.dragging[a] = !0) : this._callBack(this._onMove, "move", s, a, e)) : i === scope.L(Xt, scope.gi).TOUCH_END && (this.hovering[a] && (e.type !== "pointerup" || e.pointerType !== "mouse") && this._performHover(e, "hover_out", s, a), this.touching[a] && this._performTouch(e, "touch_end", s, a), this.dragging[a] = !1), i === scope.L(Xt, scope.gi).TOUCH_MOVE && this.dragging[a] && this._callBack(this._onDrag, "drag", s, a, e);
  }
  _callBack(e, i, s, a, o) {
    e && e.call(this._ctx, {
      action: i,
      node: s,
      nodeIndex: a,
      event: o
    });
  }
  enable() {
    this._enabled || (this._enabled = !0, (this._onTouch || this._onHover || this._onDrag || this._onClick) && this._nodes.forEach((e, i) => scope.__lifecycle.listen(e, "pointerdown", this._touchStartCbs[i])), (this._onHover || this._onMove || this._onDrag) && (this._nodes.forEach((e, i) => scope.__lifecycle.listen(e, "pointerover", this._touchMoveCbs[i])), this._nodes.forEach((e, i) => scope.__lifecycle.listen(e, "pointermove", this._touchMoveCbs[i]))), (this._onTouch || this._onHover || this._onDrag || this._onClick) && this._nodes.forEach((e, i) => {
      scope.__lifecycle.listen(e, "pointerup", this._touchEndCbs[i]), scope.__lifecycle.listen(e, "pointerout", this._touchEndCbs[i]), scope.__lifecycle.listen(e, "pointercancel", this._touchEndCbs[i]);
    }), this._nodes.forEach((e, i) => scope.__lifecycle.listen(e, "touchstart", scope.L(this, scope.Vs), {
      passive: !1
    })), this._disablePointerEvents && this._nodes.forEach(e => e.style.pointerEvents = ""));
  }
  disable() {
    this._enabled && (this._enabled = !1, this._nodes.forEach((e, i) => scope.__lifecycle.unlisten(e, "pointerdown", this._touchStartCbs[i])), this._nodes.forEach((e, i) => scope.__lifecycle.unlisten(e, "pointerover", this._touchMoveCbs[i])), this._nodes.forEach((e, i) => scope.__lifecycle.unlisten(e, "pointermove", this._touchMoveCbs[i])), this._nodes.forEach((e, i) => {
      scope.__lifecycle.unlisten(e, "pointerup", this._touchEndCbs[i]), scope.__lifecycle.unlisten(e, "pointerout", this._touchEndCbs[i]), scope.__lifecycle.unlisten(e, "pointercancel", this._touchEndCbs[i]);
    }), this._nodes.forEach((e, i) => scope.__lifecycle.unlisten(e, "touchstart", scope.L(this, scope.Vs))), this._nodes.forEach((e, i) => this._handleEvent({}, scope.L(Xt, scope.gi).TOUCH_END, e, i)), this._disablePointerEvents && this._nodes.forEach(e => e.style.pointerEvents = "none"));
  }
};
}
