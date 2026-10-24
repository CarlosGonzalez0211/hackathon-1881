/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 16007:16253.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0120(scope) {
scope.execute_effect_teardown = function execute_effect_teardown(r) {
  var e = r.teardown;
  if (e !== null) {
    const i = scope.is_destroying_effect,
      s = scope.active_reaction;
    scope.set_is_destroying_effect(!0), scope.set_active_reaction(null);
    try {
      e.call(null);
    } finally {
      scope.set_is_destroying_effect(i), scope.set_active_reaction(s);
    }
  }
};
}
