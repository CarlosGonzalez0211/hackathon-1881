/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 678368:678516.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1146(scope) {
scope.idleTick = r => {
  scope.idleCbs.length > 0 ? scope._idle = requestIdleCallback(scope.idleTick) : scope._idle = null;
  for (let e = scope.idleCbs.length - 1; e > -1 && r.timeRemaining() > 0; e--) scope.idleCbs[e](r);
};
}
