/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 888275:889004.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1429(scope) {
scope.addPrimitiveAttributes = function addPrimitiveAttributes(r, e, i) {
  const s = e.attributes,
    a = [];
  function o(l, c) {
    return i.getDependency("accessor", l).then(function (h) {
      r.setAttribute(c, h);
    });
  }
  for (const l in s) {
    const c = scope.ATTRIBUTES[l] || l.toLowerCase();
    c in r.attributes || a.push(o(s[l], c));
  }
  if (e.indices !== void 0 && !r.index) {
    const l = i.getDependency("accessor", e.indices).then(function (c) {
      r.setIndex(c);
    });
    a.push(l);
  }
  return scope.ColorManagement.workingColorSpace !== scope.LinearSRGBColorSpace && "COLOR_0" in s && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${scope.ColorManagement.workingColorSpace}" not supported.`), scope.assignExtrasToUserData(r, e), scope.computeBounds(r, e, i), Promise.all(a).then(function () {
    return e.targets !== void 0 ? scope.addMorphTargets(r, e.targets, i) : r;
  });
};
}
