/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 889575:890105.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1448(scope) {
scope.FullScreenQuad$1 = class {
  constructor(e = null) {
    scope.Ye(this, "camera", new scope.OrthographicCamera(-1, 1, 1, -1, 0, 1));
    scope.Ye(this, "mesh", null);
    this.mesh = new scope.Mesh(scope.triangle$2, e), this.mesh.frustumCulled = !1;
  }
  get material() {
    return this.mesh.material;
  }
  set material(e) {
    this.mesh.material = e;
  }
  render(e) {
    e.render(this.mesh, this.camera);
  }
  dispose() {
    if (this.mesh.geometry.dispose(), this.mesh.material.dispose(), !!this.mesh.material.uniforms) for (const e in this.mesh.material.uniforms) {
      const i = this.mesh.material.uniforms[e];
      i.value && i.value.dispose && i.value.dispose();
    }
  }
};
}
