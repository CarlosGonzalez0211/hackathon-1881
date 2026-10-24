/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 4352:4580.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0076(scope) {
scope.update_derived = function update_derived(r) {
  var e = scope.execute_derived(r);
  if (r.equals(e) || (r.v = e, r.wv = scope.increment_write_version()), !scope.is_destroying_effect) {
    var i = (scope.skip_reaction || (r.f & scope.UNOWNED) !== 0) && r.deps !== null ? scope.MAYBE_DIRTY : scope.CLEAN;
    scope.set_signal_status(r, i);
  }
};
}
