/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 22570:23620.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0158(scope) {
scope.get = function get(r) {
  var e = r.f,
    i = (e & scope.DERIVED) !== 0;
  if (scope.active_reaction !== null && !scope.untracking) {
    var s = scope.active_effect !== null && (scope.active_effect.f & scope.DESTROYED) !== 0;
    if (!s && !(scope.current_sources != null && scope.current_sources.includes(r))) {
      var a = scope.active_reaction.deps;
      if ((scope.active_reaction.f & scope.REACTION_IS_UPDATING) !== 0) r.rv < scope.read_version && (r.rv = scope.read_version, scope.new_deps === null && a !== null && a[scope.skipped_deps] === r ? scope.skipped_deps++ : scope.new_deps === null ? scope.new_deps = [r] : (!scope.skip_reaction || !scope.new_deps.includes(r)) && scope.new_deps.push(r));else {
        (scope.active_reaction.deps ?? (scope.active_reaction.deps = [])).push(r);
        var o = r.reactions;
        o === null ? r.reactions = [scope.active_reaction] : o.includes(scope.active_reaction) || o.push(scope.active_reaction);
      }
    }
  } else if (i && r.deps === null && r.effects === null) {
    var l = r,
      c = l.parent;
    c !== null && (c.f & scope.UNOWNED) === 0 && (l.f ^= scope.UNOWNED);
  }
  if (scope.is_destroying_effect) {
    if (scope.old_values.has(r)) return scope.old_values.get(r);
    if (i) {
      l = r;
      var h = l.v;
      return ((l.f & scope.CLEAN) === 0 && l.reactions !== null || scope.depends_on_old_values(l)) && (h = scope.execute_derived(l)), scope.old_values.set(l, h), h;
    }
  } else i && (l = r, scope.is_dirty(l) && scope.update_derived(l));
  if ((r.f & scope.ERROR_VALUE) !== 0) throw r.v;
  return r.v;
};
}
