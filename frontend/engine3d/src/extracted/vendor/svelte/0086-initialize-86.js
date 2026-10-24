/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 6863:7804.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0086(scope) {
scope.Ss = new WeakMap(), scope.Kn = new WeakMap(), scope.hn = new WeakMap(), scope.Cs = new WeakMap(), scope.Es = new WeakMap(), scope.Sn = new WeakMap(), scope.Jn = new WeakMap(), scope.En = new WeakMap(), scope.dn = new WeakMap(), scope.Zn = new WeakMap(), scope.Ts = new WeakMap(), scope.Ms = new WeakMap(), scope.Ti = new WeakSet(), scope.no = function (e) {
  var p;
  e.f ^= scope.CLEAN;
  for (var i = e.first; i !== null;) {
    var s = i.f,
      a = (s & (scope.BRANCH_EFFECT | scope.ROOT_EFFECT)) !== 0,
      o = a && (s & scope.CLEAN) !== 0,
      l = o || (s & scope.INERT) !== 0 || this.skipped_effects.has(i);
    if (!l && i.fn !== null) {
      if (a) i.f ^= scope.CLEAN;else if ((s & scope.EFFECT) !== 0) scope.L(this, scope.dn).push(i);else if ((s & scope.CLEAN) === 0) if ((s & scope.ASYNC) !== 0) {
        var c = (p = i.b) != null && p.pending ? scope.L(this, scope.Jn) : scope.L(this, scope.Sn);
        c.push(i);
      } else scope.is_dirty(i) && ((i.f & scope.BLOCK_EFFECT) !== 0 && scope.L(this, scope.Zn).push(i), scope.update_effect(i));
      var h = i.first;
      if (h !== null) {
        i = h;
        continue;
      }
    }
    var d = i.parent;
    for (i = i.next; i === null && d !== null;) i = d.next, d = d.parent;
  }
}, scope.Ir = function (e) {
  for (const i of e) ((i.f & scope.DIRTY) !== 0 ? scope.L(this, scope.Ts) : scope.L(this, scope.Ms)).push(i), scope.set_signal_status(i, scope.CLEAN);
  e.length = 0;
}, scope.ga = function () {
  if (!scope.L(this, scope.Es)) for (const e of scope.L(this, scope.Kn)) e();
  scope.L(this, scope.Kn).clear();
};
}
