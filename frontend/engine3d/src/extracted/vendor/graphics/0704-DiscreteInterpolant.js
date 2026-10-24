/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 256697:256830.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0704(scope) {
scope.DiscreteInterpolant = class DiscreteInterpolant extends scope.Interpolant {
  constructor(e, i, s, a) {
    super(e, i, s, a);
  }
  interpolate_(e) {
    return this.copySampleValue_(e - 1);
  }
};
}
