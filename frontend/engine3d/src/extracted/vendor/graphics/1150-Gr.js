/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 680389:682129.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1150(scope) {
scope.Gr = class Gr {
  constructor() {
    scope.oe(this, scope.Bs);
    scope.oe(this, scope.Tn, 0);
    scope.oe(this, scope.ai, []);
    scope.oe(this, scope.Hi, 0);
    scope.oe(this, scope.es, 0);
    scope.oe(this, scope.Nr, 100);
    scope.oe(this, scope.Or, 1e3 / 60);
    scope.oe(this, scope.ts, () => {});
    scope.oe(this, scope.Is, 0);
    scope.oe(this, scope.kr, .5);
    scope.oe(this, scope.zr, 5);
    scope.oe(this, scope.fn, []);
    scope.oe(this, scope.is, 1 / 0);
    scope.Ye(this, "_timeScale", 1);
    scope.Ye(this, "_time", 0);
    scope.Ye(this, "_delta", 0);
    scope.Ye(this, "_ratio", 1);
    scope.Ye(this, "_averageFPS", 60);
    scope.Ye(this, "_maxFPS", 0);
    scope.Ye(this, "_frame", 0);
    scope.Ye(this, "_ticking", !1);
    scope.oe(this, scope.ns, () => {
      scope.L(this, scope.ai).length > 0 ? scope.ze(this, scope.Tn, scope.__lifecycle.requestAnimationFrame(scope.L(this, scope.ns))) : scope.ze(this, scope.Tn, 0);
      const e = Gr.getTime();
      if (scope.L(this, scope.is) < 1 / 0 && e - scope.L(this, scope.Hi) < 1e3 / scope.L(this, scope.is)) return;
      if (this._ticking = !0, scope.ze(this, scope.es, scope.L(this, scope.Hi)), scope.ze(this, scope.Hi, e), this._delta = Math.min(scope.L(this, scope.Nr), scope.L(this, scope.Hi) - scope.L(this, scope.es)) * this._timeScale, this._time += this._delta / 1e3, this._ratio = this._delta / scope.L(this, scope.Or), this._frame++, scope.L(this, scope.fn).push(this._delta), this._time - scope.L(this, scope.Is) >= scope.L(this, scope.kr) && scope.L(this, scope.fn).length >= scope.L(this, scope.zr)) {
        const s = Math.round(1e3 / (scope.L(this, scope.fn).reduce((a, o) => a + o, 0) / scope.L(this, scope.fn).length));
        this._maxFPS = Math.max(this._maxFPS, s), this._averageFPS = s, scope.L(this, scope.ts).call(this, s), scope.L(this, scope.fn).length = 0, scope.ze(this, scope.Is, this._time);
      }
      const i = scope.L(this, scope.ai).slice();
      for (; i.length > 0;) i.shift().tick(this._time, this._delta, this._frame);
      this._ticking = !1;
    });
    scope.ze(this, scope.Hi, Gr.getTime()), scope.ze(this, scope.es, scope.L(this, scope.Hi)), scope.L(this, scope.ns).call(this);
  }
  static getTime() {
    return performance.now();
  }
  set onAverageFPS(e) {
    scope.ze(this, scope.ts, e);
  }
  get onAverageFPS() {
    return scope.L(this, scope.ts);
  }
  add(e, i = !1) {
    if (!e.tick) throw new Error('Elements added to the ticker must have a "tick()" method');
    i && scope.Ee(this, scope.Bs, scope.va).call(this, e), scope.L(this, scope.ai).push(e), scope.L(this, scope.Tn) === 0 && scope.ze(this, scope.Tn, scope.__lifecycle.requestAnimationFrame(scope.L(this, scope.ns)));
  }
  remove(e) {
    scope.ze(this, scope.ai, scope.L(this, scope.ai).filter(i => i !== e));
  }
  removeCb(e) {
    scope.ze(this, scope.ai, scope.L(this, scope.ai).filter(i => i.tick !== e));
  }
  removeAll() {
    scope.ze(this, scope.ai, []);
  }
  limitFPS(e = 1 / 0) {
    scope.ze(this, scope.is, e);
  }
};
}
