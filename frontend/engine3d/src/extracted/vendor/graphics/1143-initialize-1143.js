/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 678084:678336.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1143(scope) {
window.requestIdleCallback || (window.requestIdleCallback = function (r) {
  return scope.__lifecycle.setTimeout(() => {
    const e = performance.now();
    r({
      didTimeout: !1,
      timeRemaining: () => Math.max(0, 5 - (performance.now() - e))
    });
  }, 16);
}, window.cancelIdleCallback = function (r) {
  scope.__lifecycle.clearTimeout(r);
});
}
