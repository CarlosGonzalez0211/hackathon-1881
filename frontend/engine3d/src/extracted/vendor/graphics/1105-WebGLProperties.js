/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 555760:556036.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1105(scope) {
scope.WebGLProperties = function WebGLProperties() {
  let r = new WeakMap();
  function e(l) {
    return r.has(l);
  }
  function i(l) {
    let c = r.get(l);
    return c === void 0 && (c = {}, r.set(l, c)), c;
  }
  function s(l) {
    r.delete(l);
  }
  function a(l, c, h) {
    r.get(l)[c] = h;
  }
  function o() {
    r = new WeakMap();
  }
  return {
    has: e,
    get: i,
    remove: s,
    update: a,
    dispose: o
  };
};
}
