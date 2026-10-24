/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 2845:3005.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0064(scope) {
scope.pop = function pop(r) {
  var e = scope.component_context,
    i = e.e;
  if (i !== null) {
    e.e = null;
    for (var s of i) scope.create_user_effect(s);
  }
  return r !== void 0 && (e.x = r), scope.component_context = e.p, r ?? {};
};
}
