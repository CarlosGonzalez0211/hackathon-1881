/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 753779:753900.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1250(scope) {
scope.disposeGlyphs = function disposeGlyphs() {
  scope.worker.dispose(), scope.glyphLoader._glyphsBufferCache.clear(), scope.glyphLoader._glyphsTextureCache.clear();
};
}
