/**
 * Nature family: trees, rocks, floating islet and the foliage card atlas
 * (docs/art/ART_DIRECTION.md 4.4, docs/art/briefs/landscape.md).
 *
 *   athena-tree-broadleaf       crown of seven lobes stepped toward +X (the light), leaning
 *                               trunk with a root flare and one branch on the sun side
 *   athena-tree-cypress         stacked rings tapering to a soft point, swaying lean
 *   athena-tree-blossom         low wide crown in blossom pink, placed near houses
 *   athena-tree-*-lod           the crown at one third of the triangles (+ a trunk stub)
 *   athena-islet                a floating rock with a grass cap, one spire, a waterfall thread
 *   athena-rock-set / -boulder / -pebble   moss-capped boulders (SDF-free cage + subdivision)
 *   athena-cliff-slab-a / -b    rounded cliff slabs with a grass cap, for plateau outcrops
 *   athena-foliage-cards        the painted foliage atlas on one card (the runtime reads its
 *                               texture; fringe, tuft and flower cards are placed in code)
 *
 * Every crown is a smooth-min union of ellipsoids with a baked deep-to-light gradient (rule 4),
 * every trunk a swept tube with a root flare. Asymmetry is authored: the sun-side branch is
 * longer, crowns step toward +X, the cypress leans (rule 5). Parts are named `crown`, `trunk`
 * and `branch`; materials `crown_leaf` and `trunk_bark` (the runtime picks parts by material).
 */

const LEAF = { deep: "#3F7A5B", mid: "#6CA66E", light: "#A8C97A" };
const BLOSSOM = { deep: "#C98A93", light: "#F3C9C4" };

// --------------------------------------------------------------------------- shared helpers
function leafMaterial(T) {
  return T.material("crown_leaf", "#FFFFFF", { vertexColors: true, roughness: 1 });
}
function barkMaterial(T) {
  return T.material("trunk_bark", "#FFFFFF", { vertexColors: true, roughness: 0.9 });
}

/** A swept trunk or branch with a baked dark foot (dirt) and timber body. */
function limb(THREE, T, points, { radius, tubular, radial, foot = true }) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const geometry = T.sweep(curve, { radius, tubular, radial, caps: false });
  T.bake.fill(geometry, "#9C7356");
  if (foot) T.bake.gradient(geometry, { bottom: "#6F5A4C", top: "#FFFFFF", from: 0, to: 1.1 });
  return geometry;
}

/**
 * A crown: smooth-min union of ellipsoid lobes, optional flat underside, polygonised and
 * decimated. Colour: deep foliage at the bottom to light foliage at the top, extra light on
 * the faces that look toward the sun side, a little cavity darkening between lobes.
 */
async function sdfCrown(
  T,
  {
    lobes,
    blend = 0.34,
    cutY,
    size = 72,
    triangles,
    bottom = LEAF.deep,
    top = LEAF.light,
    sunTint = LEAF.light,
    curve = 0.95,
  },
) {
  const { sdf } = T;
  const union = sdf.smin(blend, ...lobes.map(([centre, radii]) => sdf.ellipsoid(centre, radii)));
  const field =
    cutY === undefined ? union : sdf.subtract(union, sdf.halfspace([0, 1, 0], cutY), 0.08);
  const geometry = await T.polygonise(field, { size, maxTriangles: triangles });
  T.bake.fill(geometry, "#FFFFFF");
  T.bake.gradient(geometry, { bottom, top, curve });
  T.bake.direction(geometry, {
    color: sunTint,
    direction: [0.7, 1, 0.25],
    threshold: 0.45,
    softness: 0.35,
    strength: 0.5,
  });
  T.bake.occlusion(geometry, { sdf: field, radius: 0.35, strength: 0.4 });
  return geometry;
}

