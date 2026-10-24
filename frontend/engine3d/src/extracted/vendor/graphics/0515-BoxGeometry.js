/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 154521:155952.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0515(scope) {
scope.BoxGeometry = class BoxGeometry extends scope.BufferGeometry {
  constructor(e = 1, i = 1, s = 1, a = 1, o = 1, l = 1) {
    super(), this.type = "BoxGeometry", this.parameters = {
      width: e,
      height: i,
      depth: s,
      widthSegments: a,
      heightSegments: o,
      depthSegments: l
    };
    const c = this;
    a = Math.floor(a), o = Math.floor(o), l = Math.floor(l);
    const h = [],
      d = [],
      p = [],
      f = [];
    let _ = 0,
      x = 0;
    b("z", "y", "x", -1, -1, s, i, e, l, o, 0), b("z", "y", "x", 1, -1, s, i, -e, l, o, 1), b("x", "z", "y", 1, 1, e, s, i, a, l, 2), b("x", "z", "y", 1, -1, e, s, -i, a, l, 3), b("x", "y", "z", 1, -1, e, i, s, a, o, 4), b("x", "y", "z", -1, -1, e, i, -s, a, o, 5), this.setIndex(h), this.setAttribute("position", new scope.Float32BufferAttribute(d, 3)), this.setAttribute("normal", new scope.Float32BufferAttribute(p, 3)), this.setAttribute("uv", new scope.Float32BufferAttribute(f, 2));
    function b(T, M, w, D, R, P, U, O, N, H, F) {
      const k = P / N,
        W = U / H,
        $ = P / 2,
        Z = U / 2,
        J = O / 2,
        se = N + 1,
        re = H + 1;
      let he = 0,
        ee = 0;
      const Ie = new scope.Vector3();
      for (let Te = 0; Te < re; Te++) {
        const Ue = Te * W - Z;
        for (let nt = 0; nt < se; nt++) {
          const mt = nt * k - $;
          Ie[T] = mt * D, Ie[M] = Ue * R, Ie[w] = J, d.push(Ie.x, Ie.y, Ie.z), Ie[T] = 0, Ie[M] = 0, Ie[w] = O > 0 ? 1 : -1, p.push(Ie.x, Ie.y, Ie.z), f.push(nt / N), f.push(1 - Te / H), he += 1;
        }
      }
      for (let Te = 0; Te < H; Te++) for (let Ue = 0; Ue < N; Ue++) {
        const nt = _ + Ue + se * Te,
          mt = _ + Ue + se * (Te + 1),
          ve = _ + (Ue + 1) + se * (Te + 1),
          ne = _ + (Ue + 1) + se * Te;
        h.push(nt, mt, ne), h.push(mt, ve, ne), ee += 6;
      }
      c.addGroup(x, ee, F), x += ee, _ += he;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new scope.BoxGeometry(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments);
  }
};
}
