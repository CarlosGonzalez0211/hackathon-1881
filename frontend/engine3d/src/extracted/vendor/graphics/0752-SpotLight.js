/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 275870:276480.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0752(scope) {
scope.SpotLight = class SpotLight extends scope.Light {
  constructor(e, i, s = 0, a = Math.PI / 3, o = 0, l = 2) {
    super(e, i), this.isSpotLight = !0, this.type = "SpotLight", this.position.copy(scope.Object3D.DEFAULT_UP), this.updateMatrix(), this.target = new scope.Object3D(), this.distance = s, this.angle = a, this.penumbra = o, this.decay = l, this.map = null, this.shadow = new scope.SpotLightShadow();
  }
  get power() {
    return this.intensity * Math.PI;
  }
  set power(e) {
    this.intensity = e / Math.PI;
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e, i) {
    return super.copy(e, i), this.distance = e.distance, this.angle = e.angle, this.penumbra = e.penumbra, this.decay = e.decay, this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
};
}
