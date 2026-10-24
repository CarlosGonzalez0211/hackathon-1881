/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 515755:515987.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1019(scope) {
scope.flatten = function flatten(r, e, i) {
  const s = r[0];
  if (s <= 0 || s > 0) return r;
  const a = e * i;
  let o = scope.arrayCacheF32[a];
  if (o === void 0 && (o = new Float32Array(a), scope.arrayCacheF32[a] = o), e !== 0) {
    s.toArray(o, 0);
    for (let l = 1, c = 0; l !== e; ++l) c += i, r[l].toArray(o, c);
  }
  return o;
};
}
