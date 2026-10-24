/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 3737:3808.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0071(scope) {
scope.run_micro_tasks = function run_micro_tasks() {
  var r = scope.micro_tasks;
  scope.micro_tasks = [], scope.run_all(r);
};
}
