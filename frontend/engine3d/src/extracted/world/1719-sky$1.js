/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1268664:1268952.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1719(scope) {
scope.sky$1 = class sky$1 {
  constructor(e) {
    this.scene = e, this.ready = scope.miscutils.deferred(), this.init();
  }
  init() {
    this.mesh = new scope.Mesh(new scope.SphereGeometry(150, 32, 16), scope.skyMaterial({})), this.mesh.name = "Sky", this.mesh.material.side = scope.BackSide, this.mesh.scale.setScalar(4), this.scene.add(this.mesh), this.ready.resolve();
  }
};
}
