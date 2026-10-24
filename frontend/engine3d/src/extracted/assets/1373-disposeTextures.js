/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 835368:835590.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1373(scope) {
scope.disposeTextures = function disposeTextures() {
  const r = scope.ktx2Loader.workerSourceURL;
  scope.ktx2Loader.workerSourceURL = "", scope.ktx2Loader.dispose(), scope.ktx2Loader.workerSourceURL = r, scope.bitmapLoader.dispose(), scope.exrLoader.dispose(), scope.textureLoader._texturesCache.clear();
};
}
