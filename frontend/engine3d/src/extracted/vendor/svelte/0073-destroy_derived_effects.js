/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 3913:4043.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0073(scope) {
scope.destroy_derived_effects = function destroy_derived_effects(r) {
  var e = r.effects;
  if (e !== null) {
    r.effects = null;
    for (var i = 0; i < e.length; i += 1) scope.destroy_effect(e[i]);
  }
};
}
