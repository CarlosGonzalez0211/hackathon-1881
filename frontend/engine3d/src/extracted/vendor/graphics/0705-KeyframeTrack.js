/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 256830:260634.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0705(scope) {
scope.KeyframeTrack = class KeyframeTrack {
  constructor(e, i, s, a) {
    if (e === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
    if (i === void 0 || i.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + e);
    this.name = e, this.times = scope.convertArray(i, this.TimeBufferType), this.values = scope.convertArray(s, this.ValueBufferType), this.setInterpolation(a || this.DefaultInterpolation);
  }
  static toJSON(e) {
    const i = e.constructor;
    let s;
    if (i.toJSON !== this.toJSON) s = i.toJSON(e);else {
      s = {
        name: e.name,
        times: scope.convertArray(e.times, Array),
        values: scope.convertArray(e.values, Array)
      };
      const a = e.getInterpolation();
      a !== e.DefaultInterpolation && (s.interpolation = a);
    }
    return s.type = e.ValueTypeName, s;
  }
  InterpolantFactoryMethodDiscrete(e) {
    return new scope.DiscreteInterpolant(this.times, this.values, this.getValueSize(), e);
  }
  InterpolantFactoryMethodLinear(e) {
    return new scope.LinearInterpolant(this.times, this.values, this.getValueSize(), e);
  }
  InterpolantFactoryMethodSmooth(e) {
    return new scope.CubicInterpolant(this.times, this.values, this.getValueSize(), e);
  }
  setInterpolation(e) {
    let i;
    switch (e) {
      case scope.InterpolateDiscrete:
        i = this.InterpolantFactoryMethodDiscrete;
        break;
      case scope.InterpolateLinear:
        i = this.InterpolantFactoryMethodLinear;
        break;
      case scope.InterpolateSmooth:
        i = this.InterpolantFactoryMethodSmooth;
        break;
    }
    if (i === void 0) {
      const s = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
      if (this.createInterpolant === void 0) if (e !== this.DefaultInterpolation) this.setInterpolation(this.DefaultInterpolation);else throw new Error(s);
      return console.warn("THREE.KeyframeTrack:", s), this;
    }
    return this.createInterpolant = i, this;
  }
  getInterpolation() {
    switch (this.createInterpolant) {
      case this.InterpolantFactoryMethodDiscrete:
        return scope.InterpolateDiscrete;
      case this.InterpolantFactoryMethodLinear:
        return scope.InterpolateLinear;
      case this.InterpolantFactoryMethodSmooth:
        return scope.InterpolateSmooth;
    }
  }
  getValueSize() {
    return this.values.length / this.times.length;
  }
  shift(e) {
    if (e !== 0) {
      const i = this.times;
      for (let s = 0, a = i.length; s !== a; ++s) i[s] += e;
    }
    return this;
  }
  scale(e) {
    if (e !== 1) {
      const i = this.times;
      for (let s = 0, a = i.length; s !== a; ++s) i[s] *= e;
    }
    return this;
  }
  trim(e, i) {
    const s = this.times,
      a = s.length;
    let o = 0,
      l = a - 1;
    for (; o !== a && s[o] < e;) ++o;
    for (; l !== -1 && s[l] > i;) --l;
    if (++l, o !== 0 || l !== a) {
      o >= l && (l = Math.max(l, 1), o = l - 1);
      const c = this.getValueSize();
      this.times = s.slice(o, l), this.values = this.values.slice(o * c, l * c);
    }
    return this;
  }
  validate() {
    let e = !0;
    const i = this.getValueSize();
    i - Math.floor(i) !== 0 && (console.error("THREE.KeyframeTrack: Invalid value size in track.", this), e = !1);
    const s = this.times,
      a = this.values,
      o = s.length;
    o === 0 && (console.error("THREE.KeyframeTrack: Track is empty.", this), e = !1);
    let l = null;
    for (let c = 0; c !== o; c++) {
      const h = s[c];
      if (typeof h == "number" && isNaN(h)) {
        console.error("THREE.KeyframeTrack: Time is not a valid number.", this, c, h), e = !1;
        break;
      }
      if (l !== null && l > h) {
        console.error("THREE.KeyframeTrack: Out of order keys.", this, c, h, l), e = !1;
        break;
      }
      l = h;
    }
    if (a !== void 0 && scope.isTypedArray(a)) for (let c = 0, h = a.length; c !== h; ++c) {
      const d = a[c];
      if (isNaN(d)) {
        console.error("THREE.KeyframeTrack: Value is not a valid number.", this, c, d), e = !1;
        break;
      }
    }
    return e;
  }
  optimize() {
    const e = this.times.slice(),
      i = this.values.slice(),
      s = this.getValueSize(),
      a = this.getInterpolation() === scope.InterpolateSmooth,
      o = e.length - 1;
    let l = 1;
    for (let c = 1; c < o; ++c) {
      let h = !1;
      const d = e[c],
        p = e[c + 1];
      if (d !== p && (c !== 1 || d !== e[0])) if (a) h = !0;else {
        const f = c * s,
          _ = f - s,
          x = f + s;
        for (let b = 0; b !== s; ++b) {
          const T = i[f + b];
          if (T !== i[_ + b] || T !== i[x + b]) {
            h = !0;
            break;
          }
        }
      }
      if (h) {
        if (c !== l) {
          e[l] = e[c];
          const f = c * s,
            _ = l * s;
          for (let x = 0; x !== s; ++x) i[_ + x] = i[f + x];
        }
        ++l;
      }
    }
    if (o > 0) {
      e[l] = e[o];
      for (let c = o * s, h = l * s, d = 0; d !== s; ++d) i[h + d] = i[c + d];
      ++l;
    }
    return l !== e.length ? (this.times = e.slice(0, l), this.values = i.slice(0, l * s)) : (this.times = e, this.values = i), this;
  }
  clone() {
    const e = this.times.slice(),
      i = this.values.slice(),
      s = this.constructor,
      a = new s(this.name, e, i);
    return a.createInterpolant = this.createInterpolant, a;
  }
};
}
