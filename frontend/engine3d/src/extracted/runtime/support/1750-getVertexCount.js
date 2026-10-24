/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1321470:1321554.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1750(scope) {
scope.getVertexCount = function getVertexCount(r) {
  return r.index ? r.index.count : r.attributes.position.count;
};
}
