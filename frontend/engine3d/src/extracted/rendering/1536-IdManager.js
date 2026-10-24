/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 942537:942655.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1536(scope) {
scope.IdManager = class {
  constructor(r = 0) {
    this.nextId = r;
  }
  getNextId() {
    return this.nextId++;
  }
  reset(r = 0) {
    return this.nextId = r, this;
  }
};
}
