/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 24223:24589.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0165(scope) {
scope.from_html = function from_html(r, e) {
  var i = (e & scope.TEMPLATE_FRAGMENT) !== 0,
    s = (e & scope.TEMPLATE_USE_IMPORT_NODE) !== 0,
    a,
    o = !r.startsWith("<!>");
  return () => {
    a === void 0 && (a = scope.create_fragment_from_html(o ? r : "<!>" + r), i || (a = scope.get_first_child(a)));
    var l = s || scope.is_firefox ? document.importNode(a, !0) : a.cloneNode(!0);
    if (i) {
      var c = scope.get_first_child(l),
        h = l.lastChild;
      scope.assign_nodes(c, h);
    } else scope.assign_nodes(l, l);
    return l;
  };
};
}
