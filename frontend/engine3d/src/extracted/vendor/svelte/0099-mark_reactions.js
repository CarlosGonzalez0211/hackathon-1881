/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 10091:10437.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0099(scope) {
scope.mark_reactions = function mark_reactions(r, e) {
  var i = r.reactions;
  if (i !== null) for (var s = scope.is_runes(), a = i.length, o = 0; o < a; o++) {
    var l = i[o],
      c = l.f;
    if (!(!s && l === scope.active_effect)) {
      var h = (c & scope.DIRTY) === 0;
      h && scope.set_signal_status(l, e), (c & scope.DERIVED) !== 0 ? scope.mark_reactions(l, scope.MAYBE_DIRTY) : h && ((c & scope.BLOCK_EFFECT) !== 0 && scope.eager_block_effects !== null && scope.eager_block_effects.push(l), scope.schedule_effect(l));
    }
  }
};
}
