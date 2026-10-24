/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1368765:1368900.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1909(scope) {
scope.acceleratedRaycast = function acceleratedRaycast(r, e) {
  this.isBatchedMesh ? scope.acceleratedBatchedMeshRaycast.call(this, r, e) : scope.acceleratedMeshRaycast.call(this, r, e);
};
}
