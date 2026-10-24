/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 20027:21682.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0154(scope) {
scope.update_reaction = function update_reaction(r) {
  var T;
  var e = scope.new_deps,
    i = scope.skipped_deps,
    s = scope.untracked_writes,
    a = scope.active_reaction,
    o = scope.skip_reaction,
    l = scope.current_sources,
    c = scope.component_context,
    h = scope.untracking,
    d = scope.update_version,
    p = r.f;
  scope.new_deps = null, scope.skipped_deps = 0, scope.untracked_writes = null, scope.skip_reaction = (p & scope.UNOWNED) !== 0 && (scope.untracking || !scope.is_updating_effect || scope.active_reaction === null), scope.active_reaction = (p & (scope.BRANCH_EFFECT | scope.ROOT_EFFECT)) === 0 ? r : null, scope.current_sources = null, scope.set_component_context(r.ctx), scope.untracking = !1, scope.update_version = ++scope.read_version, r.ac !== null && (scope.without_reactive_context(() => {
    r.ac.abort(scope.STALE_REACTION);
  }), r.ac = null);
  try {
    r.f |= scope.REACTION_IS_UPDATING;
    var f = r.fn,
      _ = f(),
      x = r.deps;
    if (scope.new_deps !== null) {
      var b;
      if (scope.remove_reactions(r, scope.skipped_deps), x !== null && scope.skipped_deps > 0) for (x.length = scope.skipped_deps + scope.new_deps.length, b = 0; b < scope.new_deps.length; b++) x[scope.skipped_deps + b] = scope.new_deps[b];else r.deps = x = scope.new_deps;
      if (!scope.skip_reaction || (p & scope.DERIVED) !== 0 && r.reactions !== null) for (b = scope.skipped_deps; b < x.length; b++) ((T = x[b]).reactions ?? (T.reactions = [])).push(r);
    } else x !== null && scope.skipped_deps < x.length && (scope.remove_reactions(r, scope.skipped_deps), x.length = scope.skipped_deps);
    if (scope.is_runes() && scope.untracked_writes !== null && !scope.untracking && x !== null && (r.f & (scope.DERIVED | scope.MAYBE_DIRTY | scope.DIRTY)) === 0) for (b = 0; b < scope.untracked_writes.length; b++) scope.schedule_possible_effect_self_invalidation(scope.untracked_writes[b], r);
    return a !== null && a !== r && (scope.read_version++, scope.untracked_writes !== null && (s === null ? s = scope.untracked_writes : s.push(...scope.untracked_writes))), (r.f & scope.ERROR_VALUE) !== 0 && (r.f ^= scope.ERROR_VALUE), _;
  } catch (M) {
    return scope.handle_error(M);
  } finally {
    r.f ^= scope.REACTION_IS_UPDATING, scope.new_deps = e, scope.skipped_deps = i, scope.untracked_writes = s, scope.active_reaction = a, scope.skip_reaction = o, scope.current_sources = l, scope.set_component_context(c), scope.untracking = h, scope.update_version = d;
  }
};
}
