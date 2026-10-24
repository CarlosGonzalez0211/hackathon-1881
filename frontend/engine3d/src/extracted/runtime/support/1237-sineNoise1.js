/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 748588:748969.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1237(scope) {
scope.sineNoise1 = function sineNoise1(r, e, i) {
  scope._v0$l.set(r, e, i);
  let s = 0;
  return s += Math.sin(scope._v0$l.dot(scope._v1$e.set(1.5, 3.4598, 1.234))), s += Math.sin(scope._v0$l.dot(scope._v1$e.set(3.12, -3.234, 4.221))), s += Math.sin(scope._v0$l.dot(scope._v1$e.set(.355, 2.3, -1.375))), s += Math.sin(scope._v0$l.dot(scope._v1$e.set(-.156, -3.34, -.4566))), s += Math.sin(scope._v0$l.dot(scope._v1$e.set(-4.1235, -.485, -1.45))), s += Math.sin(scope._v0$l.dot(scope._v1$e.set(2.54, -.879, -2.123))), s / 6;
};
}
