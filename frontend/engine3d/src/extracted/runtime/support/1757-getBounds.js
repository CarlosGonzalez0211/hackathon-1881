/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1322774:1323244.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1757(scope) {
scope.getBounds = function getBounds(r, e, i, s, a) {
  let o = 1 / 0,
    l = 1 / 0,
    c = 1 / 0,
    h = -1 / 0,
    d = -1 / 0,
    p = -1 / 0,
    f = 1 / 0,
    _ = 1 / 0,
    x = 1 / 0,
    b = -1 / 0,
    T = -1 / 0,
    M = -1 / 0;
  for (let w = e * 6, D = (e + i) * 6; w < D; w += 6) {
    const R = r[w + 0],
      P = r[w + 1],
      U = R - P,
      O = R + P;
    U < o && (o = U), O > h && (h = O), R < f && (f = R), R > b && (b = R);
    const N = r[w + 2],
      H = r[w + 3],
      F = N - H,
      k = N + H;
    F < l && (l = F), k > d && (d = k), N < _ && (_ = N), N > T && (T = N);
    const W = r[w + 4],
      $ = r[w + 5],
      Z = W - $,
      J = W + $;
    Z < c && (c = Z), J > p && (p = J), W < x && (x = W), W > M && (M = W);
  }
  s[0] = o, s[1] = l, s[2] = c, s[3] = h, s[4] = d, s[5] = p, a[0] = f, a[1] = _, a[2] = x, a[3] = b, a[4] = T, a[5] = M;
};
}
