/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 557469:557715.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1109(scope) {
scope.WebGLRenderLists = function WebGLRenderLists() {
  let r = new WeakMap();
  function e(s, a) {
    const o = r.get(s);
    let l;
    return o === void 0 ? (l = new scope.WebGLRenderList(), r.set(s, [l])) : a >= o.length ? (l = new scope.WebGLRenderList(), o.push(l)) : l = o[a], l;
  }
  function i() {
    r = new WeakMap();
  }
  return {
    get: e,
    dispose: i
  };
};
}
