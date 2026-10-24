/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 865851:865986.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1423(scope) {
scope.createAttributesKey = function createAttributesKey(r) {
  let e = "";
  const i = Object.keys(r).sort();
  for (let s = 0, a = i.length; s < a; s++) e += i[s] + ":" + r[i[s]] + ";";
  return e;
};
}
