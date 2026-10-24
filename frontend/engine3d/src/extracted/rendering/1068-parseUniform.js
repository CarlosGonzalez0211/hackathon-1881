/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 524542:524925.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1068(scope) {
scope.parseUniform = function parseUniform(r, e, i) {
  const s = r.name,
    a = s.length;
  for (scope.RePathPart.lastIndex = 0;;) {
    const o = scope.RePathPart.exec(s),
      l = scope.RePathPart.lastIndex;
    let c = o[1];
    const h = o[2] === "]",
      d = o[3];
    if (h && (c = c | 0), d === void 0 || d === "[" && l + 2 === a) {
      scope.addUniform(i, d === void 0 ? new scope.SingleUniform(c, r, e) : new scope.PureArrayUniform(c, r, e));
      break;
    } else {
      let f = i.map[c];
      f === void 0 && (f = new scope.StructuredUniform(c), scope.addUniform(i, f)), i = f;
    }
  }
};
}
