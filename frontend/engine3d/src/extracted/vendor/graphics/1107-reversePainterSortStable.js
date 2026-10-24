/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 556273:556459.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1107(scope) {
scope.reversePainterSortStable = function reversePainterSortStable(r, e) {
  return r.groupOrder !== e.groupOrder ? r.groupOrder - e.groupOrder : r.renderOrder !== e.renderOrder ? r.renderOrder - e.renderOrder : r.z !== e.z ? e.z - r.z : r.id - e.id;
};
}
