/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1324218:1324342.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1762(scope) {
scope.unionBounds = function unionBounds(r, e, i) {
  let s, a;
  for (let o = 0; o < 3; o++) {
    const l = o + 3;
    s = r[o], a = e[o], i[o] = s < a ? s : a, s = r[l], a = e[l], i[l] = s > a ? s : a;
  }
};
}
