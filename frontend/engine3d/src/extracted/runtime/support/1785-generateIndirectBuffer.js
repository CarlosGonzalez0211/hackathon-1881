/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1329087:1329345.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1785(scope) {
scope.generateIndirectBuffer = function generateIndirectBuffer(r, e) {
  const i = (r.index ? r.index.count : r.attributes.position.count) / 3,
    s = i > 2 ** 16,
    a = s ? 4 : 2,
    o = e ? new SharedArrayBuffer(i * a) : new ArrayBuffer(i * a),
    l = s ? new Uint32Array(o) : new Uint16Array(o);
  for (let c = 0, h = l.length; c < h; c++) l[c] = c;
  return l;
};
}
