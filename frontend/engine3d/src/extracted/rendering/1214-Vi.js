/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 735369:735809.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1214(scope) {
scope.Vi = class Vi {
  constructor() {
    scope.oe(this, scope.qn);
    scope.Ye(this, "stick1", new scope.Vector2());
    scope.Ye(this, "stick2", new scope.Vector2());
    scope.Ye(this, "buttons", Array(4).fill(!1));
    scope.Ye(this, "boundUpdate", scope.Ee(this, scope.qn, scope.mo).bind(this));
  }
  static controlDeadZone(e = 0) {
    return e * scope.math.smoothstep(Vi.DEADZONE[0], Vi.DEADZONE[1], Math.abs(e));
  }
  init() {
    scope.client$1.capabilities.gamepad && scope.events$1.on("prerender", this.boundUpdate);
  }
  dispose() {
    scope.events$1.off("prerender", this.boundUpdate), scope.Ee(this, scope.qn, scope.Pa).call(this);
  }
};
}
