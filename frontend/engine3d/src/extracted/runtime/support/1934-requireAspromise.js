/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1441193:1441644.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1934(scope) {
scope.requireAspromise = function requireAspromise() {
  if (scope.hasRequiredAspromise) return scope.aspromise;
  scope.hasRequiredAspromise = 1, scope.aspromise = r;
  function r(e, i) {
    for (var s = new Array(arguments.length - 1), a = 0, o = 2, l = !0; o < arguments.length;) s[a++] = arguments[o++];
    return new Promise(function (h, d) {
      s[a] = function (f) {
        if (l) if (l = !1, f) d(f);else {
          for (var _ = new Array(arguments.length - 1), x = 0; x < _.length;) _[x++] = arguments[x];
          h.apply(null, _);
        }
      };
      try {
        e.apply(i || null, s);
      } catch (p) {
        l && (l = !1, d(p));
      }
    });
  }
  return scope.aspromise;
};
}
