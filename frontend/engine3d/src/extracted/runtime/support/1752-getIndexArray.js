/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1321605:1321716.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1752(scope) {
scope.getIndexArray = function getIndexArray(r, e = ArrayBuffer) {
  return r > 65535 ? new Uint32Array(new e(4 * r)) : new Uint16Array(new e(2 * r));
};
}
