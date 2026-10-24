/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 495535:496323.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0980(scope) {
scope.WebGLCubeMaps = function WebGLCubeMaps(r) {
  let e = new WeakMap();
  function i(l, c) {
    return c === scope.EquirectangularReflectionMapping ? l.mapping = scope.CubeReflectionMapping : c === scope.EquirectangularRefractionMapping && (l.mapping = scope.CubeRefractionMapping), l;
  }
  function s(l) {
    if (l && l.isTexture) {
      const c = l.mapping;
      if (c === scope.EquirectangularReflectionMapping || c === scope.EquirectangularRefractionMapping) if (e.has(l)) {
        const h = e.get(l).texture;
        return i(h, l.mapping);
      } else {
        const h = l.image;
        if (h && h.height > 0) {
          const d = new scope.WebGLCubeRenderTarget(h.height);
          return d.fromEquirectangularTexture(r, l), e.set(l, d), scope.__lifecycle.listen(l, "dispose", a), i(d.texture, l.mapping);
        } else return null;
      }
    }
    return l;
  }
  function a(l) {
    const c = l.target;
    scope.__lifecycle.unlisten(c, "dispose", a);
    const h = e.get(c);
    h !== void 0 && (e.delete(c), h.dispose());
  }
  function o() {
    e = new WeakMap();
  }
  return {
    get: s,
    dispose: o
  };
};
}
