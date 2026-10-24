/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1531077:1531485.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1989(scope) {
scope.inferJSON = function inferJSON(r = "JsonData", e = {}, i = {}) {
  const s = [];
  return Object.keys(e).forEach((a, o) => {
    const l = e[a],
      c = typeof l,
      h = l instanceof Array && l.length > 0;
    let d = h ? scope.TYPEMAP[typeof l[0]] : scope.TYPEMAP[c];
    if (a in i && (d = i[a]), c === "number" || c === "string" || c === "boolean") return s.push(`    ${d} ${a} = ${o + 1};`);
    if (h) return s.push(`    repeated ${d} ${a} = ${o + 1};`);
  }), `syntax = "proto3";

message ${r} {
${s.join(`
`)}
}`;
};
}
