/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 239006:239281.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0660(scope) {
scope.eliminateHoles = function eliminateHoles(r, e, i, s) {
  const a = [];
  for (let o = 0, l = e.length; o < l; o++) {
    const c = e[o] * s,
      h = o < l - 1 ? e[o + 1] * s : r.length,
      d = scope.linkedList(r, c, h, s, !1);
    d === d.next && (d.steiner = !0), a.push(scope.getLeftmost(d));
  }
  a.sort(scope.compareXYSlope);
  for (let o = 0; o < a.length; o++) i = scope.eliminateHole(a[o], i);
  return i;
};
}
