/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 242404:242599.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0679(scope) {
scope.middleInside = function middleInside(r, e) {
  let i = r,
    s = !1;
  const a = (r.x + e.x) / 2,
    o = (r.y + e.y) / 2;
  do i.y > o != i.next.y > o && i.next.y !== i.y && a < (i.next.x - i.x) * (o - i.y) / (i.next.y - i.y) + i.x && (s = !s), i = i.next; while (i !== r);
  return s;
};
}
