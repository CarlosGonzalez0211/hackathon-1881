/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 3566:3718.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0069(scope) {
scope.apply_adjustments = function apply_adjustments(r) {
  const e = scope.adjustments.get(r);
  e && (scope.define_property(r, "message", {
    value: e.message
  }), scope.define_property(r, "stack", {
    value: e.stack
  }));
};
}
