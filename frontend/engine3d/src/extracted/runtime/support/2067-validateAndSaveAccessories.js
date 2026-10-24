/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1639683:1640048.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2067(scope) {
scope.validateAndSaveAccessories = function validateAndSaveAccessories(r) {
  const e = Object.keys(scope.ACCESSORIES),
    i = new Array(e.length).fill(!1);
  for (let a = 0; a < r.length; a++) {
    const o = r[a];
    if (o) for (let l = 0; l < e.length; l++) {
      const c = e[l];
      if (scope.ACCESSORIES[c].includes(o) && a === l) {
        i[l] = !0;
        break;
      }
    }
  }
  let s = r;
  return i.some(a => !a) && (s = scope.getRandomAccessories()), scope.client$1.localStorage.modelFiles = s, s.map(a => `accessories/${a}`);
};
}
