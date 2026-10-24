/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1740652:1742137.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2108(scope) {
scope.butterflies = class butterflies {
  constructor(e, i) {
    this.scene = e, this.options = i, this.meshes = [], this.ready = scope.miscutils.deferred(), this.init();
  }
  async init() {
    const e = new scope.PlaneGeometry();
    e.rotateZ(Math.PI), e.translate(0, -.5, 0), e.rotateX(Math.PI * -.5), e.scale(.1, .125, .125), e.scale(.8, .8, .8);
    const i = await scope.geometryLoader.load(`planets/${this.scene.terrainOptions.terrain}/butterflies.drc`);
    (await scope.createInstancedGeometryPatches(e, i)).forEach((a, o) => {
      const l = new scope.InstancedMesh(a, scope.createButterflyMaterial(), a.instanceCount);
      l.instanceMatrix.array = a._matrixArray, a._colors && (l.instanceColor = a._colors), l.name = "butterflies", l.updateMatrixWorld(), l.matrixAutoUpdate = !1, l.matrixWorldAutoUpdate = !1, l.frustumCulled = !0, l.computeBoundingSphere(), l.boundingSphere.radius += 1, l.updateMatrixWorld(!0), l.matrixAutoUpdate = !1, l.matrixWorldAutoUpdate = !1, l.receiveShadow = !0, l.castShadow = !1, l.ignore = o !== 0, this.meshes.push(l), this.scene.add(l);
    }), this.scene.beforeRenderCbs.push(this.update.bind(this)), this.ready.resolve();
  }
  update() {
    var i;
    if (!((i = this.scene.characters) != null && i.mesh)) return;
    const e = this.scene.characters.mesh._localObject;
    this.meshes.forEach(s => {
      s.material.uniforms.charPos.value.copy(e.position), s.material.uniforms.charSpeed.value = e.velocityHorizontal, scope._s$1.copy(s.boundingSphere), scope._v0$2.copy(e.position).sub(scope._s$1.center).normalize();
      const a = scope._s$1.center.distanceTo(e.position),
        o = Math.min(a, scope._s$1.radius);
      scope._v1$1.copy(scope._s$1.center).addScaledVector(scope._v0$2, o), s.visible = e.position.distanceTo(scope._v1$1) < scope.VISIBILITY_THRESHOLD$1;
    });
  }
};
}
