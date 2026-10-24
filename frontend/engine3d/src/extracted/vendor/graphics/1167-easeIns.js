/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 710456:710993.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1167(scope) {
scope.easeIns = {
  power1: scope.easeInPower(2),
  power2: scope.easeInPower(3),
  power3: scope.easeInPower(4),
  power4: scope.easeInPower(5),
  sine: r => 1 - Math.cos(r * scope.math.HALF_PI),
  circ: r => 1 - Math.sqrt(1 - r * r),
  expo: r => r ? Math.pow(2, 10 * r - 10) : 0,
  bounce: r => {
    let e = 0,
      i = 4;
    for (; r < ((e = Math.pow(2, --i)) - 1) / 11;);
    return 1 / Math.pow(4, 3 - i) - 7.5625 * Math.pow((e * 3 - 2) / 22 - r, 2);
  },
  back: (r = 1.70158) => e => (r + 1) * e * e * e - r * e * e,
  elastic: (r = 1, e = .3) => {
    const i = scope.math.clamp(r, 1, 10),
      s = scope.math.clamp(e, 1e-11, 2),
      a = s / scope.math.TWO_PI * Math.asin(1 / i),
      o = scope.math.TWO_PI / s;
    return l => l === 0 || l === 1 ? l : -i * Math.pow(2, -10 * (1 - l)) * Math.sin((1 - l - a) * o);
  }
};
}
