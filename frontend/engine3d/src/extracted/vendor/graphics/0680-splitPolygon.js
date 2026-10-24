/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 242599:242783.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0680(scope) {
scope.splitPolygon = function splitPolygon(r, e) {
  const i = scope.createNode(r.i, r.x, r.y),
    s = scope.createNode(e.i, e.x, e.y),
    a = r.next,
    o = e.prev;
  return r.next = e, e.prev = r, i.next = a, a.prev = i, s.next = i, i.prev = s, o.next = s, s.prev = o, s;
};
}
