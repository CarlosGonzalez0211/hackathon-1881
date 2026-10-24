/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 525676:525867.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1073(scope) {
scope.handleSource = function handleSource(r, e) {
  const i = r.split(`
`),
    s = [],
    a = Math.max(e - 6, 0),
    o = Math.min(e + 6, i.length);
  for (let l = a; l < o; l++) {
    const c = l + 1;
    s.push(`${c === e ? ">" : " "} ${c}: ${i[l]}`);
  }
  return s.join(`
`);
};
}
