/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 17361:17474.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0126(scope) {
scope.pause_effect = function pause_effect(r, e) {
  var i = [];
  scope.pause_children(r, i, !0), scope.run_out_transitions(i, () => {
    scope.destroy_effect(r), e && e();
  });
};
}
