/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 241319:241579.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0671(scope) {
scope.isValidDiagonal = function isValidDiagonal(r, e) {
  return r.next.i !== e.i && r.prev.i !== e.i && !scope.intersectsPolygon(r, e) && (scope.locallyInside(r, e) && scope.locallyInside(e, r) && scope.middleInside(r, e) && (scope.area(r.prev, r, e.prev) || scope.area(r, e.prev, e)) || scope.equals(r, e) && scope.area(r.prev, r, r.next) > 0 && scope.area(e.prev, e, e.next) > 0);
};
}
