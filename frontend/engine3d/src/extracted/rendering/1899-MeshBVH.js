/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1363640:1368385.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1899(scope) {
scope.MeshBVH = class MeshBVH {
  static serialize(e, i = {}) {
    i = {
      cloneBuffers: !0,
      ...i
    };
    const s = e.geometry,
      a = e._roots,
      o = e._indirectBuffer,
      l = s.getIndex();
    let c;
    return i.cloneBuffers ? c = {
      roots: a.map(h => h.slice()),
      index: l ? l.array.slice() : null,
      indirectBuffer: o ? o.slice() : null
    } : c = {
      roots: a,
      index: l ? l.array : null,
      indirectBuffer: o
    }, c;
  }
  static deserialize(e, i, s = {}) {
    s = {
      setIndex: !0,
      indirect: !!e.indirectBuffer,
      ...s
    };
    const {
        index: a,
        roots: o,
        indirectBuffer: l
      } = e,
      c = new scope.MeshBVH(i, {
        ...s,
        [scope.SKIP_GENERATION]: !0
      });
    if (c._roots = o, c._indirectBuffer = l || null, s.setIndex) {
      const h = i.getIndex();
      if (h === null) {
        const d = new scope.BufferAttribute(e.index, 1, !1);
        i.setIndex(d);
      } else h.array !== a && (h.array.set(a), h.needsUpdate = !0);
    }
    return c;
  }
  get indirect() {
    return !!this._indirectBuffer;
  }
  constructor(e, i = {}) {
    if (e.isBufferGeometry) {
      if (e.index && e.index.isInterleavedBufferAttribute) throw new Error("MeshBVH: InterleavedBufferAttribute is not supported for the index attribute.");
    } else throw new Error("MeshBVH: Only BufferGeometries are supported.");
    if (i = Object.assign({
      ...scope.DEFAULT_OPTIONS,
      [scope.SKIP_GENERATION]: !1
    }, i), i.useSharedArrayBuffer && !scope.isSharedArrayBufferSupported()) throw new Error("MeshBVH: SharedArrayBuffer is not available.");
    this.geometry = e, this._roots = null, this._indirectBuffer = null, i[scope.SKIP_GENERATION] || (scope.buildPackedTree(this, i), !e.boundingBox && i.setBoundingBox && (e.boundingBox = this.getBoundingBox(new scope.Box3()))), this.resolveTriangleIndex = i.indirect ? s => this._indirectBuffer[s] : s => s;
  }
  refit(e = null) {
    return (this.indirect ? scope.refit_indirect : scope.refit)(this, e);
  }
  traverse(e, i = 0) {
    const s = this._roots[i],
      a = new Uint32Array(s),
      o = new Uint16Array(s);
    l(0);
    function l(c, h = 0) {
      const d = c * 2,
        p = o[d + 15] === scope.IS_LEAFNODE_FLAG;
      if (p) {
        const f = a[c + 6],
          _ = o[d + 14];
        e(h, p, new Float32Array(s, c * 4, 6), f, _);
      } else {
        const f = c + scope.BYTES_PER_NODE / 4,
          _ = a[c + 6],
          x = a[c + 7];
        e(h, p, new Float32Array(s, c * 4, 6), x) || (l(f, h + 1), l(_, h + 1));
      }
    }
  }
  raycast(e, i = scope.FrontSide, s = 0, a = 1 / 0) {
    const o = this._roots,
      l = this.geometry,
      c = [],
      h = i.isMaterial,
      d = Array.isArray(i),
      p = l.groups,
      f = h ? i.side : i,
      _ = this.indirect ? scope.raycast_indirect : scope.raycast;
    for (let x = 0, b = o.length; x < b; x++) {
      const T = d ? i[p[x].materialIndex].side : f,
        M = c.length;
      if (_(this, x, T, e, c, s, a), d) {
        const w = p[x].materialIndex;
        for (let D = M, R = c.length; D < R; D++) c[D].face.materialIndex = w;
      }
    }
    return c;
  }
  raycastFirst(e, i = scope.FrontSide, s = 0, a = 1 / 0) {
    const o = this._roots,
      l = this.geometry,
      c = i.isMaterial,
      h = Array.isArray(i);
    let d = null;
    const p = l.groups,
      f = c ? i.side : i,
      _ = this.indirect ? scope.raycastFirst_indirect : scope.raycastFirst;
    for (let x = 0, b = o.length; x < b; x++) {
      const T = h ? i[p[x].materialIndex].side : f,
        M = _(this, x, T, e, s, a);
      M != null && (d == null || M.distance < d.distance) && (d = M, h && (M.face.materialIndex = p[x].materialIndex));
    }
    return d;
  }
  intersectsGeometry(e, i) {
    let s = !1;
    const a = this._roots,
      o = this.indirect ? scope.intersectsGeometry_indirect : scope.intersectsGeometry;
    for (let l = 0, c = a.length; l < c && (s = o(this, l, e, i), !s); l++);
    return s;
  }
  shapecast(e) {
    const i = scope.ExtendedTrianglePool.getPrimitive(),
      s = this.indirect ? scope.iterateOverTriangles_indirect : scope.iterateOverTriangles;
    let {
      boundsTraverseOrder: a,
      intersectsBounds: o,
      intersectsRange: l,
      intersectsTriangle: c
    } = e;
    if (l && c) {
      const f = l;
      l = (_, x, b, T, M) => f(_, x, b, T, M) ? !0 : s(_, x, this, c, b, T, i);
    } else l || (c ? l = (f, _, x, b) => s(f, _, this, c, x, b, i) : l = (f, _, x) => x);
    let h = !1,
      d = 0;
    const p = this._roots;
    for (let f = 0, _ = p.length; f < _; f++) {
      const x = p[f];
      if (h = scope.shapecast(this, f, o, l, a, d), h) break;
      d += x.byteLength;
    }
    return scope.ExtendedTrianglePool.releasePrimitive(i), h;
  }
  bvhcast(e, i, s) {
    let {
      intersectsRanges: a,
      intersectsTriangles: o
    } = s;
    const l = scope.ExtendedTrianglePool.getPrimitive(),
      c = this.geometry.index,
      h = this.geometry.attributes.position,
      d = this.indirect ? b => {
        const T = this.resolveTriangleIndex(b);
        scope.setTriangle(l, T * 3, c, h);
      } : b => {
        scope.setTriangle(l, b * 3, c, h);
      },
      p = scope.ExtendedTrianglePool.getPrimitive(),
      f = e.geometry.index,
      _ = e.geometry.attributes.position,
      x = e.indirect ? b => {
        const T = e.resolveTriangleIndex(b);
        scope.setTriangle(p, T * 3, f, _);
      } : b => {
        scope.setTriangle(p, b * 3, f, _);
      };
    if (o) {
      const b = (T, M, w, D, R, P, U, O) => {
        for (let N = w, H = w + D; N < H; N++) {
          x(N), p.a.applyMatrix4(i), p.b.applyMatrix4(i), p.c.applyMatrix4(i), p.needsUpdate = !0;
          for (let F = T, k = T + M; F < k; F++) if (d(F), l.needsUpdate = !0, o(l, p, F, N, R, P, U, O)) return !0;
        }
        return !1;
      };
      if (a) {
        const T = a;
        a = function (M, w, D, R, P, U, O, N) {
          return T(M, w, D, R, P, U, O, N) ? !0 : b(M, w, D, R, P, U, O, N);
        };
      } else a = b;
    }
    return scope.bvhcast(this, e, i, a);
  }
  intersectsBox(e, i) {
    return scope.obb.set(e.min, e.max, i), scope.obb.needsUpdate = !0, this.shapecast({
      intersectsBounds: s => scope.obb.intersectsBox(s),
      intersectsTriangle: s => scope.obb.intersectsTriangle(s)
    });
  }
  intersectsSphere(e) {
    return this.shapecast({
      intersectsBounds: i => e.intersectsBox(i),
      intersectsTriangle: i => i.intersectsSphere(e)
    });
  }
  closestPointToGeometry(e, i, s = {}, a = {}, o = 0, l = 1 / 0) {
    return (this.indirect ? scope.closestPointToGeometry_indirect : scope.closestPointToGeometry)(this, e, i, s, a, o, l);
  }
  closestPointToPoint(e, i = {}, s = 0, a = 1 / 0) {
    return scope.closestPointToPoint(this, e, i, s, a);
  }
  getBoundingBox(e) {
    return e.makeEmpty(), this._roots.forEach(s => {
      scope.arrayToBox(0, new Float32Array(s), scope.tempBox), e.union(scope.tempBox);
    }), e;
  }
};
}
