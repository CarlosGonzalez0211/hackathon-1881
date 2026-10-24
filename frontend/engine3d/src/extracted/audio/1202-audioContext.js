/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 727116:727818.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1202(scope) {
scope.audioContext = class audioContext {
  constructor() {
    scope.oe(this, scope.fi);
    scope.oe(this, scope.ls, null);
    scope.oe(this, scope.qi, scope.Ee(this, scope.fi, scope.Ea).bind(this));
    scope.Ye(this, "context", scope.AudioContext.getContext());
    scope.Ye(this, "contextReady", scope.miscutils.deferred());
    scope.Ye(this, "contextStarted", !1);
  }
  get isRunning() {
    return this.context.state === scope.STATES.RUNNING;
  }
  init() {
    this.isRunning ? scope.Ee(this, scope.fi, scope.Ea).call(this) : scope.Ee(this, scope.fi, scope.po).call(this), scope.events$1.on("visibility_change", scope.Ee(this, scope.fi, scope.Ta), this);
  }
  dispose() {
    scope.Ee(this, scope.fi, scope.Ca).call(this), scope.__lifecycle.clearTimeout(scope.L(this, scope.ls)), scope.events$1.off("visibility_change", scope.Ee(this, scope.fi, scope.Ta), this), this.contextReady.reject(), this.contextReady = scope.miscutils.deferred(), this.context.close(), this.contextStarted = !1, scope.AudioContext.setContext(void 0), this.context = scope.AudioContext.getContext();
  }
};
}
