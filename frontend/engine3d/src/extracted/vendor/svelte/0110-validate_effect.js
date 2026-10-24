/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 14157:14397.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0110(scope) {
scope.validate_effect = function validate_effect(r) {
  scope.active_effect === null && scope.active_reaction === null && scope.effect_orphan(), scope.active_reaction !== null && (scope.active_reaction.f & scope.UNOWNED) !== 0 && scope.active_effect === null && scope.effect_in_unowned_derived(), scope.is_destroying_effect && scope.effect_in_teardown();
};
}
