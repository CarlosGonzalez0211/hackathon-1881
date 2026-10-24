/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 891129:891358.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1460(scope) {
scope.FullScreenQuad = class FullScreenQuad {
  constructor(e) {
    this._mesh = new scope.Mesh(scope._geometry, e);
  }
  dispose() {
    this._mesh.geometry.dispose();
  }
  render(e) {
    e.render(this._mesh, scope._camera);
  }
  get material() {
    return this._mesh.material;
  }
  set material(e) {
    this._mesh.material = e;
  }
};
}
