/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 834846:834980.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1371(scope) {
scope.deleteFromCache = function deleteFromCache(r, e, i) {
  scope.bitmapLoader.deleteFromCache(r, e), scope.exrLoader.deleteFromCache(r), scope.textureLoader._texturesCache.delete(i);
};
}
