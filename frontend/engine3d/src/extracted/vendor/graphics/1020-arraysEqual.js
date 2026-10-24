/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 515987:516109.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1020(scope) {
scope.arraysEqual = function arraysEqual(r, e) {
  if (r.length !== e.length) return !1;
  for (let i = 0, s = r.length; i < s; i++) if (r[i] !== e[i]) return !1;
  return !0;
};
}
