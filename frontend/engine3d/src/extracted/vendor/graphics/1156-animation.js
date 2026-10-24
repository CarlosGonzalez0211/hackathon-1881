/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 683029:684761.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1156(scope) {
scope.animation = class animation {
  constructor({
    delay: e = 0,
    onStart: i = scope.noop$2,
    onUpdate: s = scope.noop$2,
    onComplete: a = scope.noop$2,
    paused: o = !1,
    overwrite: l = !0
  } = {}) {
    scope.oe(this, scope.Mn, !1);
    scope.oe(this, scope.mn, !1);
    scope.oe(this, scope.Ds, scope.noop$2);
    scope.oe(this, scope.Rs, scope.noop$2);
    scope.oe(this, scope.Ps, scope.noop$2);
    scope.oe(this, scope.In, null);
    scope.oe(this, scope.gn, 0);
    scope.oe(this, scope.Ri, !1);
    scope.oe(this, scope.Ls, !0);
    scope.oe(this, scope.Bn, null);
    scope.Ye(this, "_duration", 0);
    scope.Ye(this, "_delay", 0);
    this._delay = Math.max(0, e), scope.ze(this, scope.Ds, i), scope.ze(this, scope.Rs, s), scope.ze(this, scope.Ps, a), scope.ze(this, scope.Ri, o), scope.ze(this, scope.Ls, l);
  }
  _animationAutoPlay() {
    scope.L(this, scope.Ri) || (scope.ze(this, scope.Ri, !0), this.play());
  }
  _animationUpdate(e = 0) {
    var c;
    const i = e - this._delay;
    let s = 0;
    this._duration > 0 ? (s = i / this._duration, scope.ze(this, scope.gn, scope.math.fit(i, -this._delay, this._duration, 0, 1))) : (i < 0 ? s = -1 : i === 0 || !scope.L(this, scope.mn) ? s = 1 : s = 2, scope.ze(this, scope.gn, s < 0 ? 0 : 1));
    let a = !1,
      o = !1,
      l = !1;
    (s <= 0 || this._duration === 0 && s === 1) && scope.ze(this, scope.Mn, !1), !scope.L(this, scope.Mn) && s >= 0 && (scope.ze(this, scope.Mn, !0), a = !0, o = !0), s >= 0 && s <= 1 && (o = !0), s <= 1 && scope.ze(this, scope.mn, !1), !scope.L(this, scope.mn) && s >= 1 && (scope.ze(this, scope.mn, !0), l = !0, o = !0), this._animationPerformUpdate(i, s, o), a && scope.L(this, scope.Ds).call(this), o && scope.L(this, scope.Rs).call(this), l && (scope.L(this, scope.Ps).call(this), (c = scope.L(this, scope.Bn)) == null || c.resolve()), this._animationAfterUpdate(i, s, o);
  }
  _animationPerformUpdate(e, i, s) {}
  _animationAfterUpdate(e, i, s) {}
  then(e, i) {
    return scope.L(this, scope.Bn) || scope.ze(this, scope.Bn, scope.miscutils.deferred()), scope.L(this, scope.Bn).then(e, i);
  }
  play() {
    return scope.L(this, scope.Ri) ? (scope.ze(this, scope.Ri, !1), scope.ze(this, scope.In, null), scope.t$1.add(this, scope.L(this, scope.Ls)), this) : this;
  }
  pause() {
    return scope.L(this, scope.Ri) ? this : (scope.ze(this, scope.Ri, !0), scope.t$1.remove(this), this);
  }
  stop() {
    return scope.ze(this, scope.gn, 0), scope.ze(this, scope.Mn, !1), scope.ze(this, scope.mn, !1), this.pause();
  }
  seek(e = 0) {
    return this.pause(), this._animationUpdate((this._duration + this._delay) * scope.math.clamp(e, 0, 1)), this;
  }
  tick(e) {
    return scope.L(this, scope.In) === null && scope.ze(this, scope.In, e - (this._duration + this._delay) * scope.L(this, scope.gn)), this._animationUpdate(e - scope.L(this, scope.In)), scope.L(this, scope.gn) === 1 && scope.t$1.remove(this), this;
  }
};
}
