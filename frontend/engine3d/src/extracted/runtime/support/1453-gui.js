/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 890257:890508.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1453(scope) {
scope.gui = class gui {
  constructor() {
    scope.oe(this, scope.ea, null);
    scope.oe(this, scope.js, null);
    scope.oe(this, scope.qa, !1);
  }
  async init() {}
  add(e, i, s) {
    var a;
    (a = scope.L(this, scope.ea)) == null || a.add(e, i, s);
  }
  showRenderInfo(e) {
    var i;
    (i = scope.L(this, scope.js)) == null || i.add(e);
  }
  hideRenderInfo() {
    var e;
    (e = scope.L(this, scope.js)) == null || e.remove();
  }
};
}
