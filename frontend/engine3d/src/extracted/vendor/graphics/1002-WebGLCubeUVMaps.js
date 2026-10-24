/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 508192:509257.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1002(scope) {
scope.WebGLCubeUVMaps = function WebGLCubeUVMaps(r) {
  let e = new WeakMap(),
    i = null;
  function s(c) {
    if (c && c.isTexture) {
      const h = c.mapping,
        d = h === scope.EquirectangularReflectionMapping || h === scope.EquirectangularRefractionMapping,
        p = h === scope.CubeReflectionMapping || h === scope.CubeRefractionMapping;
      if (d || p) {
        let f = e.get(c);
        const _ = f !== void 0 ? f.texture.pmremVersion : 0;
        if (c.isRenderTargetTexture && c.pmremVersion !== _) return i === null && (i = new scope.PMREMGenerator(r)), f = d ? i.fromEquirectangular(c, f) : i.fromCubemap(c, f), f.texture.pmremVersion = c.pmremVersion, e.set(c, f), f.texture;
        if (f !== void 0) return f.texture;
        {
          const x = c.image;
          return d && x && x.height > 0 || p && x && a(x) ? (i === null && (i = new scope.PMREMGenerator(r)), f = d ? i.fromEquirectangular(c) : i.fromCubemap(c), f.texture.pmremVersion = c.pmremVersion, e.set(c, f), scope.__lifecycle.listen(c, "dispose", o), f.texture) : null;
        }
      }
    }
    return c;
  }
  function a(c) {
    let h = 0;
    const d = 6;
    for (let p = 0; p < d; p++) c[p] !== void 0 && h++;
    return h === d;
  }
  function o(c) {
    const h = c.target;
    scope.__lifecycle.unlisten(h, "dispose", o);
    const d = e.get(h);
    d !== void 0 && (e.delete(h), d.dispose());
  }
  function l() {
    e = new WeakMap(), i !== null && (i.dispose(), i = null);
  }
  return {
    get: s,
    dispose: l
  };
};
}
