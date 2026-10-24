/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 239438:239588.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0662(scope) {
scope.eliminateHole = function eliminateHole(r, e) {
  const i = scope.findHoleBridge(r, e);
  if (!i) return e;
  const s = scope.splitPolygon(i, r);
  return scope.filterPoints(s, s.next), scope.filterPoints(i, i.next);
};
}
