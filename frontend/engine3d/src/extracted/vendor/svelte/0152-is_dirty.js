/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 19012:19664.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0152(scope) {
scope.is_dirty = function is_dirty(r) {
  var f;
  var e = r.f;
  if ((e & scope.DIRTY) !== 0) return !0;
  if ((e & scope.MAYBE_DIRTY) !== 0) {
    var i = r.deps,
      s = (e & scope.UNOWNED) !== 0;
    if (i !== null) {
      var a,
        o,
        l = (e & scope.DISCONNECTED) !== 0,
        c = s && scope.active_effect !== null && !scope.skip_reaction,
        h = i.length;
      if ((l || c) && (scope.active_effect === null || (scope.active_effect.f & scope.DESTROYED) === 0)) {
        var d = r,
          p = d.parent;
        for (a = 0; a < h; a++) o = i[a], (l || !((f = o == null ? void 0 : o.reactions) != null && f.includes(d))) && (o.reactions ?? (o.reactions = [])).push(d);
        l && (d.f ^= scope.DISCONNECTED), c && p !== null && (p.f & scope.UNOWNED) === 0 && (d.f ^= scope.UNOWNED);
      }
      for (a = 0; a < h; a++) if (o = i[a], scope.is_dirty(o) && scope.update_derived(o), o.wv > r.wv) return !0;
    }
    (!s || scope.active_effect !== null && !scope.skip_reaction) && scope.set_signal_status(r, scope.CLEAN);
  }
  return !1;
};
}
