/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 54388:54622.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0381(scope) {
scope.probeAsync = function probeAsync(r, e, i) {
  return new Promise(function (s, a) {
    function o() {
      switch (r.clientWaitSync(e, r.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case r.WAIT_FAILED:
          a();
          break;
        case r.TIMEOUT_EXPIRED:
          scope.__lifecycle.setTimeout(o, i);
          break;
        default:
          s();
      }
    }
    scope.__lifecycle.setTimeout(o, i);
  });
};
}
