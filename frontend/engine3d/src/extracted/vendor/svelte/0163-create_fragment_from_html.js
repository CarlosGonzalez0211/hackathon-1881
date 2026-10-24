/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 23984:24122.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0163(scope) {
scope.create_fragment_from_html = function create_fragment_from_html(r) {
  var e = document.createElement("template");
  return e.innerHTML = r.replaceAll("<!>", "<!---->"), e.content;
};
}
