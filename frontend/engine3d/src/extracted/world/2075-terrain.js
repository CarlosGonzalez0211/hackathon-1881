/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1650313:1655109.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2075(scope) {
scope.terrain = class terrain {
  constructor(e, i) {
    this.scene = e, this.options = i, this.extraLODs = 0, this.lowMemory = !!scope.client$1.lowMemoryDevice, this.DOT_THRESHOLD = .45, this.LOD1_THRESHOLD = 6, this.LOD2_THRESHOLD = 12, this.LOD3_THRESHOLD = this.lowMemory ? 1 / 0 : 20, this.ready = new Promise(s => {
      this.isReady = s;
    }), this.init();
  }
  async init() {
    const e = Array.from({
      length: this.options.chunks
    }, (_, x) => x);
    let i = null,
      s = null,
      a = null,
      o = null,
      l = null;
    this.lowMemory ? (i = await Promise.all([await Promise.all(e.map(_ => scope.geometryLoader.batched(`planets/${this.scene.terrainOptions.terrain}/low/full_${_}.drc`))), await Promise.all(e.map(_ => scope.geometryLoader.batched(`planets/${this.scene.terrainOptions.terrain}/low/full-lod-1_${_}.drc`))), await Promise.all(e.map(_ => scope.geometryLoader.batched(`planets/${this.scene.terrainOptions.terrain}/low/full-lod-3_${_}.drc`)))]), s = i[0].flat(), a = i[1].flat(), o = i[2].flat()) : (i = await Promise.all([await Promise.all(e.map(_ => scope.geometryLoader.batched(`planets/${this.scene.terrainOptions.terrain}/full_${_}.drc`))), await Promise.all(e.map(_ => scope.geometryLoader.batched(`planets/${this.scene.terrainOptions.terrain}/full-lod-1_${_}.drc`))), await Promise.all(e.map(_ => scope.geometryLoader.batched(`planets/${this.scene.terrainOptions.terrain}/full-lod-2_${_}.drc`))), await Promise.all(e.map(_ => scope.geometryLoader.batched(`planets/${this.scene.terrainOptions.terrain}/full-lod-3_${_}.drc`)))]), s = i[0].flat(), a = i[1].flat(), o = i[2].flat(), l = i[3].flat());
    const c = Math.max((s == null ? void 0 : s.length) || 0, (a == null ? void 0 : a.length) || 0, (o == null ? void 0 : o.length) || 0, (l == null ? void 0 : l.length) || 0);
    s && s.length < c && scope.fillEmptyLODs(s, c), a && a.length < c && scope.fillEmptyLODs(a, c), o && o.length < c && scope.fillEmptyLODs(o, c), l && l.length < c && scope.fillEmptyLODs(l, c);
    const h = s.length,
      d = s.reduce((_, x) => _ + x.attributes.position.count, 0),
      p = s.reduce((_, x) => _ + x.index.count, 0);
    this.mesh = new scope.BatchedMesh(h, d, p, new scope.baseMaterial({
      isTerrain: !0,
      ...this.options.materialArgs
    })), this.mesh.name = "planet-chunks-LOD-0", this.mesh.sortObjects = !1, this.mesh.receiveShadow = !0, this.mesh.castShadow = !0, this.mesh.frustumCulled = !1, this.mesh.perObjectFrustumCulled = !1, s.forEach((_, x) => {
      this.mesh.addInstance(this.mesh.addGeometry(_));
    }), this.mesh.__onBeforeRender = this.mesh.onBeforeRender, this.mesh.onBeforeRender = () => {}, this.scene.add(this.mesh), this.mesh.onBeforeRender = this.update.bind(this);
    const f = [a, o];
    l && f.push(l), f.forEach((_, x) => {
      this.extraLODs++;
      const b = _.length,
        T = _.reduce((D, R) => D + R.attributes.position.count, 0),
        M = _.reduce((D, R) => D + R.index.count, 0);
      this[`mesh${x + 1}`] = new scope.BatchedMesh(b, T, M, new scope.baseMaterial({
        isTerrain: !0,
        ...this.options.materialArgs
      }));
      const w = this[`mesh${x + 1}`];
      w.name = `planet-chunks-LOD-${x + 1}`, w.sortObjects = !1, w.receiveShadow = !0, w.castShadow = !0, w.frustumCulled = !1, w.perObjectFrustumCulled = !1, _.forEach((D, R) => {
        w.addInstance(w.addGeometry(D));
      }), w.__onBeforeRender = w.onBeforeRender, w.onBeforeRender = () => {}, this.scene.add(w);
    }), this.isReady();
  }
  update(e, i, s, a, o) {
    var h;
    if (!((h = this.scene.characters) != null && h.mesh)) return;
    scope._matrix.multiplyMatrices(s.projectionMatrix, s.matrixWorldInverse).multiply(this.mesh.matrixWorld), scope._frustum.setFromProjectionMatrix(scope._matrix, e.coordinateSystem);
    const l = this.scene.characters.mesh._localObject,
      c = l.position.length();
    for (let d = 0; d < this.mesh._instanceInfo.length; d++) {
      this.mesh._instanceInfo[d].visible = !1;
      for (let b = 0; b < this.extraLODs; b++) this[`mesh${b + 1}`]._instanceInfo[d].visible = !1;
      this.mesh.getBoundingSphereAt(d, scope._s$4), this.mesh._instanceInfo[d].__culled = !scope._frustum.intersectsSphere(scope._s$4), scope._v0$7.copy(l.position).sub(scope._s$4.center).normalize();
      const p = scope._s$4.center.distanceTo(l.position),
        f = Math.min(p, scope._s$4.radius);
      scope._v1$4.copy(scope._s$4.center).addScaledVector(scope._v0$7, f), this.mesh._instanceInfo[d].__distanceToCharacter = l.position.distanceTo(scope._v1$4);
      const _ = Math.abs(scope._s$4.center.length() - c),
        x = Math.min(p, scope._s$4.radius + _);
      scope._v1$4.copy(scope._s$4.center).addScaledVector(scope._v0$7, x), scope._v0$7.copy(l.position).divideScalar(c || 1), this.mesh._instanceInfo[d].__dotCharacter = scope._v0$7.dot(scope._v1$4.normalize());
    }
    for (let d = 0; d < this.mesh._instanceInfo.length; d++) if (this.mesh._instanceInfo[d].__dotCharacter < this.DOT_THRESHOLD || this.mesh._instanceInfo[d].__culled) {
      this.mesh._instanceInfo[d].visible = !1;
      for (let f = 0; f < this.extraLODs; f++) this[`mesh${f + 1}`]._instanceInfo[d].visible = !1;
    } else {
      const f = this.mesh._instanceInfo[d].__distanceToCharacter <= this.LOD1_THRESHOLD,
        _ = !f && this.mesh._instanceInfo[d].__distanceToCharacter <= this.LOD2_THRESHOLD,
        x = !f && !_ && this.mesh._instanceInfo[d].__distanceToCharacter <= this.LOD3_THRESHOLD,
        b = !f && !_ && !x;
      this.mesh._instanceInfo[d].visible = f, [_, x, b].forEach((T, M) => {
        M < this.extraLODs && (this[`mesh${M + 1}`]._instanceInfo[d].visible = T);
      });
    }
    this.mesh._visibilityChanged = !0, this.mesh.__onBeforeRender(e, i, s, this.mesh.geometry, this.mesh.material);
    for (let d = 0; d < this.extraLODs; d++) {
      const p = this[`mesh${d + 1}`];
      p._visibilityChanged = !0, p.__onBeforeRender(e, i, s, p.geometry, p.material);
    }
  }
};
}
