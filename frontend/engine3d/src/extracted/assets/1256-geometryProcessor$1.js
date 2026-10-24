/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 755451:758123.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1256(scope) {
scope.geometryProcessor$1 = (scope.io = class {
  constructor() {
    scope.oe(this, scope.Kt);
    scope.oe(this, scope.On, new scope.workerTask().setWorkerCreator(() => new scope.WorkerWrapper$5()));
  }
  batched(e) {
    if (!e.isBufferGeometry) throw new Error("geometryProcessor.batched: geometry is not a BufferGeometry");
    const {
      attribs: i,
      transfers: s
    } = scope.Ee(this, scope.Kt, scope.Yn).call(this, e);
    return scope.L(this, scope.On).postMessage({
      action: "batched",
      attributes: i
    }, s).then(a => {
      const o = [];
      for (let l = 0; l < a.result.length; l++) {
        const c = a.result[l];
        o.push(scope.Ee(this, scope.Kt, scope._o).call(this, c));
      }
      return o;
    });
  }
  instanced(e, i) {
    if (!e.isBufferGeometry || !i.isBufferGeometry) throw new Error("geometryProcessor.instanced: geometries are not a BufferGeometry");
    const s = scope.Ee(this, scope.Kt, scope.Yn).call(this, e),
      a = scope.Ee(this, scope.Kt, scope.Yn).call(this, i);
    return scope.L(this, scope.On).postMessage({
      action: "instanced",
      attributes: s.attribs,
      attributesInstanced: a.attribs
    }, [...s.transfers, ...a.transfers]).then(o => {
      const l = o.result,
        c = scope.Ee(this, scope.Kt, scope.Ua).call(this, l);
      return scope.Ee(this, scope.Kt, scope.Fa).call(this, e, c), c;
    });
  }
  instancedPatches(e, i) {
    if (!e.isBufferGeometry || !i.isBufferGeometry) throw new Error("geometryProcessor.instanced: geometries are not a BufferGeometry");
    const s = scope.Ee(this, scope.Kt, scope.Yn).call(this, e),
      a = scope.Ee(this, scope.Kt, scope.Yn).call(this, i);
    return scope.L(this, scope.On).postMessage({
      action: "instancedPatches",
      attributes: s.attribs,
      attributesInstanced: a.attribs
    }, [...s.transfers, ...a.transfers]).then(o => {
      const l = [];
      for (let c = 0; c < o.result.length; c++) {
        const h = o.result[c],
          d = scope.Ee(this, scope.Kt, scope.Ua).call(this, h);
        scope.Ee(this, scope.Kt, scope.Fa).call(this, e, d), l.push(d);
      }
      return l;
    });
  }
  dispose() {
    scope.L(this, scope.On).dispose();
  }
}, scope.On = new WeakMap(), scope.Kt = new WeakSet(), scope.Yn = function (e) {
  const i = {},
    s = [];
  if (e.getIndex()) {
    const a = e.getIndex();
    i.index = {
      array: a.array,
      itemSize: a.itemSize,
      normalized: a.normalized
    }, s.push(a.array.buffer);
  }
  for (const a in e.attributes) {
    const o = e.getAttribute(a);
    i[a] = {
      array: o.array,
      itemSize: o.itemSize,
      normalized: o.normalized
    }, s.push(i[a].array.buffer);
  }
  return {
    attribs: i,
    transfers: s,
    userData: e.userData
  };
}, scope._o = function (e) {
  const i = new scope.BufferGeometry();
  for (const s in e) if (s === "userData") i.userData = e.userData;else {
    const a = e[s];
    s === "index" ? i.setIndex(new scope.BufferAttribute(a.array, a.itemSize, a.normalized)) : i.setAttribute(s, new scope.BufferAttribute(a.array, a.itemSize, a.normalized));
  }
  return i;
}, scope.Ua = function (e) {
  const i = new scope.InstancedBufferGeometry();
  for (const s in e) if (s === "userData") i.userData = e.userData;else if (s === "instanceCount") i.instanceCount = e.instanceCount;else if (s === "matrixArray") i._matrixArray = e[s];else {
    const a = e[s];
    s === "index" ? i.setIndex(new scope.BufferAttribute(a.array, a.itemSize, a.normalized)) : i.setAttribute(s, new (a.isInstanced ? scope.InstancedBufferAttribute : scope.BufferAttribute)(a.array, a.itemSize, a.normalized));
  }
  return i;
}, scope.Fa = function (e, i) {
  e.__vertexAnimationUniforms && (i.__vertexAnimationUniforms = e.__vertexAnimationUniforms);
}, scope.io);
}
