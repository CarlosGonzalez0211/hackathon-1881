/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 8147:8270.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0089(scope) {
scope.infinite_loop_guard = function infinite_loop_guard() {
  try {
    scope.effect_update_depth_exceeded();
  } catch (r) {
    scope.invoke_error_boundary(r, scope.last_scheduled_effect);
  }
};
}
