/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 13730:13846.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0106(scope) {
scope.first_child = function first_child(r, e) {
  {
    var i = scope.get_first_child(r);
    return i instanceof Comment && i.data === "" ? scope.get_next_sibling(i) : i;
  }
};
}
