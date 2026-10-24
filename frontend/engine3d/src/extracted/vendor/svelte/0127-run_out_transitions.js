/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 17474:17583.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0127(scope) {
scope.run_out_transitions = function run_out_transitions(r, e) {
  var i = r.length;
  if (i > 0) {
    var s = () => --i || e();
    for (var a of r) a.out(s);
  } else e();
};
}
