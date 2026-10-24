/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 4164:4352.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0075(scope) {
scope.execute_derived = function execute_derived(r) {
  var e,
    i = scope.active_effect;
  scope.set_active_effect(scope.get_derived_parent_effect(r));
  try {
    scope.destroy_derived_effects(r), e = scope.update_reaction(r);
  } finally {
    scope.set_active_effect(i);
  }
  return e;
};
}
