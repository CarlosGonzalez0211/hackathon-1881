/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 892361:892724.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1462(scope) {
scope.keys = class keys {
  constructor() {
    scope.oe(this, scope.As);
    scope.Ye(this, "boundKeyDown", scope.Ee(this, scope.As, scope.xo).bind(this));
    scope.Ye(this, "boundKeyUp", scope.Ee(this, scope.As, scope.yo).bind(this));
  }
  init() {
    scope.__lifecycle.listen(window, "keydown", this.boundKeyDown), scope.__lifecycle.listen(window, "keyup", this.boundKeyUp);
  }
  dispose() {
    scope.__lifecycle.unlisten(window, "keydown", this.boundKeyDown), scope.__lifecycle.unlisten(window, "keyup", this.boundKeyUp);
  }
};
}
