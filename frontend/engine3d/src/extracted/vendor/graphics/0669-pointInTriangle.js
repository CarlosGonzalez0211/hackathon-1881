/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 241085:241210.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0669(scope) {
scope.pointInTriangle = function pointInTriangle(r, e, i, s, a, o, l, c) {
  return (a - l) * (e - c) >= (r - l) * (o - c) && (r - l) * (s - c) >= (i - l) * (e - c) && (i - l) * (o - c) >= (a - l) * (s - c);
};
}
