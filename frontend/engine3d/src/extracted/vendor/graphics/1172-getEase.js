/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 711461:711943.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1172(scope) {
scope.getEase = function getEase(r = "linear") {
  if (typeof r == "function") return r;
  if (typeof r != "string") return scope.easeMap.linear;
  const e = r.toLowerCase();
  if (scope.easeMap[e]) return scope.easeMap[e];
  if (scope.customEasesCache.has(r)) return scope.customEasesCache.get(r);
  if (scope.customEasesCache.has(e)) return scope.customEasesCache.get(e);
  const i = scope.functionStrRegexp.exec(e),
    s = i[1],
    a = i[3];
  return s && scope.easeMap[`${s}_fn`] && a ? scope.easeMap[`${s}_fn`](...a.split(",").map(Number)) : (console.warn(`Invalid ease "${r}". Using linear instead.`), scope.easeMap.linear);
};
}