// --------------------------------------------------------------------------- broadleaf
// Seven lobes rising toward +X like a staircase; the bounding box stays symmetric around the
// trunk so the pivot is the base centre.
const BROADLEAF_LOBES = [
  [
    [-1.0, 3.0, 0.15],
    [0.9, 0.62, 0.82],
  ],
  [
    [-0.3, 3.4, -0.35],
    [0.98, 0.7, 0.86],
  ],
  [
    [0.45, 3.78, 0.2],
    [0.95, 0.7, 0.88],
  ],
  [
    [1.1, 4.12, -0.1],
    [0.74, 0.56, 0.72],
  ],
  [
    [0.05, 3.05, 0.9],
    [0.82, 0.6, 0.76],
  ],
  [
    [0.35, 3.0, -0.85],
    [0.84, 0.58, 0.72],
  ],
  [
    [-0.62, 4.05, 0.3],
    [0.62, 0.5, 0.6],
  ],
];

function broadleafTrunk(THREE, T) {
  const trunk = limb(
    THREE,
    T,
    [
      [0.0, 0.0, 0.0],
      [0.07, 0.9, 0.02],
      [0.19, 1.8, 0.0],
      [0.26, 2.5, 0.04],
      [0.3, 3.15, 0.04],
    ],
    {
      tubular: 4,
      radial: 6,
      // Root flare: wide at the foot, a slim waist, a quiet taper into the crown.
      radius: (t) => 0.1 + 0.075 * (1 - t) + 0.19 * Math.pow(1 - t, 7),
    },
  );
  // One branch, longer on the sun side (+X), leaving the trunk below the crown.
  const branch = limb(
    THREE,
    T,
    [
      [0.2, 1.95, 0.0],
      [0.6, 2.35, 0.1],
      [1.05, 2.62, 0.25],
    ],
    { tubular: 2, radial: 4, radius: (t) => 0.075 * Math.pow(1 - t, 0.7), foot: false },
  );
  return { trunk, branch };
}

async function buildBroadleaf(THREE, T, { lod = false } = {}) {
  const crown = await sdfCrown(T, {
    lobes: BROADLEAF_LOBES,
    cutY: 2.4,
    triangles: lod ? 110 : 285,
    size: lod ? 36 : 56,
  });
  const { trunk, branch } = lod
    ? { trunk: limbStub(THREE, T), branch: null }
    : broadleafTrunk(THREE, T);
  const children = [
    T.mesh("crown", crown, leafMaterial(T)),
    T.mesh("trunk", trunk, barkMaterial(T)),
  ];
  if (branch) children.push(T.mesh("branch", branch, barkMaterial(T)));
  return {
    root: T.ground(
      T.group(lod ? "athena-tree-broadleaf-lod" : "athena-tree-broadleaf", ...children),
    ),
  };
}

/** A cheap trunk for the LOD files: the same silhouette in 16 triangles. */
function limbStub(THREE, T) {
  return limb(
    THREE,
    T,
    [
      [0.0, 0.0, 0.0],
      [0.15, 1.6, 0.02],
      [0.3, 3.1, 0.04],
    ],
    { tubular: 2, radial: 4, radius: (t) => 0.1 + 0.2 * Math.pow(1 - t, 3) },
  );
}

// --------------------------------------------------------------------------- cypress
async function buildCypress(THREE, T, { lod = false } = {}) {
  // Outside, bottom to top: five ring bulges separated by waists, ending in a soft point.
  const profile = [
    [0.0, 1.25],
    [0.62, 1.32],
    [0.8, 1.8],
    [0.56, 2.2],
    [0.7, 2.62],
    [0.48, 3.02],
    [0.58, 3.42],
    [0.38, 3.82],
    [0.44, 4.22],
    [0.26, 4.6],
    [0.28, 4.95],
    [0.12, 5.4],
    [0.0, 6.3],
  ];
  const crown = T.lathe(
    lod ? profile.filter((_, i) => i % 2 === 0 || i === profile.length - 1) : profile,
    {
      segments: lod ? 6 : 10,
      divisions: 1,
      scallop: lod ? undefined : { folds: 5, depth: 0.07, from: 0.12 },
    },
  );
  const noise = T.createNoise(31);
  // Authored irregularity: a slow lean toward +X and one low-frequency swell.
  T.displace(crown, (p) => 0.07 * noise.fbm3(p.x * 1.3, p.y * 0.7, p.z * 1.3, { octaves: 2 }));
  const position = crown.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    position.setX(i, position.getX(i) + 0.05 * (y - 1.2) * (y - 1.2) * 0.12);
  }
  position.needsUpdate = true;
  T.smoothNormals(crown, 55);
  T.bake.fill(crown, "#FFFFFF");
  T.bake.gradient(crown, { bottom: LEAF.deep, top: "#8DB677", curve: 1.15 });
  T.bake.direction(crown, {
    color: LEAF.light,
    direction: [0.7, 1, 0.25],
    threshold: 0.35,
    softness: 0.4,
    strength: 0.45,
  });
  T.bake.occlusion(crown, { radius: 0.3, strength: 0.4 });
  const trunk = limb(
    THREE,
    T,
    [
      [0.0, 0.0, 0.0],
      [0.04, 0.7, 0.0],
      [0.1, 1.5, 0.02],
    ],
    {
      tubular: lod ? 2 : 3,
      radial: lod ? 4 : 6,
      radius: (t) => 0.09 + 0.05 * (1 - t) + 0.17 * Math.pow(1 - t, 6),
    },
  );
  const root = T.group(
    lod ? "athena-tree-cypress-lod" : "athena-tree-cypress",
    T.mesh("crown", crown, leafMaterial(T)),
    T.mesh("trunk", trunk, barkMaterial(T)),
  );
  return { root: T.ground(root) };
}

