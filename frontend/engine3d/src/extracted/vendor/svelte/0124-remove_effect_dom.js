/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 17099:17200.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0124(scope) {
scope.remove_effect_dom = function remove_effect_dom(r, e) {
  for (; r !== null;) {
    var i = r === e ? null : scope.get_next_sibling(r);
    r.remove(), r = i;
  }
};
}
