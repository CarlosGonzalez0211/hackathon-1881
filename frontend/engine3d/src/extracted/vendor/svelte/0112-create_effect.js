/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 14491:15215.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0112(scope) {
scope.create_effect = function create_effect(r, e, i, s = !0) {
  var a = scope.active_effect;
  a !== null && (a.f & scope.INERT) !== 0 && (r |= scope.INERT);
  var o = {
    ctx: scope.component_context,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: r | scope.DIRTY,
    first: null,
    fn: e,
    last: null,
    next: null,
    parent: a,
    b: a && a.b,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0,
    ac: null
  };
  if (i) try {
    scope.update_effect(o), o.f |= scope.EFFECT_RAN;
  } catch (h) {
    throw scope.destroy_effect(o), h;
  } else e !== null && scope.schedule_effect(o);
  if (s) {
    var l = o;
    if (i && l.deps === null && l.teardown === null && l.nodes_start === null && l.first === l.last && (l.f & scope.EFFECT_PRESERVED) === 0 && (l = l.first), l !== null && (l.parent = a, a !== null && scope.push_effect(l, a), scope.active_reaction !== null && (scope.active_reaction.f & scope.DERIVED) !== 0 && (r & scope.ROOT_EFFECT) === 0)) {
      var c = scope.active_reaction;
      (c.effects ?? (c.effects = [])).push(l);
    }
  }
  return o;
};
}
