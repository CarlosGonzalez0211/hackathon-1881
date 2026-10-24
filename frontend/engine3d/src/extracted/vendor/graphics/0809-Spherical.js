/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 319073:319664.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0809(scope) {
scope.Spherical = class Spherical {
  constructor(e = 1, i = 0, s = 0) {
    this.radius = e, this.phi = i, this.theta = s;
  }
  set(e, i, s) {
    return this.radius = e, this.phi = i, this.theta = s, this;
  }
  copy(e) {
    return this.radius = e.radius, this.phi = e.phi, this.theta = e.theta, this;
  }
  makeSafe() {
    return this.phi = scope.clamp(this.phi, 1e-6, Math.PI - 1e-6), this;
  }
  setFromVector3(e) {
    return this.setFromCartesianCoords(e.x, e.y, e.z);
  }
  setFromCartesianCoords(e, i, s) {
    return this.radius = Math.sqrt(e * e + i * i + s * s), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(e, s), this.phi = Math.acos(scope.clamp(i / this.radius, -1, 1))), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
};
}
