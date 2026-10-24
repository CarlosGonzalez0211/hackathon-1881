/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1330319:1331050.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1787(scope) {
scope.buildPackedTree = function buildPackedTree(r, e) {
  const i = r.geometry;
  e.indirect && (r._indirectBuffer = scope.generateIndirectBuffer(i, e.useSharedArrayBuffer), scope.hasGroupGaps(i, e.range) && !e.verbose && console.warn('MeshBVH: Provided geometry contains groups or a range that do not fully span the vertex contents while using the "indirect" option. BVH may incorrectly report intersections on unrendered portions of the geometry.')), r._indirectBuffer || scope.ensureIndex(i, e);
  const s = e.useSharedArrayBuffer ? SharedArrayBuffer : ArrayBuffer,
    a = scope.computeTriangleBounds(i),
    o = e.indirect ? scope.getFullGeometryRange(i, e.range) : scope.getRootIndexRanges(i, e.range);
  r._roots = o.map(l => {
    const c = scope.buildTree(r, a, l.offset, l.count, e),
      h = scope.countNodes(c),
      d = new s(scope.BYTES_PER_NODE * h);
    return scope.populateBuffer(0, c, d), d;
  });
};
}
