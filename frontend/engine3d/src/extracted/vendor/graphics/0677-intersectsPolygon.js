/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 242100:242265.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0677(scope) {
scope.intersectsPolygon = function intersectsPolygon(r, e) {
  let i = r;
  do {
    if (i.i !== r.i && i.next.i !== r.i && i.i !== e.i && i.next.i !== e.i && scope.intersects(i, i.next, r, e)) return !0;
    i = i.next;
  } while (i !== r);
  return !1;
};
}
