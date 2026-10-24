/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 261513:261785.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0720(scope) {
scope.QuaternionLinearInterpolant = class QuaternionLinearInterpolant extends scope.Interpolant {
  constructor(e, i, s, a) {
    super(e, i, s, a);
  }
  interpolate_(e, i, s, a) {
    const o = this.resultBuffer,
      l = this.sampleValues,
      c = this.valueSize,
      h = (s - i) / (a - i);
    let d = e * c;
    for (let p = d + c; d !== p; d += 4) scope.Quaternion.slerpFlat(o, 0, l, d - c, l, d, h);
    return o;
  }
};
}
