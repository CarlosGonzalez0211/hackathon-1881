/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1530495:1530763.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1984(scope) {
scope.requireSrc = function requireSrc() {
  if (scope.hasRequiredSrc) return scope.src.exports;
  scope.hasRequiredSrc = 1;
  var r = scope.src.exports = scope.requireIndexLight();
  return r.build = "full", r.tokenize = scope.requireTokenize(), r.parse = scope.requireParse(), r.common = scope.requireCommon(), r.Root._configure(r.Type, r.parse, r.common), scope.src.exports;
};
}
