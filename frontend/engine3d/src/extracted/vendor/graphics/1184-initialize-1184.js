/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 714720:714790.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1184(scope) {
scope.addToTicker((r, e, i) => {
  scope.renderEvents.forEach(s => scope.events$1.emit(s, r, e));
});
}
