/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 514794:515453.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1008(scope) {
scope.WebGLObjects = function WebGLObjects(r, e, i, s) {
  let a = new WeakMap();
  function o(h) {
    const d = s.render.frame,
      p = h.geometry,
      f = e.get(h, p);
    if (a.get(f) !== d && (e.update(f), a.set(f, d)), h.isInstancedMesh && (h.hasEventListener("dispose", c) === !1 && scope.__lifecycle.listen(h, "dispose", c), a.get(h) !== d && (i.update(h.instanceMatrix, r.ARRAY_BUFFER), h.instanceColor !== null && i.update(h.instanceColor, r.ARRAY_BUFFER), a.set(h, d))), h.isSkinnedMesh) {
      const _ = h.skeleton;
      a.get(_) !== d && (_.update(), a.set(_, d));
    }
    return f;
  }
  function l() {
    a = new WeakMap();
  }
  function c(h) {
    const d = h.target;
    scope.__lifecycle.unlisten(d, "dispose", c), i.remove(d.instanceMatrix), d.instanceColor !== null && i.remove(d.instanceColor);
  }
  return {
    update: o,
    dispose: l
  };
};
}
