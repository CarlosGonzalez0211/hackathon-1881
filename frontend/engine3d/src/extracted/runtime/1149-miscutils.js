/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 678693:680333.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1149(scope) {
scope.miscutils = {
  debounce(r, e) {
    let i = null;
    return (...s) => {
      scope.__lifecycle.clearTimeout(i), i = scope.__lifecycle.setTimeout(() => r(...s), e);
    };
  },
  deferred() {
    let r = null,
      e = null;
    const i = new Promise((s, a) => {
      r = s, e = a;
    });
    return i.resolve = r, i.reject = e, i;
  },
  wait(r, e = !1) {
    return new Promise(i => {
      const s = "prerender";
      if (typeof r == "number") {
        if (e === !0) {
          const a = scope.renderInfo.frame,
            o = () => {
              scope.renderInfo.frame - a >= r && (scope.events$1.off(s, o), i());
            };
          scope.events$1.on(s, o);
        } else scope.createDelayedCall(r, i);
      } else if (r && typeof e == "string") {
        const a = () => {
          r[e] !== void 0 && (scope.events$1.off(s, a), i());
        };
        scope.events$1.on(s, a);
      } else console.warn("invalid wait"), i();
    });
  },
  nextFrame(r) {
    return new Promise(e => {
      scope.createDelayedCall(0, () => {
        e(r == null ? void 0 : r());
      });
    });
  },
  nextIdle(r) {
    return new Promise(e => {
      const i = () => {
        scope.removeFromIdle(i), e(r == null ? void 0 : r());
      };
      scope.addToIdle(i);
    });
  },
  taskIdle(r, e = 2, i = 10) {
    return new Promise(s => {
      const a = performance.now();
      let o = !1;
      const l = () => {
          scope.removeFromIdle(c), o = !0, s();
        },
        c = h => {
          const d = performance.now();
          let p = d,
            f = -1;
          for (; !o && f < e && h.timeRemaining() > 0;) r == null || r(l), p = performance.now(), f = p - d;
          !o && p - a > i * 1e3 && (console.warn("An idle task took too long to complete, aborting."), l());
        };
      scope.addToIdle(c);
    });
  },
  hasRunThisFrame(r) {
    if (!r) throw new Error("hasRunThisFrame requires an object");
    const e = r.___lastTimeFired;
    return r.___lastTimeFired = scope.renderInfo.time, e ? e === scope.renderInfo.time : !1;
  },
  loadJson(r) {
    return fetch(r).then(e => e.json()).catch(() => console.log(`Load of ${r} failed.`));
  },
  preload(r = [], e) {
    if (!(r && r.length)) return e == null || e(1), Promise.resolve();
    const i = [...new Set(r)],
      s = i.length;
    let a = 0;
    const o = async l => {
      try {
        const h = await fetch(l);
        h.ok && (await h.blob());
      } catch (h) {
        console.warn(`${h} ${l}`);
      }
      const c = ++a / s;
      e == null || e(c);
    };
    return Promise.all(i.map(l => o(l)));
  }
};
}
