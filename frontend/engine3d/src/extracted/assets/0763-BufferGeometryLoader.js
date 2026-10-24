/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 281160:283221.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0763(scope) {
scope.BufferGeometryLoader = class BufferGeometryLoader extends scope.Loader$1 {
  constructor(e) {
    super(e);
  }
  load(e, i, s, a) {
    const o = this,
      l = new scope.FileLoader(o.manager);
    l.setPath(o.path), l.setRequestHeader(o.requestHeader), l.setWithCredentials(o.withCredentials), l.load(e, function (c) {
      try {
        i(o.parse(JSON.parse(c)));
      } catch (h) {
        a ? a(h) : console.error(h), o.manager.itemError(e);
      }
    }, s, a);
  }
  parse(e) {
    const i = {},
      s = {};
    function a(x, b) {
      if (i[b] !== void 0) return i[b];
      const M = x.interleavedBuffers[b],
        w = o(x, M.buffer),
        D = scope.getTypedArray(M.type, w),
        R = new scope.InterleavedBuffer(D, M.stride);
      return R.uuid = M.uuid, i[b] = R, R;
    }
    function o(x, b) {
      if (s[b] !== void 0) return s[b];
      const M = x.arrayBuffers[b],
        w = new Uint32Array(M).buffer;
      return s[b] = w, w;
    }
    const l = e.isInstancedBufferGeometry ? new scope.InstancedBufferGeometry() : new scope.BufferGeometry(),
      c = e.data.index;
    if (c !== void 0) {
      const x = scope.getTypedArray(c.type, c.array);
      l.setIndex(new scope.BufferAttribute(x, 1));
    }
    const h = e.data.attributes;
    for (const x in h) {
      const b = h[x];
      let T;
      if (b.isInterleavedBufferAttribute) {
        const M = a(e.data, b.data);
        T = new scope.InterleavedBufferAttribute(M, b.itemSize, b.offset, b.normalized);
      } else {
        const M = scope.getTypedArray(b.type, b.array),
          w = b.isInstancedBufferAttribute ? scope.InstancedBufferAttribute : scope.BufferAttribute;
        T = new w(M, b.itemSize, b.normalized);
      }
      b.name !== void 0 && (T.name = b.name), b.usage !== void 0 && T.setUsage(b.usage), l.setAttribute(x, T);
    }
    const d = e.data.morphAttributes;
    if (d) for (const x in d) {
      const b = d[x],
        T = [];
      for (let M = 0, w = b.length; M < w; M++) {
        const D = b[M];
        let R;
        if (D.isInterleavedBufferAttribute) {
          const P = a(e.data, D.data);
          R = new scope.InterleavedBufferAttribute(P, D.itemSize, D.offset, D.normalized);
        } else {
          const P = scope.getTypedArray(D.type, D.array);
          R = new scope.BufferAttribute(P, D.itemSize, D.normalized);
        }
        D.name !== void 0 && (R.name = D.name), T.push(R);
      }
      l.morphAttributes[x] = T;
    }
    e.data.morphTargetsRelative && (l.morphTargetsRelative = !0);
    const f = e.data.groups || e.data.drawcalls || e.data.offsets;
    if (f !== void 0) for (let x = 0, b = f.length; x !== b; ++x) {
      const T = f[x];
      l.addGroup(T.start, T.count, T.materialIndex);
    }
    const _ = e.data.boundingSphere;
    return _ !== void 0 && (l.boundingSphere = new scope.Sphere().fromJSON(_)), e.name && (l.name = e.name), e.userData && (l.userData = e.userData), l;
  }
};
}
