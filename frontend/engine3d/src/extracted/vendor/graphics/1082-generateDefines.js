/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 527809:527934.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1082(scope) {
scope.generateDefines = function generateDefines(r) {
  const e = [];
  for (const i in r) {
    const s = r[i];
    s !== !1 && e.push("#define " + i + " " + s);
  }
  return e.join(`
`);
};
}
