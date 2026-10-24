/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 922583:923787.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1515(scope) {
scope.Timer = class {
  constructor() {
    this.startTime = performance.now(), this.previousTime = 0, this.currentTime = 0, this._delta = 0, this._elapsed = 0, this._fixedDelta = 1e3 / 60, this.timescale = 1, this.useFixedDelta = !1, this._autoReset = !1;
  }
  get autoReset() {
    return this._autoReset;
  }
  set autoReset(r) {
    typeof document < "u" && document.hidden !== void 0 && (r ? scope.__lifecycle.listen(document, "visibilitychange", this) : scope.__lifecycle.unlisten(document, "visibilitychange", this), this._autoReset = r);
  }
  get delta() {
    return this._delta * scope.MILLISECONDS_TO_SECONDS;
  }
  get fixedDelta() {
    return this._fixedDelta * scope.MILLISECONDS_TO_SECONDS;
  }
  set fixedDelta(r) {
    this._fixedDelta = r * scope.SECONDS_TO_MILLISECONDS;
  }
  get elapsed() {
    return this._elapsed * scope.MILLISECONDS_TO_SECONDS;
  }
  update(r) {
    this.useFixedDelta ? this._delta = this.fixedDelta : (this.previousTime = this.currentTime, this.currentTime = (r !== void 0 ? r : performance.now()) - this.startTime, this._delta = this.currentTime - this.previousTime), this._delta *= this.timescale, this._elapsed += this._delta;
  }
  reset() {
    this._delta = 0, this._elapsed = 0, this.currentTime = performance.now() - this.startTime;
  }
  getDelta() {
    return this.delta;
  }
  getElapsed() {
    return this.elapsed;
  }
  handleEvent(r) {
    document.hidden || (this.currentTime = performance.now() - this.startTime);
  }
  dispose() {
    this.autoReset = !1;
  }
};
}
