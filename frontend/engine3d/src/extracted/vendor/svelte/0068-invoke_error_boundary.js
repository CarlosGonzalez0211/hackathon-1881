/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 3388:3566.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0068(scope) {
scope.invoke_error_boundary = function invoke_error_boundary(r, e) {
  for (; e !== null;) {
    if ((e.f & scope.BOUNDARY_EFFECT) !== 0) try {
      e.b.error(r);
      return;
    } catch (i) {
      r = i;
    }
    e = e.parent;
  }
  throw r instanceof Error && scope.apply_adjustments(r), r;
};
}
