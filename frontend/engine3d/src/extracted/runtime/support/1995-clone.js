/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1549751:1550114.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1995(scope) {
scope.clone = function clone(r) {
  const e = new Map(),
    i = new Map(),
    s = r.clone();
  return scope.parallelTraverse(r, s, function (a, o) {
    e.set(o, a), i.set(a, o);
  }), s.traverse(function (a) {
    if (!a.isSkinnedMesh) return;
    const o = a,
      l = e.get(a),
      c = l.skeleton.bones;
    o.skeleton = l.skeleton.clone(), o.bindMatrix.copy(l.bindMatrix), o.skeleton.bones = c.map(function (h) {
      return i.get(h);
    }), o.bind(o.skeleton, o.bindMatrix);
  }), s;
};
}
