/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1639537:1639683.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2066(scope) {
scope.getRandomAccessories = function getRandomAccessories() {
  return Object.keys(scope.ACCESSORIES).map(e => {
    const i = scope.ACCESSORIES[e],
      s = Math.floor(Math.random() * i.length);
    return i[s];
  });
};
}
