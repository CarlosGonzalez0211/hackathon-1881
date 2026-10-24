/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 285167:285690.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0768(scope) {
scope.Clock = class Clock {
  constructor(e = !0) {
    this.autoStart = e, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = !1;
  }
  start() {
    this.startTime = performance.now(), this.oldTime = this.startTime, this.elapsedTime = 0, this.running = !0;
  }
  stop() {
    this.getElapsedTime(), this.running = !1, this.autoStart = !1;
  }
  getElapsedTime() {
    return this.getDelta(), this.elapsedTime;
  }
  getDelta() {
    let e = 0;
    if (this.autoStart && !this.running) return this.start(), 0;
    if (this.running) {
      const i = performance.now();
      e = (i - this.oldTime) / 1e3, this.oldTime = i, this.elapsedTime += e;
    }
    return e;
  }
};
}