// --------------------------------------------------------------------------- blossom
const BLOSSOM_LOBES = [
  [
    [-1.25, 2.55, 0.1],
    [1.0, 0.62, 0.95],
  ],
  [
    [-0.25, 2.95, -0.5],
    [1.1, 0.7, 0.95],
  ],
  [
    [0.7, 3.2, 0.25],
    [1.1, 0.7, 1.0],
  ],
  [
    [1.35, 3.0, -0.35],
    [0.82, 0.56, 0.8],
  ],
  [
    [0.0, 2.6, 0.95],
    [0.95, 0.58, 0.8],
  ],
  [
    [0.1, 2.5, -1.1],
    [0.9, 0.55, 0.78],
  ],
];

async function buildBlossom(THREE, T, { lod = false } = {}) {
  const crown = await sdfCrown(T, {
    lobes: BLOSSOM_LOBES,
    cutY: 2.05,
    blend: 0.4,
    triangles: lod ? 110 : 285,
    size: lod ? 36 : 56,
    bottom: BLOSSOM.deep,
    top: BLOSSOM.light,
    sunTint: "#FBF3E4",
    curve: 0.85,
  });
  const children = [T.mesh("crown", crown, leafMaterial(T))];
  if (lod) children.push(T.mesh("trunk", limbStub(THREE, T), barkMaterial(T)));
  else {
    // A thicker, more curved trunk with its branch on the side away from the light.
    children.push(
      T.mesh(
        "trunk",
        limb(
          THREE,
          T,
          [
            [0.0, 0.0, 0.0],
            [-0.12, 0.7, 0.06],
            [0.0, 1.45, 0.02],
            [0.18, 2.1, -0.04],
            [0.3, 2.7, 0.0],
          ],
          {
            tubular: 4,
            radial: 6,
            radius: (t) => 0.13 + 0.07 * (1 - t) + 0.2 * Math.pow(1 - t, 7),
          },
        ),
        barkMaterial(T),
      ),
      T.mesh(
        "branch",
        limb(
          THREE,
          T,
          [
            [-0.05, 1.2, 0.02],
            [-0.5, 1.7, 0.2],
            [-0.85, 2.05, 0.4],
          ],
          { tubular: 2, radial: 4, radius: (t) => 0.08 * Math.pow(1 - t, 0.7), foot: false },
        ),
        barkMaterial(T),
      ),
    );
  }
  return {
    root: T.ground(T.group(lod ? "athena-tree-blossom-lod" : "athena-tree-blossom", ...children)),
  };
}

// --------------------------------------------------------------------------- rocks
const STONE = { low: "#6F8491", mid: "#B9C4C8", warm: "#D9C3A3" };

