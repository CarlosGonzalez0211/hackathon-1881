/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 241210:241319.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0670(scope) {
scope.pointInTriangleExceptFirst = function pointInTriangleExceptFirst(r, e, i, s, a, o, l, c) {
  return !(r === l && e === c) && scope.pointInTriangle(r, e, i, s, a, o, l, c);
};
}
