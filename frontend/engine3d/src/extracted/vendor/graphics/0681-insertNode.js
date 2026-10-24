/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 242783:242917.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0681(scope) {
scope.insertNode = function insertNode(r, e, i, s) {
  const a = scope.createNode(r, e, i);
  return s ? (a.next = s.next, a.prev = s, s.next.prev = a, s.next = a) : (a.prev = a, a.next = a), a;
};
}
