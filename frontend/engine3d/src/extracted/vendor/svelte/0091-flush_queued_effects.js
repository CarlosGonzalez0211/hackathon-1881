/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 8299:8774.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0091(scope) {
scope.flush_queued_effects = function flush_queued_effects(r) {
  var e = r.length;
  if (e !== 0) {
    for (var i = 0; i < e;) {
      var s = r[i++];
      if ((s.f & (scope.DESTROYED | scope.INERT)) === 0 && scope.is_dirty(s) && (scope.eager_block_effects = [], scope.update_effect(s), s.deps === null && s.first === null && s.nodes_start === null && (s.teardown === null && s.ac === null ? scope.unlink_effect(s) : s.fn = null), (scope.eager_block_effects == null ? void 0 : scope.eager_block_effects.length) > 0)) {
        scope.old_values.clear();
        for (const a of scope.eager_block_effects) scope.update_effect(a);
        scope.eager_block_effects = [];
      }
    }
    scope.eager_block_effects = null;
  }
};
}
