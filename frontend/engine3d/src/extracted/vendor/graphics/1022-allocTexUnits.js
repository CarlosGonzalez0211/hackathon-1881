/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 516174:516338.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1022(scope) {
scope.allocTexUnits = function allocTexUnits(r, e) {
  let i = scope.arrayCacheI32[e];
  i === void 0 && (i = new Int32Array(e), scope.arrayCacheI32[e] = i);
  for (let s = 0; s !== e; ++s) i[s] = r.allocateTextureUnit();
  return i;
};
}
