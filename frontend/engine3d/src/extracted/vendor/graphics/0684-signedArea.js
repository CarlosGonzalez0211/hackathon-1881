/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 243148:243256.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0684(scope) {
scope.signedArea = function signedArea(r, e, i, s) {
  let a = 0;
  for (let o = e, l = i - s; o < i; o += s) a += (r[l] - r[o]) * (r[o + 1] + r[l + 1]), l = o;
  return a;
};
}
