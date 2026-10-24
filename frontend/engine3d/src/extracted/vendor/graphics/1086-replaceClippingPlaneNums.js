/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 528986:529162.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1086(scope) {
scope.replaceClippingPlaneNums = function replaceClippingPlaneNums(r, e) {
  return r.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
};
}
