/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1340333:1340542.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1804(scope) {
scope.OrientedBox.prototype.closestPointToPoint = function () {
  return function (e, i) {
    return this.needsUpdate && this.update(), i.copy(e).applyMatrix4(this.invMatrix).clamp(this.min, this.max).applyMatrix4(this.matrix), i;
  };
}();
}
