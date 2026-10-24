/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 716162:716340.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1190(scope) {
scope.storage = new Proxy(scope.dataObject, {
  set: (r, e, i) => (r[e] = i, scope.update(r), !0),
  deleteProperty: (r, e) => e in r ? (delete r[e], Object.keys(r).length > 0 ? scope.update(r) : localStorage.removeItem(scope.key), !0) : !1
});
}
