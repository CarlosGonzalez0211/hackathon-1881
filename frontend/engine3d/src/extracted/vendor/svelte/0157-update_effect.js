/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 22158:22570.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0157(scope) {
scope.update_effect = function update_effect(r) {
  var e = r.f;
  if ((e & scope.DESTROYED) === 0) {
    scope.set_signal_status(r, scope.CLEAN);
    var i = scope.active_effect,
      s = scope.is_updating_effect;
    scope.active_effect = r, scope.is_updating_effect = !0;
    try {
      (e & scope.BLOCK_EFFECT) !== 0 ? scope.destroy_block_effect_children(r) : scope.destroy_effect_children(r), scope.execute_effect_teardown(r);
      var a = scope.update_reaction(r);
      r.teardown = typeof a == "function" ? a : null, r.wv = scope.write_version;
      var o;
    } finally {
      scope.is_updating_effect = s, scope.active_effect = i;
    }
  }
};
}
