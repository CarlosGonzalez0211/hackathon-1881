/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 17583:17857.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0128(scope) {
scope.pause_children = function pause_children(r, e, i) {
  if ((r.f & scope.INERT) === 0) {
    if (r.f ^= scope.INERT, r.transitions !== null) for (const l of r.transitions) (l.is_global || i) && e.push(l);
    for (var s = r.first; s !== null;) {
      var a = s.next,
        o = (s.f & scope.EFFECT_TRANSPARENT) !== 0 || (s.f & scope.BRANCH_EFFECT) !== 0;
      scope.pause_children(s, e, o ? i : !1), s = a;
    }
  }
};
}
