/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 255307:256445.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0702(scope) {
scope.CubicInterpolant = class CubicInterpolant extends scope.Interpolant {
  constructor(e, i, s, a) {
    super(e, i, s, a), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = {
      endingStart: scope.ZeroCurvatureEnding,
      endingEnd: scope.ZeroCurvatureEnding
    };
  }
  intervalChanged_(e, i, s) {
    const a = this.parameterPositions;
    let o = e - 2,
      l = e + 1,
      c = a[o],
      h = a[l];
    if (c === void 0) switch (this.getSettings_().endingStart) {
      case scope.ZeroSlopeEnding:
        o = e, c = 2 * i - s;
        break;
      case scope.WrapAroundEnding:
        o = a.length - 2, c = i + a[o] - a[o + 1];
        break;
      default:
        o = e, c = s;
    }
    if (h === void 0) switch (this.getSettings_().endingEnd) {
      case scope.ZeroSlopeEnding:
        l = e, h = 2 * s - i;
        break;
      case scope.WrapAroundEnding:
        l = 1, h = s + a[1] - a[0];
        break;
      default:
        l = e - 1, h = i;
    }
    const d = (s - i) * .5,
      p = this.valueSize;
    this._weightPrev = d / (i - c), this._weightNext = d / (h - s), this._offsetPrev = o * p, this._offsetNext = l * p;
  }
  interpolate_(e, i, s, a) {
    const o = this.resultBuffer,
      l = this.sampleValues,
      c = this.valueSize,
      h = e * c,
      d = h - c,
      p = this._offsetPrev,
      f = this._offsetNext,
      _ = this._weightPrev,
      x = this._weightNext,
      b = (s - i) / (a - i),
      T = b * b,
      M = T * b,
      w = -_ * M + 2 * _ * T - _ * b,
      D = (1 + _) * M + (-1.5 - 2 * _) * T + (-.5 + _) * b + 1,
      R = (-1 - x) * M + (1.5 + x) * T + .5 * b,
      P = x * M - x * T;
    for (let U = 0; U !== c; ++U) o[U] = w * l[p + U] + D * l[d + U] + R * l[h + U] + P * l[f + U];
    return o;
  }
};
}
