/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1448255:1448516.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1942(scope) {
scope.requirePool = function requirePool() {
  if (scope.hasRequiredPool) return scope.pool_1;
  scope.hasRequiredPool = 1, scope.pool_1 = r;
  function r(e, i, s) {
    var a = s || 8192,
      o = a >>> 1,
      l = null,
      c = a;
    return function (d) {
      if (d < 1 || d > o) return e(d);
      c + d > a && (l = e(a), c = 0);
      var p = i.call(l, c, c += d);
      return c & 7 && (c = (c | 7) + 1), p;
    };
  }
  return scope.pool_1;
};
}
