/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 711158:711409.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1170(scope) {
for (const r in scope.easeTypes) for (const e in scope.easeIns) {
  const i = e === "back" || e === "elastic",
    s = scope.easeIns[e],
    a = scope.easeTypes[r],
    o = a(i ? s() : s),
    l = `${e}.${r}`,
    c = `${e}${r}`;
  if (scope.easeMap[l] = o, scope.easeMap[c] = o, i) {
    const h = (d, p) => a(s(d, p));
    scope.easeMap[`${l}_fn`] = h, scope.easeMap[`${c}_fn`] = h;
  }
}
}
