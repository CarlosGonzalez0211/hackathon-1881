/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 839441:840523.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1376(scope) {
scope.toTrianglesDrawMode = function toTrianglesDrawMode(r, e) {
  if (e === scope.TrianglesDrawMode) return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), r;
  if (e === scope.TriangleFanDrawMode || e === scope.TriangleStripDrawMode) {
    let i = r.getIndex();
    if (i === null) {
      const l = [],
        c = r.getAttribute("position");
      if (c !== void 0) {
        for (let h = 0; h < c.count; h++) l.push(h);
        r.setIndex(l), i = r.getIndex();
      } else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."), r;
    }
    const s = i.count - 2,
      a = [];
    if (e === scope.TriangleFanDrawMode) for (let l = 1; l <= s; l++) a.push(i.getX(0)), a.push(i.getX(l)), a.push(i.getX(l + 1));else for (let l = 0; l < s; l++) l % 2 === 0 ? (a.push(i.getX(l)), a.push(i.getX(l + 1)), a.push(i.getX(l + 2))) : (a.push(i.getX(l + 2)), a.push(i.getX(l + 1)), a.push(i.getX(l)));
    a.length / 3 !== s && console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
    const o = r.clone();
    return o.setIndex(a), o.clearGroups(), o;
  } else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", e), r;
};
}
