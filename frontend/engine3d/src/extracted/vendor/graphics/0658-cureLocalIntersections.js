/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 238458:238721.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0658(scope) {
scope.cureLocalIntersections = function cureLocalIntersections(r, e) {
  let i = r;
  do {
    const s = i.prev,
      a = i.next.next;
    !scope.equals(s, a) && scope.intersects(s, i, i.next, a) && scope.locallyInside(s, a) && scope.locallyInside(a, s) && (e.push(s.i, i.i, a.i), scope.removeNode(i), scope.removeNode(i.next), i = r = a), i = i.next;
  } while (i !== r);
  return scope.filterPoints(i);
};
}
