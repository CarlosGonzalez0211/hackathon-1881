/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 253115:253248.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0696(scope) {
scope.convertArray = function convertArray(r, e) {
  return !r || r.constructor === e ? r : typeof e.BYTES_PER_ELEMENT == "number" ? new e(r) : Array.prototype.slice.call(r);
};
}
