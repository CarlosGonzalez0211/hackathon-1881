/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 210991:213159.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0603(scope) {
scope.Line = class Line extends scope.Object3D {
  constructor(e = new scope.BufferGeometry(), i = new scope.LineBasicMaterial()) {
    super(), this.isLine = !0, this.type = "Line", this.geometry = e, this.material = i, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets();
  }
  copy(e, i) {
    return super.copy(e, i), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const i = e.attributes.position,
        s = [0];
      for (let a = 1, o = i.count; a < o; a++) scope._vStart.fromBufferAttribute(i, a - 1), scope._vEnd.fromBufferAttribute(i, a), s[a] = s[a - 1], s[a] += scope._vStart.distanceTo(scope._vEnd);
      e.setAttribute("lineDistance", new scope.Float32BufferAttribute(s, 1));
    } else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
  raycast(e, i) {
    const s = this.geometry,
      a = this.matrixWorld,
      o = e.params.Line.threshold,
      l = s.drawRange;
    if (s.boundingSphere === null && s.computeBoundingSphere(), scope._sphere$1.copy(s.boundingSphere), scope._sphere$1.applyMatrix4(a), scope._sphere$1.radius += o, e.ray.intersectsSphere(scope._sphere$1) === !1) return;
    scope._inverseMatrix$1.copy(a).invert(), scope._ray$1.copy(e.ray).applyMatrix4(scope._inverseMatrix$1);
    const c = o / ((this.scale.x + this.scale.y + this.scale.z) / 3),
      h = c * c,
      d = this.isLineSegments ? 2 : 1,
      p = s.index,
      _ = s.attributes.position;
    if (p !== null) {
      const x = Math.max(0, l.start),
        b = Math.min(p.count, l.start + l.count);
      for (let T = x, M = b - 1; T < M; T += d) {
        const w = p.getX(T),
          D = p.getX(T + 1),
          R = scope.checkIntersection$2(this, e, scope._ray$1, h, w, D, T);
        R && i.push(R);
      }
      if (this.isLineLoop) {
        const T = p.getX(b - 1),
          M = p.getX(x),
          w = scope.checkIntersection$2(this, e, scope._ray$1, h, T, M, b - 1);
        w && i.push(w);
      }
    } else {
      const x = Math.max(0, l.start),
        b = Math.min(_.count, l.start + l.count);
      for (let T = x, M = b - 1; T < M; T += d) {
        const w = scope.checkIntersection$2(this, e, scope._ray$1, h, T, T + 1, T);
        w && i.push(w);
      }
      if (this.isLineLoop) {
        const T = scope.checkIntersection$2(this, e, scope._ray$1, h, b - 1, x, b - 1);
        T && i.push(T);
      }
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
