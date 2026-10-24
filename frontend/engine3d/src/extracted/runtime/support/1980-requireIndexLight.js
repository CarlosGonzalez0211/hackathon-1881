/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1516490:1517465.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1980(scope) {
scope.requireIndexLight = function requireIndexLight() {
  if (scope.hasRequiredIndexLight) return scope.indexLight.exports;
  scope.hasRequiredIndexLight = 1;
  var r = scope.indexLight.exports = scope.requireIndexMinimal();
  r.build = "light";
  function e(s, a, o) {
    return typeof a == "function" ? (o = a, a = new r.Root()) : a || (a = new r.Root()), a.load(s, o);
  }
  r.load = e;
  function i(s, a) {
    return a || (a = new r.Root()), a.loadSync(s);
  }
  return r.loadSync = i, r.encoder = scope.requireEncoder(), r.decoder = scope.requireDecoder(), r.verifier = scope.requireVerifier(), r.converter = scope.requireConverter(), r.ReflectionObject = scope.requireObject(), r.Namespace = scope.requireNamespace(), r.Root = scope.requireRoot(), r.Enum = scope.require_enum(), r.Type = scope.requireType(), r.Field = scope.requireField(), r.OneOf = scope.requireOneof(), r.MapField = scope.requireMapfield(), r.Service = scope.requireService(), r.Method = scope.requireMethod(), r.Message = scope.requireMessage(), r.wrappers = scope.requireWrappers(), r.types = scope.requireTypes(), r.util = scope.requireUtil(), r.ReflectionObject._configure(r.Root), r.Namespace._configure(r.Type, r.Service, r.Enum), r.Root._configure(r.Type), r.Field._configure(r.Type), scope.indexLight.exports;
};
}
