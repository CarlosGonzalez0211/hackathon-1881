/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 253248:253328.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0697(scope) {
scope.isTypedArray = function isTypedArray(r) {
  return ArrayBuffer.isView(r) && !(r instanceof DataView);
};
}
