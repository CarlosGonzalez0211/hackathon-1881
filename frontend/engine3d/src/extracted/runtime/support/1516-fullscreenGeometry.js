/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 923788:924028.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1516(scope) {
scope.fullscreenGeometry = (() => {
  const r = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
    e = new Float32Array([0, 0, 2, 0, 0, 2]),
    i = new scope.BufferGeometry();
  return i.setAttribute("position", new scope.BufferAttribute(r, 3)), i.setAttribute("uv", new scope.BufferAttribute(e, 2)), i;
})();
}
