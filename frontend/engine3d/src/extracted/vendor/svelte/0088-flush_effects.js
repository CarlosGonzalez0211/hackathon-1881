/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 7817:8147.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0088(scope) {
scope.flush_effects = function flush_effects() {
  var r = scope.is_updating_effect;
  scope.is_flushing = !0;
  try {
    var e = 0;
    for (scope.set_is_updating_effect(!0); scope.queued_root_effects.length > 0;) {
      var i = scope.Batch.ensure();
      if (e++ > 1e3) {
        var s, a;
        scope.infinite_loop_guard();
      }
      i.process(scope.queued_root_effects), scope.old_values.clear();
    }
  } finally {
    scope.is_flushing = !1, scope.set_is_updating_effect(r), scope.last_scheduled_effect = null;
  }
};
}
