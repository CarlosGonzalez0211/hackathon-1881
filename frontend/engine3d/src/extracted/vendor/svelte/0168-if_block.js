/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 24777:25418.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0168(scope) {
scope.if_block = function if_block(r, e, i = !1) {
  var s = r,
    a = null,
    o = null,
    l = scope.UNINITIALIZED,
    c = i ? scope.EFFECT_TRANSPARENT : 0,
    h = !1;
  const d = (x, b = !0) => {
    h = !0, _(b, x);
  };
  var p = null;
  function f() {
    p !== null && (p.lastChild.remove(), s.before(p), p = null);
    var x = l ? a : o,
      b = l ? o : a;
    x && scope.resume_effect(x), b && scope.pause_effect(b, () => {
      l ? o = null : a = null;
    });
  }
  const _ = (x, b) => {
    if (l !== (l = x)) {
      var T = scope.should_defer_append(),
        M = s;
      if (T && (p = document.createDocumentFragment(), p.append(M = scope.create_text())), l ? a ?? (a = b && scope.branch(() => b(M))) : o ?? (o = b && scope.branch(() => b(M))), T) {
        var w = scope.current_batch,
          D = l ? a : o,
          R = l ? o : a;
        D && w.skipped_effects.delete(D), R && w.skipped_effects.add(R), w.add_callback(f);
      } else f();
    }
  };
  scope.block(() => {
    h = !1, e(d), h || _(null, null);
  }, c);
};
}
