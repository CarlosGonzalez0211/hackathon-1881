/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 21682:22051.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0155(scope) {
scope.remove_reaction = function remove_reaction(r, e) {
  let i = e.reactions;
  if (i !== null) {
    var s = scope.index_of.call(i, r);
    if (s !== -1) {
      var a = i.length - 1;
      a === 0 ? i = e.reactions = null : (i[s] = i[a], i.pop());
    }
  }
  i === null && (e.f & scope.DERIVED) !== 0 && (scope.new_deps === null || !scope.new_deps.includes(e)) && (scope.set_signal_status(e, scope.MAYBE_DIRTY), (e.f & (scope.UNOWNED | scope.DISCONNECTED)) === 0 && (e.f ^= scope.DISCONNECTED), scope.destroy_derived_effects(e), scope.remove_reactions(e, 0));
};
}
