/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1324342:1324483.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1763(scope) {
scope.expandByTriangleBounds = function expandByTriangleBounds(r, e, i) {
  for (let s = 0; s < 3; s++) {
    const a = e[r + 2 * s],
      o = e[r + 2 * s + 1],
      l = a - o,
      c = a + o;
    l < i[s] && (i[s] = l), c > i[s + 3] && (i[s + 3] = c);
  }
};
}
