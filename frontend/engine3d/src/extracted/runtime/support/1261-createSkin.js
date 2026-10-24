/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 759659:760230.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1261(scope) {
scope.createSkin = function createSkin(r, e) {
  const i = [];
  for (let l = 0; l < e.attributes.position.count; l++) {
    const c = new scope.Bone();
    c.name = `bone_${l}`, c.position.fromArray(e.attributes.position.array, l * 3), c.quaternion.fromArray(e.attributes.quaternion.array, l * 4).normalize(), c.scale.fromArray(e.attributes.scale.array, l * 3), i.push(c);
  }
  const s = [];
  for (let l = 0; l < e.attributes.hierarchy.count; l++) {
    const c = e.attributes.hierarchy.array[l] - 1;
    c === -1 ? s.push(l) : i[c].add(i[l]);
  }
  const a = new scope.Skeleton(i),
    o = new scope.SkinnedMesh(r, scope.defaultMaterial);
  return s.forEach(l => o.add(a.bones[l])), o.bind(a), o.normalizeSkinWeights(), o;
};
}
