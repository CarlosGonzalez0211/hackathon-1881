/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 835590:838195.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1374(scope) {
scope.mergeGeometries = function mergeGeometries(r, e = !1) {
  const i = r[0].index !== null,
    s = new Set(Object.keys(r[0].attributes)),
    a = new Set(Object.keys(r[0].morphAttributes)),
    o = {},
    l = {},
    c = r[0].morphTargetsRelative,
    h = new scope.BufferGeometry();
  let d = 0;
  for (let p = 0; p < r.length; ++p) {
    const f = r[p];
    let _ = 0;
    if (i !== (f.index !== null)) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + p + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const x in f.attributes) {
      if (!s.has(x)) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + p + '. All geometries must have compatible attributes; make sure "' + x + '" attribute exists among all geometries, or in none of them.'), null;
      o[x] === void 0 && (o[x] = []), o[x].push(f.attributes[x]), _++;
    }
    if (_ !== s.size) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + p + ". Make sure all geometries have the same number of attributes."), null;
    if (c !== f.morphTargetsRelative) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + p + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
    for (const x in f.morphAttributes) {
      if (!a.has(x)) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + p + ".  .morphAttributes must be consistent throughout all geometries."), null;
      l[x] === void 0 && (l[x] = []), l[x].push(f.morphAttributes[x]);
    }
    if (e) {
      let x;
      if (i) x = f.index.count;else if (f.attributes.position !== void 0) x = f.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + p + ". The geometry must have either an index or a position attribute"), null;
      h.addGroup(d, x, p), d += x;
    }
  }
  if (i) {
    let p = 0;
    const f = [];
    for (let _ = 0; _ < r.length; ++_) {
      const x = r[_].index;
      for (let b = 0; b < x.count; ++b) f.push(x.getX(b) + p);
      p += r[_].attributes.position.count;
    }
    h.setIndex(f);
  }
  for (const p in o) {
    const f = scope.mergeAttributes(o[p]);
    if (!f) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + p + " attribute."), null;
    h.setAttribute(p, f);
  }
  for (const p in l) {
    const f = l[p][0].length;
    if (f === 0) break;
    h.morphAttributes = h.morphAttributes || {}, h.morphAttributes[p] = [];
    for (let _ = 0; _ < f; ++_) {
      const x = [];
      for (let T = 0; T < l[p].length; ++T) x.push(l[p][T][_]);
      const b = scope.mergeAttributes(x);
      if (!b) return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + p + " morphAttribute."), null;
      h.morphAttributes[p].push(b);
    }
  }
  return h;
};
}
