/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 262657:266002.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0732(scope) {
scope.AnimationClip = class AnimationClip {
  constructor(e = "", i = -1, s = [], a = scope.NormalAnimationBlendMode) {
    this.name = e, this.tracks = s, this.duration = i, this.blendMode = a, this.uuid = scope.generateUUID(), this.userData = {}, this.duration < 0 && this.resetDuration();
  }
  static parse(e) {
    const i = [],
      s = e.tracks,
      a = 1 / (e.fps || 1);
    for (let l = 0, c = s.length; l !== c; ++l) i.push(scope.parseKeyframeTrack(s[l]).scale(a));
    const o = new this(e.name, e.duration, i, e.blendMode);
    return o.uuid = e.uuid, o.userData = JSON.parse(e.userData || "{}"), o;
  }
  static toJSON(e) {
    const i = [],
      s = e.tracks,
      a = {
        name: e.name,
        duration: e.duration,
        tracks: i,
        uuid: e.uuid,
        blendMode: e.blendMode,
        userData: JSON.stringify(e.userData)
      };
    for (let o = 0, l = s.length; o !== l; ++o) i.push(scope.KeyframeTrack.toJSON(s[o]));
    return a;
  }
  static CreateFromMorphTargetSequence(e, i, s, a) {
    const o = i.length,
      l = [];
    for (let c = 0; c < o; c++) {
      let h = [],
        d = [];
      h.push((c + o - 1) % o, c, (c + 1) % o), d.push(0, 1, 0);
      const p = scope.getKeyframeOrder(h);
      h = scope.sortedArray(h, 1, p), d = scope.sortedArray(d, 1, p), !a && h[0] === 0 && (h.push(o), d.push(d[0])), l.push(new scope.NumberKeyframeTrack(".morphTargetInfluences[" + i[c].name + "]", h, d).scale(1 / s));
    }
    return new this(e, -1, l);
  }
  static findByName(e, i) {
    let s = e;
    if (!Array.isArray(e)) {
      const a = e;
      s = a.geometry && a.geometry.animations || a.animations;
    }
    for (let a = 0; a < s.length; a++) if (s[a].name === i) return s[a];
    return null;
  }
  static CreateClipsFromMorphTargetSequences(e, i, s) {
    const a = {},
      o = /^([\w-]*?)([\d]+)$/;
    for (let c = 0, h = e.length; c < h; c++) {
      const d = e[c],
        p = d.name.match(o);
      if (p && p.length > 1) {
        const f = p[1];
        let _ = a[f];
        _ || (a[f] = _ = []), _.push(d);
      }
    }
    const l = [];
    for (const c in a) l.push(this.CreateFromMorphTargetSequence(c, a[c], i, s));
    return l;
  }
  static parseAnimation(e, i) {
    if (console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"), !e) return console.error("THREE.AnimationClip: No animation in JSONLoader data."), null;
    const s = function (f, _, x, b, T) {
        if (x.length !== 0) {
          const M = [],
            w = [];
          scope.flattenJSON(x, M, w, b), M.length !== 0 && T.push(new f(_, M, w));
        }
      },
      a = [],
      o = e.name || "default",
      l = e.fps || 30,
      c = e.blendMode;
    let h = e.length || -1;
    const d = e.hierarchy || [];
    for (let f = 0; f < d.length; f++) {
      const _ = d[f].keys;
      if (!(!_ || _.length === 0)) if (_[0].morphTargets) {
        const x = {};
        let b;
        for (b = 0; b < _.length; b++) if (_[b].morphTargets) for (let T = 0; T < _[b].morphTargets.length; T++) x[_[b].morphTargets[T]] = -1;
        for (const T in x) {
          const M = [],
            w = [];
          for (let D = 0; D !== _[b].morphTargets.length; ++D) {
            const R = _[b];
            M.push(R.time), w.push(R.morphTarget === T ? 1 : 0);
          }
          a.push(new scope.NumberKeyframeTrack(".morphTargetInfluence[" + T + "]", M, w));
        }
        h = x.length * l;
      } else {
        const x = ".bones[" + i[f].name + "]";
        s(scope.VectorKeyframeTrack, x + ".position", _, "pos", a), s(scope.QuaternionKeyframeTrack, x + ".quaternion", _, "rot", a), s(scope.VectorKeyframeTrack, x + ".scale", _, "scl", a);
      }
    }
    return a.length === 0 ? null : new this(o, h, a, c);
  }
  resetDuration() {
    const e = this.tracks;
    let i = 0;
    for (let s = 0, a = e.length; s !== a; ++s) {
      const o = this.tracks[s];
      i = Math.max(i, o.times[o.times.length - 1]);
    }
    return this.duration = i, this;
  }
  trim() {
    for (let e = 0; e < this.tracks.length; e++) this.tracks[e].trim(0, this.duration);
    return this;
  }
  validate() {
    let e = !0;
    for (let i = 0; i < this.tracks.length; i++) e = e && this.tracks[i].validate();
    return e;
  }
  optimize() {
    for (let e = 0; e < this.tracks.length; e++) this.tracks[e].optimize();
    return this;
  }
  clone() {
    const e = [];
    for (let s = 0; s < this.tracks.length; s++) e.push(this.tracks[s].clone());
    const i = new this.constructor(this.name, this.duration, e, this.blendMode);
    return i.userData = JSON.parse(JSON.stringify(this.userData)), i;
  }
  toJSON() {
    return this.constructor.toJSON(this);
  }
};
}
