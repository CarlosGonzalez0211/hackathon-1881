/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 242917:243044.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0682(scope) {
scope.removeNode = function removeNode(r) {
  r.next.prev = r.prev, r.prev.next = r.next, r.prevZ && (r.prevZ.nextZ = r.nextZ), r.nextZ && (r.nextZ.prevZ = r.prevZ);
};
}
