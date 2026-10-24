/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 3133:3388.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0067(scope) {
scope.handle_error = function handle_error(r) {
  var e = scope.active_effect;
  if (e === null) return scope.active_reaction.f |= scope.ERROR_VALUE, r;
  if ((e.f & scope.EFFECT_RAN) === 0) {
    if ((e.f & scope.BOUNDARY_EFFECT) === 0) throw !e.parent && r instanceof Error && scope.apply_adjustments(r), r;
    e.b.error(r);
  } else scope.invoke_error_boundary(r, e);
};
}
