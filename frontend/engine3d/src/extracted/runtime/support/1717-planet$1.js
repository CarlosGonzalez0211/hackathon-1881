/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1266664:1267811.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1717(scope) {
scope.planet$1 = class planet$1 {
  constructor(e) {
    this.scene = e, this.ready = scope.miscutils.deferred(), this.init();
  }
  async init() {
    const [e, i, s, a] = await Promise.all([scope.geometryLoader.load(`planets/present/intro/${scope.client$1.lowMemoryDevice ? "low/" : ""}planet.drc`), scope.geometryLoader.load("planets/present/intro/water.drc"), scope.geometryLoader.load("planets/present/intro/trees.drc"), scope.geometryLoader.load("planets/present/intro/clouds.drc")]);
    this.planetMesh = new scope.Mesh(e, scope.introMaterial({})), this.planetMesh.name = "Planet", this.waterMesh = new scope.Mesh(i, scope.waterMaterial({})), this.waterMesh.name = "Water", this.treeMesh = new scope.Mesh(s, scope.introMaterial({})), this.treeMesh.name = "Trees", this.cloudMesh = new scope.Mesh(a, scope.cloudMaterial({})), this.cloudMesh.name = "Clouds", this.planetMesh.receiveShadow = !0, this.planetMesh.castShadow = !0, this.waterMesh.castShadow = !1, this.waterMesh.receiveShadow = !0, this.treeMesh.castShadow = !0, this.treeMesh.receiveShadow = !0, this.cloudMesh.castShadow = !1, this.cloudMesh.receiveShadow = !1, this.mesh = new scope.Group(), this.scene.planetGroup.add(this.planetMesh), this.scene.planetGroup.add(this.waterMesh), this.scene.planetGroup.add(this.treeMesh), this.scene.planetGroup.add(this.cloudMesh), this.ready.resolve();
  }
};
}
