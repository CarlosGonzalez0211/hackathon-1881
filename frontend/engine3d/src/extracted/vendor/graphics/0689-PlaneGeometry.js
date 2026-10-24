/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 243949:244834.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0689(scope) {
scope.PlaneGeometry = class PlaneGeometry extends scope.BufferGeometry {
  constructor(e = 1, i = 1, s = 1, a = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: e,
      height: i,
      widthSegments: s,
      heightSegments: a
    };
    const o = e / 2,
      l = i / 2,
      c = Math.floor(s),
      h = Math.floor(a),
      d = c + 1,
      p = h + 1,
      f = e / c,
      _ = i / h,
      x = [],
      b = [],
      T = [],
      M = [];
    for (let w = 0; w < p; w++) {
      const D = w * _ - l;
      for (let R = 0; R < d; R++) {
        const P = R * f - o;
        b.push(P, -D, 0), T.push(0, 0, 1), M.push(R / c), M.push(1 - w / h);
      }
    }
    for (let w = 0; w < h; w++) for (let D = 0; D < c; D++) {
      const R = D + d * w,
        P = D + d * (w + 1),
        U = D + 1 + d * (w + 1),
        O = D + 1 + d * w;
      x.push(R, P, O), x.push(P, U, O);
    }
    this.setIndex(x), this.setAttribute("position", new scope.Float32BufferAttribute(b, 3)), this.setAttribute("normal", new scope.Float32BufferAttribute(T, 3)), this.setAttribute("uv", new scope.Float32BufferAttribute(M, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new scope.PlaneGeometry(e.width, e.height, e.widthSegments, e.heightSegments);
  }
};
}
