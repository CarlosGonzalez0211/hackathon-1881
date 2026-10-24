/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1342259:1342359.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1808(scope) {
scope.ExtendedTrianglePoolBase = class ExtendedTrianglePoolBase extends scope.PrimitivePool {
  constructor() {
    super(() => new scope.ExtendedTriangle());
  }
};
}
