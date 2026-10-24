/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 23620:23818.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0159(scope) {
scope.depends_on_old_values = function depends_on_old_values(r) {
  if (r.v === scope.UNINITIALIZED) return !0;
  if (r.deps === null) return !1;
  for (const e of r.deps) if (scope.old_values.has(e) || (e.f & scope.DERIVED) !== 0 && scope.depends_on_old_values(e)) return !0;
  return !1;
};
}
