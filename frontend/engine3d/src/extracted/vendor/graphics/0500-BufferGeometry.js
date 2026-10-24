/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 138928:149826.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0500(scope) {
scope.BufferGeometry = class BufferGeometry extends scope.EventDispatcher {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", {
      value: scope._id$1++
    }), this.uuid = scope.generateUUID(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
      start: 0,
      count: 1 / 0
    }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(e) {
    return Array.isArray(e) ? this.index = new (scope.arrayNeedsUint32(e) ? scope.Uint32BufferAttribute : scope.Uint16BufferAttribute)(e, 1) : this.index = e, this;
  }
  setIndirect(e) {
    return this.indirect = e, this;
  }
  getIndirect() {
    return this.indirect;
  }
  getAttribute(e) {
    return this.attributes[e];
  }
  setAttribute(e, i) {
    return this.attributes[e] = i, this;
  }
  deleteAttribute(e) {
    return delete this.attributes[e], this;
  }
  hasAttribute(e) {
    return this.attributes[e] !== void 0;
  }
  addGroup(e, i, s = 0) {
    this.groups.push({
      start: e,
      count: i,
      materialIndex: s
    });
  }
  clearGroups() {
    this.groups = [];
  }
  setDrawRange(e, i) {
    this.drawRange.start = e, this.drawRange.count = i;
  }
  applyMatrix4(e) {
    const i = this.attributes.position;
    i !== void 0 && (i.applyMatrix4(e), i.needsUpdate = !0);
    const s = this.attributes.normal;
    if (s !== void 0) {
      const o = new scope.Matrix3().getNormalMatrix(e);
      s.applyNormalMatrix(o), s.needsUpdate = !0;
    }
    const a = this.attributes.tangent;
    return a !== void 0 && (a.transformDirection(e), a.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  applyQuaternion(e) {
    return scope._m1$3.makeRotationFromQuaternion(e), this.applyMatrix4(scope._m1$3), this;
  }
  rotateX(e) {
    return scope._m1$3.makeRotationX(e), this.applyMatrix4(scope._m1$3), this;
  }
  rotateY(e) {
    return scope._m1$3.makeRotationY(e), this.applyMatrix4(scope._m1$3), this;
  }
  rotateZ(e) {
    return scope._m1$3.makeRotationZ(e), this.applyMatrix4(scope._m1$3), this;
  }
  translate(e, i, s) {
    return scope._m1$3.makeTranslation(e, i, s), this.applyMatrix4(scope._m1$3), this;
  }
  scale(e, i, s) {
    return scope._m1$3.makeScale(e, i, s), this.applyMatrix4(scope._m1$3), this;
  }
  lookAt(e) {
    return scope._obj$2.lookAt(e), scope._obj$2.updateMatrix(), this.applyMatrix4(scope._obj$2.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(scope._offset).negate(), this.translate(scope._offset.x, scope._offset.y, scope._offset.z), this;
  }
  setFromPoints(e) {
    const i = this.getAttribute("position");
    if (i === void 0) {
      const s = [];
      for (let a = 0, o = e.length; a < o; a++) {
        const l = e[a];
        s.push(l.x, l.y, l.z || 0);
      }
      this.setAttribute("position", new scope.Float32BufferAttribute(s, 3));
    } else {
      const s = Math.min(e.length, i.count);
      for (let a = 0; a < s; a++) {
        const o = e[a];
        i.setXYZ(a, o.x, o.y, o.z || 0);
      }
      e.length > i.count && console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), i.needsUpdate = !0;
    }
    return this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new scope.Box3());
    const e = this.attributes.position,
      i = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new scope.Vector3(-1 / 0, -1 / 0, -1 / 0), new scope.Vector3(1 / 0, 1 / 0, 1 / 0));
      return;
    }
    if (e !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(e), i) for (let s = 0, a = i.length; s < a; s++) {
        const o = i[s];
        scope._box$2.setFromBufferAttribute(o), this.morphTargetsRelative ? (scope._vector$8.addVectors(this.boundingBox.min, scope._box$2.min), this.boundingBox.expandByPoint(scope._vector$8), scope._vector$8.addVectors(this.boundingBox.max, scope._box$2.max), this.boundingBox.expandByPoint(scope._vector$8)) : (this.boundingBox.expandByPoint(scope._box$2.min), this.boundingBox.expandByPoint(scope._box$2.max));
      }
    } else this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new scope.Sphere());
    const e = this.attributes.position,
      i = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new scope.Vector3(), 1 / 0);
      return;
    }
    if (e) {
      const s = this.boundingSphere.center;
      if (scope._box$2.setFromBufferAttribute(e), i) for (let o = 0, l = i.length; o < l; o++) {
        const c = i[o];
        scope._boxMorphTargets.setFromBufferAttribute(c), this.morphTargetsRelative ? (scope._vector$8.addVectors(scope._box$2.min, scope._boxMorphTargets.min), scope._box$2.expandByPoint(scope._vector$8), scope._vector$8.addVectors(scope._box$2.max, scope._boxMorphTargets.max), scope._box$2.expandByPoint(scope._vector$8)) : (scope._box$2.expandByPoint(scope._boxMorphTargets.min), scope._box$2.expandByPoint(scope._boxMorphTargets.max));
      }
      scope._box$2.getCenter(s);
      let a = 0;
      for (let o = 0, l = e.count; o < l; o++) scope._vector$8.fromBufferAttribute(e, o), a = Math.max(a, s.distanceToSquared(scope._vector$8));
      if (i) for (let o = 0, l = i.length; o < l; o++) {
        const c = i[o],
          h = this.morphTargetsRelative;
        for (let d = 0, p = c.count; d < p; d++) scope._vector$8.fromBufferAttribute(c, d), h && (scope._offset.fromBufferAttribute(e, d), scope._vector$8.add(scope._offset)), a = Math.max(a, s.distanceToSquared(scope._vector$8));
      }
      this.boundingSphere.radius = Math.sqrt(a), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
    }
  }
  computeTangents() {
    const e = this.index,
      i = this.attributes;
    if (e === null || i.position === void 0 || i.normal === void 0 || i.uv === void 0) {
      console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
      return;
    }
    const s = i.position,
      a = i.normal,
      o = i.uv;
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new scope.BufferAttribute(new Float32Array(4 * s.count), 4));
    const l = this.getAttribute("tangent"),
      c = [],
      h = [];
    for (let H = 0; H < s.count; H++) c[H] = new scope.Vector3(), h[H] = new scope.Vector3();
    const d = new scope.Vector3(),
      p = new scope.Vector3(),
      f = new scope.Vector3(),
      _ = new scope.Vector2(),
      x = new scope.Vector2(),
      b = new scope.Vector2(),
      T = new scope.Vector3(),
      M = new scope.Vector3();
    function w(H, F, k) {
      d.fromBufferAttribute(s, H), p.fromBufferAttribute(s, F), f.fromBufferAttribute(s, k), _.fromBufferAttribute(o, H), x.fromBufferAttribute(o, F), b.fromBufferAttribute(o, k), p.sub(d), f.sub(d), x.sub(_), b.sub(_);
      const W = 1 / (x.x * b.y - b.x * x.y);
      isFinite(W) && (T.copy(p).multiplyScalar(b.y).addScaledVector(f, -x.y).multiplyScalar(W), M.copy(f).multiplyScalar(x.x).addScaledVector(p, -b.x).multiplyScalar(W), c[H].add(T), c[F].add(T), c[k].add(T), h[H].add(M), h[F].add(M), h[k].add(M));
    }
    let D = this.groups;
    D.length === 0 && (D = [{
      start: 0,
      count: e.count
    }]);
    for (let H = 0, F = D.length; H < F; ++H) {
      const k = D[H],
        W = k.start,
        $ = k.count;
      for (let Z = W, J = W + $; Z < J; Z += 3) w(e.getX(Z + 0), e.getX(Z + 1), e.getX(Z + 2));
    }
    const R = new scope.Vector3(),
      P = new scope.Vector3(),
      U = new scope.Vector3(),
      O = new scope.Vector3();
    function N(H) {
      U.fromBufferAttribute(a, H), O.copy(U);
      const F = c[H];
      R.copy(F), R.sub(U.multiplyScalar(U.dot(F))).normalize(), P.crossVectors(O, F);
      const W = P.dot(h[H]) < 0 ? -1 : 1;
      l.setXYZW(H, R.x, R.y, R.z, W);
    }
    for (let H = 0, F = D.length; H < F; ++H) {
      const k = D[H],
        W = k.start,
        $ = k.count;
      for (let Z = W, J = W + $; Z < J; Z += 3) N(e.getX(Z + 0)), N(e.getX(Z + 1)), N(e.getX(Z + 2));
    }
  }
  computeVertexNormals() {
    const e = this.index,
      i = this.getAttribute("position");
    if (i !== void 0) {
      let s = this.getAttribute("normal");
      if (s === void 0) s = new scope.BufferAttribute(new Float32Array(i.count * 3), 3), this.setAttribute("normal", s);else for (let _ = 0, x = s.count; _ < x; _++) s.setXYZ(_, 0, 0, 0);
      const a = new scope.Vector3(),
        o = new scope.Vector3(),
        l = new scope.Vector3(),
        c = new scope.Vector3(),
        h = new scope.Vector3(),
        d = new scope.Vector3(),
        p = new scope.Vector3(),
        f = new scope.Vector3();
      if (e) for (let _ = 0, x = e.count; _ < x; _ += 3) {
        const b = e.getX(_ + 0),
          T = e.getX(_ + 1),
          M = e.getX(_ + 2);
        a.fromBufferAttribute(i, b), o.fromBufferAttribute(i, T), l.fromBufferAttribute(i, M), p.subVectors(l, o), f.subVectors(a, o), p.cross(f), c.fromBufferAttribute(s, b), h.fromBufferAttribute(s, T), d.fromBufferAttribute(s, M), c.add(p), h.add(p), d.add(p), s.setXYZ(b, c.x, c.y, c.z), s.setXYZ(T, h.x, h.y, h.z), s.setXYZ(M, d.x, d.y, d.z);
      } else for (let _ = 0, x = i.count; _ < x; _ += 3) a.fromBufferAttribute(i, _ + 0), o.fromBufferAttribute(i, _ + 1), l.fromBufferAttribute(i, _ + 2), p.subVectors(l, o), f.subVectors(a, o), p.cross(f), s.setXYZ(_ + 0, p.x, p.y, p.z), s.setXYZ(_ + 1, p.x, p.y, p.z), s.setXYZ(_ + 2, p.x, p.y, p.z);
      this.normalizeNormals(), s.needsUpdate = !0;
    }
  }
  normalizeNormals() {
    const e = this.attributes.normal;
    for (let i = 0, s = e.count; i < s; i++) scope._vector$8.fromBufferAttribute(e, i), scope._vector$8.normalize(), e.setXYZ(i, scope._vector$8.x, scope._vector$8.y, scope._vector$8.z);
  }
  toNonIndexed() {
    function e(c, h) {
      const d = c.array,
        p = c.itemSize,
        f = c.normalized,
        _ = new d.constructor(h.length * p);
      let x = 0,
        b = 0;
      for (let T = 0, M = h.length; T < M; T++) {
        c.isInterleavedBufferAttribute ? x = h[T] * c.data.stride + c.offset : x = h[T] * p;
        for (let w = 0; w < p; w++) _[b++] = d[x++];
      }
      return new scope.BufferAttribute(_, p, f);
    }
    if (this.index === null) return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const i = new scope.BufferGeometry(),
      s = this.index.array,
      a = this.attributes;
    for (const c in a) {
      const h = a[c],
        d = e(h, s);
      i.setAttribute(c, d);
    }
    const o = this.morphAttributes;
    for (const c in o) {
      const h = [],
        d = o[c];
      for (let p = 0, f = d.length; p < f; p++) {
        const _ = d[p],
          x = e(_, s);
        h.push(x);
      }
      i.morphAttributes[c] = h;
    }
    i.morphTargetsRelative = this.morphTargetsRelative;
    const l = this.groups;
    for (let c = 0, h = l.length; c < h; c++) {
      const d = l[c];
      i.addGroup(d.start, d.count, d.materialIndex);
    }
    return i;
  }
  toJSON() {
    const e = {
      metadata: {
        version: 4.7,
        type: "BufferGeometry",
        generator: "BufferGeometry.toJSON"
      }
    };
    if (e.uuid = this.uuid, e.type = this.type, this.name !== "" && (e.name = this.name), Object.keys(this.userData).length > 0 && (e.userData = this.userData), this.parameters !== void 0) {
      const h = this.parameters;
      for (const d in h) h[d] !== void 0 && (e[d] = h[d]);
      return e;
    }
    e.data = {
      attributes: {}
    };
    const i = this.index;
    i !== null && (e.data.index = {
      type: i.array.constructor.name,
      array: Array.prototype.slice.call(i.array)
    });
    const s = this.attributes;
    for (const h in s) {
      const d = s[h];
      e.data.attributes[h] = d.toJSON(e.data);
    }
    const a = {};
    let o = !1;
    for (const h in this.morphAttributes) {
      const d = this.morphAttributes[h],
        p = [];
      for (let f = 0, _ = d.length; f < _; f++) {
        const x = d[f];
        p.push(x.toJSON(e.data));
      }
      p.length > 0 && (a[h] = p, o = !0);
    }
    o && (e.data.morphAttributes = a, e.data.morphTargetsRelative = this.morphTargetsRelative);
    const l = this.groups;
    l.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(l)));
    const c = this.boundingSphere;
    return c !== null && (e.data.boundingSphere = c.toJSON()), e;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
    const i = {};
    this.name = e.name;
    const s = e.index;
    s !== null && this.setIndex(s.clone());
    const a = e.attributes;
    for (const d in a) {
      const p = a[d];
      this.setAttribute(d, p.clone(i));
    }
    const o = e.morphAttributes;
    for (const d in o) {
      const p = [],
        f = o[d];
      for (let _ = 0, x = f.length; _ < x; _++) p.push(f[_].clone(i));
      this.morphAttributes[d] = p;
    }
    this.morphTargetsRelative = e.morphTargetsRelative;
    const l = e.groups;
    for (let d = 0, p = l.length; d < p; d++) {
      const f = l[d];
      this.addGroup(f.start, f.count, f.materialIndex);
    }
    const c = e.boundingBox;
    c !== null && (this.boundingBox = c.clone());
    const h = e.boundingSphere;
    return h !== null && (this.boundingSphere = h.clone()), this.drawRange.start = e.drawRange.start, this.drawRange.count = e.drawRange.count, this.userData = e.userData, this;
  }
  dispose() {
    this.dispatchEvent({
      type: "dispose"
    });
  }
};
}
