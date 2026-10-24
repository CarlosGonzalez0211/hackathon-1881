/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 887092:888275.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1428(scope) {
scope.computeBounds = function computeBounds(r, e, i) {
  const s = e.attributes,
    a = new scope.Box3();
  if (s.POSITION !== void 0) {
    const c = i.json.accessors[s.POSITION],
      h = c.min,
      d = c.max;
    if (h !== void 0 && d !== void 0) {
      if (a.set(new scope.Vector3(h[0], h[1], h[2]), new scope.Vector3(d[0], d[1], d[2])), c.normalized) {
        const p = scope.getNormalizedComponentScale(scope.WEBGL_COMPONENT_TYPES[c.componentType]);
        a.min.multiplyScalar(p), a.max.multiplyScalar(p);
      }
    } else {
      console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      return;
    }
  } else return;
  const o = e.targets;
  if (o !== void 0) {
    const c = new scope.Vector3(),
      h = new scope.Vector3();
    for (let d = 0, p = o.length; d < p; d++) {
      const f = o[d];
      if (f.POSITION !== void 0) {
        const _ = i.json.accessors[f.POSITION],
          x = _.min,
          b = _.max;
        if (x !== void 0 && b !== void 0) {
          if (h.setX(Math.max(Math.abs(x[0]), Math.abs(b[0]))), h.setY(Math.max(Math.abs(x[1]), Math.abs(b[1]))), h.setZ(Math.max(Math.abs(x[2]), Math.abs(b[2]))), _.normalized) {
            const T = scope.getNormalizedComponentScale(scope.WEBGL_COMPONENT_TYPES[_.componentType]);
            h.multiplyScalar(T);
          }
          c.max(h);
        } else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      }
    }
    a.expandByVector(c);
  }
  r.boundingBox = a;
  const l = new scope.Sphere();
  a.getCenter(l.center), l.radius = a.min.distanceTo(a.max) / 2, r.boundingSphere = l;
};
}
