/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 721881:723477.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1195(scope) {
scope.jn = class jn {
  constructor(e = 0) {
    scope.oe(this, scope.Gt);
    scope.oe(this, scope.ss, new scope.Vector2());
    scope.oe(this, scope.rs, new scope.Vector2());
    scope.oe(this, scope.as, new scope.Vector2());
    scope.oe(this, scope.os, new scope.Vector2());
    scope.oe(this, scope.Fs, 0);
    this.finger = e, this.touchID = !1, this.eventID = this.finger === 0 ? "touch" : `touch${this.finger + 1}`, this.input = this.finger === 0 ? "mouse" : "touch", this.button = 0, this.position = new scope.Vector2(scope.client$1.screen.w * .5, scope.client$1.screen.h * .5), this.position01 = new scope.Vector2(.5, .5), this.position11 = new scope.Vector2(), this.delta = new scope.Vector2(), this.delta11 = new scope.Vector2(), this.dragged = new scope.Vector2(), this.dragged11 = new scope.Vector2(), this.swipeVelocity = new scope.Vector2(), scope.L(this, scope.ss).copy(this.position), scope.L(this, scope.rs).copy(this.position01), scope.L(this, scope.as).copy(this.position), scope.L(this, scope.os).copy(this.position01);
  }
  onTouchStart(e) {
    scope.ze(this, scope.Fs, scope.renderInfo.time), scope.Ee(this, scope.Gt, scope.ya).call(this, e), scope.Ee(this, scope.Gt, scope.Br).call(this, e), scope.Ee(this, scope.Gt, scope.ba).call(this), scope.Ee(this, scope.Gt, scope.Dr).call(this), scope.Ee(this, scope.Gt, scope.oo).call(this), scope.Ee(this, scope.Gt, scope.Rr).call(this), scope.events$1.emit(`${this.eventID}_start`, this);
  }
  onTouchMove(e) {
    this.touchID === !1 && scope.Ee(this, scope.Gt, scope.ya).call(this, e), scope.Ee(this, scope.Gt, scope.Br).call(this, e), scope.Ee(this, scope.Gt, scope.Dr).call(this), scope.events$1.emit(`${this.eventID}_move`, this), this.touchID !== !1 && (scope.Ee(this, scope.Gt, scope.Rr).call(this), scope.events$1.emit(`${this.eventID}_drag`, this));
  }
  onTouchEnd(e) {
    scope.Ee(this, scope.Gt, scope.Br).call(this, e), scope.Ee(this, scope.Gt, scope.Dr).call(this), scope.Ee(this, scope.Gt, scope.Rr).call(this);
    const i = Math.max(.001, scope.renderInfo.time - scope.L(this, scope.Fs));
    this.swipeVelocity.copy(this.dragged).divideScalar(i), scope.events$1.emit(`${this.eventID}_end`, this), !(this.dragged.length() >= scope.L(jn, scope.Qr) || i >= scope.L(jn, scope.Wr)) && (this.input === "mouse" && this.button !== 0 || e.type !== "pointerout" && scope.events$1.emit(`${this.eventID}_click`, this));
  }
  dispose() {}
};
}
