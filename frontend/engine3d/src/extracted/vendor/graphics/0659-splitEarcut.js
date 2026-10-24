/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 238721:239006.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0659(scope) {
scope.splitEarcut = function splitEarcut(r, e, i, s, a, o) {
  let l = r;
  do {
    let c = l.next.next;
    for (; c !== l.prev;) {
      if (l.i !== c.i && scope.isValidDiagonal(l, c)) {
        let h = scope.splitPolygon(l, c);
        l = scope.filterPoints(l, l.next), h = scope.filterPoints(h, h.next), scope.earcutLinked(l, e, i, s, a, o, 0), scope.earcutLinked(h, e, i, s, a, o, 0);
        return;
      }
      c = c.next;
    }
    l = l.next;
  } while (l !== r);
};
}
