/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 244834:246137.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0690(scope) {
scope.SphereGeometry = class SphereGeometry extends scope.BufferGeometry {
  constructor(e = 1, i = 32, s = 16, a = 0, o = Math.PI * 2, l = 0, c = Math.PI) {
    super(), this.type = "SphereGeometry", this.parameters = {
      radius: e,
      widthSegments: i,
      heightSegments: s,
      phiStart: a,
      phiLength: o,
      thetaStart: l,
      thetaLength: c
    }, i = Math.max(3, Math.floor(i)), s = Math.max(2, Math.floor(s));
    const h = Math.min(l + c, Math.PI);
    let d = 0;
    const p = [],
      f = new scope.Vector3(),
      _ = new scope.Vector3(),
      x = [],
      b = [],
      T = [],
      M = [];
    for (let w = 0; w <= s; w++) {
      const D = [],
        R = w / s;
      let P = 0;
      w === 0 && l === 0 ? P = .5 / i : w === s && h === Math.PI && (P = -.5 / i);
      for (let U = 0; U <= i; U++) {
        const O = U / i;
        f.x = -e * Math.cos(a + O * o) * Math.sin(l + R * c), f.y = e * Math.cos(l + R * c), f.z = e * Math.sin(a + O * o) * Math.sin(l + R * c), b.push(f.x, f.y, f.z), _.copy(f).normalize(), T.push(_.x, _.y, _.z), M.push(O + P, 1 - R), D.push(d++);
      }
      p.push(D);
    }
    for (let w = 0; w < s; w++) for (let D = 0; D < i; D++) {
      const R = p[w][D + 1],
        P = p[w][D],
        U = p[w + 1][D],
        O = p[w + 1][D + 1];
      (w !== 0 || l > 0) && x.push(R, P, O), (w !== s - 1 || h < Math.PI) && x.push(P, U, O);
    }
    this.setIndex(x), this.setAttribute("position", new scope.Float32BufferAttribute(b, 3)), this.setAttribute("normal", new scope.Float32BufferAttribute(T, 3)), this.setAttribute("uv", new scope.Float32BufferAttribute(M, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new scope.SphereGeometry(e.radius, e.widthSegments, e.heightSegments, e.phiStart, e.phiLength, e.thetaStart, e.thetaLength);
  }
};
}
