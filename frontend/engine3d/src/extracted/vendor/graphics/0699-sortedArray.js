/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 253470:253625.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0699(scope) {
scope.sortedArray = function sortedArray(r, e, i) {
  const s = r.length,
    a = new r.constructor(s);
  for (let o = 0, l = 0; l !== s; ++o) {
    const c = i[o] * e;
    for (let h = 0; h !== e; ++h) a[l++] = r[c + h];
  }
  return a;
};
}
