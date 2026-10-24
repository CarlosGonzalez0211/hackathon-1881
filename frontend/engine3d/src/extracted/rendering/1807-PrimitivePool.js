/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1342042:1342259.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1807(scope) {
scope.PrimitivePool = class PrimitivePool {
  constructor(e) {
    this._getNewPrimitive = e, this._primitives = [];
  }
  getPrimitive() {
    const e = this._primitives;
    return e.length === 0 ? this._getNewPrimitive() : e.pop();
  }
  releasePrimitive(e) {
    this._primitives.push(e);
  }
};
}
