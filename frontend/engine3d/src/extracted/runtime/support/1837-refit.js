/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1347612:1348650.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1837(scope) {
scope.refit = function refit(r, e = null) {
  e && Array.isArray(e) && (e = new Set(e));
  const i = r.geometry,
    s = i.index ? i.index.array : null,
    a = i.attributes.position;
  let o,
    l,
    c,
    h,
    d = 0;
  const p = r._roots;
  for (let _ = 0, x = p.length; _ < x; _++) o = p[_], l = new Uint32Array(o), c = new Uint16Array(o), h = new Float32Array(o), f(0, d), d += o.byteLength;
  function f(_, x, b = !1) {
    const T = _ * 2;
    if (c[T + 15] === scope.IS_LEAFNODE_FLAG) {
      const w = l[_ + 6],
        D = c[T + 14];
      let R = 1 / 0,
        P = 1 / 0,
        U = 1 / 0,
        O = -1 / 0,
        N = -1 / 0,
        H = -1 / 0;
      for (let F = 3 * w, k = 3 * (w + D); F < k; F++) {
        let W = s[F];
        const $ = a.getX(W),
          Z = a.getY(W),
          J = a.getZ(W);
        $ < R && (R = $), $ > O && (O = $), Z < P && (P = Z), Z > N && (N = Z), J < U && (U = J), J > H && (H = J);
      }
      return h[_ + 0] !== R || h[_ + 1] !== P || h[_ + 2] !== U || h[_ + 3] !== O || h[_ + 4] !== N || h[_ + 5] !== H ? (h[_ + 0] = R, h[_ + 1] = P, h[_ + 2] = U, h[_ + 3] = O, h[_ + 4] = N, h[_ + 5] = H, !0) : !1;
    } else {
      const w = _ + 8,
        D = l[_ + 6],
        R = w + x,
        P = D + x;
      let U = b,
        O = !1,
        N = !1;
      e ? U || (O = e.has(R), N = e.has(P), U = !O && !N) : (O = !0, N = !0);
      const H = U || O,
        F = U || N;
      let k = !1;
      H && (k = f(w, x, U));
      let W = !1;
      F && (W = f(D, x, U));
      const $ = k || W;
      if ($) for (let Z = 0; Z < 3; Z++) {
        const J = w + Z,
          se = D + Z,
          re = h[J],
          he = h[J + 3],
          ee = h[se],
          Ie = h[se + 3];
        h[_ + Z] = re < ee ? re : ee, h[_ + Z + 3] = he > Ie ? he : Ie;
      }
      return $;
    }
  }
};
}
