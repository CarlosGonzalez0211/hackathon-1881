/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 9530:10056.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0097(scope) {
scope.internal_set = function internal_set(r, e) {
  if (!r.equals(e)) {
    var i = r.v;
    scope.is_destroying_effect ? scope.old_values.set(r, e) : scope.old_values.set(r, i), r.v = e;
    var s = scope.Batch.ensure();
    s.capture(r, i), (r.f & scope.DERIVED) !== 0 && ((r.f & scope.DIRTY) !== 0 && scope.execute_derived(r), scope.set_signal_status(r, (r.f & scope.UNOWNED) === 0 ? scope.CLEAN : scope.MAYBE_DIRTY)), r.wv = scope.increment_write_version(), scope.mark_reactions(r, scope.DIRTY), scope.is_runes() && scope.active_effect !== null && (scope.active_effect.f & scope.CLEAN) !== 0 && (scope.active_effect.f & (scope.BRANCH_EFFECT | scope.ROOT_EFFECT)) === 0 && (scope.untracked_writes === null ? scope.set_untracked_writes([r]) : scope.untracked_writes.push(r));
  }
  return e;
};
}
