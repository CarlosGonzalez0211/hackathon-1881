/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 280112:280482.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0760(scope) {
scope.DirectionalLight = class DirectionalLight extends scope.Light {
  constructor(e, i) {
    super(e, i), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(scope.Object3D.DEFAULT_UP), this.updateMatrix(), this.target = new scope.Object3D(), this.shadow = new scope.DirectionalLightShadow();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e) {
    return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
};
}
