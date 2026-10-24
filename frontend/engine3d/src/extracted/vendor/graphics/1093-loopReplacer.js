/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 529872:530036.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1093(scope) {
scope.loopReplacer = function loopReplacer(r, e, i, s) {
  let a = "";
  for (let o = parseInt(e); o < parseInt(i); o++) a += s.replace(/\[\s*i\s*\]/g, "[ " + o + " ]").replace(/UNROLLED_LOOP_INDEX/g, o);
  return a;
};
}
