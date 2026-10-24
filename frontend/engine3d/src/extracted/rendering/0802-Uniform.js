/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 316896:317023.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0802(scope) {
scope.Uniform = class Uniform {
  constructor(e) {
    this.value = e;
  }
  clone() {
    return new scope.Uniform(this.value.clone === void 0 ? this.value : this.value.clone());
  }
};
}
