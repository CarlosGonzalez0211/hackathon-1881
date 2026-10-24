/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 256445:256697.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0703(scope) {
scope.LinearInterpolant = class LinearInterpolant extends scope.Interpolant {
  constructor(e, i, s, a) {
    super(e, i, s, a);
  }
  interpolate_(e, i, s, a) {
    const o = this.resultBuffer,
      l = this.sampleValues,
      c = this.valueSize,
      h = e * c,
      d = h - c,
      p = (s - i) / (a - i),
      f = 1 - p;
    for (let _ = 0; _ !== c; ++_) o[_] = l[d + _] * f + l[h + _] * p;
    return o;
  }
};
}
