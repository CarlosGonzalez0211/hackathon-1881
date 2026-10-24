/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 53833:53925.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0374(scope) {
scope.arrayNeedsUint32 = function arrayNeedsUint32(r) {
  for (let e = r.length - 1; e >= 0; --e) if (r[e] >= 65535) return !0;
  return !1;
};
}
