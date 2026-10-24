/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 13077:13497.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0101(scope) {
scope.init_operations = function init_operations() {
  if (scope.$window === void 0) {
    scope.$window = window, scope.is_firefox = /Firefox/.test(navigator.userAgent);
    var r = Element.prototype,
      e = Node.prototype,
      i = Text.prototype;
    scope.first_child_getter = scope.get_descriptor(e, "firstChild").get, scope.next_sibling_getter = scope.get_descriptor(e, "nextSibling").get, scope.is_extensible(r) && (r.__click = void 0, r.__className = void 0, r.__attributes = null, r.__style = void 0, r.__e = void 0), scope.is_extensible(i) && (i.__t = void 0);
  }
};
}
