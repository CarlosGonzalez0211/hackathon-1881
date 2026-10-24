/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1464041:1464513.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1953(scope) {
scope.requireIndexMinimal = function requireIndexMinimal() {
  return scope.hasRequiredIndexMinimal || (scope.hasRequiredIndexMinimal = 1, function (r) {
    var e = r;
    e.build = "minimal", e.Writer = scope.requireWriter(), e.BufferWriter = scope.requireWriter_buffer(), e.Reader = scope.requireReader(), e.BufferReader = scope.requireReader_buffer(), e.util = scope.requireMinimal(), e.rpc = scope.requireRpc(), e.roots = scope.requireRoots(), e.configure = i;
    function i() {
      e.util._configure(), e.Writer._configure(e.BufferWriter), e.Reader._configure(e.BufferReader);
    }
    i();
  }(scope.indexMinimal)), scope.indexMinimal;
};
}