/** A cage boulder: eight authored corners (a little different per seed), Loop-subdivided. */
function boulder(T, seed, { w = 1, h = 0.7, d = 0.9, subdivisions = 2, amplitude = 0.055 }) {
  const random = T.lcg(seed);
  const j = (amount) => (random() - 0.5) * amount;
  const hw = w / 2;
  const hd = d / 2;
  const cage = T.cage({
    vertices: [
      [-hw + j(0.2), 0, -hd + j(0.2)],
      [hw + j(0.2), 0, -hd + j(0.2)],
      [hw + j(0.2), 0, hd + j(0.2)],
      [-hw + j(0.2), 0, hd + j(0.2)],
      [-hw * 0.7 + j(0.25), h + j(0.15), -hd * 0.7 + j(0.25)],
      [hw * 0.75 + j(0.25), h * 1.1 + j(0.15), -hd * 0.6 + j(0.25)],
      [hw * 0.65 + j(0.25), h * 0.85 + j(0.15), hd * 0.7 + j(0.25)],
      [-hw * 0.6 + j(0.25), h * 0.95 + j(0.15), hd * 0.65 + j(0.25)],
    ],
    faces: [
      [0, 1, 2, 3],
      [4, 7, 6, 5],
      [3, 2, 6, 7],
      [1, 0, 4, 5],
      [2, 1, 5, 6],
      [0, 3, 7, 4],
    ],
  });
  const rock = T.subdivide(cage, subdivisions);
  const noise = T.createNoise(seed);
  T.displace(rock, (p) => amplitude * noise.fbm3(p.x * 2.2, p.y * 2.2, p.z * 2.2, { octaves: 2 }));
  T.smoothNormals(rock, 50);
  T.bake.fill(rock, STONE.mid);
  T.bake.gradient(rock, { bottom: STONE.low, top: STONE.warm, curve: 1.2 });
  T.bake.direction(rock, {
    color: LEAF.deep,
    direction: [0, 1, 0],
    threshold: 0.72,
    strength: 0.85,
  });
  T.bake.occlusion(rock, { radius: 0.2, strength: 0.3 });
  return rock;
}
const rockMaterial = (T) => T.material("rock", "#FFFFFF", { vertexColors: true, roughness: 0.95 });

function buildRockSet(_THREE, T) {
  const material = rockMaterial(T);
  const parts = [
    { seed: 11, size: { w: 1.1, h: 0.78, d: 0.95 }, at: [0, 0, 0], yaw: 0.2 },
    { seed: 23, size: { w: 0.7, h: 0.52, d: 0.62 }, at: [0.85, 0, 0.38], yaw: -0.7 },
    { seed: 37, size: { w: 0.62, h: 0.42, d: 0.55 }, at: [-0.7, 0, 0.5], yaw: 1.1 },
    { seed: 53, size: { w: 0.4, h: 0.3, d: 0.38 }, at: [0.15, 0, -0.78], yaw: 0.4 },
  ];
  const meshes = parts.map(({ seed, size, at, yaw }, i) => {
    const mesh = T.mesh(`rock_${i}`, boulder(T, seed, size), material);
    mesh.position.set(...at);
    mesh.rotation.y = yaw;
    return mesh;
  });
  return { root: T.ground(T.group("athena-rock-set", ...meshes)) };
}
function buildBoulder(_THREE, T) {
  const mesh = T.mesh("rock", boulder(T, 71, { w: 1, h: 0.62, d: 0.85 }), rockMaterial(T));
  return { root: T.ground(T.group("athena-rock-boulder", mesh)) };
}
function buildPebble(_THREE, T) {
  const mesh = T.mesh(
    "rock",
    boulder(T, 83, { w: 1, h: 0.55, d: 0.8, subdivisions: 1, amplitude: 0.035 }),
    rockMaterial(T),
  );
  return { root: T.ground(T.group("athena-rock-pebble", mesh)) };
}

