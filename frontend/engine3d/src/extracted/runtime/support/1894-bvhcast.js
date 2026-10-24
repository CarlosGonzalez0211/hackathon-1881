/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1361016:1361621.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1894(scope) {
scope.bvhcast = function bvhcast(r, e, i, s) {
  if (scope._active) throw new Error("MeshBVH: Recursive calls to bvhcast not supported.");
  scope._active = !0;
  const a = r._roots,
    o = e._roots;
  let l,
    c = 0,
    h = 0;
  const d = new scope.Matrix4().copy(i).invert();
  for (let p = 0, f = a.length; p < f; p++) {
    scope._bufferStack1.setBuffer(a[p]), h = 0;
    const _ = scope._boxPool.getPrimitive();
    scope.arrayToBox(0, scope._bufferStack1.float32Array, _), _.applyMatrix4(d);
    for (let x = 0, b = o.length; x < b && (scope._bufferStack2.setBuffer(o[x]), l = scope._traverse(0, 0, i, d, s, c, h, 0, 0, _), scope._bufferStack2.clearBuffer(), h += o[x].length, !l); x++);
    if (scope._boxPool.releasePrimitive(_), scope._bufferStack1.clearBuffer(), c += a[p].length, l) break;
  }
  return scope._active = !1, l;
};
}
