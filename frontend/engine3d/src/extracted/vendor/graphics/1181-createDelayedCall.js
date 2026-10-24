/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 714475:714564.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1181(scope) {
scope.createDelayedCall = function createDelayedCall(r = 0, e) {
  return new scope.tween({}, {
    delay: r,
    duration: 0,
    onComplete: e
  });
};
}
