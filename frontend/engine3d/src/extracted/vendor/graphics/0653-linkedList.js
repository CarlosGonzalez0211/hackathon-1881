/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 236350:236589.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0653(scope) {
scope.linkedList = function linkedList(r, e, i, s, a) {
  let o;
  if (a === scope.signedArea(r, e, i, s) > 0) for (let l = e; l < i; l += s) o = scope.insertNode(l / s | 0, r[l], r[l + 1], o);else for (let l = i - s; l >= e; l -= s) o = scope.insertNode(l / s | 0, r[l], r[l + 1], o);
  return o && scope.equals(o, o.next) && (scope.removeNode(o), o = o.next), o;
};
}
