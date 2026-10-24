/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 712038:713301.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1175(scope) {
scope.Di = class Di extends scope.animation {
  constructor(i, {
    from: s = {},
    to: a = {},
    duration: o = 0,
    delay: l = 0,
    ease: c = "power2.inOut",
    onStart: h = scope.noop$1,
    onUpdate: d = scope.noop$1,
    onComplete: p = scope.noop$1,
    paused: f = !1,
    overwrite: _ = !0
  } = {}) {
    super({
      delay: l,
      onStart: h,
      onUpdate: d,
      onComplete: p,
      paused: f,
      overwrite: _
    });
    scope.oe(this, scope.Vr);
    scope.oe(this, scope.Qi, null);
    scope.oe(this, scope.Rn, !1);
    scope.oe(this, scope.Zt, {});
    scope.oe(this, scope.li, {});
    scope.oe(this, scope.Pn, {});
    scope.oe(this, scope.Ln, {});
    scope.oe(this, scope.Us, i => i);
    scope.Ye(this, "isTween", !0);
    scope.Ye(this, "_isTimelineInitializer", !1);
    this._duration = Math.max(0, o), scope.ze(this, scope.Qi, i), scope.ze(this, scope.Zt, s), scope.ze(this, scope.li, a), scope.ze(this, scope.Rn, i instanceof HTMLElement), scope.ze(this, scope.Us, scope.getEase(c)), scope.Ee(this, scope.Vr, scope.so).call(this), super._animationAutoPlay();
  }
  get _obj() {
    return scope.L(this, scope.Qi);
  }
  get _from() {
    return scope.L(this, scope.Zt);
  }
  _removeProp(i) {
    delete scope.L(this, scope.Zt)[i], delete scope.L(this, scope.li)[i], delete scope.L(this, scope.Pn)[i], delete scope.L(this, scope.Ln)[i];
  }
  _animationPerformUpdate(i, s, a) {
    const o = s >= 1;
    if (a || o) {
      const l = scope.L(this, scope.Us).call(this, scope.math.clamp(s, 0, 1));
      for (const c in scope.L(this, scope.Zt)) {
        const h = scope.L(this, scope.Zt)[c],
          d = scope.L(this, scope.li)[c];
        let p = scope.L(this, scope.Pn)[c] === Di.TYPES.number ? scope.math.lerp(h, d, l) : l < .5 ? h : d;
        scope.L(this, scope.Ln)[c] && (p = `${p}${scope.L(this, scope.Ln)[c]}`), scope.L(this, scope.Rn) ? scope.L(this, scope.Qi).style[c] = p : scope.L(this, scope.Qi)[c] = p;
      }
    }
  }
  _animationAfterUpdate(i, s, a) {
    scope.L(this, scope.Rn) && !scope.t$1._ticking && console.warn("tween updating the DOM outside a rAF loop. This may cause performance issues.");
  }
};
}
