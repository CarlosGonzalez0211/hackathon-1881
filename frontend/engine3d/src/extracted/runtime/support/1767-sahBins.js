/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1324638:1324806.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1767(scope) {
scope.sahBins = new Array(scope.BIN_COUNT).fill().map(() => ({
  count: 0,
  bounds: new Float32Array(6),
  rightCacheBounds: new Float32Array(6),
  leftCacheBounds: new Float32Array(6),
  candidate: 0
}));
}
