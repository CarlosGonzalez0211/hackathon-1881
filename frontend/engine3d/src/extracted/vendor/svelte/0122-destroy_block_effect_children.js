/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 16496:16628.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0122(scope) {
scope.destroy_block_effect_children = function destroy_block_effect_children(r) {
  for (var e = r.first; e !== null;) {
    var i = e.next;
    (e.f & scope.BRANCH_EFFECT) === 0 && scope.destroy_effect(e), e = i;
  }
};
}
