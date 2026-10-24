/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 253328:253470.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0698(scope) {
scope.getKeyframeOrder = function getKeyframeOrder(r) {
  function e(a, o) {
    return r[a] - r[o];
  }
  const i = r.length,
    s = new Array(i);
  for (let a = 0; a !== i; ++a) s[a] = a;
  return s.sort(e), s;
};
}
