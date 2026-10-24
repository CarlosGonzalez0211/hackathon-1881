/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 253625:254052.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0700(scope) {
scope.flattenJSON = function flattenJSON(r, e, i, s) {
  let a = 1,
    o = r[0];
  for (; o !== void 0 && o[s] === void 0;) o = r[a++];
  if (o === void 0) return;
  let l = o[s];
  if (l !== void 0) if (Array.isArray(l)) do l = o[s], l !== void 0 && (e.push(o.time), i.push(...l)), o = r[a++]; while (o !== void 0);else if (l.toArray !== void 0) do l = o[s], l !== void 0 && (e.push(o.time), l.toArray(i, i.length)), o = r[a++]; while (o !== void 0);else do l = o[s], l !== void 0 && (e.push(o.time), i.push(l)), o = r[a++]; while (o !== void 0);
};
}
