/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 241933:242061.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0675(scope) {
scope.onSegment = function onSegment(r, e, i) {
  return e.x <= Math.max(r.x, i.x) && e.x >= Math.min(r.x, i.x) && e.y <= Math.max(r.y, i.y) && e.y >= Math.min(r.y, i.y);
};
}
