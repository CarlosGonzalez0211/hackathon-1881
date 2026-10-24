/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 183129:183469.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0556(scope) {
scope.InstancedBufferAttribute = class InstancedBufferAttribute extends scope.BufferAttribute {
  constructor(e, i, s, a = 1) {
    super(e, i, s), this.isInstancedBufferAttribute = !0, this.meshPerAttribute = a;
  }
  copy(e) {
    return super.copy(e), this.meshPerAttribute = e.meshPerAttribute, this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.meshPerAttribute = this.meshPerAttribute, e.isInstancedBufferAttribute = !0, e;
  }
};
}
