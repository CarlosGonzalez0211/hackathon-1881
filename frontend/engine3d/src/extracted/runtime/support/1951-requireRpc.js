/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1463778:1463901.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1951(scope) {
scope.requireRpc = function requireRpc() {
  return scope.hasRequiredRpc || (scope.hasRequiredRpc = 1, function (r) {
    var e = r;
    e.Service = scope.requireService$1();
  }(scope.rpc)), scope.rpc;
};
}
