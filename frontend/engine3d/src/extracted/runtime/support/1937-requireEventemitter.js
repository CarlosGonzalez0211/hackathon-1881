/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1442980:1443643.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1937(scope) {
scope.requireEventemitter = function requireEventemitter() {
  if (scope.hasRequiredEventemitter) return scope.eventemitter;
  scope.hasRequiredEventemitter = 1, scope.eventemitter = r;
  function r() {
    this._listeners = {};
  }
  return r.prototype.on = function (i, s, a) {
    return (this._listeners[i] || (this._listeners[i] = [])).push({
      fn: s,
      ctx: a || this
    }), this;
  }, r.prototype.off = function (i, s) {
    if (i === void 0) this._listeners = {};else if (s === void 0) this._listeners[i] = [];else for (var a = this._listeners[i], o = 0; o < a.length;) a[o].fn === s ? a.splice(o, 1) : ++o;
    return this;
  }, r.prototype.emit = function (i) {
    var s = this._listeners[i];
    if (s) {
      for (var a = [], o = 1; o < arguments.length;) a.push(arguments[o++]);
      for (o = 0; o < s.length;) s[o].fn.apply(s[o++].ctx, a);
    }
    return this;
  }, scope.eventemitter;
};
}
