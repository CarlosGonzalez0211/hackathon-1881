/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1539:1739.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0046(scope) {
scope.STALE_REACTION = new class extends Error {
  constructor() {
    super(...arguments);
    scope.Ye(this, "name", "StaleReactionError");
    scope.Ye(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
}
