/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 10437:13015.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0100(scope) {
scope.proxy = function proxy(r) {
  if (typeof r != "object" || r === null || scope.STATE_SYMBOL in r) return r;
  const e = scope.get_prototype_of(r);
  if (e !== scope.object_prototype && e !== scope.array_prototype) return r;
  var i = new Map(),
    s = scope.is_array(r),
    a = scope.state(0),
    o = scope.update_version,
    l = c => {
      if (scope.update_version === o) return c();
      var h = scope.active_reaction,
        d = scope.update_version;
      scope.set_active_reaction(null), scope.set_update_version(o);
      var p = c();
      return scope.set_active_reaction(h), scope.set_update_version(d), p;
    };
  return s && i.set("length", scope.state(r.length)), new Proxy(r, {
    defineProperty(c, h, d) {
      (!("value" in d) || d.configurable === !1 || d.enumerable === !1 || d.writable === !1) && scope.state_descriptors_fixed();
      var p = i.get(h);
      return p === void 0 ? p = l(() => {
        var f = scope.state(d.value);
        return i.set(h, f), f;
      }) : scope.set(p, d.value, !0), !0;
    },
    deleteProperty(c, h) {
      var d = i.get(h);
      if (d === void 0) {
        if (h in c) {
          const p = l(() => scope.state(scope.UNINITIALIZED));
          i.set(h, p), scope.increment(a);
        }
      } else scope.set(d, scope.UNINITIALIZED), scope.increment(a);
      return !0;
    },
    get(c, h, d) {
      var x;
      if (h === scope.STATE_SYMBOL) return r;
      var p = i.get(h),
        f = h in c;
      if (p === void 0 && (!f || (x = scope.get_descriptor(c, h)) != null && x.writable) && (p = l(() => {
        var b = scope.proxy(f ? c[h] : scope.UNINITIALIZED),
          T = scope.state(b);
        return T;
      }), i.set(h, p)), p !== void 0) {
        var _ = scope.get(p);
        return _ === scope.UNINITIALIZED ? void 0 : _;
      }
      return Reflect.get(c, h, d);
    },
    getOwnPropertyDescriptor(c, h) {
      var d = Reflect.getOwnPropertyDescriptor(c, h);
      if (d && "value" in d) {
        var p = i.get(h);
        p && (d.value = scope.get(p));
      } else if (d === void 0) {
        var f = i.get(h),
          _ = f == null ? void 0 : f.v;
        if (f !== void 0 && _ !== scope.UNINITIALIZED) return {
          enumerable: !0,
          configurable: !0,
          value: _,
          writable: !0
        };
      }
      return d;
    },
    has(c, h) {
      var _;
      if (h === scope.STATE_SYMBOL) return !0;
      var d = i.get(h),
        p = d !== void 0 && d.v !== scope.UNINITIALIZED || Reflect.has(c, h);
      if (d !== void 0 || scope.active_effect !== null && (!p || (_ = scope.get_descriptor(c, h)) != null && _.writable)) {
        d === void 0 && (d = l(() => {
          var x = p ? scope.proxy(c[h]) : scope.UNINITIALIZED,
            b = scope.state(x);
          return b;
        }), i.set(h, d));
        var f = scope.get(d);
        if (f === scope.UNINITIALIZED) return !1;
      }
      return p;
    },
    set(c, h, d, p) {
      var R;
      var f = i.get(h),
        _ = h in c;
      if (s && h === "length") for (var x = d; x < f.v; x += 1) {
        var b = i.get(x + "");
        b !== void 0 ? scope.set(b, scope.UNINITIALIZED) : x in c && (b = l(() => scope.state(scope.UNINITIALIZED)), i.set(x + "", b));
      }
      if (f === void 0) (!_ || (R = scope.get_descriptor(c, h)) != null && R.writable) && (f = l(() => scope.state(void 0)), scope.set(f, scope.proxy(d)), i.set(h, f));else {
        _ = f.v !== scope.UNINITIALIZED;
        var T = l(() => scope.proxy(d));
        scope.set(f, T);
      }
      var M = Reflect.getOwnPropertyDescriptor(c, h);
      if (M != null && M.set && M.set.call(p, d), !_) {
        if (s && typeof h == "string") {
          var w = i.get("length"),
            D = Number(h);
          Number.isInteger(D) && D >= w.v && scope.set(w, D + 1);
        }
        scope.increment(a);
      }
      return !0;
    },
    ownKeys(c) {
      scope.get(a);
      var h = Reflect.ownKeys(c).filter(f => {
        var _ = i.get(f);
        return _ === void 0 || _.v !== scope.UNINITIALIZED;
      });
      for (var [d, p] of i) p.v !== scope.UNINITIALIZED && !(d in c) && h.push(d);
      return h;
    },
    setPrototypeOf() {
      scope.state_prototype_fixed();
    }
  });
};
}