// --------------------------------------------------------------------------- cliff slabs
/** A rounded slab of cool stone with a grass cap and a slightly overhanging lip. */
async function buildCliffSlab(THREE, T, variant) {
  const { sdf } = T;
  const a = variant === "a";
  const body = sdf.smin(
    0.22,
    sdf.roundBox([0, 0.55, 0], a ? [1.15, 0.55, 0.85] : [0.95, 0.65, 1.0], 0.3),
    sdf.ellipsoid(
      a ? [0.25, 1.1, 0.1] : [-0.2, 1.2, -0.1],
      a ? [0.9, 0.34, 0.7] : [0.75, 0.38, 0.8],
    ),
    sdf.ellipsoid(a ? [-0.7, 0.2, 0.55] : [0.7, 0.25, -0.6], [0.5, 0.3, 0.42]),
  );
  const field = sdf.subtract(body, sdf.halfspace([0, 1, 0], 0.0), 0.04);
  const geometry = await T.polygonise(field, { size: 64, maxTriangles: a ? 385 : 395 });
  T.bake.fill(geometry, STONE.mid);
  T.bake.gradient(geometry, { bottom: STONE.low, top: "#D4DAD6", curve: 1.1 });
  // Strata: two soft darker bands across the sides.
  T.bake.direction(geometry, {
    color: LEAF.mid,
    direction: [0, 1, 0],
    threshold: 0.62,
    strength: 0.95,
  });
  T.bake.occlusion(geometry, { sdf: field, radius: 0.3, strength: 0.4 });
  const root = T.group(`athena-cliff-slab-${variant}`, T.mesh("slab", geometry, rockMaterial(T)));
  return { root: T.ground(root) };
}

// --------------------------------------------------------------------------- islet
function buildIslet(THREE, T) {
  const noise = T.createNoise(97);
  // Outside, bottom to top: a pointed underside, a bulging belly, a crisp lip, the grass cap.
  const body = T.lathe(
    [
      [0.0, -3.3],
      [0.34, -3.05],
      [0.86, -2.4],
      [1.45, -1.5],
      [1.95, -0.7],
      [2.28, -0.1],
      [2.32, 0.1, 1],
      [1.7, 0.22],
      [0.9, 0.3],
      [0.0, 0.3],
    ],
    { segments: 40, divisions: 2 },
  );
  T.displace(body, (p) => 0.22 * noise.fbm3(p.x * 0.9, p.y * 0.6, p.z * 0.9, { octaves: 2 }));
  T.smoothNormals(body, 55);
  // Colour: stone sides darkening toward the point, grass cap on the upward faces, a pale
  // waterfall thread falling from the lip along one azimuth.
  const normal = body.attributes.normal;
  const position = body.attributes.position;
  const color = new Float32Array(position.count * 3);
  const stone = new THREE.Color();
  const grassLow = new THREE.Color(LEAF.deep);
  const grassHigh = new THREE.Color(LEAF.light);
  const lo = new THREE.Color(STONE.low);
  const hi = new THREE.Color(STONE.mid);
  const warm = new THREE.Color(STONE.warm);
  const foam = new THREE.Color("#DDF2F0");
  const mixed = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    const x = position.getX(i);
    const z = position.getZ(i);
    const ny = normal.getY(i);
    const heightT = Math.min(1, Math.max(0, (y + 3.3) / 3.6));
    stone
      .copy(lo)
      .lerp(hi, Math.pow(heightT, 0.8))
      .lerp(warm, Math.max(0, x / 2.4) * 0.35 * heightT);
    const cap = Math.min(1, Math.max(0, (ny - 0.45) / 0.3));
    mixed.copy(grassLow).lerp(grassHigh, Math.min(1, Math.max(0, 0.45 + (x * 0.15 + z * 0.1))));
    stone.lerp(mixed, cap);
    const azimuth = Math.atan2(z, x);
    const near = Math.max(0, 1 - Math.abs(azimuth + 0.9) / 0.13);
    if (y < 0.05 && y > -2.2) stone.lerp(foam, near * near * 0.9);
    color.set([stone.r, stone.g, stone.b], i * 3);
  }
  body.setAttribute("color", new THREE.BufferAttribute(color, 3));
  T.bake.occlusion(body, { radius: 0.3, strength: 0.25 });

  // One tiny spire, a little off centre: plaster tower under a teal point.
  const tower = T.lathe(
    [
      [0.3, 0.0],
      [0.34, 0.14],
      [0.23, 0.62],
      [0.26, 0.98],
      [0.3, 1.04, 1],
      [0.18, 1.1],
    ],
    { segments: 10, divisions: 2 },
  );
  T.bake.fill(tower, "#F4E9D8");
  T.bake.gradient(tower, { bottom: "#B9A58A", top: "#FFFFFF", curve: 1.2 });
  const roof = T.lathe(
    [
      [0.34, 1.0],
      [0.3, 1.14],
      [0.17, 1.55],
      [0.08, 2.0],
      [0.0, 2.55],
    ],
    { segments: 10, divisions: 2 },
  );
  T.bake.fill(roof, "#2F7D7A");
  T.bake.gradient(roof, { bottom: "#1F5856", top: "#7FC1B8", curve: 0.9 });
  const body_mesh = T.mesh(
    "islet_rock",
    body,
    T.material("rock", "#FFFFFF", { vertexColors: true, roughness: 0.95 }),
  );
  const tower_mesh = T.mesh(
    "islet_tower",
    tower,
    T.material("plaster", "#FFFFFF", { vertexColors: true, roughness: 0.9 }),
  );
  const roof_mesh = T.mesh(
    "islet_roof",
    roof,
    T.material("roof_tile", "#FFFFFF", { vertexColors: true, roughness: 0.6 }),
  );
  for (const mesh of [tower_mesh, roof_mesh]) mesh.position.set(0.45, 0.28, -0.3);
  return { root: T.ground(T.group("athena-islet", body_mesh, tower_mesh, roof_mesh)) };
}

