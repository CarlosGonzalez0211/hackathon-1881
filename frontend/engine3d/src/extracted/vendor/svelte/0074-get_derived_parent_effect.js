/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 4043:4164.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0074(scope) {
scope.get_derived_parent_effect = function get_derived_parent_effect(r) {
  for (var e = r.parent; e !== null;) {
    if ((e.f & scope.DERIVED) === 0) return e;
    e = e.parent;
  }
  return null;
};
}
