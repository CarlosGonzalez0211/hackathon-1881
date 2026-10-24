/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 116092:116199.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0479(scope) {
scope.hue2rgb = function hue2rgb(r, e, i) {
  return i < 0 && (i += 1), i > 1 && (i -= 1), i < 1 / 6 ? r + (e - r) * 6 * i : i < 1 / 2 ? e : i < 2 / 3 ? r + (e - r) * 6 * (2 / 3 - i) : r;
};
}
