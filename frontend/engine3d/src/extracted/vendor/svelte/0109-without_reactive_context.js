/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 13964:14157.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0109(scope) {
scope.without_reactive_context = function without_reactive_context(r) {
  var e = scope.active_reaction,
    i = scope.active_effect;
  scope.set_active_reaction(null), scope.set_active_effect(null);
  try {
    return r();
  } finally {
    scope.set_active_reaction(e), scope.set_active_effect(i);
  }
};
}
