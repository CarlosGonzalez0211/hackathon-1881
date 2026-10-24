/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 892906:893714.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1465(scope) {
scope.adaptiveDPR = class adaptiveDPR {
  constructor(e) {
    scope.oe(this, scope.hi);
    scope.oe(this, scope.Ks, null);
    scope.oe(this, scope.ta, 2);
    scope.oe(this, scope.fs, 0);
    scope.oe(this, scope.ia, 4);
    scope.oe(this, scope.na, 5);
    scope.oe(this, scope.sa, 30);
    scope.oe(this, scope.ra, 60);
    scope.oe(this, scope.Js, .1);
    scope.oe(this, scope.Zs, .6);
    scope.oe(this, scope.aa, 4);
    scope.oe(this, scope.Ki, []);
    scope.oe(this, scope.kn, 0);
    scope.oe(this, scope.ps, 0);
    scope.oe(this, scope.Fi, 1);
    scope.oe(this, scope.zn, 0);
    scope.ze(this, scope.Ks, e);
  }
  get hasRun() {
    return scope.L(this, scope.zn) !== 0;
  }
  get multiplier() {
    return scope.L(this, scope.Fi);
  }
  start() {
    this.stop(), scope.ze(this, scope.fs, scope.renderInfo.time + scope.L(this, scope.ta)), scope.ze(this, scope.zn, scope.L(this, scope.fs)), scope.events$1.on("average_fps_update", scope.Ee(this, scope.hi, scope.Na), this), scope.events$1.on("adaptive_dpr_force", scope.Ee(this, scope.hi, scope.bs), this), scope.events$1.on("adaptive_dpr_renderinfo_report", scope.Ee(this, scope.hi, scope.Oa), this);
  }
  stop() {
    scope.L(this, scope.Ki).length = 0, scope.events$1.off("average_fps_update", scope.Ee(this, scope.hi, scope.Na), this), scope.events$1.off("adaptive_dpr_force", scope.Ee(this, scope.hi, scope.bs), this), scope.events$1.off("adaptive_dpr_renderinfo_report", scope.Ee(this, scope.hi, scope.Oa), this);
  }
};
}
