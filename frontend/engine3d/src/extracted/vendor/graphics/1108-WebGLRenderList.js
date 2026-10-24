/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 556459:557469.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1108(scope) {
scope.WebGLRenderList = function WebGLRenderList() {
  const r = [];
  let e = 0;
  const i = [],
    s = [],
    a = [];
  function o() {
    e = 0, i.length = 0, s.length = 0, a.length = 0;
  }
  function l(f, _, x, b, T, M) {
    let w = r[e];
    return w === void 0 ? (w = {
      id: f.id,
      object: f,
      geometry: _,
      material: x,
      groupOrder: b,
      renderOrder: f.renderOrder,
      z: T,
      group: M
    }, r[e] = w) : (w.id = f.id, w.object = f, w.geometry = _, w.material = x, w.groupOrder = b, w.renderOrder = f.renderOrder, w.z = T, w.group = M), e++, w;
  }
  function c(f, _, x, b, T, M) {
    const w = l(f, _, x, b, T, M);
    x.transmission > 0 ? s.push(w) : x.transparent === !0 ? a.push(w) : i.push(w);
  }
  function h(f, _, x, b, T, M) {
    const w = l(f, _, x, b, T, M);
    x.transmission > 0 ? s.unshift(w) : x.transparent === !0 ? a.unshift(w) : i.unshift(w);
  }
  function d(f, _) {
    i.length > 1 && i.sort(f || scope.painterSortStable), s.length > 1 && s.sort(_ || scope.reversePainterSortStable), a.length > 1 && a.sort(_ || scope.reversePainterSortStable);
  }
  function p() {
    for (let f = e, _ = r.length; f < _; f++) {
      const x = r[f];
      if (x.id === null) break;
      x.id = null, x.object = null, x.geometry = null, x.material = null, x.group = null;
    }
  }
  return {
    opaque: i,
    transmissive: s,
    transparent: a,
    init: o,
    push: c,
    unshift: h,
    finish: p,
    sort: d
  };
};
}
