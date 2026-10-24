/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 510488:511698.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1004(scope) {
scope.WebGLGeometries = function WebGLGeometries(r, e, i, s) {
  const a = {},
    o = new WeakMap();
  function l(f) {
    const _ = f.target;
    _.index !== null && e.remove(_.index);
    for (const b in _.attributes) e.remove(_.attributes[b]);
    scope.__lifecycle.unlisten(_, "dispose", l), delete a[_.id];
    const x = o.get(_);
    x && (e.remove(x), o.delete(_)), s.releaseStatesOfGeometry(_), _.isInstancedBufferGeometry === !0 && delete _._maxInstanceCount, i.memory.geometries--;
  }
  function c(f, _) {
    return a[_.id] === !0 || (scope.__lifecycle.listen(_, "dispose", l), a[_.id] = !0, i.memory.geometries++), _;
  }
  function h(f) {
    const _ = f.attributes;
    for (const x in _) e.update(_[x], r.ARRAY_BUFFER);
  }
  function d(f) {
    const _ = [],
      x = f.index,
      b = f.attributes.position;
    let T = 0;
    if (x !== null) {
      const D = x.array;
      T = x.version;
      for (let R = 0, P = D.length; R < P; R += 3) {
        const U = D[R + 0],
          O = D[R + 1],
          N = D[R + 2];
        _.push(U, O, O, N, N, U);
      }
    } else if (b !== void 0) {
      const D = b.array;
      T = b.version;
      for (let R = 0, P = D.length / 3 - 1; R < P; R += 3) {
        const U = R + 0,
          O = R + 1,
          N = R + 2;
        _.push(U, O, O, N, N, U);
      }
    } else return;
    const M = new (scope.arrayNeedsUint32(_) ? scope.Uint32BufferAttribute : scope.Uint16BufferAttribute)(_, 1);
    M.version = T;
    const w = o.get(f);
    w && e.remove(w), o.set(f, M);
  }
  function p(f) {
    const _ = o.get(f);
    if (_) {
      const x = f.index;
      x !== null && _.version < x.version && d(f);
    } else d(f);
    return o.get(f);
  }
  return {
    get: c,
    update: h,
    getWireframeAttribute: p
  };
};
}
