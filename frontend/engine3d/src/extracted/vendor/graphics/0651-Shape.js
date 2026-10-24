/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 235207:235961.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0651(scope) {
scope.Shape = class Shape extends scope.Path {
  constructor(e) {
    super(e), this.uuid = scope.generateUUID(), this.type = "Shape", this.holes = [];
  }
  getPointsHoles(e) {
    const i = [];
    for (let s = 0, a = this.holes.length; s < a; s++) i[s] = this.holes[s].getPoints(e);
    return i;
  }
  extractPoints(e) {
    return {
      shape: this.getPoints(e),
      holes: this.getPointsHoles(e)
    };
  }
  copy(e) {
    super.copy(e), this.holes = [];
    for (let i = 0, s = e.holes.length; i < s; i++) {
      const a = e.holes[i];
      this.holes.push(a.clone());
    }
    return this;
  }
  toJSON() {
    const e = super.toJSON();
    e.uuid = this.uuid, e.holes = [];
    for (let i = 0, s = this.holes.length; i < s; i++) {
      const a = this.holes[i];
      e.holes.push(a.toJSON());
    }
    return e;
  }
  fromJSON(e) {
    super.fromJSON(e), this.uuid = e.uuid, this.holes = [];
    for (let i = 0, s = e.holes.length; i < s; i++) {
      const a = e.holes[i];
      this.holes.push(new scope.Path().fromJSON(a));
    }
    return this;
  }
};
}
