/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 31791:32216.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0344(scope) {
scope.generateUUID = function generateUUID() {
  const r = Math.random() * 4294967295 | 0,
    e = Math.random() * 4294967295 | 0,
    i = Math.random() * 4294967295 | 0,
    s = Math.random() * 4294967295 | 0;
  return (scope._lut[r & 255] + scope._lut[r >> 8 & 255] + scope._lut[r >> 16 & 255] + scope._lut[r >> 24 & 255] + "-" + scope._lut[e & 255] + scope._lut[e >> 8 & 255] + "-" + scope._lut[e >> 16 & 15 | 64] + scope._lut[e >> 24 & 255] + "-" + scope._lut[i & 63 | 128] + scope._lut[i >> 8 & 255] + "-" + scope._lut[i >> 16 & 255] + scope._lut[i >> 24 & 255] + scope._lut[s & 255] + scope._lut[s >> 8 & 255] + scope._lut[s >> 16 & 255] + scope._lut[s >> 24 & 255]).toLowerCase();
};
}
