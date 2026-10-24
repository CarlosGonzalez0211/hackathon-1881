/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 735810:736693.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1215(scope) {
scope.qn = new WeakSet(), scope.Pa = function () {
  this.stick1.set(0, 0), this.stick2.set(0, 0), this.buttons.fill(!1);
}, scope.mo = function () {
  const e = this.stick1.toArray(),
    i = this.stick2.toArray(),
    s = this.buttons.slice();
  scope.Ee(this, scope.qn, scope.Pa).call(this);
  const o = navigator.getGamepads().find(l => l == null ? void 0 : l.connected);
  if (o && (o.axes.length >= 2 && (this.stick1.x = scope.Vi.controlDeadZone(o.axes[0]), this.stick1.y = scope.Vi.controlDeadZone(o.axes[1]), this.stick1.multiplyScalar(-1), o.axes.length >= 4 && (this.stick2.x = scope.Vi.controlDeadZone(o.axes[2]), this.stick2.y = scope.Vi.controlDeadZone(o.axes[3]), this.stick1.multiplyScalar(-1))), o.buttons.length > 0)) {
    const l = Math.min(this.buttons.length, o.buttons.length);
    for (let c = 0; c < l; c++) this.buttons[c] = o.buttons[c].pressed;
  }
  (!this.stick1.equals(scope._v20.fromArray(e)) || !this.stick2.equals(scope._v20.fromArray(i)) || !this.buttons.every((l, c) => l === s[c])) && scope.events$1.emit("gamepad_update", this);
}, scope.Ye(scope.Vi, "DEADZONE", [.15, .25]);
}
