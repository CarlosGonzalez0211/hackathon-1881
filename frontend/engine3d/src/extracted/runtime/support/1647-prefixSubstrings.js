/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1116894:1117110.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1647(scope) {
scope.prefixSubstrings = function prefixSubstrings(r, e, i) {
  for (const s of e) {
    const a = "$1" + r + s.charAt(0).toUpperCase() + s.slice(1),
      o = new RegExp("([^\\.])(\\b" + s + "\\b)", "g");
    for (const l of i.entries()) l[1] !== null && i.set(l[0], l[1].replace(o, a));
  }
};
}
