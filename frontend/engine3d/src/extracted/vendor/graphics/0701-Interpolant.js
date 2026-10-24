/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 254052:255307.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0701(scope) {
scope.Interpolant = class Interpolant {
  constructor(e, i, s, a) {
    this.parameterPositions = e, this._cachedIndex = 0, this.resultBuffer = a !== void 0 ? a : new i.constructor(s), this.sampleValues = i, this.valueSize = s, this.settings = null, this.DefaultSettings_ = {};
  }
  evaluate(e) {
    const i = this.parameterPositions;
    let s = this._cachedIndex,
      a = i[s],
      o = i[s - 1];
    e: {
      t: {
        let l;
        i: {
          n: if (!(e < a)) {
            for (let c = s + 2;;) {
              if (a === void 0) {
                if (e < o) break n;
                return s = i.length, this._cachedIndex = s, this.copySampleValue_(s - 1);
              }
              if (s === c) break;
              if (o = a, a = i[++s], e < a) break t;
            }
            l = i.length;
            break i;
          }
          if (!(e >= o)) {
            const c = i[1];
            e < c && (s = 2, o = c);
            for (let h = s - 2;;) {
              if (o === void 0) return this._cachedIndex = 0, this.copySampleValue_(0);
              if (s === h) break;
              if (a = o, o = i[--s - 1], e >= o) break t;
            }
            l = s, s = 0;
            break i;
          }
          break e;
        }
        for (; s < l;) {
          const c = s + l >>> 1;
          e < i[c] ? l = c : s = c + 1;
        }
        if (a = i[s], o = i[s - 1], o === void 0) return this._cachedIndex = 0, this.copySampleValue_(0);
        if (a === void 0) return s = i.length, this._cachedIndex = s, this.copySampleValue_(s - 1);
      }
      this._cachedIndex = s, this.intervalChanged_(s, o, a);
    }
    return this.interpolate_(s, o, e, a);
  }
  getSettings_() {
    return this.settings || this.DefaultSettings_;
  }
  copySampleValue_(e) {
    const i = this.resultBuffer,
      s = this.sampleValues,
      a = this.valueSize,
      o = e * a;
    for (let l = 0; l !== a; ++l) i[l] = s[o + l];
    return i;
  }
  interpolate_() {
    throw new Error("call to abstract method");
  }
  intervalChanged_() {}
};
}
