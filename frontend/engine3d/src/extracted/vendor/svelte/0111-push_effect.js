/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 14397:14491.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0111(scope) {
scope.push_effect = function push_effect(r, e) {
  var i = e.last;
  i === null ? e.last = e.first = r : (i.next = r, r.prev = i, e.last = r);
};
}
