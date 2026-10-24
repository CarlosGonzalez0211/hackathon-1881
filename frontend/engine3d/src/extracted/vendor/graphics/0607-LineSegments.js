/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 213713:214270.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0607(scope) {
scope.LineSegments = class LineSegments extends scope.Line {
  constructor(e, i) {
    super(e, i), this.isLineSegments = !0, this.type = "LineSegments";
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const i = e.attributes.position,
        s = [];
      for (let a = 0, o = i.count; a < o; a += 2) scope._start.fromBufferAttribute(i, a), scope._end.fromBufferAttribute(i, a + 1), s[a] = a === 0 ? 0 : s[a - 1], s[a + 1] = s[a] + scope._start.distanceTo(scope._end);
      e.setAttribute("lineDistance", new scope.Float32BufferAttribute(s, 1));
    } else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
};
}
