/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 16628:17099.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0123(scope) {
scope.destroy_effect = function destroy_effect(r, e = !0) {
  var i = !1;
  (e || (r.f & scope.HEAD_EFFECT) !== 0) && r.nodes_start !== null && r.nodes_end !== null && (scope.remove_effect_dom(r.nodes_start, r.nodes_end), i = !0), scope.destroy_effect_children(r, e && !i), scope.remove_reactions(r, 0), scope.set_signal_status(r, scope.DESTROYED);
  var s = r.transitions;
  if (s !== null) for (const o of s) o.stop();
  scope.execute_effect_teardown(r);
  var a = r.parent;
  a !== null && a.first !== null && scope.unlink_effect(r), r.next = r.prev = r.teardown = r.ctx = r.deps = r.fn = r.nodes_start = r.nodes_end = r.ac = null;
};
}
