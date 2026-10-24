/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 223245:223604.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0625(scope) {
scope.CubicPoly = function CubicPoly() {
  let r = 0,
    e = 0,
    i = 0,
    s = 0;
  function a(o, l, c, h) {
    r = o, e = c, i = -3 * o + 3 * l - 2 * c - h, s = 2 * o - 2 * l + c + h;
  }
  return {
    initCatmullRom: function (o, l, c, h, d) {
      a(l, c, d * (c - o), d * (h - l));
    },
    initNonuniformCatmullRom: function (o, l, c, h, d, p, f) {
      let _ = (l - o) / d - (c - o) / (d + p) + (c - l) / p,
        x = (c - l) / p - (h - l) / (p + f) + (h - c) / f;
      _ *= p, x *= p, a(l, c, _, x);
    },
    calc: function (o) {
      const l = o * o,
        c = l * o;
      return r + e * o + i * l + s * c;
    }
  };
};
}
