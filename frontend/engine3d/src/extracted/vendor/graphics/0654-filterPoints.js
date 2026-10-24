/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 236589:236809.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0654(scope) {
scope.filterPoints = function filterPoints(r, e) {
  if (!r) return r;
  e || (e = r);
  let i = r,
    s;
  do if (s = !1, !i.steiner && (scope.equals(i, i.next) || scope.area(i.prev, i, i.next) === 0)) {
    if (scope.removeNode(i), i = e = i.prev, i === i.next) break;
    s = !0;
  } else i = i.next; while (s || i !== e);
  return e;
};
}
