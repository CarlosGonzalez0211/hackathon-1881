/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 23818:23906.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0160(scope) {
scope.untrack = function untrack(r) {
  var e = scope.untracking;
  try {
    return scope.untracking = !0, r();
  } finally {
    scope.untracking = e;
  }
};
}
