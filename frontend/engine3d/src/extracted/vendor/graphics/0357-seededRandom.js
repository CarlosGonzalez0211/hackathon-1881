/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 32932:33093.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0357(scope) {
scope.seededRandom = function seededRandom(r) {
  r !== void 0 && (scope._seed = r);
  let e = scope._seed += 1831565813;
  return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
};
}
