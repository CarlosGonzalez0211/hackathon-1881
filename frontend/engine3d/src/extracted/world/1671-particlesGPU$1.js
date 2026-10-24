/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1164206:1164503.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1671(scope) {
scope.particlesGPU$1 = function particlesGPU$1(r = {}, e = {}) {
  const i = !r.geometry || r.geometry === "points",
    s = r.count || 128,
    a = scope.createParticlesGeometry({
      geometry: r.geometry,
      createPoints: i,
      count: s
    }),
    o = scope.particlesGPU(i ? scope.Points : scope.InstancedMesh);
  return new o({
    geometry: a,
    material: r.material,
    count: s,
    onSpawn: r.onSpath,
    onDeath: r.onDeath
  }, e);
};
}
