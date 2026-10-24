/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 214872:216387.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0614(scope) {
scope.Points = class Points extends scope.Object3D {
  constructor(e = new scope.BufferGeometry(), i = new scope.PointsMaterial()) {
    super(), this.isPoints = !0, this.type = "Points", this.geometry = e, this.material = i, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
  }
  copy(e, i) {
    return super.copy(e, i), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  raycast(e, i) {
    const s = this.geometry,
      a = this.matrixWorld,
      o = e.params.Points.threshold,
      l = s.drawRange;
    if (s.boundingSphere === null && s.computeBoundingSphere(), scope._sphere$7.copy(s.boundingSphere), scope._sphere$7.applyMatrix4(a), scope._sphere$7.radius += o, e.ray.intersectsSphere(scope._sphere$7) === !1) return;
    scope._inverseMatrix.copy(a).invert(), scope._ray.copy(e.ray).applyMatrix4(scope._inverseMatrix);
    const c = o / ((this.scale.x + this.scale.y + this.scale.z) / 3),
      h = c * c,
      d = s.index,
      f = s.attributes.position;
    if (d !== null) {
      const _ = Math.max(0, l.start),
        x = Math.min(d.count, l.start + l.count);
      for (let b = _, T = x; b < T; b++) {
        const M = d.getX(b);
        scope._position$2.fromBufferAttribute(f, M), scope.testPoint(scope._position$2, M, h, a, e, i, this);
      }
    } else {
      const _ = Math.max(0, l.start),
        x = Math.min(f.count, l.start + l.count);
      for (let b = _, T = x; b < T; b++) scope._position$2.fromBufferAttribute(f, b), scope.testPoint(scope._position$2, b, h, a, e, i, this);
    }
  }
  updateMorphTargets() {
    const i = this.geometry.morphAttributes,
      s = Object.keys(i);
    if (s.length > 0) {
      const a = i[s[0]];
      if (a !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let o = 0, l = a.length; o < l; o++) {
          const c = a[o].name || String(o);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[c] = o;
        }
      }
    }
  }
};
}
