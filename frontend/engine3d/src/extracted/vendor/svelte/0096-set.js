/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 9224:9530.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0096(scope) {
scope.set = function set(r, e, i = !1) {
  scope.active_reaction !== null && (!scope.untracking || (scope.active_reaction.f & scope.INSPECT_EFFECT) !== 0) && scope.is_runes() && (scope.active_reaction.f & (scope.DERIVED | scope.BLOCK_EFFECT | scope.ASYNC | scope.INSPECT_EFFECT)) !== 0 && !(scope.current_sources != null && scope.current_sources.includes(r)) && scope.state_unsafe_mutation();
  let s = i ? scope.proxy(e) : e;
  return scope.internal_set(r, s);
};
}
