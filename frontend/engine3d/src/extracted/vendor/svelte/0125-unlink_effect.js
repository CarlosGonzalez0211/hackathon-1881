/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 17200:17361.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0125(scope) {
scope.unlink_effect = function unlink_effect(r) {
  var e = r.parent,
    i = r.prev,
    s = r.next;
  i !== null && (i.next = s), s !== null && (s.prev = i), e !== null && (e.first === r && (e.first = s), e.last === r && (e.last = i));
};
}
