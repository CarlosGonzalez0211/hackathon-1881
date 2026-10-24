/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 526294:526586.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1076(scope) {
scope.getShaderErrors = function getShaderErrors(r, e, i) {
  const s = r.getShaderParameter(e, r.COMPILE_STATUS),
    o = (r.getShaderInfoLog(e) || "").trim();
  if (s && o === "") return "";
  const l = /ERROR: 0:(\d+)/.exec(o);
  if (l) {
    const c = parseInt(l[1]);
    return i.toUpperCase() + `

` + o + `

` + scope.handleSource(r.getShaderSource(e), c);
  } else return o;
};
}
