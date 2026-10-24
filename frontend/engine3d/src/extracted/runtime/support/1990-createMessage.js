/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1531485:1531603.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1990(scope) {
scope.createMessage = function createMessage(r, e, i) {
  const s = scope.inferJSON(r, e, i),
    a = new scope.protobuf.Root();
  return scope.protobuf.parse(s, a), a.lookupType(r);
};
}
