/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 4877:6862.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0085(scope) {
scope.Fr = class Fr {
  constructor() {
    scope.oe(this, scope.Ti);
    scope.Ye(this, "current", new Map());
    scope.oe(this, scope.Ss, new Map());
    scope.oe(this, scope.Kn, new Set());
    scope.oe(this, scope.hn, 0);
    scope.oe(this, scope.Cs, null);
    scope.oe(this, scope.Es, !1);
    scope.oe(this, scope.Sn, []);
    scope.oe(this, scope.Jn, []);
    scope.oe(this, scope.En, []);
    scope.oe(this, scope.dn, []);
    scope.oe(this, scope.Zn, []);
    scope.oe(this, scope.Ts, []);
    scope.oe(this, scope.Ms, []);
    scope.Ye(this, "skipped_effects", new Set());
  }
  process(e) {
    var a;
    scope.queued_root_effects = [];
    for (const o of e) scope.Ee(this, scope.Ti, scope.no).call(this, o);
    if (scope.L(this, scope.Sn).length === 0 && scope.L(this, scope.hn) === 0) {
      scope.Ee(this, scope.Ti, scope.ga).call(this);
      var i = scope.L(this, scope.En),
        s = scope.L(this, scope.dn);
      scope.ze(this, scope.En, []), scope.ze(this, scope.dn, []), scope.ze(this, scope.Zn, []), scope.current_batch = null, scope.flush_queued_effects(i), scope.flush_queued_effects(s), scope.current_batch === null ? scope.current_batch = this : scope.batches.delete(this), (a = scope.L(this, scope.Cs)) == null || a.resolve();
    } else scope.Ee(this, scope.Ti, scope.Ir).call(this, scope.L(this, scope.En)), scope.Ee(this, scope.Ti, scope.Ir).call(this, scope.L(this, scope.dn)), scope.Ee(this, scope.Ti, scope.Ir).call(this, scope.L(this, scope.Zn));
    for (const o of scope.L(this, scope.Sn)) scope.update_effect(o);
    for (const o of scope.L(this, scope.Jn)) scope.update_effect(o);
    scope.ze(this, scope.Sn, []), scope.ze(this, scope.Jn, []);
  }
  capture(e, i) {
    scope.L(this, scope.Ss).has(e) || scope.L(this, scope.Ss).set(e, i), this.current.set(e, e.v);
  }
  activate() {
    scope.current_batch = this;
  }
  deactivate() {
    scope.current_batch = null;
    for (const e of scope.effect_pending_updates) if (scope.effect_pending_updates.delete(e), e(), scope.current_batch !== null) break;
  }
  neuter() {
    scope.ze(this, scope.Es, !0);
  }
  flush() {
    scope.queued_root_effects.length > 0 ? scope.flush_effects() : scope.Ee(this, scope.Ti, scope.ga).call(this), scope.current_batch === this && (scope.L(this, scope.hn) === 0 && scope.batches.delete(this), this.deactivate());
  }
  increment() {
    scope.ze(this, scope.hn, scope.L(this, scope.hn) + 1);
  }
  decrement() {
    if (scope.ze(this, scope.hn, scope.L(this, scope.hn) - 1), scope.L(this, scope.hn) === 0) {
      for (const e of scope.L(this, scope.Ts)) scope.set_signal_status(e, scope.DIRTY), scope.schedule_effect(e);
      for (const e of scope.L(this, scope.Ms)) scope.set_signal_status(e, scope.MAYBE_DIRTY), scope.schedule_effect(e);
      scope.ze(this, scope.En, []), scope.ze(this, scope.dn, []), this.flush();
    } else this.deactivate();
  }
  add_callback(e) {
    scope.L(this, scope.Kn).add(e);
  }
  settled() {
    return (scope.L(this, scope.Cs) ?? scope.ze(this, scope.Cs, scope.deferred())).promise;
  }
  static ensure() {
    if (scope.current_batch === null) {
      const e = scope.current_batch = new Fr();
      scope.batches.add(scope.current_batch), Fr.enqueue(() => {
        scope.current_batch === e && e.flush();
      });
    }
    return scope.current_batch;
  }
  static enqueue(e) {
    scope.tasks.length === 0 && queueMicrotask(scope.dequeue), scope.tasks.unshift(e);
  }
};
}
