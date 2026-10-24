/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 16253:16496.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0121(scope) {
scope.destroy_effect_children = function destroy_effect_children(r, e = !1) {
  var i = r.first;
  for (r.first = r.last = null; i !== null;) {
    const a = i.ac;
    a !== null && scope.without_reactive_context(() => {
      a.abort(scope.STALE_REACTION);
    });
    var s = i.next;
    (i.f & scope.ROOT_EFFECT) !== 0 ? i.parent = null : scope.destroy_effect(i, e), i = s;
  }
};
}
