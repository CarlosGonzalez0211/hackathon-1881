/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 8774:9042.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0092(scope) {
scope.schedule_effect = function schedule_effect(r) {
  for (var e = scope.last_scheduled_effect = r; e.parent !== null;) {
    e = e.parent;
    var i = e.f;
    if (scope.is_flushing && e === scope.active_effect && (i & scope.BLOCK_EFFECT) !== 0) return;
    if ((i & (scope.ROOT_EFFECT | scope.BRANCH_EFFECT)) !== 0) {
      if ((i & scope.CLEAN) === 0) return;
      e.f ^= scope.CLEAN;
    }
  }
  scope.queued_root_effects.push(e);
};
}
