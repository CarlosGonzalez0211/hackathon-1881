/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 19664:20027.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0153(scope) {
scope.schedule_possible_effect_self_invalidation = function schedule_possible_effect_self_invalidation(r, e, i = !0) {
  var s = r.reactions;
  if (s !== null && !(scope.current_sources != null && scope.current_sources.includes(r))) for (var a = 0; a < s.length; a++) {
    var o = s[a];
    (o.f & scope.DERIVED) !== 0 ? scope.schedule_possible_effect_self_invalidation(o, e, !1) : e === o && (i ? scope.set_signal_status(o, scope.DIRTY) : (o.f & scope.CLEAN) !== 0 && scope.set_signal_status(o, scope.MAYBE_DIRTY), scope.schedule_effect(o));
  }
};
}
