/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 225570:225688.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0631(scope) {
scope.CatmullRom = function CatmullRom(r, e, i, s, a) {
  const o = (s - e) * .5,
    l = (a - i) * .5,
    c = r * r,
    h = r * c;
  return (2 * i - 2 * s + o + l) * h + (-3 * i + 3 * s - 2 * o - l) * c + o * r + i;
};
}
