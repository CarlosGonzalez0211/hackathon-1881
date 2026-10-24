/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 277788:278191.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0757(scope) {
scope.PointLight = class PointLight extends scope.Light {
  constructor(e, i, s = 0, a = 2) {
    super(e, i), this.isPointLight = !0, this.type = "PointLight", this.distance = s, this.decay = a, this.shadow = new scope.PointLightShadow();
  }
  get power() {
    return this.intensity * 4 * Math.PI;
  }
  set power(e) {
    this.intensity = e / (4 * Math.PI);
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e, i) {
    return super.copy(e, i), this.distance = e.distance, this.decay = e.decay, this.shadow = e.shadow.clone(), this;
  }
};
}
