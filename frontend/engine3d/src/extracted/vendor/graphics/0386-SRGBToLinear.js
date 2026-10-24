/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 57271:57366.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0386(scope) {
scope.SRGBToLinear = function SRGBToLinear(r) {
  return r < .04045 ? r * .0773993808 : Math.pow(r * .9478672986 + .0521327014, 2.4);
};
}
