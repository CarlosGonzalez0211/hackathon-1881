/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 240270:240445.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0665(scope) {
scope.indexCurve = function indexCurve(r, e, i, s) {
  let a = r;
  do a.z === 0 && (a.z = scope.zOrder(a.x, a.y, e, i, s)), a.prevZ = a.prev, a.nextZ = a.next, a = a.next; while (a !== r);
  a.prevZ.nextZ = null, a.prevZ = null, scope.sortLinked(a);
};
}
