/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 22051:22158.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0156(scope) {
scope.remove_reactions = function remove_reactions(r, e) {
  var i = r.deps;
  if (i !== null) for (var s = e; s < i.length; s++) scope.remove_reaction(r, i[s]);
};
}
