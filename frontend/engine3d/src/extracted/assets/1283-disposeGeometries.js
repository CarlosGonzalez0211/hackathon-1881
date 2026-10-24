/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 767305:767449.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1283(scope) {
scope.disposeGeometries = function disposeGeometries() {
  scope.customDracoLoader.dispose(), scope.msdfLoader.dispose(), scope.geometryProcessor.dispose(), scope.geometryLoader._geometryCache.clear();
};
}
