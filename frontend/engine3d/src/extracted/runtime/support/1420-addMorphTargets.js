/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 864177:865027.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1420(scope) {
scope.addMorphTargets = function addMorphTargets(r, e, i) {
  let s = !1,
    a = !1,
    o = !1;
  for (let d = 0, p = e.length; d < p; d++) {
    const f = e[d];
    if (f.POSITION !== void 0 && (s = !0), f.NORMAL !== void 0 && (a = !0), f.COLOR_0 !== void 0 && (o = !0), s && a && o) break;
  }
  if (!s && !a && !o) return Promise.resolve(r);
  const l = [],
    c = [],
    h = [];
  for (let d = 0, p = e.length; d < p; d++) {
    const f = e[d];
    if (s) {
      const _ = f.POSITION !== void 0 ? i.getDependency("accessor", f.POSITION) : r.attributes.position;
      l.push(_);
    }
    if (a) {
      const _ = f.NORMAL !== void 0 ? i.getDependency("accessor", f.NORMAL) : r.attributes.normal;
      c.push(_);
    }
    if (o) {
      const _ = f.COLOR_0 !== void 0 ? i.getDependency("accessor", f.COLOR_0) : r.attributes.color;
      h.push(_);
    }
  }
  return Promise.all([Promise.all(l), Promise.all(c), Promise.all(h)]).then(function (d) {
    const p = d[0],
      f = d[1],
      _ = d[2];
    return s && (r.morphAttributes.position = p), a && (r.morphAttributes.normal = f), o && (r.morphAttributes.color = _), r.morphTargetsRelative = !0, r;
  });
};
}
