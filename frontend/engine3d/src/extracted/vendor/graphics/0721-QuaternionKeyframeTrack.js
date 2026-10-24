/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 261785:261993.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0721(scope) {
scope.QuaternionKeyframeTrack = class QuaternionKeyframeTrack extends scope.KeyframeTrack {
  constructor(e, i, s, a) {
    super(e, i, s, a);
  }
  InterpolantFactoryMethodLinear(e) {
    return new scope.QuaternionLinearInterpolant(this.times, this.values, this.getValueSize(), e);
  }
};
}
