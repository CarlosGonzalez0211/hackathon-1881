/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 935210:935472.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1530(scope) {
scope.getCoefficients = function getCoefficients(r) {
  let e;
  if (r === 0) e = new Float64Array(0);else if (r === 1) e = new Float64Array([1]);else if (r > 1) {
    let i = new Float64Array(r),
      s = new Float64Array(r);
    for (let a = 1; a <= r; ++a) {
      for (let o = 0; o < a; ++o) s[o] = o === 0 || o === a - 1 ? 1 : i[o - 1] + i[o];
      e = s, s = i, i = e;
    }
  }
  return e;
};
}
