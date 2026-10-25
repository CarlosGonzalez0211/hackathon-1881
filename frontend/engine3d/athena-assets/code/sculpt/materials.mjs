/**
 * Material factory. Materials are named by ROLE, because names are a runtime contract
 * (docs/art/ART_DIRECTION.md 4.3 and 7): `window_glow`, `lantern_glow`, `beacon_*`, `gilt`,
 * `vine_bloom` drive the light-as-state system; `/tile|glaze|lacquer/` get the sheen;
 * `/banner|pennant|vine_tip|leaf/` move in the wind.
 *
 * Only MeshStandardMaterial (GLB-safe, no shader materials). Colour comes from vertex colours
 * (`vertexColors: true`, white base) or the base colour. Never attach THREE.Texture objects in
 * Node (they touch `document`); cards get their PNG afterwards via `attachTexture`.
 *
 *   const material = createMaterials(THREE);
 *   material("window_glow", "#FFE2A6", { emissive: "#F6C46A", emissiveIntensity: 0.8 });
 */
export function createMaterials(THREE) {
  const cache = new Map();
  /**
   * @param {string} name
   * @param {string} color hex
   * @param {{ roughness?: number, metalness?: number, emissive?: string, emissiveIntensity?: number,
   *   vertexColors?: boolean, doubleSided?: boolean, alphaTest?: number }} [options]
   */
  return function material(name, color, options = {}) {
    if (cache.has(name)) return cache.get(name);
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: options.roughness ?? 0.85,
      metalness: options.metalness ?? 0,
      vertexColors: !!options.vertexColors,
    });
    if (options.emissive) {
      m.emissive = new THREE.Color(options.emissive);
      m.emissiveIntensity = options.emissiveIntensity ?? 1;
    }
    if (options.doubleSided) m.side = THREE.DoubleSide;
    if (options.alphaTest) m.alphaTest = options.alphaTest;
    m.name = name;
    cache.set(name, m);
    return m;
  };
}
