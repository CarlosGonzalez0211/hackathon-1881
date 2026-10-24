/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 57366:57447.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0387(scope) {
scope.LinearToSRGB = function LinearToSRGB(r) {
  return r < .0031308 ? r * 12.92 : 1.055 * Math.pow(r, .41666) - .055;
};
}
