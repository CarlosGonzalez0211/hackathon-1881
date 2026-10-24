/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 25497:25750.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0170(scope) {
scope.bind_this = function bind_this(r = {}, e, i, s) {
  return scope.effect(() => {
    var a, o;
    return scope.render_effect(() => {
      a = o, o = [], scope.untrack(() => {
        r !== i(...o) && (e(r, ...o), a && scope.is_bound_this(i(...a), r) && e(null, ...a));
      });
    }), () => {
      scope.queue_micro_task(() => {
        o && scope.is_bound_this(i(...o), r) && e(null, ...o);
      });
    };
  }), r;
};
}