// --------------------------------------------------------------------------- atlas
function buildFoliageCards(_THREE, T) {
  const atlas = T.paint.paintFoliageAtlas({ seed: 7 });
  const geometry = T.cards.crossCards({
    width: 0.5,
    height: 0.5,
    count: 2,
    rect: atlas.rects.leafCluster,
    atlasSize: atlas.size,
  });
  const material = T.material("leaf_card", "#FFFFFF", {
    vertexColors: true,
    doubleSided: true,
    alphaTest: 0.5,
    roughness: 0.9,
  });
  const root = T.group("athena-foliage-cards", T.mesh("cards", geometry, material));
  return { root, textures: [{ png: atlas.png, materials: ["leaf_card"] }] };
}

/** @type {Array<{ id: string, family: string, file: string, build: Function }>} */
export const entries = [
  {
    id: "tree-broadleaf",
    family: "nature",
    file: "athena-tree-broadleaf.glb",
    build: (t, k) => buildBroadleaf(t, k),
  },
  {
    id: "tree-broadleaf-lod",
    family: "nature",
    file: "athena-tree-broadleaf-lod.glb",
    build: (t, k) => buildBroadleaf(t, k, { lod: true }),
  },
  {
    id: "tree-cypress",
    family: "nature",
    file: "athena-tree-cypress.glb",
    build: (t, k) => buildCypress(t, k),
  },
  {
    id: "tree-cypress-lod",
    family: "nature",
    file: "athena-tree-cypress-lod.glb",
    build: (t, k) => buildCypress(t, k, { lod: true }),
  },
  {
    id: "tree-blossom",
    family: "nature",
    file: "athena-tree-blossom.glb",
    build: (t, k) => buildBlossom(t, k),
  },
  {
    id: "tree-blossom-lod",
    family: "nature",
    file: "athena-tree-blossom-lod.glb",
    build: (t, k) => buildBlossom(t, k, { lod: true }),
  },
  { id: "rock-set", family: "nature", file: "athena-rock-set.glb", build: buildRockSet },
  { id: "rock-boulder", family: "nature", file: "athena-rock-boulder.glb", build: buildBoulder },
  { id: "rock-pebble", family: "nature", file: "athena-rock-pebble.glb", build: buildPebble },
  {
    id: "cliff-slab-a",
    family: "nature",
    file: "athena-cliff-slab-a.glb",
    build: (t, k) => buildCliffSlab(t, k, "a"),
  },
  {
    id: "cliff-slab-b",
    family: "nature",
    file: "athena-cliff-slab-b.glb",
    build: (t, k) => buildCliffSlab(t, k, "b"),
  },
  { id: "islet", family: "nature", file: "athena-islet.glb", build: buildIslet },
  {
    id: "foliage-cards",
    family: "nature",
    file: "athena-foliage-cards.glb",
    build: buildFoliageCards,
  },
];
