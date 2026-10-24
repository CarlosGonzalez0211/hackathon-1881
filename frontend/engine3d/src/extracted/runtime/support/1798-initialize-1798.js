/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1336927:1337077.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1798(scope) {
scope.ExtendedTriangle.prototype.distanceToPoint = function () {
  const r = new scope.Vector3();
  return function (i) {
    return this.closestPointToPoint(i, r), i.distanceTo(r);
  };
}();
}
