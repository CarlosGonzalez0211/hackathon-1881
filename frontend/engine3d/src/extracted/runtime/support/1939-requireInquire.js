/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1446772:1447057.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1939(scope) {
scope.requireInquire = function requireInquire() {
  if (scope.hasRequiredInquire) return scope.inquire_1;
  scope.hasRequiredInquire = 1, scope.inquire_1 = inquire;
  function inquire(moduleName) {
    try {
      var mod = eval("quire".replace(/^/, "re"))(moduleName);
      if (mod && (mod.length || Object.keys(mod).length)) return mod;
    } catch (r) {}
    return null;
  }
  return scope.inquire_1;
};
}
