/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 305184:310623.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0799(scope) {
scope.AnimationAction = class AnimationAction {
  constructor(e, i, s = null, a = i.blendMode) {
    this._mixer = e, this._clip = i, this._localRoot = s, this.blendMode = a;
    const o = i.tracks,
      l = o.length,
      c = new Array(l),
      h = {
        endingStart: scope.ZeroCurvatureEnding,
        endingEnd: scope.ZeroCurvatureEnding
      };
    for (let d = 0; d !== l; ++d) {
      const p = o[d].createInterpolant(null);
      c[d] = p, p.settings = h;
    }
    this._interpolantSettings = h, this._interpolants = c, this._propertyBindings = new Array(l), this._cacheIndex = null, this._byClipCacheIndex = null, this._timeScaleInterpolant = null, this._weightInterpolant = null, this.loop = scope.LoopRepeat, this._loopCount = -1, this._startTime = null, this.time = 0, this.timeScale = 1, this._effectiveTimeScale = 1, this.weight = 1, this._effectiveWeight = 1, this.repetitions = 1 / 0, this.paused = !1, this.enabled = !0, this.clampWhenFinished = !1, this.zeroSlopeAtStart = !0, this.zeroSlopeAtEnd = !0;
  }
  play() {
    return this._mixer._activateAction(this), this;
  }
  stop() {
    return this._mixer._deactivateAction(this), this.reset();
  }
  reset() {
    return this.paused = !1, this.enabled = !0, this.time = 0, this._loopCount = -1, this._startTime = null, this.stopFading().stopWarping();
  }
  isRunning() {
    return this.enabled && !this.paused && this.timeScale !== 0 && this._startTime === null && this._mixer._isActiveAction(this);
  }
  isScheduled() {
    return this._mixer._isActiveAction(this);
  }
  startAt(e) {
    return this._startTime = e, this;
  }
  setLoop(e, i) {
    return this.loop = e, this.repetitions = i, this;
  }
  setEffectiveWeight(e) {
    return this.weight = e, this._effectiveWeight = this.enabled ? e : 0, this.stopFading();
  }
  getEffectiveWeight() {
    return this._effectiveWeight;
  }
  fadeIn(e) {
    return this._scheduleFading(e, 0, 1);
  }
  fadeOut(e) {
    return this._scheduleFading(e, 1, 0);
  }
  crossFadeFrom(e, i, s = !1) {
    if (e.fadeOut(i), this.fadeIn(i), s === !0) {
      const a = this._clip.duration,
        o = e._clip.duration,
        l = o / a,
        c = a / o;
      e.warp(1, l, i), this.warp(c, 1, i);
    }
    return this;
  }
  crossFadeTo(e, i, s = !1) {
    return e.crossFadeFrom(this, i, s);
  }
  stopFading() {
    const e = this._weightInterpolant;
    return e !== null && (this._weightInterpolant = null, this._mixer._takeBackControlInterpolant(e)), this;
  }
  setEffectiveTimeScale(e) {
    return this.timeScale = e, this._effectiveTimeScale = this.paused ? 0 : e, this.stopWarping();
  }
  getEffectiveTimeScale() {
    return this._effectiveTimeScale;
  }
  setDuration(e) {
    return this.timeScale = this._clip.duration / e, this.stopWarping();
  }
  syncWith(e) {
    return this.time = e.time, this.timeScale = e.timeScale, this.stopWarping();
  }
  halt(e) {
    return this.warp(this._effectiveTimeScale, 0, e);
  }
  warp(e, i, s) {
    const a = this._mixer,
      o = a.time,
      l = this.timeScale;
    let c = this._timeScaleInterpolant;
    c === null && (c = a._lendControlInterpolant(), this._timeScaleInterpolant = c);
    const h = c.parameterPositions,
      d = c.sampleValues;
    return h[0] = o, h[1] = o + s, d[0] = e / l, d[1] = i / l, this;
  }
  stopWarping() {
    const e = this._timeScaleInterpolant;
    return e !== null && (this._timeScaleInterpolant = null, this._mixer._takeBackControlInterpolant(e)), this;
  }
  getMixer() {
    return this._mixer;
  }
  getClip() {
    return this._clip;
  }
  getRoot() {
    return this._localRoot || this._mixer._root;
  }
  _update(e, i, s, a) {
    if (!this.enabled) {
      this._updateWeight(e);
      return;
    }
    const o = this._startTime;
    if (o !== null) {
      const h = (e - o) * s;
      h < 0 || s === 0 ? i = 0 : (this._startTime = null, i = s * h);
    }
    i *= this._updateTimeScale(e);
    const l = this._updateTime(i),
      c = this._updateWeight(e);
    if (c > 0) {
      const h = this._interpolants,
        d = this._propertyBindings;
      switch (this.blendMode) {
        case scope.AdditiveAnimationBlendMode:
          for (let p = 0, f = h.length; p !== f; ++p) h[p].evaluate(l), d[p].accumulateAdditive(c);
          break;
        case scope.NormalAnimationBlendMode:
        default:
          for (let p = 0, f = h.length; p !== f; ++p) h[p].evaluate(l), d[p].accumulate(a, c);
      }
    }
  }
  _updateWeight(e) {
    let i = 0;
    if (this.enabled) {
      i = this.weight;
      const s = this._weightInterpolant;
      if (s !== null) {
        const a = s.evaluate(e)[0];
        i *= a, e > s.parameterPositions[1] && (this.stopFading(), a === 0 && (this.enabled = !1));
      }
    }
    return this._effectiveWeight = i, i;
  }
  _updateTimeScale(e) {
    let i = 0;
    if (!this.paused) {
      i = this.timeScale;
      const s = this._timeScaleInterpolant;
      if (s !== null) {
        const a = s.evaluate(e)[0];
        i *= a, e > s.parameterPositions[1] && (this.stopWarping(), i === 0 ? this.paused = !0 : this.timeScale = i);
      }
    }
    return this._effectiveTimeScale = i, i;
  }
  _updateTime(e) {
    const i = this._clip.duration,
      s = this.loop;
    let a = this.time + e,
      o = this._loopCount;
    const l = s === scope.LoopPingPong;
    if (e === 0) return o === -1 ? a : l && (o & 1) === 1 ? i - a : a;
    if (s === scope.LoopOnce) {
      o === -1 && (this._loopCount = 0, this._setEndings(!0, !0, !1));
      e: {
        if (a >= i) a = i;else if (a < 0) a = 0;else {
          this.time = a;
          break e;
        }
        this.clampWhenFinished ? this.paused = !0 : this.enabled = !1, this.time = a, this._mixer.dispatchEvent({
          type: "finished",
          action: this,
          direction: e < 0 ? -1 : 1
        });
      }
    } else {
      if (o === -1 && (e >= 0 ? (o = 0, this._setEndings(!0, this.repetitions === 0, l)) : this._setEndings(this.repetitions === 0, !0, l)), a >= i || a < 0) {
        const c = Math.floor(a / i);
        a -= i * c, o += Math.abs(c);
        const h = this.repetitions - o;
        if (h <= 0) this.clampWhenFinished ? this.paused = !0 : this.enabled = !1, a = e > 0 ? i : 0, this.time = a, this._mixer.dispatchEvent({
          type: "finished",
          action: this,
          direction: e > 0 ? 1 : -1
        });else {
          if (h === 1) {
            const d = e < 0;
            this._setEndings(d, !d, l);
          } else this._setEndings(!1, !1, l);
          this._loopCount = o, this.time = a, this._mixer.dispatchEvent({
            type: "loop",
            action: this,
            loopDelta: c
          });
        }
      } else this.time = a;
      if (l && (o & 1) === 1) return i - a;
    }
    return a;
  }
  _setEndings(e, i, s) {
    const a = this._interpolantSettings;
    s ? (a.endingStart = scope.ZeroSlopeEnding, a.endingEnd = scope.ZeroSlopeEnding) : (e ? a.endingStart = this.zeroSlopeAtStart ? scope.ZeroSlopeEnding : scope.ZeroCurvatureEnding : a.endingStart = scope.WrapAroundEnding, i ? a.endingEnd = this.zeroSlopeAtEnd ? scope.ZeroSlopeEnding : scope.ZeroCurvatureEnding : a.endingEnd = scope.WrapAroundEnding);
  }
  _scheduleFading(e, i, s) {
    const a = this._mixer,
      o = a.time;
    let l = this._weightInterpolant;
    l === null && (l = a._lendControlInterpolant(), this._weightInterpolant = l);
    const c = l.parameterPositions,
      h = l.sampleValues;
    return c[0] = o, h[0] = i, c[1] = o + e, h[1] = s, this;
  }
};
}
