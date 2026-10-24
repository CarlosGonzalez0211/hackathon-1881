/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 15506:15725.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0115(scope) {
scope.component_root = function component_root(r) {
  scope.Batch.ensure();
  const e = scope.create_effect(scope.ROOT_EFFECT | scope.EFFECT_PRESERVED, r, !0);
  return (i = {}) => new Promise(s => {
    i.outro ? scope.pause_effect(e, () => {
      scope.destroy_effect(e), s(void 0);
    }) : (scope.destroy_effect(e), s(void 0));
  });
};
}
