/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 240179:240270.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0664(scope) {
scope.sectorContainsSector = function sectorContainsSector(r, e) {
  return scope.area(r.prev, r, e.prev) < 0 && scope.area(e.next, r, r.next) < 0;
};
}
