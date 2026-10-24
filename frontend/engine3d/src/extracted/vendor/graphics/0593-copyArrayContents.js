/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 193820:194033.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0593(scope) {
scope.copyArrayContents = function copyArrayContents(r, e) {
  if (r.constructor !== e.constructor) {
    const i = Math.min(r.length, e.length);
    for (let s = 0; s < i; s++) e[s] = r[s];
  } else {
    const i = Math.min(r.length, e.length);
    e.set(new r.constructor(r.buffer, 0, i));
  }
};
}
