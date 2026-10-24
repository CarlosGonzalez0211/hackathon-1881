/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1324071:1324184.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1760(scope) {
scope.getLongestEdgeIndex = function getLongestEdgeIndex(r) {
  let e = -1,
    i = -1 / 0;
  for (let s = 0; s < 3; s++) {
    const a = r[s + 3] - r[s];
    a > i && (i = a, e = s);
  }
  return e;
};
}
