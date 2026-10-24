/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 759201:759614.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1259(scope) {
scope.createCurves = function createCurves(r, e, i) {
  const s = [];
  return Object.values(r.attributes).forEach(o => {
    const l = o.count,
      c = o.array,
      h = [];
    for (let f = 0; f < l; f++) h.push(new scope.Vector3(c[f * 3 + 0], c[f * 3 + 1], c[f * 3 + 2]));
    const d = new scope.CurvePath();
    for (let f = 0; f < h.length - 1; f++) d.add(new scope.LineCurve3(h[f], h[f + 1]));
    i && (d.autoClose = !0);
    const p = d.getPoints(Math.round(d.getLength() * 10 * e));
    s.push({
      curve: d,
      geometry: new scope.BufferGeometry().setFromPoints(p)
    });
  }), s;
};
}
