/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 241695:241933.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0674(scope) {
scope.intersects = function intersects(r, e, i, s) {
  const a = scope.sign(scope.area(r, e, i)),
    o = scope.sign(scope.area(r, e, s)),
    l = scope.sign(scope.area(i, s, r)),
    c = scope.sign(scope.area(i, s, e));
  return !!(a !== o && l !== c || a === 0 && scope.onSegment(r, i, e) || o === 0 && scope.onSegment(r, s, e) || l === 0 && scope.onSegment(i, r, s) || c === 0 && scope.onSegment(i, e, s));
};
}
