/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 672576:675450.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1136(scope) {
scope.requireEventemitter3 = function requireEventemitter3() {
  return scope.hasRequiredEventemitter3 || (scope.hasRequiredEventemitter3 = 1, function (r) {
    var e = Object.prototype.hasOwnProperty,
      i = "~";
    function s() {}
    Object.create && (s.prototype = Object.create(null), new s().__proto__ || (i = !1));
    function a(h, d, p) {
      this.fn = h, this.context = d, this.once = p || !1;
    }
    function o(h, d, p, f, _) {
      if (typeof p != "function") throw new TypeError("The listener must be a function");
      var x = new a(p, f || h, _),
        b = i ? i + d : d;
      return h._events[b] ? h._events[b].fn ? h._events[b] = [h._events[b], x] : h._events[b].push(x) : (h._events[b] = x, h._eventsCount++), h;
    }
    function l(h, d) {
      --h._eventsCount === 0 ? h._events = new s() : delete h._events[d];
    }
    function c() {
      this._events = new s(), this._eventsCount = 0;
    }
    c.prototype.eventNames = function () {
      var d = [],
        p,
        f;
      if (this._eventsCount === 0) return d;
      for (f in p = this._events) e.call(p, f) && d.push(i ? f.slice(1) : f);
      return Object.getOwnPropertySymbols ? d.concat(Object.getOwnPropertySymbols(p)) : d;
    }, c.prototype.listeners = function (d) {
      var p = i ? i + d : d,
        f = this._events[p];
      if (!f) return [];
      if (f.fn) return [f.fn];
      for (var _ = 0, x = f.length, b = new Array(x); _ < x; _++) b[_] = f[_].fn;
      return b;
    }, c.prototype.listenerCount = function (d) {
      var p = i ? i + d : d,
        f = this._events[p];
      return f ? f.fn ? 1 : f.length : 0;
    }, c.prototype.emit = function (d, p, f, _, x, b) {
      var T = i ? i + d : d;
      if (!this._events[T]) return !1;
      var M = this._events[T],
        w = arguments.length,
        D,
        R;
      if (M.fn) {
        switch (M.once && this.removeListener(d, M.fn, void 0, !0), w) {
          case 1:
            return M.fn.call(M.context), !0;
          case 2:
            return M.fn.call(M.context, p), !0;
          case 3:
            return M.fn.call(M.context, p, f), !0;
          case 4:
            return M.fn.call(M.context, p, f, _), !0;
          case 5:
            return M.fn.call(M.context, p, f, _, x), !0;
          case 6:
            return M.fn.call(M.context, p, f, _, x, b), !0;
        }
        for (R = 1, D = new Array(w - 1); R < w; R++) D[R - 1] = arguments[R];
        M.fn.apply(M.context, D);
      } else {
        var P = M.length,
          U;
        for (R = 0; R < P; R++) switch (M[R].once && this.removeListener(d, M[R].fn, void 0, !0), w) {
          case 1:
            M[R].fn.call(M[R].context);
            break;
          case 2:
            M[R].fn.call(M[R].context, p);
            break;
          case 3:
            M[R].fn.call(M[R].context, p, f);
            break;
          case 4:
            M[R].fn.call(M[R].context, p, f, _);
            break;
          default:
            if (!D) for (U = 1, D = new Array(w - 1); U < w; U++) D[U - 1] = arguments[U];
            M[R].fn.apply(M[R].context, D);
        }
      }
      return !0;
    }, c.prototype.on = function (d, p, f) {
      return o(this, d, p, f, !1);
    }, c.prototype.once = function (d, p, f) {
      return o(this, d, p, f, !0);
    }, c.prototype.removeListener = function (d, p, f, _) {
      var x = i ? i + d : d;
      if (!this._events[x]) return this;
      if (!p) return l(this, x), this;
      var b = this._events[x];
      if (b.fn) b.fn === p && (!_ || b.once) && (!f || b.context === f) && l(this, x);else {
        for (var T = 0, M = [], w = b.length; T < w; T++) (b[T].fn !== p || _ && !b[T].once || f && b[T].context !== f) && M.push(b[T]);
        M.length ? this._events[x] = M.length === 1 ? M[0] : M : l(this, x);
      }
      return this;
    }, c.prototype.removeAllListeners = function (d) {
      var p;
      return d ? (p = i ? i + d : d, this._events[p] && l(this, p)) : (this._events = new s(), this._eventsCount = 0), this;
    }, c.prototype.off = c.prototype.removeListener, c.prototype.addListener = c.prototype.on, c.prefixed = i, c.EventEmitter = c, r.exports = c;
  }(scope.eventemitter3)), scope.eventemitter3.exports;
};
}
