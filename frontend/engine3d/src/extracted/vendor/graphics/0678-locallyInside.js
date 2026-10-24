/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 242265:242404.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0678(scope) {
scope.locallyInside = function locallyInside(r, e) {
  return scope.area(r.prev, r, r.next) < 0 ? scope.area(r, e, r.next) >= 0 && scope.area(r, r.prev, e) >= 0 : scope.area(r, e, r.prev) < 0 || scope.area(r, r.next, e) < 0;
};
}
