/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 15215:15429.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0113(scope) {
scope.user_effect = function user_effect(r) {
  scope.validate_effect();
  var e = scope.active_effect.f,
    i = !scope.active_reaction && (e & scope.BRANCH_EFFECT) !== 0 && (e & scope.EFFECT_RAN) === 0;
  if (i) {
    var s = scope.component_context;
    (s.e ?? (s.e = [])).push(r);
  } else return scope.create_user_effect(r);
};
}
