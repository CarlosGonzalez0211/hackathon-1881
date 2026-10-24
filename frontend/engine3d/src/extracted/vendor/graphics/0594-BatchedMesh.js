/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 194033:210390.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0594(scope) {
scope.BatchedMesh = class BatchedMesh extends scope.Mesh {
  constructor(e, i, s = i * 2, a) {
    super(new scope.BufferGeometry(), a), this.isBatchedMesh = !0, this.perObjectFrustumCulled = !0, this.sortObjects = !0, this.boundingBox = null, this.boundingSphere = null, this.customSort = null, this._instanceInfo = [], this._geometryInfo = [], this._availableInstanceIds = [], this._availableGeometryIds = [], this._nextIndexStart = 0, this._nextVertexStart = 0, this._geometryCount = 0, this._visibilityChanged = !0, this._geometryInitialized = !1, this._maxInstanceCount = e, this._maxVertexCount = i, this._maxIndexCount = s, this._multiDrawCounts = new Int32Array(e), this._multiDrawStarts = new Int32Array(e), this._multiDrawCount = 0, this._multiDrawInstances = null, this._matricesTexture = null, this._indirectTexture = null, this._colorsTexture = null, this._initMatricesTexture(), this._initIndirectTexture();
  }
  get maxInstanceCount() {
    return this._maxInstanceCount;
  }
  get instanceCount() {
    return this._instanceInfo.length - this._availableInstanceIds.length;
  }
  get unusedVertexCount() {
    return this._maxVertexCount - this._nextVertexStart;
  }
  get unusedIndexCount() {
    return this._maxIndexCount - this._nextIndexStart;
  }
  _initMatricesTexture() {
    let e = Math.sqrt(this._maxInstanceCount * 4);
    e = Math.ceil(e / 4) * 4, e = Math.max(e, 4);
    const i = new Float32Array(e * e * 4),
      s = new scope.DataTexture(i, e, e, scope.RGBAFormat, scope.FloatType);
    this._matricesTexture = s;
  }
  _initIndirectTexture() {
    let e = Math.sqrt(this._maxInstanceCount);
    e = Math.ceil(e);
    const i = new Uint32Array(e * e),
      s = new scope.DataTexture(i, e, e, scope.RedIntegerFormat, scope.UnsignedIntType);
    this._indirectTexture = s;
  }
  _initColorsTexture() {
    let e = Math.sqrt(this._maxInstanceCount);
    e = Math.ceil(e);
    const i = new Float32Array(e * e * 4).fill(1),
      s = new scope.DataTexture(i, e, e, scope.RGBAFormat, scope.FloatType);
    s.colorSpace = scope.ColorManagement.workingColorSpace, this._colorsTexture = s;
  }
  _initializeGeometry(e) {
    const i = this.geometry,
      s = this._maxVertexCount,
      a = this._maxIndexCount;
    if (this._geometryInitialized === !1) {
      for (const o in e.attributes) {
        const l = e.getAttribute(o),
          {
            array: c,
            itemSize: h,
            normalized: d
          } = l,
          p = new c.constructor(s * h),
          f = new scope.BufferAttribute(p, h, d);
        i.setAttribute(o, f);
      }
      if (e.getIndex() !== null) {
        const o = s > 65535 ? new Uint32Array(a) : new Uint16Array(a);
        i.setIndex(new scope.BufferAttribute(o, 1));
      }
      this._geometryInitialized = !0;
    }
  }
  _validateGeometry(e) {
    const i = this.geometry;
    if (!!e.getIndex() != !!i.getIndex()) throw new Error('THREE.BatchedMesh: All geometries must consistently have "index".');
    for (const s in i.attributes) {
      if (!e.hasAttribute(s)) throw new Error(`THREE.BatchedMesh: Added geometry missing "${s}". All geometries must have consistent attributes.`);
      const a = e.getAttribute(s),
        o = i.getAttribute(s);
      if (a.itemSize !== o.itemSize || a.normalized !== o.normalized) throw new Error("THREE.BatchedMesh: All attributes must have a consistent itemSize and normalized value.");
    }
  }
  validateInstanceId(e) {
    const i = this._instanceInfo;
    if (e < 0 || e >= i.length || i[e].active === !1) throw new Error(`THREE.BatchedMesh: Invalid instanceId ${e}. Instance is either out of range or has been deleted.`);
  }
  validateGeometryId(e) {
    const i = this._geometryInfo;
    if (e < 0 || e >= i.length || i[e].active === !1) throw new Error(`THREE.BatchedMesh: Invalid geometryId ${e}. Geometry is either out of range or has been deleted.`);
  }
  setCustomSort(e) {
    return this.customSort = e, this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new scope.Box3());
    const e = this.boundingBox,
      i = this._instanceInfo;
    e.makeEmpty();
    for (let s = 0, a = i.length; s < a; s++) {
      if (i[s].active === !1) continue;
      const o = i[s].geometryIndex;
      this.getMatrixAt(s, scope._matrix$1), this.getBoundingBoxAt(o, scope._box$1).applyMatrix4(scope._matrix$1), e.union(scope._box$1);
    }
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new scope.Sphere());
    const e = this.boundingSphere,
      i = this._instanceInfo;
    e.makeEmpty();
    for (let s = 0, a = i.length; s < a; s++) {
      if (i[s].active === !1) continue;
      const o = i[s].geometryIndex;
      this.getMatrixAt(s, scope._matrix$1), this.getBoundingSphereAt(o, scope._sphere$2).applyMatrix4(scope._matrix$1), e.union(scope._sphere$2);
    }
  }
  addInstance(e) {
    if (this._instanceInfo.length >= this.maxInstanceCount && this._availableInstanceIds.length === 0) throw new Error("THREE.BatchedMesh: Maximum item count reached.");
    const s = {
      visible: !0,
      active: !0,
      geometryIndex: e
    };
    let a = null;
    this._availableInstanceIds.length > 0 ? (this._availableInstanceIds.sort(scope.ascIdSort), a = this._availableInstanceIds.shift(), this._instanceInfo[a] = s) : (a = this._instanceInfo.length, this._instanceInfo.push(s));
    const o = this._matricesTexture;
    scope._matrix$1.identity().toArray(o.image.data, a * 16), o.needsUpdate = !0;
    const l = this._colorsTexture;
    return l && (scope._whiteColor.toArray(l.image.data, a * 4), l.needsUpdate = !0), this._visibilityChanged = !0, a;
  }
  addGeometry(e, i = -1, s = -1) {
    this._initializeGeometry(e), this._validateGeometry(e);
    const a = {
        vertexStart: -1,
        vertexCount: -1,
        reservedVertexCount: -1,
        indexStart: -1,
        indexCount: -1,
        reservedIndexCount: -1,
        start: -1,
        count: -1,
        boundingBox: null,
        boundingSphere: null,
        active: !0
      },
      o = this._geometryInfo;
    a.vertexStart = this._nextVertexStart, a.reservedVertexCount = i === -1 ? e.getAttribute("position").count : i;
    const l = e.getIndex();
    if (l !== null && (a.indexStart = this._nextIndexStart, a.reservedIndexCount = s === -1 ? l.count : s), a.indexStart !== -1 && a.indexStart + a.reservedIndexCount > this._maxIndexCount || a.vertexStart + a.reservedVertexCount > this._maxVertexCount) throw new Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");
    let h;
    return this._availableGeometryIds.length > 0 ? (this._availableGeometryIds.sort(scope.ascIdSort), h = this._availableGeometryIds.shift(), o[h] = a) : (h = this._geometryCount, this._geometryCount++, o.push(a)), this.setGeometryAt(h, e), this._nextIndexStart = a.indexStart + a.reservedIndexCount, this._nextVertexStart = a.vertexStart + a.reservedVertexCount, h;
  }
  setGeometryAt(e, i) {
    if (e >= this._geometryCount) throw new Error("THREE.BatchedMesh: Maximum geometry count reached.");
    this._validateGeometry(i);
    const s = this.geometry,
      a = s.getIndex() !== null,
      o = s.getIndex(),
      l = i.getIndex(),
      c = this._geometryInfo[e];
    if (a && l.count > c.reservedIndexCount || i.attributes.position.count > c.reservedVertexCount) throw new Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");
    const h = c.vertexStart,
      d = c.reservedVertexCount;
    c.vertexCount = i.getAttribute("position").count;
    for (const p in s.attributes) {
      const f = i.getAttribute(p),
        _ = s.getAttribute(p);
      scope.copyAttributeData(f, _, h);
      const x = f.itemSize;
      for (let b = f.count, T = d; b < T; b++) {
        const M = h + b;
        for (let w = 0; w < x; w++) _.setComponent(M, w, 0);
      }
      _.needsUpdate = !0, _.addUpdateRange(h * x, d * x);
    }
    if (a) {
      const p = c.indexStart,
        f = c.reservedIndexCount;
      c.indexCount = i.getIndex().count;
      for (let _ = 0; _ < l.count; _++) o.setX(p + _, h + l.getX(_));
      for (let _ = l.count, x = f; _ < x; _++) o.setX(p + _, h);
      o.needsUpdate = !0, o.addUpdateRange(p, c.reservedIndexCount);
    }
    return c.start = a ? c.indexStart : c.vertexStart, c.count = a ? c.indexCount : c.vertexCount, c.boundingBox = null, i.boundingBox !== null && (c.boundingBox = i.boundingBox.clone()), c.boundingSphere = null, i.boundingSphere !== null && (c.boundingSphere = i.boundingSphere.clone()), this._visibilityChanged = !0, e;
  }
  deleteGeometry(e) {
    const i = this._geometryInfo;
    if (e >= i.length || i[e].active === !1) return this;
    const s = this._instanceInfo;
    for (let a = 0, o = s.length; a < o; a++) s[a].active && s[a].geometryIndex === e && this.deleteInstance(a);
    return i[e].active = !1, this._availableGeometryIds.push(e), this._visibilityChanged = !0, this;
  }
  deleteInstance(e) {
    return this.validateInstanceId(e), this._instanceInfo[e].active = !1, this._availableInstanceIds.push(e), this._visibilityChanged = !0, this;
  }
  optimize() {
    let e = 0,
      i = 0;
    const s = this._geometryInfo,
      a = s.map((l, c) => c).sort((l, c) => s[l].vertexStart - s[c].vertexStart),
      o = this.geometry;
    for (let l = 0, c = s.length; l < c; l++) {
      const h = a[l],
        d = s[h];
      if (d.active !== !1) {
        if (o.index !== null) {
          if (d.indexStart !== i) {
            const {
                indexStart: p,
                vertexStart: f,
                reservedIndexCount: _
              } = d,
              x = o.index,
              b = x.array,
              T = e - f;
            for (let M = p; M < p + _; M++) b[M] = b[M] + T;
            x.array.copyWithin(i, p, p + _), x.addUpdateRange(i, _), d.indexStart = i;
          }
          i += d.reservedIndexCount;
        }
        if (d.vertexStart !== e) {
          const {
              vertexStart: p,
              reservedVertexCount: f
            } = d,
            _ = o.attributes;
          for (const x in _) {
            const b = _[x],
              {
                array: T,
                itemSize: M
              } = b;
            T.copyWithin(e * M, p * M, (p + f) * M), b.addUpdateRange(e * M, f * M);
          }
          d.vertexStart = e;
        }
        e += d.reservedVertexCount, d.start = o.index ? d.indexStart : d.vertexStart, this._nextIndexStart = o.index ? d.indexStart + d.reservedIndexCount : 0, this._nextVertexStart = d.vertexStart + d.reservedVertexCount;
      }
    }
    return this;
  }
  getBoundingBoxAt(e, i) {
    if (e >= this._geometryCount) return null;
    const s = this.geometry,
      a = this._geometryInfo[e];
    if (a.boundingBox === null) {
      const o = new scope.Box3(),
        l = s.index,
        c = s.attributes.position;
      for (let h = a.start, d = a.start + a.count; h < d; h++) {
        let p = h;
        l && (p = l.getX(p)), o.expandByPoint(scope._vector$5.fromBufferAttribute(c, p));
      }
      a.boundingBox = o;
    }
    return i.copy(a.boundingBox), i;
  }
  getBoundingSphereAt(e, i) {
    if (e >= this._geometryCount) return null;
    const s = this.geometry,
      a = this._geometryInfo[e];
    if (a.boundingSphere === null) {
      const o = new scope.Sphere();
      this.getBoundingBoxAt(e, scope._box$1), scope._box$1.getCenter(o.center);
      const l = s.index,
        c = s.attributes.position;
      let h = 0;
      for (let d = a.start, p = a.start + a.count; d < p; d++) {
        let f = d;
        l && (f = l.getX(f)), scope._vector$5.fromBufferAttribute(c, f), h = Math.max(h, o.center.distanceToSquared(scope._vector$5));
      }
      o.radius = Math.sqrt(h), a.boundingSphere = o;
    }
    return i.copy(a.boundingSphere), i;
  }
  setMatrixAt(e, i) {
    this.validateInstanceId(e);
    const s = this._matricesTexture,
      a = this._matricesTexture.image.data;
    return i.toArray(a, e * 16), s.needsUpdate = !0, this;
  }
  getMatrixAt(e, i) {
    return this.validateInstanceId(e), i.fromArray(this._matricesTexture.image.data, e * 16);
  }
  setColorAt(e, i) {
    return this.validateInstanceId(e), this._colorsTexture === null && this._initColorsTexture(), i.toArray(this._colorsTexture.image.data, e * 4), this._colorsTexture.needsUpdate = !0, this;
  }
  getColorAt(e, i) {
    return this.validateInstanceId(e), i.fromArray(this._colorsTexture.image.data, e * 4);
  }
  setVisibleAt(e, i) {
    return this.validateInstanceId(e), this._instanceInfo[e].visible === i ? this : (this._instanceInfo[e].visible = i, this._visibilityChanged = !0, this);
  }
  getVisibleAt(e) {
    return this.validateInstanceId(e), this._instanceInfo[e].visible;
  }
  setGeometryIdAt(e, i) {
    return this.validateInstanceId(e), this.validateGeometryId(i), this._instanceInfo[e].geometryIndex = i, this;
  }
  getGeometryIdAt(e) {
    return this.validateInstanceId(e), this._instanceInfo[e].geometryIndex;
  }
  getGeometryRangeAt(e, i = {}) {
    this.validateGeometryId(e);
    const s = this._geometryInfo[e];
    return i.vertexStart = s.vertexStart, i.vertexCount = s.vertexCount, i.reservedVertexCount = s.reservedVertexCount, i.indexStart = s.indexStart, i.indexCount = s.indexCount, i.reservedIndexCount = s.reservedIndexCount, i.start = s.start, i.count = s.count, i;
  }
  setInstanceCount(e) {
    const i = this._availableInstanceIds,
      s = this._instanceInfo;
    for (i.sort(scope.ascIdSort); i[i.length - 1] === s.length - 1;) s.pop(), i.pop();
    if (e < s.length) throw new Error(`BatchedMesh: Instance ids outside the range ${e} are being used. Cannot shrink instance count.`);
    const a = new Int32Array(e),
      o = new Int32Array(e);
    scope.copyArrayContents(this._multiDrawCounts, a), scope.copyArrayContents(this._multiDrawStarts, o), this._multiDrawCounts = a, this._multiDrawStarts = o, this._maxInstanceCount = e;
    const l = this._indirectTexture,
      c = this._matricesTexture,
      h = this._colorsTexture;
    l.dispose(), this._initIndirectTexture(), scope.copyArrayContents(l.image.data, this._indirectTexture.image.data), c.dispose(), this._initMatricesTexture(), scope.copyArrayContents(c.image.data, this._matricesTexture.image.data), h && (h.dispose(), this._initColorsTexture(), scope.copyArrayContents(h.image.data, this._colorsTexture.image.data));
  }
  setGeometrySize(e, i) {
    const s = [...this._geometryInfo].filter(c => c.active);
    if (Math.max(...s.map(c => c.vertexStart + c.reservedVertexCount)) > e) throw new Error(`BatchedMesh: Geometry vertex values are being used outside the range ${i}. Cannot shrink further.`);
    if (this.geometry.index && Math.max(...s.map(h => h.indexStart + h.reservedIndexCount)) > i) throw new Error(`BatchedMesh: Geometry index values are being used outside the range ${i}. Cannot shrink further.`);
    const o = this.geometry;
    o.dispose(), this._maxVertexCount = e, this._maxIndexCount = i, this._geometryInitialized && (this._geometryInitialized = !1, this.geometry = new scope.BufferGeometry(), this._initializeGeometry(o));
    const l = this.geometry;
    o.index && scope.copyArrayContents(o.index.array, l.index.array);
    for (const c in o.attributes) scope.copyArrayContents(o.attributes[c].array, l.attributes[c].array);
  }
  raycast(e, i) {
    const s = this._instanceInfo,
      a = this._geometryInfo,
      o = this.matrixWorld,
      l = this.geometry;
    scope._mesh$2.material = this.material, scope._mesh$2.geometry.index = l.index, scope._mesh$2.geometry.attributes = l.attributes, scope._mesh$2.geometry.boundingBox === null && (scope._mesh$2.geometry.boundingBox = new scope.Box3()), scope._mesh$2.geometry.boundingSphere === null && (scope._mesh$2.geometry.boundingSphere = new scope.Sphere());
    for (let c = 0, h = s.length; c < h; c++) {
      if (!s[c].visible || !s[c].active) continue;
      const d = s[c].geometryIndex,
        p = a[d];
      scope._mesh$2.geometry.setDrawRange(p.start, p.count), this.getMatrixAt(c, scope._mesh$2.matrixWorld).premultiply(o), this.getBoundingBoxAt(d, scope._mesh$2.geometry.boundingBox), this.getBoundingSphereAt(d, scope._mesh$2.geometry.boundingSphere), scope._mesh$2.raycast(e, scope._batchIntersects$1);
      for (let f = 0, _ = scope._batchIntersects$1.length; f < _; f++) {
        const x = scope._batchIntersects$1[f];
        x.object = this, x.batchId = c, i.push(x);
      }
      scope._batchIntersects$1.length = 0;
    }
    scope._mesh$2.material = null, scope._mesh$2.geometry.index = null, scope._mesh$2.geometry.attributes = {}, scope._mesh$2.geometry.setDrawRange(0, 1 / 0);
  }
  copy(e) {
    return super.copy(e), this.geometry = e.geometry.clone(), this.perObjectFrustumCulled = e.perObjectFrustumCulled, this.sortObjects = e.sortObjects, this.boundingBox = e.boundingBox !== null ? e.boundingBox.clone() : null, this.boundingSphere = e.boundingSphere !== null ? e.boundingSphere.clone() : null, this._geometryInfo = e._geometryInfo.map(i => ({
      ...i,
      boundingBox: i.boundingBox !== null ? i.boundingBox.clone() : null,
      boundingSphere: i.boundingSphere !== null ? i.boundingSphere.clone() : null
    })), this._instanceInfo = e._instanceInfo.map(i => ({
      ...i
    })), this._availableInstanceIds = e._availableInstanceIds.slice(), this._availableGeometryIds = e._availableGeometryIds.slice(), this._nextIndexStart = e._nextIndexStart, this._nextVertexStart = e._nextVertexStart, this._geometryCount = e._geometryCount, this._maxInstanceCount = e._maxInstanceCount, this._maxVertexCount = e._maxVertexCount, this._maxIndexCount = e._maxIndexCount, this._geometryInitialized = e._geometryInitialized, this._multiDrawCounts = e._multiDrawCounts.slice(), this._multiDrawStarts = e._multiDrawStarts.slice(), this._indirectTexture = e._indirectTexture.clone(), this._indirectTexture.image.data = this._indirectTexture.image.data.slice(), this._matricesTexture = e._matricesTexture.clone(), this._matricesTexture.image.data = this._matricesTexture.image.data.slice(), this._colorsTexture !== null && (this._colorsTexture = e._colorsTexture.clone(), this._colorsTexture.image.data = this._colorsTexture.image.data.slice()), this;
  }
  dispose() {
    this.geometry.dispose(), this._matricesTexture.dispose(), this._matricesTexture = null, this._indirectTexture.dispose(), this._indirectTexture = null, this._colorsTexture !== null && (this._colorsTexture.dispose(), this._colorsTexture = null);
  }
  onBeforeRender(e, i, s, a, o) {
    if (!this._visibilityChanged && !this.perObjectFrustumCulled && !this.sortObjects) return;
    const l = a.getIndex(),
      c = l === null ? 1 : l.array.BYTES_PER_ELEMENT,
      h = this._instanceInfo,
      d = this._multiDrawStarts,
      p = this._multiDrawCounts,
      f = this._geometryInfo,
      _ = this.perObjectFrustumCulled,
      x = this._indirectTexture,
      b = x.image.data,
      T = s.isArrayCamera ? scope._frustumArray : scope._frustum$2;
    _ && !s.isArrayCamera && (scope._matrix$1.multiplyMatrices(s.projectionMatrix, s.matrixWorldInverse).multiply(this.matrixWorld), scope._frustum$2.setFromProjectionMatrix(scope._matrix$1, s.coordinateSystem, s.reversedDepth));
    let M = 0;
    if (this.sortObjects) {
      scope._matrix$1.copy(this.matrixWorld).invert(), scope._vector$5.setFromMatrixPosition(s.matrixWorld).applyMatrix4(scope._matrix$1), scope._forward$1.set(0, 0, -1).transformDirection(s.matrixWorld).transformDirection(scope._matrix$1);
      for (let R = 0, P = h.length; R < P; R++) if (h[R].visible && h[R].active) {
        const U = h[R].geometryIndex;
        this.getMatrixAt(R, scope._matrix$1), this.getBoundingSphereAt(U, scope._sphere$2).applyMatrix4(scope._matrix$1);
        let O = !1;
        if (_ && (O = !T.intersectsSphere(scope._sphere$2, s)), !O) {
          const N = f[U],
            H = scope._temp.subVectors(scope._sphere$2.center, scope._vector$5).dot(scope._forward$1);
          scope._renderList.push(N.start, N.count, H, R);
        }
      }
      const w = scope._renderList.list,
        D = this.customSort;
      D === null ? w.sort(o.transparent ? scope.sortTransparent : scope.sortOpaque) : D.call(this, w, s);
      for (let R = 0, P = w.length; R < P; R++) {
        const U = w[R];
        d[M] = U.start * c, p[M] = U.count, b[M] = U.index, M++;
      }
      scope._renderList.reset();
    } else for (let w = 0, D = h.length; w < D; w++) if (h[w].visible && h[w].active) {
      const R = h[w].geometryIndex;
      let P = !1;
      if (_ && (this.getMatrixAt(w, scope._matrix$1), this.getBoundingSphereAt(R, scope._sphere$2).applyMatrix4(scope._matrix$1), P = !T.intersectsSphere(scope._sphere$2, s)), !P) {
        const U = f[R];
        d[M] = U.start * c, p[M] = U.count, b[M] = w, M++;
      }
    }
    x.needsUpdate = !0, this._multiDrawCount = M, this._visibilityChanged = !1;
  }
  onBeforeShadow(e, i, s, a, o, l) {
    this.onBeforeRender(e, null, a, o, l);
  }
};
}
