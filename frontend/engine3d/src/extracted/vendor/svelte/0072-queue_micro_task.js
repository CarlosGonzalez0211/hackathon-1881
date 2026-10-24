/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 3808:3913.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0072(scope) {
scope.queue_micro_task = function queue_micro_task(r) {
  scope.micro_tasks.length === 0 && queueMicrotask(scope.run_micro_tasks), scope.micro_tasks.push(r);
};
}
