/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 729668:735326.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1212(scope) {
scope.audioController$1 = (scope.cs = class {
  constructor({
    camera: e = null,
    volume: i = 1,
    muted: s = !0
  } = {}) {
    scope.oe(this, scope.Nt);
    scope.oe(this, scope.$i, null);
    scope.oe(this, scope.xi, 1);
    scope.oe(this, scope.Xi, 0);
    scope.oe(this, scope.bi, !0);
    scope.oe(this, scope.Yi, scope.client$1.visible);
    scope.oe(this, scope.Yt, new scope.AudioListener());
    scope.oe(this, scope.ei, new Map());
    scope.oe(this, scope.qr, .1);
    scope.oe(this, scope.Ns, 0);
    scope.oe(this, scope.Os, !0);
    scope.oe(this, scope.Fn, !1);
    scope.ze(this, scope.$i, e), scope.L(this, scope.$i) && scope.L(this, scope.$i).add(scope.L(this, scope.Yt)), scope.ze(this, scope.xi, Math.max(0, i)), scope.ze(this, scope.bi, s), scope.L(this, scope.Yt).setMasterVolume(scope.L(this, scope.Xi)), scope.events$1.on("visibility_change", scope.Ee(this, scope.Nt, scope.Ma), this), scope.events$1.on("audio_mute_toggle", scope.Ee(this, scope.Nt, scope.Ia), this), scope.events$1.on("audio_global_volume", scope.Ee(this, scope.Nt, scope.Ba), this), scope.events$1.on("prerender", scope.Ee(this, scope.Nt, scope.Da), this), scope.audiocontext.contextReady.then(() => {
      scope.L(this, scope.bi) && scope.events$1.emit("audio_mute_toggle"), scope.Ee(this, scope.Nt, scope.ln).call(this, scope.L(this, scope.xi), 3);
    }).catch(() => {
      console.warn("audio failed to set volume");
    });
  }
  static constantToTime(e = 0, i = 1, s = .01, a = .001) {
    const o = i !== 0 ? s * Math.log(Math.abs(i - e) / a / i) : s * Math.log(e / a);
    return Math.max(a, o);
  }
  static timeToConstant(e = 0, i = 1, s = 1, a = .001) {
    const o = i !== 0 ? s / Math.log(Math.abs(i - e) / a / i) : s / Math.log(e / a);
    return Math.max(a, o);
  }
  get listener() {
    return scope.L(this, scope.Yt);
  }
  get muted() {
    return scope.L(this, scope.bi);
  }
  addAudio({
    name: e = "default",
    url: i,
    volume: s = 1,
    autoPlay: a = !1,
    loop: o = !1,
    playbackRate: l = 1,
    offset: c = 0,
    sync: h = !1,
    syncOffset: d = 0,
    minTimeBetweenPlays: p = 0
  } = {}) {
    return scope.Ee(this, scope.Nt, scope.Ra).call(this, {
      name: e,
      url: i,
      volume: s,
      autoPlay: a,
      loop: o,
      playbackRate: l,
      offset: c,
      sync: h,
      syncOffset: d,
      minTimeBetweenPlays: p
    });
  }
  addPositionalAudio({
    name: e = "default",
    url: i,
    volume: s = 1,
    autoPlay: a = !0,
    loop: o = !0,
    playbackRate: l = 1,
    offset: c = 0,
    sync: h = !1,
    syncOffset: d = 0,
    minTimeBetweenPlays: p = 0,
    refDistance: f = 1,
    rolloffFactor: _ = 1,
    distanceModel: x = "inverse",
    maxDistance: b = 1e4,
    directionalCone: T = [360, 0, 0]
  } = {}) {
    return scope.Ee(this, scope.Nt, scope.Ra).call(this, {
      name: e,
      url: i,
      volume: s,
      autoPlay: a,
      loop: o,
      playbackRate: l,
      offset: c,
      sync: h,
      syncOffset: d,
      minTimeBetweenPlays: p,
      positional: {
        refDistance: f,
        rolloffFactor: _,
        distanceModel: x,
        maxDistance: b,
        directionalCone: T
      }
    });
  }
  playAudio(e = "default", i = 0) {
    const s = scope.L(this, scope.ei).get(e);
    !s || !scope.audiocontext.isRunning || scope.renderInfo.time - s._timeLastPlayed > s._minTimeBetweenPlays && (s._timeLastPlayed = scope.renderInfo.time, s.stop().play(i));
  }
  pauseAudio(e = "default") {
    const i = scope.L(this, scope.ei).get(e);
    !i || !scope.audiocontext.isRunning || i.pause();
  }
  stopAudio(e = "default") {
    const i = scope.L(this, scope.ei).get(e);
    !i || !scope.audiocontext.isRunning || i.stop();
  }
  setAudioVolume(e = "default", i = 1) {
    const s = scope.L(this, scope.ei).get(e);
    s && (s.individualVolume = Math.max(0, i), s.setVolume(s.individualVolume));
  }
  setFilter(e) {
    scope.L(this, scope.Yt).setFilter(e);
  }
  getFilter() {
    return scope.L(this, scope.Yt).getFilter();
  }
  removeFilter() {
    scope.L(this, scope.Yt).removeFilter();
  }
  async dispose({
    delay: e = 0,
    duration: i = .35
  } = {}) {
    scope.events$1.off("audio_global_volume", scope.Ee(this, scope.Nt, scope.Ba), this), e > 0 && (await scope.miscutils.wait(e)), scope.ze(this, scope.xi, 0), scope.Ee(this, scope.Nt, scope.ln).call(this, scope.L(this, scope.xi), i), i > 0 && (await scope.miscutils.wait(i)), scope.events$1.off("visibility_change", scope.Ee(this, scope.Nt, scope.Ma), this), scope.events$1.off("audio_mute_toggle", scope.Ee(this, scope.Nt, scope.Ia), this), scope.events$1.off("prerender", scope.Ee(this, scope.Nt, scope.Da), this), scope.L(this, scope.ei) && (scope.L(this, scope.ei).forEach(s => {
      s.stop(), s.disconnect(), s.source = null, s.buffer = null;
    }), scope.L(this, scope.ei).clear(), scope.ze(this, scope.ei, null)), scope.L(this, scope.Yt) && (scope.L(this, scope.$i) && scope.L(this, scope.$i).remove(scope.L(this, scope.Yt)), scope.L(this, scope.Yt).gain.disconnect(scope.audiocontext.context.destination)), scope.ze(this, scope.$i, null), scope.ze(this, scope.Yt, null), scope.ze(this, scope.Fn, !0);
  }
}, scope.$i = new WeakMap(), scope.xi = new WeakMap(), scope.Xi = new WeakMap(), scope.bi = new WeakMap(), scope.Yi = new WeakMap(), scope.Yt = new WeakMap(), scope.ei = new WeakMap(), scope.qr = new WeakMap(), scope.Ns = new WeakMap(), scope.Os = new WeakMap(), scope.Fn = new WeakMap(), scope.Nt = new WeakSet(), scope.ln = function (e = 1, i = 1.5) {
  if (scope.L(this, scope.Fn)) return;
  let s = e;
  if ((!scope.audiocontext.contextStarted || !scope.L(this, scope.Yi) || scope.L(this, scope.bi)) && (s = 0), s === scope.L(this, scope.Xi)) return;
  scope.ze(this, scope.Xi, Math.max(0, s));
  const a = Math.max(.1, scope.audiocontext.context.currentTime),
    o = scope.L(this, scope.Os) && scope.L(this, scope.Xi) > 0;
  o && scope.ze(this, scope.Os, !1);
  const l = Math.max(.01, o ? 3 : i),
    c = scope.cs.timeToConstant(scope.L(this, scope.Yt).gain.gain.value, scope.L(this, scope.Xi), l);
  scope.L(this, scope.Yt).gain.gain.setTargetAtTime(scope.L(this, scope.Xi), a, c);
}, scope.Ma = function (e) {
  e ? scope.L(this, scope.Yi) || (scope.ze(this, scope.Yi, !0), scope.Ee(this, scope.Nt, scope.ln).call(this, scope.L(this, scope.xi), 2)) : scope.L(this, scope.Yi) && (scope.ze(this, scope.Yi, !1), scope.Ee(this, scope.Nt, scope.ln).call(this, 0, 1.5));
}, scope.Ia = function () {
  scope.ze(this, scope.bi, !scope.L(this, scope.bi)), scope.L(this, scope.bi) ? scope.Ee(this, scope.Nt, scope.ln).call(this, 0, 1) : scope.Ee(this, scope.Nt, scope.ln).call(this, scope.L(this, scope.xi), 1), scope.events$1.emit("audio_update_mute", scope.L(this, scope.bi));
}, scope.Ba = function (e = {}) {
  let i = 1,
    s = .2;
  typeof e == "number" ? i = e : typeof e == "object" && (i = typeof e.volume == "number" ? e.volume : 1, s = typeof e.time == "number" ? e.time : .2), scope.ze(this, scope.xi, Math.max(0, i)), scope.Ee(this, scope.Nt, scope.ln).call(this, scope.L(this, scope.xi), s);
}, scope.Da = function () {
  if (!scope.L(this, scope.Yi) || !scope.audiocontext.isRunning) return;
  const e = scope.renderInfo.time - scope.audiocontext.context.currentTime,
    i = Math.abs(e - scope.L(this, scope.Ns)) > scope.L(this, scope.qr);
  scope.L(this, scope.ei).forEach(s => {
    s && i && s._animationSync && (s.pause(), s._progress = (scope.renderInfo.time + s._animationSyncOffset) * s.playbackRate % (s.duration || s.buffer.duration), s.play());
  }), i && scope.ze(this, scope.Ns, e);
}, scope.Ra = async function ({
  name: e,
  url: i,
  volume: s,
  autoPlay: a,
  loop: o,
  playbackRate: l,
  offset: c,
  sync: h,
  syncOffset: d,
  minTimeBetweenPlays: p,
  positional: f = null
} = {}) {
  if (scope.L(this, scope.ei).has(e)) throw new Error(`audio ${e} already exists`);
  scope.L(this, scope.ei).set(e, null);
  try {
    const _ = await scope.audiobufferLoader.load(i);
    if (!_ || scope.L(this, scope.Fn)) return;
    const x = new (f ? scope.PositionalAudio : scope.Audio)(scope.L(this, scope.Yt));
    if (x.setBuffer(_), x.setLoop(o), x.setPlaybackRate(l), x.offset = c, x._animationSync = h, x._animationSyncOffset = d, x._minTimeBetweenPlays = p, x._timeLastPlayed = 0, f && (x.setRefDistance(f.refDistance), x.setRolloffFactor(f.rolloffFactor), x.setDistanceModel(f.distanceModel), x.setMaxDistance(f.maxDistance), x.setDirectionalCone(...f.directionalCone)), x.individualVolume = Math.max(0, s), x.setVolume(x.individualVolume), await scope.audiocontext.contextReady.then(() => scope.miscutils.wait(.5)), scope.L(this, scope.Fn)) throw new Error(`audio controller disposed during audio "${e}" creation.`);
    return a && scope.audiocontext.isRunning && !x.isPlaying && x.play(), scope.L(this, scope.ei).set(e, x), x;
  } catch (_) {
    console.log(_);
  }
}, scope.cs);
}
