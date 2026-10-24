/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 4665:4750.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0081(scope) {
scope.dequeue = function dequeue() {
  const r = scope.tasks.shift();
  scope.tasks.length > 0 && queueMicrotask(scope.dequeue), r();
};
}
