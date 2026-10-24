/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 862347:862541.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1407(scope) {
scope.GLTFCubicSplineQuaternionInterpolant = class GLTFCubicSplineQuaternionInterpolant extends scope.GLTFCubicSplineInterpolant {
  interpolate_(e, i, s, a) {
    const o = super.interpolate_(e, i, s, a);
    return scope._quaternion.fromArray(o).normalize().toArray(o), o;
  }
};
}
