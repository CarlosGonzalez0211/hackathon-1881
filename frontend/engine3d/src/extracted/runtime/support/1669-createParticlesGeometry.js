/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1153442:1153795.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1669(scope) {
scope.createParticlesGeometry = function createParticlesGeometry({
  geometry: r,
  createPoints: e,
  count: i
} = {}) {
  let s = null;
  if (e) s = new scope.BufferGeometry(), s.setAttribute("position", new scope.BufferAttribute(new Float32Array(i * 3), 3));else {
    s = new scope.InstancedBufferGeometry(), s.instanceCount = i;
    const a = r.clone();
    a.index && s.setIndex(a.index);
    for (const o in a.attributes) s.setAttribute(o, a.attributes[o]);
  }
  return s;
};
}
