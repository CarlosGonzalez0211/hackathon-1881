/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1323947:1324071.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1759(scope) {
scope.arrayToBox = function arrayToBox(r, e, i) {
  return i.min.x = e[r], i.min.y = e[r + 1], i.min.z = e[r + 2], i.max.x = e[r + 3], i.max.y = e[r + 4], i.max.z = e[r + 5], i;
};
}
