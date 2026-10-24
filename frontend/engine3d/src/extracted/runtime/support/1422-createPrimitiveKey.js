/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 865490:865851.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1422(scope) {
scope.createPrimitiveKey = function createPrimitiveKey(r) {
  let e;
  const i = r.extensions && r.extensions[scope.EXTENSIONS.KHR_DRACO_MESH_COMPRESSION];
  if (i ? e = "draco:" + i.bufferView + ":" + i.indices + ":" + scope.createAttributesKey(i.attributes) : e = r.indices + ":" + scope.createAttributesKey(r.attributes) + ":" + r.mode, r.targets !== void 0) for (let s = 0, a = r.targets.length; s < a; s++) e += ":" + scope.createAttributesKey(r.targets[s]);
  return e;
};
}
