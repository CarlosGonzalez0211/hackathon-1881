/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1751705:1753217.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2114(scope) {
scope.grass = class grass {
  constructor(e, i) {
    this.scene = e, this.options = i, this.ready = scope.miscutils.deferred(), this.lowMemory = !!scope.client$1.lowMemoryDevice, this.init();
  }
  async init() {
    const i = Array.from({
        length: 5
      }, (h, d) => d),
      a = (await Promise.all(i.map(h => scope.geometryLoader.batched(`planets/present/${this.lowMemory ? "low/" : ""}tree-leaves_${h}.drc`)))).flat(),
      o = a.length,
      l = a.reduce((h, d) => h + d.attributes.position.count, 0),
      c = a.reduce((h, d) => h + d.index.count, 0);
    this.mesh = new scope.BatchedMesh(o, l, c, scope.createLeavesMaterial(this.scene.camera)), this.mesh.name = "tree-leaves", this.mesh.sortObjects = !1, this.mesh.receiveShadow = !0, this.mesh.castShadow = !0, a.forEach((h, d) => {
      this.mesh.addInstance(this.mesh.addGeometry(h));
    }), this.mesh.updateMatrixWorld(!0), this.mesh.matrixAutoUpdate = !1, this.mesh.matrixWorldAutoUpdate = !1, this.scene.beforeRenderCbs.push(this.update.bind(this)), this.scene.add(this.mesh), this.ready.resolve();
  }
  update() {
    var i;
    if (!((i = this.scene.characters) != null && i.mesh)) return;
    const e = this.scene.characters.mesh._localObject;
    this.mesh.material.uniforms.charPos.value.copy(e.position).add(scope._v0$1.copy(e.position).normalize()), this.mesh.material.uniforms.charSpeed.value = e.velocity.length();
    for (let s = 0; s < this.mesh._instanceInfo.length; s++) {
      this.mesh.getBoundingSphereAt(s, scope._s), scope._v0$1.copy(e.position).sub(scope._s.center).normalize();
      const a = scope._s.center.distanceTo(e.position),
        o = Math.min(a, scope._s.radius);
      scope._v1.copy(scope._s.center).addScaledVector(scope._v0$1, o), this.mesh._instanceInfo[s].visible = e.position.distanceTo(scope._v1) < scope.VISIBILITY_THRESHOLD;
    }
    this.mesh._visibilityChanged = !0;
  }
};
}
