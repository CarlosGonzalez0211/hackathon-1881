/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 556036:556273.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1106(scope) {
scope.painterSortStable = function painterSortStable(r, e) {
  return r.groupOrder !== e.groupOrder ? r.groupOrder - e.groupOrder : r.renderOrder !== e.renderOrder ? r.renderOrder - e.renderOrder : r.material.id !== e.material.id ? r.material.id - e.material.id : r.z !== e.z ? r.z - e.z : r.id - e.id;
};
}
