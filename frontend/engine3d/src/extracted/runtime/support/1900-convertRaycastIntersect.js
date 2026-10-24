/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1368385:1368541.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1900(scope) {
scope.convertRaycastIntersect = function convertRaycastIntersect(r, e, i) {
  return r === null ? null : (r.point.applyMatrix4(e.matrixWorld), r.distance = r.point.distanceTo(i.ray.origin), r.object = e, r);
};
}
