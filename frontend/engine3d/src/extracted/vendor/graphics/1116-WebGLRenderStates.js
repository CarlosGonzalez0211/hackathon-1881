/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 564724:564982.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1116(scope) {
scope.WebGLRenderStates = function WebGLRenderStates(r) {
  let e = new WeakMap();
  function i(a, o = 0) {
    const l = e.get(a);
    let c;
    return l === void 0 ? (c = new scope.WebGLRenderState(r), e.set(a, [c])) : o >= l.length ? (c = new scope.WebGLRenderState(r), l.push(c)) : c = l[o], c;
  }
  function s() {
    e = new WeakMap();
  }
  return {
    get: i,
    dispose: s
  };
};
}
