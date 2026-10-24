/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1327029:1327117.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1770(scope) {
scope.getAverage = function getAverage(r, e, i, s) {
  let a = 0;
  for (let o = e, l = e + i; o < l; o++) a += r[o * 6 + s * 2];
  return a / i;
};
}
