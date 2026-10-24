/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 150084:153404.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0512(scope) {
scope.Mesh = class Mesh extends scope.Object3D {
  constructor(e = new scope.BufferGeometry(), i = new scope.MeshBasicMaterial()) {
    super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = i, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.count = 1, this.updateMorphTargets();
  }
  copy(e, i) {
    return super.copy(e, i), e.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = e.morphTargetInfluences.slice()), e.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
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
  getVertexPosition(e, i) {
    const s = this.geometry,
      a = s.attributes.position,
      o = s.morphAttributes.position,
      l = s.morphTargetsRelative;
    i.fromBufferAttribute(a, e);
    const c = this.morphTargetInfluences;
    if (o && c) {
      scope._morphA.set(0, 0, 0);
      for (let h = 0, d = o.length; h < d; h++) {
        const p = c[h],
          f = o[h];
        p !== 0 && (scope._tempA.fromBufferAttribute(f, e), l ? scope._morphA.addScaledVector(scope._tempA, p) : scope._morphA.addScaledVector(scope._tempA.sub(i), p));
      }
      i.add(scope._morphA);
    }
    return i;
  }
  raycast(e, i) {
    const s = this.geometry,
      a = this.material,
      o = this.matrixWorld;
    a !== void 0 && (s.boundingSphere === null && s.computeBoundingSphere(), scope._sphere$6.copy(s.boundingSphere), scope._sphere$6.applyMatrix4(o), scope._ray$3.copy(e.ray).recast(e.near), !(scope._sphere$6.containsPoint(scope._ray$3.origin) === !1 && (scope._ray$3.intersectSphere(scope._sphere$6, scope._sphereHitAt) === null || scope._ray$3.origin.distanceToSquared(scope._sphereHitAt) > (e.far - e.near) ** 2)) && (scope._inverseMatrix$3.copy(o).invert(), scope._ray$3.copy(e.ray).applyMatrix4(scope._inverseMatrix$3), !(s.boundingBox !== null && scope._ray$3.intersectsBox(s.boundingBox) === !1) && this._computeIntersections(e, i, scope._ray$3)));
  }
  _computeIntersections(e, i, s) {
    let a;
    const o = this.geometry,
      l = this.material,
      c = o.index,
      h = o.attributes.position,
      d = o.attributes.uv,
      p = o.attributes.uv1,
      f = o.attributes.normal,
      _ = o.groups,
      x = o.drawRange;
    if (c !== null) {
      if (Array.isArray(l)) for (let b = 0, T = _.length; b < T; b++) {
        const M = _[b],
          w = l[M.materialIndex],
          D = Math.max(M.start, x.start),
          R = Math.min(c.count, Math.min(M.start + M.count, x.start + x.count));
        for (let P = D, U = R; P < U; P += 3) {
          const O = c.getX(P),
            N = c.getX(P + 1),
            H = c.getX(P + 2);
          a = scope.checkGeometryIntersection(this, w, e, s, d, p, f, O, N, H), a && (a.faceIndex = Math.floor(P / 3), a.face.materialIndex = M.materialIndex, i.push(a));
        }
      } else {
        const b = Math.max(0, x.start),
          T = Math.min(c.count, x.start + x.count);
        for (let M = b, w = T; M < w; M += 3) {
          const D = c.getX(M),
            R = c.getX(M + 1),
            P = c.getX(M + 2);
          a = scope.checkGeometryIntersection(this, l, e, s, d, p, f, D, R, P), a && (a.faceIndex = Math.floor(M / 3), i.push(a));
        }
      }
    } else if (h !== void 0) if (Array.isArray(l)) for (let b = 0, T = _.length; b < T; b++) {
      const M = _[b],
        w = l[M.materialIndex],
        D = Math.max(M.start, x.start),
        R = Math.min(h.count, Math.min(M.start + M.count, x.start + x.count));
      for (let P = D, U = R; P < U; P += 3) {
        const O = P,
          N = P + 1,
          H = P + 2;
        a = scope.checkGeometryIntersection(this, w, e, s, d, p, f, O, N, H), a && (a.faceIndex = Math.floor(P / 3), a.face.materialIndex = M.materialIndex, i.push(a));
      }
    } else {
      const b = Math.max(0, x.start),
        T = Math.min(h.count, x.start + x.count);
      for (let M = b, w = T; M < w; M += 3) {
        const D = M,
          R = M + 1,
          P = M + 2;
        a = scope.checkGeometryIntersection(this, l, e, s, d, p, f, D, R, P), a && (a.faceIndex = Math.floor(M / 3), i.push(a));
      }
    }
  }
};
}
