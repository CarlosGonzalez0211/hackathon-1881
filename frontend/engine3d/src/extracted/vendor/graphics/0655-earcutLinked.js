/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 236809:237216.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0655(scope) {
scope.earcutLinked = function earcutLinked(r, e, i, s, a, o, l) {
  if (!r) return;
  !l && o && scope.indexCurve(r, s, a, o);
  let c = r;
  for (; r.prev !== r.next;) {
    const h = r.prev,
      d = r.next;
    if (o ? scope.isEarHashed(r, s, a, o) : scope.isEar(r)) {
      e.push(h.i, r.i, d.i), scope.removeNode(r), r = d.next, c = d.next;
      continue;
    }
    if (r = d, r === c) {
      l ? l === 1 ? (r = scope.cureLocalIntersections(scope.filterPoints(r), e), scope.earcutLinked(r, e, i, s, a, o, 2)) : l === 2 && scope.splitEarcut(r, e, i, s, a, o) : scope.earcutLinked(scope.filterPoints(r), e, i, s, a, o, 1);
      break;
    }
  }
};
}
