/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 865027:865490.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1421(scope) {
scope.updateMorphTargets = function updateMorphTargets(r, e) {
  if (r.updateMorphTargets(), e.weights !== void 0) for (let i = 0, s = e.weights.length; i < s; i++) r.morphTargetInfluences[i] = e.weights[i];
  if (e.extras && Array.isArray(e.extras.targetNames)) {
    const i = e.extras.targetNames;
    if (r.morphTargetInfluences.length === i.length) {
      r.morphTargetDictionary = {};
      for (let s = 0, a = i.length; s < a; s++) r.morphTargetDictionary[i[s]] = s;
    } else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
  }
};
}
