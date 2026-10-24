/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 280815:281160.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0762(scope) {
scope.InstancedBufferGeometry = class InstancedBufferGeometry extends scope.BufferGeometry {
  constructor() {
    super(), this.isInstancedBufferGeometry = !0, this.type = "InstancedBufferGeometry", this.instanceCount = 1 / 0;
  }
  copy(e) {
    return super.copy(e), this.instanceCount = e.instanceCount, this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.instanceCount = this.instanceCount, e.isInstancedBufferGeometry = !0, e;
  }
};
}
