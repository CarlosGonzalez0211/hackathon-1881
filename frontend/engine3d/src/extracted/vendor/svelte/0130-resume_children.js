/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 17905:18238.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0130(scope) {
scope.resume_children = function resume_children(r, e) {
  if ((r.f & scope.INERT) !== 0) {
    r.f ^= scope.INERT, (r.f & scope.CLEAN) === 0 && (scope.set_signal_status(r, scope.DIRTY), scope.schedule_effect(r));
    for (var i = r.first; i !== null;) {
      var s = i.next,
        a = (i.f & scope.EFFECT_TRANSPARENT) !== 0 || (i.f & scope.BRANCH_EFFECT) !== 0;
      scope.resume_children(i, a ? e : !1), i = s;
    }
    if (r.transitions !== null) for (const o of r.transitions) (o.is_global || e) && o.in();
  }
};
}
