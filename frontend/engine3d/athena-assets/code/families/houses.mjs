/**
 * Topic houses: 6 silhouettes x 4 learning states = 24 GLBs
 * (`models/buildings/athena-house-<status>-v<n>.glb`, status spelled with a hyphen).
 * Brief: docs/art/briefs/houses.md. Direction: docs/art/ART_DIRECTION.md 4.2 and 4.3.
 *
 * The roof tells the variants apart, the light tells the state:
 *   v0 swoop cone (8-fold) | v1 two-tier pagoda (6) | v2 onion dome (12)
 *   v3 saddle gable (soft square) | v4 spire over a ring balcony (8) | v5 garden dome (soft square)
 *   locked = unlit stone | available = one lantern | in-progress = warm windows + growth | done = gold
 *
 * Deliberate asymmetries (rule 5), also listed in `ASYMMETRY` below:
 *   every variant: the door lantern hangs on one side only (v0 right, v1 left, v2 right, v3 left,
 *   v4 right, v5 left); the oculus sits on a chosen face (v0 left, v1 right, v2 near the axis, v3 in
 *   the +X gable, v4 on the axis, v5 on the axis); one chimney placed off the axis and rotated;
 *   the middle step is nudged sideways and the half-ring of flagstones is uneven; moss only on the
 *   back-left of the plinth; the second step is 3 cm off the door axis; the flag always flies
 *   towards -X; the A-frame loom and its yarn basket sit on one side of the front eave; the eave
 *   tufts and the single trailing vine of done houses sit at different eave corners.
 *
 * Runtime notes (see src/village/houses-look.ts, src/athena/merge.ts):
 *   - Plain opaque materials are merged into one vertex-coloured mesh at load time, so a material
 *     that must stay addressable by name (the glazed roof, banners, leaves) is not plain: `roof_tile`
 *     carries a faint emissive (never visible) and the cloth / leaf materials are double sided.
 *   - Everything is MeshStandardMaterial, vertex colours for baked gradients, no textures.
 */

const TAU = Math.PI * 2;
const PI = Math.PI;

export const STATUSES = ["locked", "available", "in-progress", "done"];

/** Palette (docs/art/ART_DIRECTION.md 3). Nothing outside these swatches is used for colours. */
const C = {
  ink: "#2B2936",
  stoneCoolDark: "#6F8491",
  stoneCoolLight: "#B9C4C8",
  sandDark: "#A88E6E",
  sandLight: "#D9C3A3",
  plaster: "#F4E9D8",
  warmWhite: "#FBF3E4",
  timber: "#9C7356",
  timberDark: "#6E4F3C",
  tealLight: "#2F7D7A",
  tealDark: "#1F5856",
  terraLight: "#C9785F",
  terraDark: "#9B5542",
  slateLight: "#5C5F7A",
  slateDark: "#3E4057",
  foliageDeep: "#3F7A5B",
  foliageMid: "#6CA66E",
  foliageLight: "#A8C97A",
  blossom: "#E9AFAA",
  ginkgo: "#E9C777",
  gold: "#F2C36B",
  lantern: "#FFE2A6",
  lanternGlow: "#F6C46A",
  gilt: "#E9BC5C",
  giltGlow: "#C99232",
  white: "#FFFFFF",
  paneSlate: "#5B6470", // unlit glass: lighter than the slate swatches so a window never reads as a hole
};

/** Every material the houses may use: name -> { colour, options }. Contract: docs briefs/houses.md. */
const MATERIALS = {
  stone_plinth: { color: C.white, vc: true, roughness: 0.95 },
  stone_step: { color: C.white, vc: true, roughness: 0.95 },
  wall_plaster: { color: C.white, vc: true, roughness: 0.92 },
  wall_stone: { color: C.white, vc: true, roughness: 0.95 },
  timber: { color: C.white, vc: true, roughness: 0.8 },
  door: { color: C.white, vc: true, roughness: 0.8 },
  shutter: { color: C.white, vc: true, roughness: 0.8 },
  iron: { color: C.white, vc: true, roughness: 0.5, metalness: 0.2 },
  // Glazed tile: vertex coloured; the faint emissive keeps it out of the vertex-colour merge so
  // the runtime sheen (`/tile|glaze/`) and houses-look.ts can still find it by name.
  roof_tile: {
    color: C.white,
    vc: true,
    roughness: 0.5,
    emissive: C.tealDark,
    emissiveIntensity: 0.02,
  },
  roof_ridge: { color: C.white, vc: true, roughness: 0.6 },
  window_unlit: { color: C.white, vc: true, roughness: 0.3 },
  window_glow: {
    color: C.lantern,
    roughness: 0.5,
    emissive: C.lanternGlow,
    emissiveIntensity: 0.8,
  },
  lantern_paper: { color: C.white, vc: true, roughness: 0.7 },
  lantern_glow: {
    color: C.lantern,
    roughness: 0.5,
    emissive: C.lanternGlow,
    emissiveIntensity: 0.9,
  },
  // Warm halo around a lit paper lantern: a faint translucent shell.
  halo: {
    color: C.lantern,
    roughness: 1,
    emissive: C.lanternGlow,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.16,
  },
  beacon_gold: { color: C.gold, roughness: 0.4, emissive: C.lanternGlow, emissiveIntensity: 1.0 },
  gilt: {
    color: C.gilt,
    roughness: 0.45,
    metalness: 0.2,
    emissive: C.giltGlow,
    emissiveIntensity: 0.6,
  },
  rune_cold: {
    color: C.stoneCoolLight,
    roughness: 0.6,
    emissive: C.tealLight,
    emissiveIntensity: 0.5,
  },
  vine: { color: C.white, vc: true, roughness: 0.9 },
  vine_dry: { color: C.white, vc: true, roughness: 0.95, doubleSided: true },
  vine_leaf: { color: C.white, vc: true, roughness: 0.9, doubleSided: true },
  vine_bloom: {
    color: C.blossom,
    roughness: 0.7,
    emissive: C.blossom,
    emissiveIntensity: 0.4,
  },
  garden_leaf: { color: C.white, vc: true, roughness: 0.9, doubleSided: true },
  garden_bloom: { color: C.white, vc: true, roughness: 0.8 },
  banner: { color: C.white, vc: true, roughness: 0.85, doubleSided: true },
  smoke: { color: C.warmWhite, roughness: 1, transparent: true, opacity: 0.55 },
  mote: {
    color: C.gold,
    roughness: 0.4,
    emissive: C.lanternGlow,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.9,
  },
};
export const MATERIAL_NAMES = Object.keys(MATERIALS);

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1)));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

// ------------------------------------------------------------------------------ variants
/**
 * Per-variant plan. Plans are lathes around the vertical axis of the house; soft-square plans
 * are the same lathe warped through a superellipse (`squarify`).
 *  - folds: number of roof lobes (6, 8 or 12); faces of a round plan sit at multiples of 360/folds.
 *  - wall: nominal body radius (round) or half extents (square, profile radius ~1).
 */
const VARIANTS = [
  {
    name: "swoop",
    folds: 8,
    square: false,
    radius: 0.97,
    wallHeight: 1.4,
    plinth: [1.28, 1.28],
    tone: "teal",
    lanternSide: 1,
    ocularFace: -1,
    arches: [
      { face: 1, y: 0.4 },
      { face: -1, y: 0.4 },
      { face: 2, y: 0.42 },
    ],
    chimney: { theta: 2.5, r: 0.8 },
    loom: { theta: 0.95, r: 1.0 },
    garden: [
      { theta: -0.85, r: 0.86, s: 1 },
      { theta: 0.95, r: 0.88, s: 0.85 },
      { theta: 2.9, r: 0.8, s: 0.7 },
    ],
  },
  {
    name: "pagoda",
    folds: 6,
    square: false,
    radius: 0.92,
    wallHeight: 1.05,
    plinth: [1.28, 1.28],
    tone: "terra",
    lanternSide: -1,
    ocularFace: 1,
    arches: [
      { face: 1, y: 0.36 },
      { face: -1, y: 0.4 },
      { face: -2, y: 0.4 },
    ],
    chimney: { theta: -2.3, r: 1.0 },
    loom: { theta: -0.95, r: 1.02 },
    garden: [
      { theta: -0.75, r: 0.84, s: 0.95 },
      { theta: 0.85, r: 0.86, s: 0.8 },
      { theta: 2.6, r: 0.8, s: 0.6 },
    ],
  },
  {
    name: "onion",
    folds: 12,
    square: false,
    radius: 0.84,
    wallHeight: 1.55,
    plinth: [1.28, 1.28],
    tone: "teal",
    lanternSide: 1,
    ocularFace: 0,
    ocularTheta: 0.14,
    arches: [
      { face: 2, y: 0.4 },
      { face: -2, y: 0.38 },
      { face: -4, y: 0.4 },
    ],
    chimney: { theta: -2.65, r: 0.95 },
    loom: { theta: 0.9, r: 0.98 },
    garden: [
      { theta: -0.8, r: 0.93, s: 0.8 },
      { theta: 0.9, r: 0.94, s: 0.7 },
      { theta: 2.7, r: 0.9, s: 0.55 },
    ],
  },
  {
    name: "saddle",
    folds: 4,
    square: true,
    radius: 1,
    half: [0.98, 0.86],
    wallHeight: 1.15,
    plinth: [1.55, 1.28],
    tone: "terra",
    lanternSide: -1,
    ocularGable: 1,
    arches: [
      { theta: 0.66, y: 0.42 },
      { theta: -0.66, y: 0.42 },
      { theta: 1.55, y: 0.45 },
    ],
    chimney: { x: 0.55, z: -0.3 },
    loom: { x: -0.7, z: 0.98 },
    garden: [
      { x: -0.55, s: 0.85 },
      { x: 0.1, s: 1 },
      { x: 0.7, s: 0.7 },
    ],
  },
  {
    name: "spire",
    folds: 8,
    square: false,
    radius: 0.85,
    wallHeight: 1.25,
    plinth: [1.28, 1.28],
    tone: "terra",
    lanternSide: 1,
    ocularFace: 0,
    arches: [
      { face: 1, y: 0.4 },
      { face: -1, y: 0.42 },
    ],
    chimney: { theta: -2.3, r: 0.64 },
    loom: { theta: -0.9, r: 0.76 },
    garden: [],
  },
  {
    name: "terrace",
    folds: 8,
    square: true,
    radius: 1,
    half: [1.0, 0.9],
    wallHeight: 1.5,
    plinth: [1.6, 1.28],
    tone: "teal",
    lanternSide: -1,
    ocularFace: 0,
    arches: [
      { theta: 0.62, y: 0.4 },
      { theta: -0.62, y: 0.4 },
      { theta: 1.5, y: 0.42 },
    ],
    chimney: { x: -0.8, z: -0.6 },
    loom: { x: -0.62, z: 0.64 },
    garden: [],
  },
];

const TONES = {
  teal: { dark: C.tealDark, light: C.tealLight },
  terra: { dark: C.terraDark, light: C.terraLight },
  slate: { dark: C.slateDark, light: C.slateLight },
};

/** Documented for the report (rule 5). */
export const ASYMMETRY = [
  "door lantern on one side only (v0 right, v1 left, v2 right, v3 left, v4 right, v5 left)",
  "oculus placement per variant (v0 left face, v1 right face, v2 near axis, v3 in the front gable, crossed beams on the front gable only, v4 and v5 on axis)",
  "one off-axis chimney per house",
  "middle step shifted 3 cm off the door axis, uneven half-ring of flagstones",
  "moss on the back-left of the plinth only",
  "flag flies towards -X; the A-frame loom with its yarn basket sits on one side of the front eave (theta per variant), the eave blossom tufts and the one trailing vine at their own eave corners",
  "v3: ridge sags 6 percent towards the middle, chimney off centre, crossed beams on the front gable only",
  "each chimney leans 4 degrees in its own direction and has its own girth",
  "flagstones: six of different size and turn, clustered towards the door, none on the back half",
  "v4: the chimney stands on the balcony beside the turret, the lantern hangs on the front-right of the rail",
  "v5: dome sits on the back half of the terrace, planter bed left of the door axis",
];

// ------------------------------------------------------------------------------ geometry kit
function createKit(THREE, T) {
  const { Vector2, Vector3, Matrix4, Euler } = THREE;
  const kit = {};

  /** Dense (r, y) samples of a Catmull-Rom profile, for radius / height look-ups. */
  kit.profile = (points) => {
    const curve = new THREE.SplineCurve(points.map(([r, y]) => new Vector2(r, y)));
    const dense = curve.getPoints(points.length * 40).map((v) => [v.x, v.y]);
    return {
      dense,
      /** Radius at height y on a profile whose y rises monotonically. */
      rAt(y) {
        for (let i = 1; i < dense.length; i++) {
          const [r0, y0] = dense[i - 1];
          const [r1, y1] = dense[i];
          if ((y0 <= y && y <= y1) || (y1 <= y && y <= y0))
            return y1 === y0 ? r0 : lerp(r0, r1, (y - y0) / (y1 - y0));
        }
        return dense[dense.length - 1][0];
      },
      /** Height at radius r on a profile whose radius falls monotonically. */
      yAt(r) {
        for (let i = 1; i < dense.length; i++) {
          const [r0, y0] = dense[i - 1];
          const [r1, y1] = dense[i];
          if ((r0 >= r && r >= r1) || (r1 >= r && r >= r0))
            return r1 === r0 ? y0 : lerp(y0, y1, (r - r0) / (r1 - r0));
        }
        return dense[dense.length - 1][1];
      },
      /** Point at fraction t of the curve. */
      at: (t) => {
        const p = curve.getPoint(t);
        const q = curve.getTangent(t);
        return { r: p.x, y: p.y, nr: q.y, ny: -q.x };
      },
    };
  };

  /** Warp a lathe into a soft square: axis extents (sx, sz), superellipse exponent n. */
  kit.rho = (theta, n = 4) =>
    Math.pow(
      Math.pow(Math.abs(Math.sin(theta)), n) + Math.pow(Math.abs(Math.cos(theta)), n),
      -1 / n,
    );
  kit.squarify = (geometry, sx, sz, n = 4, crease = 55) => {
    const p = geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const r = Math.hypot(x, z);
      if (r < 1e-9) continue;
      const rho = kit.rho(Math.atan2(x, z), n);
      p.setX(i, x * sx * rho);
      p.setZ(i, z * sz * rho);
    }
    p.needsUpdate = true;
    T.smoothNormals(geometry, crease);
    return geometry;
  };

  /**
   * Scalloped, upturned rim: every vertex with radius above r0 is pulled in between `folds`
   * round lobes (cusps) and the lobe peaks are lifted. Pure function of (r, theta), so a ridge
   * band lathed on the same surface follows it exactly.
   */
  kit.scallop = (geometry, { folds, depth, lift, r0, r1, below, crease = 55 }) => {
    const p = geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const r = Math.hypot(x, z);
      const w = smoothstep(r0, r1, r) * (below ? 1 - smoothstep(below[0], below[1], p.getY(i)) : 1);
      if (w <= 0) continue;
      const theta = Math.atan2(x, z);
      const lobe = Math.abs(Math.cos((folds * theta) / 2));
      const k = 1 - depth * w * (1 - lobe);
      p.setX(i, x * k);
      p.setZ(i, z * k);
      p.setY(i, p.getY(i) + lift * w * lobe);
    }
    p.needsUpdate = true;
    T.smoothNormals(geometry, crease);
    return geometry;
  };

  kit.place = (
    geometry,
    { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1, sx, sy, sz } = {},
  ) => {
    const m = new Matrix4().compose(
      new Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new Euler(rx, ry, rz, "YXZ")),
      new Vector3(sx ?? s, sy ?? s, sz ?? s),
    );
    geometry.applyMatrix4(m);
    return geometry;
  };

  /** Soft ellipsoid blob (closed, no pole triangles). */
  kit.blob = (rx, ry, rz, segments = 8) => {
    const geometry = T.lathe(
      [
        [0, -1],
        [0.62, -0.78],
        [0.95, -0.3],
        [0.95, 0.3],
        [0.62, 0.78],
        [0, 1],
      ],
      { segments, divisions: 1 },
    );
    geometry.scale(rx, ry, rz);
    return T.smoothNormals(geometry, 80);
  };

  /** A tube along points with a (t) -> radius taper. */
  kit.tube = (points, radius, { tubular, radial = 5, caps = "round" } = {}) => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new Vector3(...p)));
    return T.sweep(curve, {
      radius,
      tubular: tubular ?? Math.max(4, (points.length - 1) * 3),
      radial,
      caps,
    });
  };

  /** Arch outline (bottom y = 0, width w, total height h): returns [x, y] points, counter-clockwise. */
  kit.archPoints = (w, h, arc = 8) => {
    const r = w / 2;
    const pts = [
      [-r, 0],
      [r, 0],
    ];
    const spring = Math.max(0, h - r);
    pts.push([r, spring]);
    for (let i = 1; i < arc; i++) {
      const a = (i / arc) * PI;
      pts.push([r * Math.cos(a), spring + r * Math.sin(a)]);
    }
    pts.push([-r, spring]);
    return pts;
  };
  kit.archShape = (w, h, arc = 8) => {
    const shape = new THREE.Shape();
    kit.archPoints(w, h, arc).forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
    return shape;
  };
  /** Arch frame: a flat ring around an arch opening of w x h with border f. */
  kit.archFrame = (w, h, f, arc = 8) => {
    // The outer outline reaches f below the opening, so the sill border exists.
    const outer = new THREE.Shape();
    kit
      .archPoints(w + 2 * f, h + f, arc)
      .forEach(([x, y], i) => (i ? outer.lineTo(x, y - f) : outer.moveTo(x, y - f)));
    const hole = new THREE.Path();
    kit
      .archPoints(w, h, arc)
      .reverse()
      .forEach(([x, y], i) => (i ? hole.lineTo(x, y) : hole.moveTo(x, y)));
    outer.holes.push(hole);
    return new THREE.ShapeGeometry(outer);
  };
  /** U-shaped door frame (no sill): outline of an arch with border f, open at the bottom. */
  kit.archU = (w, h, f, arc = 8) => {
    const ro = w / 2 + f;
    const ri = w / 2;
    const so = h - ri + 0 + 0; // spring height of the inner arch
    const shape = new THREE.Shape();
    shape.moveTo(-ro, 0);
    shape.lineTo(-ri, 0);
    shape.lineTo(-ri, so);
    for (let i = 1; i < arc; i++) {
      const a = PI - (i / arc) * PI;
      shape.lineTo(ri * Math.cos(a), so + ri * Math.sin(a));
    }
    shape.lineTo(ri, so);
    shape.lineTo(ri, 0);
    shape.lineTo(ro, 0);
    shape.lineTo(ro, so);
    for (let i = 1; i < arc; i++) {
      const a = (i / arc) * PI;
      shape.lineTo(ro * Math.cos(a), so + ro * Math.sin(a));
    }
    shape.lineTo(-ro, so);
    return shape;
  };
  kit.disc = (r, n = 14) => new THREE.CircleGeometry(r, n);
  kit.ring2d = (rOuter, rInner, n = 16) => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, rOuter, 0, TAU, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, rInner, 0, TAU, true);
    shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape, n);
  };

  /** Flag / banner: a bent strip from x = 0 (pole) to x = w, pennant or swallowtail. */
  kit.flag = (w, h, { tail = 0.35, droop = 0.04, columns = 5, rows = 2 } = {}) => {
    const positions = [];
    const indices = [];
    for (let i = 0; i <= columns; i++) {
      const u = i / columns;
      const hh = h * (1 - 0.55 * u) * 0.5;
      for (let j = 0; j <= rows; j++) {
        const v = j / rows - 0.5;
        positions.push(u * w, v * 2 * hh - droop * u * u, 0.025 * Math.sin(u * 4.2));
      }
    }
    const stride = rows + 1;
    for (let i = 0; i < columns; i++)
      for (let j = 0; j < rows; j++) {
        const a = i * stride + j;
        indices.push(a, a + stride, a + 1, a + 1, a + stride, a + stride + 1);
      }
    // Swallow tail: notch the last column's middle row back towards the pole.
    if (tail > 0 && rows % 2 === 0) {
      const middle = columns * stride + rows / 2;
      positions[middle * 3] -= tail * w * 0.5;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  };

  /** Leaf: a small pointed oval, flat, facing +Z. */
  kit.leaf = (length, width) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(width, length * 0.45, 0, length);
    shape.quadraticCurveTo(-width, length * 0.45, 0, 0);
    return new THREE.ShapeGeometry(shape, 3);
  };

  /** A lantern body (egg of paper) of height h. */
  kit.lanternBody = (h, r, segments = 10) =>
    T.lathe(
      [
        [0, 0],
        [r * 0.5, h * 0.03],
        [r, h * 0.38],
        [r * 0.98, h * 0.62],
        [r * 0.5, h * 0.95],
        [0, h],
      ],
      { segments, divisions: 1 },
    );

  return kit;
}

// ------------------------------------------------------------------------------ the house
/** Shared memo of polygonised clumps (the sdf pass is the slowest step). */
const clumpCache = new Map();

async function buildHouse(THREE, T, v, status) {
  const cfg = VARIANTS[v];
  const locked = status === "locked";
  const available = status === "available";
  const progress = status === "in-progress";
  const done = status === "done";
  const open = !locked; // door and doorway
  const doorAngle = locked ? 0 : available ? 0.61 : 1.22; // 35 and 70 degrees
  const litArches = progress || done;
  const litOculus = available || progress || done;
  const K = createKit(THREE, T);
  const { place } = K;

  // ---- parts, materials -------------------------------------------------------------------
  const parts = [];
  const mats = new Map();
  const material = (name) => {
    if (!mats.has(name)) {
      const spec = MATERIALS[name];
      if (!spec) throw new Error(`unknown house material ${name}`);
      const m = T.material(name, spec.color, {
        roughness: spec.roughness,
        metalness: spec.metalness,
        emissive: spec.emissive,
        emissiveIntensity: spec.emissiveIntensity,
        vertexColors: !!spec.vc,
        doubleSided: spec.doubleSided,
      });
      if (spec.transparent) {
        m.transparent = true;
        m.opacity = spec.opacity;
        m.depthWrite = false;
      }
      mats.set(name, m);
    }
    return mats.get(name);
  };
  const ensureColor = (geometry, hex) => {
    const n = geometry.attributes.position.count;
    if (!geometry.attributes.color || geometry.attributes.color.count !== n)
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(new Float32Array(n * 3).fill(1), 3),
      );
    if (hex) T.bake.fill(geometry, hex);
  };
  let counter = 0;
  /**
   * Add a mesh. `hex` fills the vertex colour first (vertex-coloured materials only); bakes that
   * were already applied to the geometry are kept when `hex` is omitted.
   */
  const put = (name, geometry, materialName, hex) => {
    const spec = MATERIALS[materialName];
    geometry.deleteAttribute("uv");
    if (!geometry.attributes.normal) geometry.computeVertexNormals();
    if (spec.vc) ensureColor(geometry, hex);
    else geometry.deleteAttribute("color");
    parts.push(T.mesh(`${name}_${counter++}`, geometry, material(materialName)));
    return geometry;
  };

  // ---- colours ----------------------------------------------------------------------------
  const tone = locked ? TONES.slate : TONES[cfg.tone];
  const wallColor = locked ? C.stoneCoolLight : C.plaster;
  const underColor = tone.dark; // roof undersides stay in the tile colour, never grey-white
  const plinthDark = locked ? C.stoneCoolDark : C.sandDark;
  const plinthLight = locked ? "#A3B1B7" : C.sandLight;
  const timberColor = locked ? C.timberDark : C.timber;
  const wallMat = locked ? "wall_stone" : "wall_plaster";
  const mixHex = (a, b, t) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
  // Weight at the ground (rule 4): the plinth is darker than the walls and darkest at the foot,
  // the steps and flagstones a touch darker than the plinth top.
  const plinthFoot = mixHex(plinthDark, locked ? C.slateDark : C.timberDark, locked ? 0.35 : 0.55);
  const plinthTop = mixHex(plinthLight, plinthDark, locked ? 0.4 : 0.62);
  const stepTop = mixHex(plinthLight, plinthDark, locked ? 0.6 : 0.8);
  const contactDark = mixHex(plinthFoot, C.ink, 0.4);

  // ---- geometry constants -------------------------------------------------------------------
  const P = 0.22; // plinth top
  const [plinthX, plinthZ] = cfg.plinth;
  const zc = -0.225; // plan centre; steps balance the footprint in Z
  const H = cfg.wallHeight;
  const yT = P + H;
  const sx = cfg.square ? cfg.half[0] : 1;
  const sz = cfg.square ? cfg.half[1] : 1;
  const folds = cfg.folds;

  const squareWarp = (g) => (cfg.square ? K.squarify(g, sx, sz) : g);
  const toPlan = (g) => {
    // lathe geometry built about the vertical axis -> plan centre
    return place(g, { z: zc });
  };
  /** Scale a unit-radius lathe to the plan extents (an ellipse, or a soft square). */
  const planScale = (g, ax, az) => {
    if (cfg.square) return K.squarify(g, ax, az);
    g.scale(ax, 1, az);
    return T.smoothNormals(g, 55);
  };
  const segs = () => 2 * folds * Math.ceil(48 / (2 * folds)); // lathe segments that put scallop cusps on vertices
  const lobeFolds = folds;

  /** Wall radius profile (nominal), S-shaped: bulge 4% mid height, tucked under the eaves. */
  const rWall = cfg.square ? 1 : cfg.radius;
  const wallPoints = [
    [rWall * 1.0, P],
    [rWall * 1.025, P + H * 0.18],
    [rWall * 1.04, P + H * 0.5],
    [rWall * 1.0, P + H * 0.82],
    [rWall * 0.93, yT],
  ];
  const wallProfile = K.profile(wallPoints);
  const wallR = (y) => wallProfile.rAt(Math.min(yT, Math.max(P, y)));

  /** Point on the wall surface at angle theta (0 = +Z) and height y, pushed out by `off`. */
  const wallFrame = (theta, y, off = 0) => {
    const at = (t) => {
      const r = wallR(y);
      const rho = cfg.square ? K.rho(t) : 1;
      return [r * Math.sin(t) * rho * sx, r * Math.cos(t) * rho * sz];
    };
    const [x0, z0] = at(theta);
    const [xa, za] = at(theta - 0.01);
    const [xb, zb] = at(theta + 0.01);
    let nx = zb - za;
    let nz = -(xb - xa);
    const l = Math.hypot(nx, nz) || 1;
    nx /= l;
    nz /= l;
    if (nx * x0 + nz * z0 < 0) {
      nx = -nx;
      nz = -nz;
    }
    return { x: x0 + nx * off, y, z: zc + z0 + nz * off, ry: Math.atan2(nx, nz) };
  };
  const faceTheta = (face) => (cfg.square ? 0 : face * (TAU / folds));

  // ============================================================================= PLINTH + STEPS
  {
    const rim = 1;
    const plinth = T.lathe(
      [
        [0.955, 0],
        [1.01, 0.05],
        [1.0, 0.15],
        [0.975, 0.205],
        [0.955, 0.236, 1],
        [0.93, 0.222],
        [0.5, 0.222],
        [0.0, 0.222],
      ],
      { segments: 40, divisions: 1 },
    );
    planScale(plinth, plinthX * rim, plinthZ);
    toPlan(plinth);
    T.bake.fill(plinth, C.white);
    T.bake.gradient(plinth, {
      bottom: plinthFoot,
      top: plinthTop,
      curve: 1.3,
      from: 0,
      to: 0.24,
    });
    T.bake.occlusion(plinth, { radius: 0.2, strength: 0.15 });
    // Moss only on the back-left, sky-facing rim.
    const pp = plinth.attributes.position;
    const pn = plinth.attributes.normal;
    const pc = plinth.attributes.color;
    const moss = new THREE.Color(C.foliageDeep);
    for (let i = 0; i < pp.count; i++) {
      const back = smoothstep(0.1, -0.5, pp.getZ(i) - zc) * smoothstep(0.3, -0.6, pp.getX(i));
      const w = back * smoothstep(0.55, 0.95, pn.getY(i)) * (locked ? 0.55 : 0.4);
      if (w <= 0) continue;
      pc.setXYZ(
        i,
        lerp(pc.getX(i), moss.r, w),
        lerp(pc.getY(i), moss.g, w),
        lerp(pc.getZ(i), moss.b, w),
      );
    }
    // thin dark contact band where the plinth meets the ground
    {
      const contact = new THREE.Color(contactDark);
      for (let i = 0; i < pp.count; i++) {
        const w = (1 - smoothstep(0.004, 0.05, pp.getY(i))) * 0.9;
        if (w <= 0) continue;
        pc.setXYZ(
          i,
          lerp(pc.getX(i), contact.r, w),
          lerp(pc.getY(i), contact.g, w),
          lerp(pc.getZ(i), contact.b, w),
        );
      }
    }
    put("plinth", plinth, "stone_plinth");

    // Three steps, widths 1.5 / 1.25 / 1.0, treads rolled down at the front edge.
    const frontZ = zc + plinthZ;
    const steps = [
      { w: 1.5, front: frontZ + 0.46, top: 0.073, dx: 0 },
      { w: 1.25, front: frontZ + 0.27, top: 0.147, dx: 0.03 }, // authored: 3 cm off the door axis
      { w: 1.0, front: frontZ + 0.08, top: 0.2, dx: 0 },
    ];
    steps.forEach((s, i) => {
      const depth = s.front - (frontZ - 0.25);
      const g = T.lathe(
        [
          [0.96, 0],
          [1.0, s.top * 0.45],
          [0.99, s.top * 0.86],
          [0.9, s.top + 0.002],
          [0.55, s.top + 0.007],
          [0.0, s.top + 0.008],
        ],
        { segments: 20, divisions: 1 },
      );
      g.scale(s.w / 2, 1, depth);
      T.smoothNormals(g, 55);
      place(g, { x: s.dx, z: frontZ - 0.25 });
      T.bake.fill(g, C.white);
      T.bake.gradient(g, {
        bottom: plinthFoot,
        top: stepTop,
        curve: 1.1,
        from: 0,
        to: s.top + 0.01,
      });
      put(`step${i}`, g, "stone_step");
    });

    // Six flagstones of different size and turn, clustered round the foot of the steps (none on
    // the back half), sunk a centimetre into the ground. [x, z, rx, rz, rot, segments]
    const stoneX = cfg.square ? plinthX / 1.28 : 1;
    [
      [-0.98, 1.12, 0.21, 0.13, 0.4, 7],
      [-1.2, 0.86, 0.12, 0.1, 1.2, 6],
      [-0.72, 1.4, 0.1, 0.075, 2.0, 6],
      [0.92, 1.17, 0.17, 0.12, 2.6, 7],
      [1.18, 0.9, 0.1, 0.09, 0.9, 5],
      [0.98, 1.42, 0.08, 0.065, 0.2, 6],
    ].forEach(([x, z, rx, rz, rot, n], i) => {
      const g = T.lathe(
        [
          [0.9, -0.012],
          [1.0, 0.02],
          [0.93, 0.045],
          [0.5, 0.052],
          [0, 0.054],
        ],
        { segments: n, divisions: 1 },
      );
      g.scale(rx, 1, rz);
      T.smoothNormals(g, 60);
      place(g, { x: x * stoneX, z, ry: rot });
      T.bake.fill(g, C.white);
      T.bake.gradient(g, { bottom: plinthFoot, top: stepTop, from: -0.01, to: 0.06 });
      put(`flag${i}`, g, "stone_step");
    });

    // Locked: one thin cold rune band on the plinth, in broken arcs.
    if (locked) {
      const arcs = [];
      const count = 14;
      for (let i = 0; i < count; i++) {
        const a0 = (i / count) * TAU + 0.12;
        if (Math.abs(Math.atan2(Math.sin(a0 + 0.12), Math.cos(a0 + 0.12))) < 0.7) continue; // steps hide the front
        const len = 0.17 + (i % 3) * 0.05; // authored: arcs of three lengths
        const g = T.lathe(
          [
            [1.016, 0.092],
            [1.026, 0.115],
            [1.016, 0.138],
          ],
          { segments: 4, divisions: 1, phiStart: a0, phiLength: len },
        );
        planScale(g, plinthX, plinthZ);
        place(g, { z: zc });
        arcs.push(g);
      }
      put("rune_band", T.merge(arcs), "rune_cold");
    }
  }

  // ============================================================================= BODY
  {
    const wall = T.lathe([[0, P], [wallPoints[0][0], P, 1], ...wallPoints.slice(1)], {
      segments: segs(2),
      divisions: 2,
    });
    squareWarp(wall);
    toPlan(wall);
    T.bake.fill(wall, locked ? C.white : wallColor);
    if (locked)
      T.bake.gradient(wall, {
        bottom: "#7D909B",
        top: C.stoneCoolLight,
        curve: 0.9,
        from: P,
        to: yT,
      });
    else T.bake.gradient(wall, { bottom: "#D9CDBB", top: C.white, curve: 1.2, from: P, to: yT });
    T.bake.occlusion(wall, { radius: 0.2, strength: locked ? 0.15 : 0.12 });
    put("wall", wall, wallMat);

    // Timber: base band and floor band, plus ribs that follow the bulge.
    const band = (y, off, halfHeight) => {
      const r = wallR(y) + off;
      const g = T.lathe(
        [
          [r - 0.006, y - halfHeight],
          [r + 0.016, y],
          [r - 0.006, y + halfHeight],
        ],
        { segments: segs(2), divisions: 1 },
      );
      squareWarp(g);
      return toPlan(g);
    };
    put("band_base", band(P + 0.06, 0.012, 0.045), "timber", timberColor);
    put("band_floor", band(P + H * 0.52, 0.01, 0.032), "timber", timberColor);

    const ribTheta = cfg.square
      ? [1.0, -1.0, 2.2, -2.2, 1.57, -1.57]
      : Array.from({ length: folds }, (_, k) => (k + 0.5) * (TAU / folds));
    const ribCount = cfg.square ? 6 : folds;
    ribTheta.slice(0, ribCount).forEach((theta, i) => {
      const ys = [P + 0.05, P + H * 0.25, P + H * 0.5, P + H * 0.75, yT - 0.05];
      const pts = ys.map((y) => {
        const f = wallFrame(theta, y, 0.026);
        return [f.x, y, f.z];
      });
      put(
        `rib${i}`,
        K.tube(pts, 0.034, { tubular: 6, radial: 5, caps: false }),
        "timber",
        timberColor,
      );
    });
  }

  // ============================================================================= WINDOWS + DOOR
  const openShutters = !locked;
  const windowAt = (theta, y, kind, lit, extra = {}) => {
    const w = kind === "arch" ? 0.19 : 0.28;
    const h = kind === "arch" ? 0.34 : 0.28;
    const f = extra.frame ?? wallFrame(theta, y, 0);
    const glassOff = 0.012;
    const mk = (geo, off, ry = f.ry) => {
      place(geo, { x: f.x, y: f.y, z: f.z, ry });
      // push along the facing direction
      geo.translate(Math.sin(ry) * off, 0, Math.cos(ry) * off);
      return geo;
    };
    if (kind === "arch") {
      const glass = new THREE.ShapeGeometry(K.archShape(w, h), 6);
      mk(glass, glassOff);
      put(lit ? "glow" : "glass", glass, lit ? "window_glow" : "window_unlit", C.paneSlate);
      const frame = K.archFrame(w, h, 0.03);
      mk(frame, glassOff + 0.004);
      put("frame", frame, "timber", timberColor);
      // small stone sill under the frame
      const sill = K.blob(w / 2 + 0.07, 0.022, 0.055, 8);
      sill.translate(0, -0.05, 0.034);
      mk(sill, 0.0);
      put("window_sill", sill, "stone_step", plinthLight);
      // Shutters: open leaves folded flat beside the window, or closed leaves meeting in the middle.
      const leafW = 0.085;
      if (openShutters) {
        for (const side of [-1, 1]) {
          const g = new THREE.ShapeGeometry(K.archShape(leafW, h * 0.86, 4), 4);
          const o = new THREE.Vector3(side * (w / 2 + 0.05 + leafW / 2), 0, 0);
          g.translate(o.x, o.y, o.z);
          mk(g, 0.014);
          put("shutter", g, "shutter", locked ? C.slateLight : timberColor);
        }
      } else {
        for (const side of [-1, 1]) {
          const half = new THREE.Shape();
          const r = w / 2 + 0.012;
          const spring = h - w / 2;
          half.moveTo(side * 0.008, 0);
          half.lineTo(side * r, 0);
          half.lineTo(side * r, spring);
          for (let i = 1; i <= 4; i++) {
            const a = (i / 4) * (PI / 2);
            half.lineTo(side * r * Math.cos(a), spring + r * Math.sin(a));
          }
          const g = new THREE.ShapeGeometry(half, 3);
          mk(g, 0.02);
          put("shutter", g, "shutter", C.slateLight);
        }
      }
    } else {
      // Oculus: lit or dark glass in a gilt ring.
      const glass = K.disc(w / 2 - 0.005, 14);
      mk(glass, glassOff);
      put(lit ? "glow" : "glass", glass, lit ? "window_glow" : "window_unlit", C.paneSlate);
      const ring = T.lathe(
        [
          [w / 2 - 0.012, -0.008],
          [w / 2 + 0.012, -0.012],
          [w / 2 + 0.03, 0],
          [w / 2 + 0.012, 0.014],
          [w / 2 - 0.012, 0.01],
        ],
        { segments: 20, divisions: 1 },
      );
      // lathe axis is Y: stand it up so its axis faces +Z
      ring.rotateX(PI / 2);
      mk(ring, 0.022);
      put("oculus_ring", ring, "gilt");
      if (locked) {
        // closed shutter leaf over the oculus
        const cover = K.disc(w / 2 + 0.004, 14);
        mk(cover, 0.032);
        put("shutter", cover, "shutter", C.slateLight);
      }
    }
  };

  // lower arched windows
  const archY = (a) => P + H * a.y;
  for (const a of cfg.arches) {
    const theta = a.theta ?? faceTheta(a.face);
    windowAt(theta, archY(a), "arch", litArches);
  }
  // oculus
  if (cfg.ocularGable) {
    // round window in the +X gable (saddle roof): handled with the roof, see below
  } else {
    const theta = cfg.ocularTheta ?? faceTheta(cfg.ocularFace);
    const y = P + H * (cfg.name === "swoop" || cfg.name === "pagoda" ? 0.8 : 0.82);
    windowAt(theta, y, "oculus", litOculus);
  }

  // door: frame, doorway glow, leaf, step, knob
  const doorW = 0.5;
  const doorH = 0.9;
  const doorFront = wallFrame(0, P, 0);
  {
    const dz = doorFront.z + 0.012;
    const dy = P;
    const panel = new THREE.ShapeGeometry(K.archShape(doorW, doorH), 8);
    panel.translate(0, dy, dz);
    if (open) put("doorway", panel, "window_glow");
    else put("doorway", panel, "window_unlit", C.paneSlate);
    const frame = new THREE.ExtrudeGeometry(K.archU(doorW, doorH, 0.06, 8), {
      depth: 0.05,
      bevelEnabled: false,
      curveSegments: 6,
    });
    frame.translate(0, dy - 0.005, dz - 0.012);
    put("door_frame", frame, "timber", timberColor);
    // threshold slab
    const sill = K.blob(0.34, 0.025, 0.12, 8);
    place(sill, { x: 0, y: P + 0.005, z: dz + 0.1 });
    put("sill", sill, "stone_step", plinthLight);

    // door leaf: hinge on the left edge, opens outward
    const leafShape = K.archShape(doorW - 0.02, doorH - 0.02, 8);
    const leaf = new THREE.ExtrudeGeometry(leafShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSize: 0.008,
      bevelThickness: 0.008,
      bevelSegments: 1,
      curveSegments: 6,
    });
    leaf.translate(doorW / 2 - 0.01, 0, 0); // hinge at x = 0
    const leafGroup = new THREE.Matrix4()
      .makeTranslation(-doorW / 2 + 0.01, dy + 0.005, dz + 0.02)
      .multiply(new THREE.Matrix4().makeRotationY(-doorAngle));
    leaf.applyMatrix4(leafGroup);
    put("door_leaf", leaf, "door", locked ? C.slateDark : C.timberDark);
    if (locked) {
      // closed: planks as thin ribs
    }
    // gilt knob on the free edge
    const knob = K.blob(0.022, 0.022, 0.022, 6);
    knob.translate(doorW - 0.07, doorH * 0.45, 0.06);
    knob.applyMatrix4(leafGroup);
    put("knob", knob, "gilt");
  }

  // ============================================================================= ROOF
  const roofEdge = mixHex(tone.dark, C.ink, 0.4); // the visible thickness of an eave, and the course lines
  const LIP = 0.026;
  let scallopParams = { folds: lobeFolds, depth: 0.14, lift: 0.075, r0: 0.9, r1: 1.2 };
  const roof = buildRoof();
  function ridgeBand(prof, r, hw, lift) {
    // chunky rope: the build's simplifier works to ~3 cm on a 4 m mesh, thinner bands tear
    const pts = [
      [r + hw, prof.yAt(r + hw) - 0.05],
      [r + hw * 0.5, prof.yAt(r + hw * 0.5) + lift * 0.85],
      [r - hw * 0.5, prof.yAt(r - hw * 0.5) + lift * 0.85],
      [r - hw, prof.yAt(r - hw) - 0.05],
    ];
    return T.lathe(pts, { segments: 2 * folds * Math.ceil(36 / (2 * folds)), divisions: 1 });
  }

  /** Bake a roof: tone gradient dark at the eave, pale top; warm underside; return geometry. */
  function paintRoof(g, { yLow, yHigh }) {
    T.bake.fill(g, C.white);
    T.bake.gradient(g, { bottom: tone.dark, top: tone.light, curve: 0.9, from: yLow, to: yHigh });
    T.bake.direction(g, {
      color: underColor,
      direction: [0, -1, 0],
      threshold: 0.35,
      softness: 0.2,
      strength: 1,
    });
    return g;
  }

  // ---- tiled roofs ------------------------------------------------------------------------
  /**
   * Tiled roof: a lathe whose top surface steps up by `lip` at every course line (the lower edge of
   * a row of tiles). The rows are real geometry, so they survive the build's simplification, and
   * the shadow under each step is the thin darker line. Profile, from the centre outwards:
   * `under` (underside), the eave tip (crease, a visible thickness edge), the upturned `flare`
   * going inwards, then `courses` down to the apex. `base` is the monotone curve (descending r)
   * the courses follow. Vertex colours: one tile colour, darker lines at the course edges, the
   * eave thickness and the underside in the dark tile colour.
   */
  function tileRoof({ under, tip, flare = [], base, courses, cap = [], lip = LIP, yLow, yHigh }) {
    const prof = K.profile(base);
    const yb = (r) => prof.yAt(r);
    // the step is pushed out along the surface normal, so it stays chunky on a steep cone too
    const off = (r, k) => {
      const m = (yb(r + 0.01) - yb(Math.max(0, r - 0.01))) / (r + 0.01 - Math.max(0, r - 0.01));
      const l = Math.hypot(m, 1);
      return [r + (k * -m) / l, yb(r) + k / l];
    };
    const pts = [...under, [tip.r, tip.under, 1], [tip.r, tip.top, 1], ...flare];
    for (let k = 0; k < courses.length - 1; k++) {
      const ro = courses[k];
      const ri = courses[k + 1];
      const rs = Math.max(ri, ro - 0.012);
      pts.push([ro, yb(ro), 1]); // bottom of the riser
      pts.push([...off(rs, lip), 1]); // top of the riser
      const rm = lerp(rs, ri, 0.5);
      pts.push(off(rm, lip * 0.5));
    }
    const last = courses[courses.length - 1];
    pts.push([last, yb(last)]);
    pts.push(...cap);
    const g = T.lathe(pts, { segments: segs(), divisions: 1 });
    const pos = g.attributes.position;
    const nor = g.attributes.normal;
    const col = new Float32Array(pos.count * 3);
    const body = new THREE.Color(tone.light);
    const shade = new THREE.Color(tone.dark);
    const edge = new THREE.Color(roofEdge);
    const out = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const r = Math.hypot(pos.getX(i), pos.getZ(i));
      const y = pos.getY(i);
      if (r >= tip.r - 0.004) out.copy(edge);
      else if (nor.getY(i) < -0.25) out.copy(shade);
      else {
        const t = Math.min(1, Math.max(0, (y - yLow) / (yHigh - yLow)));
        out.copy(shade).lerp(body, 0.55 + 0.45 * smoothstep(0, 0.6, t));
        let w = 0;
        for (let k = 0; k < courses.length - 1; k++) {
          const d = r - courses[k];
          if (d > -0.003 && d < 0.006 && y - yb(courses[k]) < 0.015) w = 1;
        }
        if (w) out.lerp(edge, 0.85);
      }
      col[i * 3] = out.r;
      col[i * 3 + 1] = out.g;
      col[i * 3 + 2] = out.b;
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    return { geometry: g, prof, tip, courses, lip };
  }

  /** Scallop the eave of a tiled roof, move it into the plan and add it to the scene. */
  function finishRoof(t, name, params, at = zc) {
    scallopParams = params;
    K.scallop(t.geometry, scallopParams);
    place(t.geometry, { z: at });
    put(name, t.geometry, "roof_tile");
  }

  /** Thin gilt trim ring along the scalloped eave tip (done houses). */
  function eaveRing(tipR, tipTop, at = zc, radius = 0.024) {
    const n = folds * 8;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const theta = (i / n) * TAU;
      const lobe = Math.abs(Math.cos((folds * theta) / 2));
      const r = tipR * (1 - scallopParams.depth * (1 - lobe)) - 0.006;
      pts.push(
        new THREE.Vector3(
          Math.sin(theta) * r,
          tipTop + scallopParams.lift * lobe + 0.004,
          at + Math.cos(theta) * r,
        ),
      );
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    put("eave_trim", T.sweep(curve, { radius, tubular: n * 2, radial: 4 }), "gilt");
  }

  /** Thin gilt meridians up a tiled roof (done houses), like the onion dome's. */
  function meridians(t, rStart, rEnd, count = 4, at = zc) {
    for (let i = 0; i < count; i++) {
      const theta = 0.39 + (i * TAU) / count;
      const pts = [];
      for (let k = 0; k <= 8; k++) {
        const r = lerp(rStart, rEnd, k / 8);
        const y = t.prof.yAt(r) + t.lip * 0.5 + 0.012;
        pts.push([Math.sin(theta) * r, y, at + Math.cos(theta) * r]);
      }
      put(`meridian${i}`, K.tube(pts, 0.016, { tubular: 14, radial: 4, caps: "round" }), "gilt");
    }
  }

  /**
   * Paper lantern, 0.22 m tall: the paper body is 70 percent of the height (0.154 m), the iron cap
   * and foot are a centimetre thin, two thin ribs run round the paper. Hangs from y = yTop.
   */
  function paperLantern(x, yTop, z, lit, tag = "lantern") {
    const y0 = yTop - 0.03 - 0.22;
    const bodyY0 = 0.01;
    const bodyH = 0.154;
    const rad = (y) => 0.05 * Math.pow(Math.sin((Math.PI * (y - bodyY0)) / bodyH), 0.55);
    const ribs = [0.06, 0.11];
    const ys = [0.01, 0.025, 0.045, 0.085, 0.135, 0.152, 0.164];
    for (const rb of ribs) ys.push(rb - 0.004, rb, rb + 0.004);
    ys.sort((p, q) => p - q);
    const bodyGeo = T.lathe(
      ys.map((y) => [y <= bodyY0 + 1e-6 || y >= bodyY0 + bodyH - 1e-6 ? 0 : rad(y), y]),
      { segments: 10, divisions: 1 },
    );
    const paper = locked ? C.stoneCoolLight : C.warmWhite;
    const rib = locked ? C.stoneCoolDark : C.sandDark;
    if (!lit) {
      T.bake.fill(bodyGeo, paper);
      const pos = bodyGeo.attributes.position;
      const col = bodyGeo.attributes.color;
      const ribColor = new THREE.Color(rib);
      for (let i = 0; i < pos.count; i++)
        if (ribs.some((rb) => Math.abs(pos.getY(i) - rb) < 0.0045))
          col.setXYZ(i, ribColor.r, ribColor.g, ribColor.b);
    }
    place(bodyGeo, { x, y: y0, z });
    put(tag, bodyGeo, lit ? "lantern_glow" : "lantern_paper", lit ? undefined : undefined);
    if (lit)
      for (const rb of ribs) {
        // a glowing body cannot carry baked colour: thin ribs round it instead
        const n = 10;
        const ring = [];
        for (let k = 0; k < n; k++) {
          const t = (k / n) * TAU;
          ring.push(
            new THREE.Vector3(
              x + Math.sin(t) * (rad(rb) + 0.003),
              y0 + rb,
              z + Math.cos(t) * (rad(rb) + 0.003),
            ),
          );
        }
        put(
          `${tag}_rib`,
          T.sweep(new THREE.CatmullRomCurve3(ring, true), {
            radius: 0.0045,
            tubular: 20,
            radial: 3,
          }),
          "lantern_paper",
          rib,
        );
      }
    const baseCap = T.lathe(
      [
        [0, 0],
        [0.03, 0.001],
        [0.03, 0.01],
        [0.0, 0.011],
      ],
      { segments: 8, divisions: 1 },
    );
    place(baseCap, { x, y: y0, z });
    put(`${tag}_foot`, baseCap, "iron", C.slateDark);
    const topCap = T.lathe(
      [
        [0.03, 0.163],
        [0.024, 0.174],
        [0.008, 0.18],
        [0.004, 0.186],
      ],
      { segments: 8, divisions: 1 },
    );
    place(topCap, { x, y: y0, z });
    put(`${tag}_cap`, topCap, "iron", C.slateDark);
    if (lit) {
      const halo = K.blob(0.105, 0.13, 0.105, 10);
      place(halo, { x, y: y0 + 0.09, z });
      put(`${tag}_halo`, halo, "halo");
    }
  }

  /** Finial: a post carrying a lantern cage, with the flag on its stem. Returns the top y. */
  function finial(x, y, z, { flagToward = -1 } = {}) {
    const stem = 0.2;
    const post = T.lathe(
      [
        [0.02, 0],
        [0.026, 0.05],
        [0.018, 0.11],
        [0.03, 0.15],
        [0.012, stem],
      ],
      { segments: 8, divisions: 1 },
    );
    place(post, { x, y, z });
    put("finial_post", post, done ? "gilt" : "timber", done ? undefined : timberColor);
    const cageY = y + stem - 0.02;
    const body = K.lanternBody(0.17, 0.07, 10);
    place(body, { x, y: cageY, z });
    put(
      "finial_cage",
      body,
      done ? "beacon_gold" : "lantern_paper",
      done ? undefined : locked ? C.stoneCoolLight : C.sandLight,
    );
    const cap = T.lathe(
      [
        [0.085, 0],
        [0.06, 0.03],
        [0.02, 0.07],
        [0.012, 0.09],
      ],
      { segments: 10, divisions: 1 },
    );
    place(cap, { x, y: cageY + 0.165, z });
    put("finial_cap", cap, "gilt");
    const foot = T.lathe(
      [
        [0.0, 0],
        [0.05, 0.005],
        [0.04, 0.025],
        [0.0, 0.03],
      ],
      { segments: 8, divisions: 1 },
    );
    place(foot, { x, y: cageY - 0.03, z });
    put("finial_foot", foot, "timber", timberColor);
    const top = cageY + 0.165 + 0.09;
    if (!locked) {
      const big = done;
      const flag = K.flag(big ? 0.46 : 0.3, big ? 0.15 : 0.1, {
        tail: big ? 0.4 : 0.15,
        droop: 0.03,
      });
      place(flag, {
        x: x + flagToward * 0.02,
        y: y + stem - 0.065,
        z,
        ry: flagToward < 0 ? PI : 0,
      });
      put("banner", flag, "banner", big ? tone.light : tone.dark);
    }
    return top;
  }

  function chimney(x, y0, z, height, { tilt = 0.07, girth = 1 } = {}) {
    // 40 percent shorter than the first pass, a capped stack that leans 4 degrees
    const h = height * 0.6;
    const q = girth;
    const stack = T.lathe(
      [
        [0.13 * q, 0],
        [0.14 * q, h * 0.4],
        [0.125 * q, h * 0.85],
        [0.13 * q, h],
        [0, h],
      ],
      { segments: 8, divisions: 1 },
    );
    const cap = T.lathe(
      [
        [0.0, 0],
        [0.18 * q, 0],
        [0.19 * q, 0.035],
        [0.15 * q, 0.06],
        [0.07 * q, 0.065],
        [0.0, 0.058],
      ],
      { segments: 8, divisions: 1 },
    );
    cap.translate(0, h, 0);
    for (const g of [stack, cap]) place(g, { x, y: y0, z, ry: 0.4, rz: tilt });
    T.bake.fill(stack, C.white);
    T.bake.gradient(stack, { bottom: plinthDark, top: plinthLight, from: y0, to: y0 + h });
    put("chimney", stack, "stone_step");
    T.bake.fill(cap, C.white);
    T.bake.gradient(cap, { bottom: plinthDark, top: plinthDark, from: y0 + h, to: y0 + h + 0.07 });
    put("chimney_cap", cap, "stone_step");
    if (progress) {
      [
        [0.04, 0.2, 0.065],
        [0.1, 0.42, 0.09],
        [0.17, 0.7, 0.115],
      ].forEach(([dx, dy, r], i) => {
        const puff = K.blob(r, r * 0.8, r, 7);
        place(puff, { x: x + dx - tilt * h, y: y0 + h + dy * 0.8, z: z - dx * 0.4 });
        put(`smoke${i}`, puff, "smoke");
      });
    }
    return y0 + h;
  }

  /** Door lantern: a small paper lantern on a thin curved iron arm beside the door. */
  function doorLantern() {
    const side = cfg.lanternSide;
    const f = wallFrame(side * 0.52, P + Math.min(0.85, H * 0.72), 0);
    const base = [f.x, f.y, f.z - 0.015];
    const out = [Math.sin(f.ry), Math.cos(f.ry)];
    const along = [Math.cos(f.ry), -Math.sin(f.ry)];
    const p = (o, a, h) => [
      base[0] + out[0] * o + along[0] * a * side,
      base[1] + h,
      base[2] + out[1] * o + along[1] * a * side,
    ];
    const arm = K.tube(
      [p(0, 0, -0.02), p(0.06, 0, 0.06), p(0.15, 0.02, 0.09), p(0.22, 0.04, 0.05)],
      0.011,
      { tubular: 10, radial: 4 },
    );
    put("lantern_arm", arm, "iron", C.slateDark);
    const hang = p(0.22, 0.04, 0.05);
    put(
      "lantern_chain",
      K.tube(
        [
          [hang[0], hang[1], hang[2]],
          [hang[0], hang[1] - 0.03, hang[2]],
        ],
        0.006,
        { tubular: 1, radial: 3, caps: false },
      ),
      "iron",
      C.slateDark,
    );
    paperLantern(hang[0], hang[1], hang[2], open);
  }

  // ---- roof builders ----------------------------------------------------------------------
  function buildRoof() {
    const doneRidges = done;
    const ridgeMat = doneRidges ? "gilt" : "roof_ridge";
    const ridgeColor = locked ? C.slateDark : tone.dark;
    const result = {};
    const addRidges = (prof, radii, hw, lift) => {
      radii.forEach((r, i) => {
        const g = ridgeBand(prof, r, hw, lift);
        if (r > 0.9) K.scallop(g, scallopParams);
        else T.smoothNormals(g, 60);
        toPlan(g);
        put(`ridge${i}`, g, ridgeMat, doneRidges ? undefined : ridgeColor);
      });
    };

    if (v === 0) {
      // swoop cone, 8 folds: concave profile, a skirt that flares out and up (0.3 m overhang)
      const rim = 1.22;
      const apexY = yT + 1.78;
      const t = tileRoof({
        under: [
          [0, yT - 0.01],
          [0.5, yT - 0.02],
          [0.9, yT - 0.035],
          [1.05, yT - 0.012],
          [1.15, yT + 0.03],
        ],
        tip: { r: rim, top: yT + 0.14, under: yT + 0.078 },
        flare: [
          [1.14, yT + 0.1],
          [1.06, yT + 0.068],
        ],
        base: [
          [0.98, yT + 0.045],
          [0.85, yT + 0.1],
          [0.7, yT + 0.24],
          [0.5, yT + 0.52],
          [0.3, yT + 0.95],
          [0.12, yT + 1.42],
          [0, apexY],
        ],
        courses: [0.98, 0.78, 0.58, 0.38, 0.2, 0],
        yLow: yT,
        yHigh: apexY,
      });
      finishRoof(t, "roof", { folds, depth: 0.03, lift: 0.045, r0: 1.0, r1: rim });
      if (done) {
        eaveRing(rim, yT + 0.14);
        meridians(t, 0.96, 0.16);
      }
      result.prof = t.prof;
      result.apex = [0, apexY, 0];
      result.surface = (r) => t.prof.yAt(Math.min(r, 0.98)) + 0.02;
      result.skirtY = result.surface;
      result.eave = { r: rim, y: yT + 0.14, depth: 0.03, tuftR: rim * 0.97 - 0.1 };
    } else if (v === 1) {
      // two-tier pagoda: lower roof, timber drum with glowing slits, upper roof at 61 %
      const rim = 1.24;
      const y1 = yT + 0.58; // top of the lower roof (drum base)
      const lower = tileRoof({
        under: [
          [0, yT - 0.01],
          [0.6, yT - 0.02],
          [0.95, yT - 0.03],
          [1.1, yT + 0.0],
          [1.18, yT + 0.04],
        ],
        tip: { r: rim, top: yT + 0.16, under: yT + 0.092 },
        flare: [
          [1.16, yT + 0.125],
          [1.06, yT + 0.095],
        ],
        base: [
          [0.98, yT + 0.09],
          [0.86, yT + 0.17],
          [0.74, yT + 0.3],
          [0.64, yT + 0.43],
          [0.56, y1 - 0.02],
        ],
        courses: [0.98, 0.8, 0.66, 0.56],
        cap: [
          [0.5, y1 + 0.01, 1],
          [0, y1 + 0.012],
        ],
        yLow: yT,
        yHigh: y1,
      });
      finishRoof(lower, "roof_low", { folds, depth: 0.03, lift: 0.045, r0: 1.0, r1: rim });
      if (done) {
        eaveRing(rim, yT + 0.16);
        meridians(lower, 0.96, 0.6);
      }
      const lowerProf = lower.prof;

      const drumH = 0.66;
      const y2 = y1 + drumH;
      const drum = T.lathe(
        [
          [0.5, y1 - 0.02],
          [0.54, y1 + drumH * 0.4],
          [0.5, y2 - 0.02],
          [0.0, y2 - 0.02],
        ],
        { segments: 24, divisions: 2 },
      );
      toPlan(drum);
      T.bake.fill(drum, C.white);
      T.bake.gradient(drum, { bottom: C.timberDark, top: C.timber, from: y1, to: y2 });
      put("drum", drum, "timber");
      // six glowing slits on the six faces, one per face (the face behind the door is skipped)
      for (let k = 0; k < folds; k++) {
        const theta = k * (TAU / folds) + PI / folds;
        const r = 0.545;
        const slit = new THREE.ShapeGeometry(K.archShape(0.1, 0.34, 6), 5);
        place(slit, {
          x: Math.sin(theta) * r * 1.0,
          y: y1 + 0.11,
          z: zc + Math.cos(theta) * r,
          ry: theta,
        });
        slit.translate(Math.sin(theta) * 0.01, 0, Math.cos(theta) * 0.01);
        if (litArches) put("slit", slit, "window_glow");
        else put("slit", slit, "window_unlit", C.paneSlate);
        const fr = K.archFrame(0.1, 0.34, 0.022, 5);
        place(fr, { x: Math.sin(theta) * r, y: y1 + 0.11, z: zc + Math.cos(theta) * r, ry: theta });
        fr.translate(Math.sin(theta) * 0.016, 0, Math.cos(theta) * 0.016);
        put("slit_frame", fr, "timber", timberColor);
      }

      const rim2 = 0.76;
      const upper = tileRoof({
        under: [
          [0, y2 - 0.01],
          [0.4, y2 - 0.02],
          [0.62, y2 - 0.025],
          [0.7, y2 + 0.0],
        ],
        tip: { r: rim2, top: y2 + 0.12, under: y2 + 0.06 },
        flare: [
          [0.72, y2 + 0.09],
          [0.68, y2 + 0.075],
        ],
        base: [
          [0.64, y2 + 0.06],
          [0.55, y2 + 0.14],
          [0.44, y2 + 0.3],
          [0.32, y2 + 0.55],
          [0.2, y2 + 0.9],
          [0.08, y2 + 1.22],
          [0, y2 + 1.34],
        ],
        courses: [0.64, 0.46, 0.3, 0.14, 0],
        lip: 0.02,
        yLow: y2,
        yHigh: y2 + 1.34,
      });
      finishRoof(upper, "roof_high", { folds, depth: 0.03, lift: 0.04, r0: 0.66, r1: rim2 });
      if (done) {
        eaveRing(rim2, y2 + 0.12, zc, 0.02);
        meridians(upper, 0.62, 0.12);
      }
      result.prof = lowerProf;
      result.apex = [0, y2 + 1.34, 0];
      result.surface = (r) => lowerProf.yAt(Math.min(0.98, Math.max(r, 0.57))) + 0.02;
      result.skirtY = (r) => lowerProf.yAt(Math.min(0.98, r)) + 0.02;
      result.gardenY = result.skirtY;
      result.eave = { r: rim, y: yT + 0.16, depth: 0.03, tuftR: rim * 0.97 - 0.12 };
      result.drum = { r: 0.55, y: y1 + 0.06 };
    } else if (v === 2) {
      // onion dome, 12 folds, four gilt meridians
      const rim = 1.04;
      const top = [
        [rim, yT - 0.02],
        [1.0, yT + 0.08],
        [1.07, yT + 0.4],
        [0.92, yT + 0.76],
        [0.55, yT + 1.04],
        [0.24, yT + 1.2],
        [0.1, yT + 1.42],
        [0.055, yT + 1.7],
        [0.0, yT + 1.95],
      ];
      const profile = [
        [0, yT - 0.01],
        [0.5, yT - 0.012],
        [0.85, yT - 0.04],
        [1.0, yT - 0.06],
        [rim, yT - 0.065, 1],
        [rim, yT - 0.02, 1],
        ...top.slice(1),
      ];
      scallopParams = {
        folds,
        depth: 0.12,
        lift: 0.07,
        r0: 0.9,
        r1: rim,
        below: [yT + 0.04, yT + 0.2],
      };
      const g = T.lathe(profile, { segments: segs(2), divisions: 2 });
      K.scallop(g, scallopParams);
      toPlan(g);
      paintRoof(g, { yLow: yT - 0.05, yHigh: yT + 1.95 });
      put("roof", g, "roof_tile");
      const prof = K.profile(top);
      // meridians: sweeps up the dome surface (never above the bulge)
      const meridian = (theta, i) => {
        const pts = [];
        for (let k = 0; k <= 9; k++) {
          const t = 0.06 + (k / 9) * 0.7;
          const s = prof.at(t);
          const r = s.r + s.nr * 0.02;
          pts.push([Math.sin(theta) * r, s.y + s.ny * 0.02, zc + Math.cos(theta) * r]);
        }
        put(
          `meridian${i}`,
          K.tube(pts, 0.022, { tubular: 14, radial: 4, caps: "round" }),
          locked ? "iron" : "gilt",
          locked ? C.slateDark : undefined,
        );
      };
      [0.39, 0.39 + PI / 2, 0.39 + PI, 0.39 + (3 * PI) / 2].forEach(meridian);
      // two or three tile ridge bands on the upper dome
      addRidges(prof, [0.7, 0.4], 0.062, 0.07);
      result.prof = prof;
      result.apex = [0, yT + 1.95, 0];
      result.bead = true;
      result.surface = (r) => prof.yAt(r);
      result.gardenY = (r) => yT + 0.06 + (r > 0.99 ? 0 : 0.0);
      result.eave = { r: rim, y: yT + 0.07, depth: 0.0, tuftR: 1.02 };
    } else if (v === 3) {
      // saddle gable: a 9 cm slab with tile courses, a ridge that sags 6 percent in the middle and
      // eaves that lift about 10 percent. Built with the ridge along local X, then turned so the
      // gable end faces the door (+Z).
      const hx = 1.22; // gable overhang at the ridge ends
      const zEave = 1.14;
      const rise = 1.0;
      const THICK = 0.09;
      const LIPV = 0.03;
      const W = (lx, y, lz) => [-lz, y, zc + lx]; // local roof coordinates -> house coordinates
      const nu = 17;
      const ridgeAt = (u) => rise * (0.94 + 0.06 * u * u); // the middle sits 6 % below the ends
      const eaveAt = (u) => zEave + 0.06 * u * u;
      // height across the slope: t = 0 at the eave, 1 on the ridge; the tip lifts about 10 %
      const across = (t) => 0.96 * Math.pow(t, 1.6) + 0.14 * Math.pow(Math.max(0, 1 - t / 0.25), 2);
      const slBase = (x, z) => {
        const u = Math.max(-1, Math.min(1, x / hx));
        const t = 1 - Math.min(1, Math.abs(z) / eaveAt(u));
        return yT - 0.03 + ridgeAt(u) * across(t);
      };
      // rows across the roof, eave -> ridge -> eave: course lines at 0.2, 0.4, 0.6, 0.8
      const half = [{ t: 0, off: LIPV, line: false }];
      [0.2, 0.4, 0.6, 0.8].forEach((c) => {
        half.push({ t: c - 0.005, off: 0, line: true });
        half.push({ t: c + 0.005, off: LIPV, line: false });
      });
      half.push({ t: 1, off: 0, line: false });
      const rows = [
        ...half.map((r) => ({ ...r, s: -(1 - r.t) })),
        ...half
          .slice(0, -1)
          .reverse()
          .map((r) => ({ ...r, s: 1 - r.t })),
      ];
      const nv = rows.length;
      const sl = (x, z) => slBase(x, z); // plain slope height, used by the gable plates and trims
      const body = new THREE.Color(tone.light);
      const shade = new THREE.Color(tone.dark);
      const edge = new THREE.Color(roofEdge);
      const verts = [];
      const colors = [];
      const out = new THREE.Color();
      for (const under of [false, true])
        for (let i = 0; i < nu; i++) {
          const u = (i / (nu - 1)) * 2 - 1;
          const x = u * hx;
          rows.forEach((row) => {
            const z = row.s * eaveAt(u);
            const y = slBase(x, z) + row.off - (under ? THICK : 0);
            verts.push(x, y, z);
            if (under) out.copy(shade);
            else {
              out.copy(shade).lerp(body, 0.55 + 0.45 * smoothstep(0, 0.6, row.t));
              if (row.line) out.lerp(edge, 0.85);
              if (row.t === 0 || i === 0 || i === nu - 1) out.copy(edge);
            }
            colors.push(out.r, out.g, out.b);
          });
        }
      const idx = [];
      const N = nu * nv;
      const q = (a, b, c, d, flip) => {
        if (flip) idx.push(a, c, b, b, c, d);
        else idx.push(a, b, c, b, d, c);
      };
      for (let i = 0; i < nu - 1; i++)
        for (let j = 0; j < nv - 1; j++) {
          const a = i * nv + j;
          q(a, a + nv, a + 1, a + nv + 1, true); // top (faces up)
          q(N + a, N + a + nv, N + a + 1, N + a + nv + 1, false); // under (faces down)
        }
      // rim strips joining top and under along the boundary
      const edgeStrip = (a, b) => {
        idx.push(a, b, N + a, b, N + b, N + a);
      };
      for (let j = 0; j < nv - 1; j++) {
        edgeStrip(j + 1, j); // x = -hx side
        edgeStrip((nu - 1) * nv + j, (nu - 1) * nv + j + 1);
      }
      for (let i = 0; i < nu - 1; i++) {
        edgeStrip(i * nv, (i + 1) * nv);
        edgeStrip((i + 1) * nv + nv - 1, i * nv + nv - 1);
      }
      // Rim strips: make sure every triangle faces away from the roof's centre.
      const first = 12 * (nu - 1) * (nv - 1);
      const cy = yT + 0.7;
      for (let t = first; t < idx.length; t += 3) {
        const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]].map((i) => [
          verts[i * 3],
          verts[i * 3 + 1],
          verts[i * 3 + 2],
        ]);
        const n = [
          (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]),
          (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]),
          (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]),
        ];
        const m = [
          (a[0] + b[0] + c[0]) / 3,
          (a[1] + b[1] + c[1]) / 3 - cy,
          (a[2] + b[2] + c[2]) / 3,
        ];
        if (n[0] * m[0] + n[1] * m[1] * 0.2 + n[2] * m[2] < 0)
          [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
      g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      T.smoothNormals(g, 58);
      place(g, { z: zc, ry: -PI / 2 });
      put("roof", g, "roof_tile");

      // gable infill (plaster) closing the slab at both ends, oculus in the front one
      for (const side of [-1, 1]) {
        const xg = side * (cfg.half[1] * 0.93);
        const shape = new THREE.Shape();
        const zr = cfg.half[0] * 0.93;
        shape.moveTo(-zr, 0);
        shape.lineTo(zr, 0);
        const steps = 10;
        for (let i = 0; i <= steps; i++) {
          const z = zr - (2 * zr * i) / steps;
          shape.lineTo(z, sl(xg, z) - THICK + 0.035 - yT);
        }
        const plate = new THREE.ShapeGeometry(shape, 4);
        // shape plane is (z, y); rotate so it faces +/- Z
        plate.rotateY(side > 0 ? 0 : PI);
        place(plate, { x: 0, y: yT - 0.01, z: zc + xg });
        T.bake.fill(plate, locked ? C.white : wallColor);
        if (locked)
          T.bake.gradient(plate, {
            bottom: "#8FA0A9",
            top: C.stoneCoolLight,
            from: yT,
            to: yT + 1.4,
          });
        else T.bake.gradient(plate, { bottom: "#E8DCCA", top: C.white, from: yT, to: yT + 1.4 });
        put("gable", plate, wallMat);
      }
      if (cfg.ocularGable) {
        const w = 0.3;
        const xg = cfg.half[1] * 0.93 + 0.012;
        const y = yT + 0.3;
        const glass = K.disc(w / 2 - 0.005, 14);
        place(glass, { x: 0, y, z: zc + xg });
        put(
          litOculus ? "glow" : "glass",
          glass,
          litOculus ? "window_glow" : "window_unlit",
          C.paneSlate,
        );
        const ring = T.lathe(
          [
            [w / 2 - 0.012, -0.008],
            [w / 2 + 0.012, -0.012],
            [w / 2 + 0.03, 0],
            [w / 2 + 0.012, 0.014],
            [w / 2 - 0.012, 0.01],
          ],
          { segments: 20, divisions: 1 },
        );
        ring.rotateX(PI / 2);
        place(ring, { x: 0, y, z: zc + xg + 0.01 });
        put("oculus_ring", ring, "gilt");
        if (locked) {
          const cover = K.disc(w / 2 + 0.004, 14);
          place(cover, { x: 0, y, z: zc + xg + 0.03 });
          put("shutter", cover, "shutter", C.slateLight);
        }
      }

      // ridge cap along the top (gilt when done) and, when done, a thin gilt trim on both eaves
      {
        const pts = [];
        for (let k = 0; k <= 12; k++) {
          const u = (k / 12) * 2 - 1;
          const x = u * hx;
          pts.push(W(x, sl(x, 0) + 0.03, 0));
        }
        put(
          "ridge_cap",
          K.tube(pts, 0.034, { tubular: 16, radial: 5, caps: "round" }),
          done ? "gilt" : "timber",
          done ? undefined : timberColor,
        );
        if (done)
          for (const side of [-1, 1]) {
            const trim = [];
            for (let k = 0; k <= 12; k++) {
              const u = (k / 12) * 2 - 1;
              const x = u * hx * 0.98;
              const z = side * eaveAt(u);
              trim.push(W(x, sl(x, z) + LIPV + 0.005, z * 0.98));
            }
            put(
              `eave_trim${side}`,
              K.tube(trim, 0.022, { tubular: 16, radial: 4, caps: "round" }),
              "gilt",
            );
          }
      }
      // crossed ridge beams, front gable only (a named asymmetry)
      for (const side of [1]) {
        const xe = side * (hx - 0.06);
        const yr = sl(xe, 0) + 0.02;
        [-1, 1].forEach((dir, i) => {
          const a = W(xe, yr - 0.04, -dir * 0.17);
          const m = W(xe, yr + 0.16, 0);
          const b = W(xe, yr + 0.36, dir * 0.17);
          put(
            `beam${side}_${i}`,
            K.tube([a, m, b], 0.034, { tubular: 6, radial: 5, caps: "round" }),
            "timber",
            timberColor,
          );
        });
      }
      const surface = (x, z) => sl(z, x) + LIPV * 0.5; // world frame: x across the roof, z (from the plan centre) along the ridge
      result.apex = [0, sl(0, 0), 0];
      result.surface = surface;
      result.hx = hx;
      result.ridgeEndY = sl(hx - 0.02, 0);
      result.noScallop = true;
    } else if (v === 4) {
      // tall slim spire over a small ring balcony
      const yB = yT; // balcony floor level
      const rimB = 0.98;
      const railR = 0.9;
      const floorProfile = [
        [0, yB - 0.1],
        [0.6, yB - 0.1],
        [0.85, yB - 0.085],
        [rimB, yB - 0.075, 1],
        [rimB, yB + 0.0, 1],
        [0.92, yB + 0.012],
        [0.5, yB + 0.012],
        [0, yB + 0.012],
      ];
      scallopParams = { folds, depth: 0.04, lift: 0.02, r0: 0.8, r1: rimB };
      const fl = T.lathe(floorProfile, { segments: segs(), divisions: 1 });
      K.scallop(fl, scallopParams);
      toPlan(fl);
      T.bake.fill(fl, C.white);
      T.bake.gradient(fl, { bottom: C.timberDark, top: C.timber, from: yB - 0.1, to: yB + 0.02 });
      T.bake.direction(fl, {
        color: C.timberDark,
        direction: [0, -1, 0],
        threshold: 0.4,
        strength: 0.9,
      });
      put("balcony_floor", fl, "timber");
      // railing: posts + a rail ring
      const railY = yB + 0.44;
      const posts = 16;
      for (let k = 0; k < posts; k++) {
        const t = (k + 0.5) * (TAU / posts);
        const x = Math.sin(t) * railR;
        const z = zc + Math.cos(t) * railR;
        put(
          `post${k}`,
          K.tube(
            [
              [x, yB + 0.01, z],
              [x, railY, z],
            ],
            0.017,
            { tubular: 1, radial: 4, caps: false },
          ),
          "timber",
          timberColor,
        );
      }
      const railPts = [];
      for (let k = 0; k <= 32; k++) {
        const t = (k / 32) * TAU;
        railPts.push([Math.sin(t) * railR, railY, zc + Math.cos(t) * railR]);
      }
      const railCurve = new THREE.CatmullRomCurve3(
        railPts.map((p) => new THREE.Vector3(...p)),
        true,
      );
      put(
        "rail",
        T.sweep(railCurve, { radius: 0.026, tubular: 40, radial: 5 }),
        "timber",
        timberColor,
      );
      // turret
      const yU = yB + 0.55;
      const turret = T.lathe(
        [
          [0.0, yB],
          [0.5, yB],
          [0.53, yB + 0.25],
          [0.5, yU - 0.08],
          [0.46, yU],
          [0.0, yU],
        ],
        { segments: segs(), divisions: 2 },
      );
      toPlan(turret);
      T.bake.fill(turret, locked ? C.white : wallColor);
      if (locked)
        T.bake.gradient(turret, { bottom: "#8FA0A9", top: C.stoneCoolLight, from: yB, to: yU });
      else T.bake.gradient(turret, { bottom: "#DDD2C0", top: C.white, from: yB, to: yU });
      put("turret", turret, wallMat);
      // turret windows: three arched windows on the front faces
      [-1, 0, 1].forEach((face) => {
        const theta = face * (TAU / folds);
        const r = 0.535;
        const lit = litArches;
        const glass = new THREE.ShapeGeometry(K.archShape(0.15, 0.3, 6), 5);
        const px = Math.sin(theta) * r;
        const pz = zc + Math.cos(theta) * r;
        place(glass, {
          x: px + Math.sin(theta) * 0.012,
          y: yB + 0.12,
          z: pz + Math.cos(theta) * 0.012,
          ry: theta,
        });
        put(lit ? "tglow" : "tglass", glass, lit ? "window_glow" : "window_unlit", C.paneSlate);
        const fr = K.archFrame(0.15, 0.3, 0.026, 6);
        place(fr, {
          x: px + Math.sin(theta) * 0.016,
          y: yB + 0.12,
          z: pz + Math.cos(theta) * 0.016,
          ry: theta,
        });
        put("tframe", fr, "timber", timberColor);
        if (locked) {
          for (const side of [-1, 1]) {
            const half = new THREE.Shape();
            const rr = 0.075 + 0.012;
            half.moveTo(side * 0.008, 0);
            half.lineTo(side * rr, 0);
            half.lineTo(side * rr, 0.225);
            for (let k = 1; k <= 4; k++) {
              const a = (k / 4) * (PI / 2);
              half.lineTo(side * rr * Math.cos(a), 0.225 + rr * Math.sin(a));
            }
            const g = new THREE.ShapeGeometry(half, 3);
            place(g, {
              x: px + Math.sin(theta) * 0.024,
              y: yB + 0.12,
              z: pz + Math.cos(theta) * 0.024,
              ry: theta,
            });
            put("tshutter", g, "shutter", C.slateLight);
          }
        }
      });
      // balcony lantern hung on the rail (front-right), lit when the house is lived in
      {
        const theta = 0.5;
        const x = Math.sin(theta) * (railR + 0.05);
        const z = zc + Math.cos(theta) * (railR + 0.05);
        const lit = progress || done;
        const yHook = railY + 0.1;
        put(
          "balcony_hook",
          K.tube(
            [
              [Math.sin(theta) * railR, railY, zc + Math.cos(theta) * railR],
              [Math.sin(theta) * railR, yHook, zc + Math.cos(theta) * railR],
              [x, yHook, z],
            ],
            0.009,
            { tubular: 6, radial: 4, caps: "round" },
          ),
          "iron",
          C.slateDark,
        );
        paperLantern(x, yHook, z, lit, "balcony_lantern");
      }
      // the slim spire: base radius 60 % of the swoop cone's, terracotta tiles
      const rim = 0.73;
      const apexY = yU + 1.9;
      const t = tileRoof({
        under: [
          [0, yU - 0.01],
          [0.3, yU - 0.015],
          [0.5, yU - 0.03],
          [0.62, yU - 0.01],
          [0.69, yU + 0.02],
        ],
        tip: { r: rim, top: yU + 0.13, under: yU + 0.07 },
        flare: [
          [0.69, yU + 0.1],
          [0.65, yU + 0.085],
        ],
        base: [
          [0.62, yU + 0.07],
          [0.52, yU + 0.17],
          [0.4, yU + 0.38],
          [0.28, yU + 0.7],
          [0.17, yU + 1.1],
          [0.08, yU + 1.5],
          [0, apexY],
        ],
        courses: [0.62, 0.5, 0.38, 0.26, 0.14, 0],
        lip: 0.02,
        yLow: yU,
        yHigh: apexY,
      });
      finishRoof(t, "roof", { folds, depth: 0.035, lift: 0.04, r0: 0.64, r1: rim });
      if (done) {
        eaveRing(rim, yU + 0.13, zc, 0.02);
        meridians(t, 0.6, 0.1);
      }
      result.apex = [0, apexY, 0];
      result.prof = t.prof;
      result.surface = (r) => t.prof.yAt(Math.min(r, 0.62)) + 0.015;
      result.balcony = { y: yB + 0.012, r: railR };
      result.eave = { r: rim, y: yU + 0.13, depth: 0.035, tuftR: rim * 0.965 - 0.08 };
    } else {
      // garden dome with a terrace in front, low stone parapet
      const yF = yT + 0.07; // terrace floor
      const slab = T.lathe(
        [
          [0, yT - 0.02],
          [0.95, yT - 0.02],
          [1.06, yT - 0.01],
          [1.1, yT + 0.04, 1],
          [1.08, yF],
          [0.9, yF],
          [0, yF],
        ],
        { segments: segs(2), divisions: 1 },
      );
      squareWarp(slab);
      toPlan(slab);
      T.bake.fill(slab, C.white);
      T.bake.gradient(slab, { bottom: plinthDark, top: plinthLight, from: yT - 0.02, to: yF });
      put("slab", slab, "stone_step");
      const parapet = T.lathe(
        [
          [1.03, yF],
          [1.065, yF + 0.07],
          [1.05, yF + 0.17],
          [1.02, yF + 0.205, 1],
          [0.99, yF + 0.17],
          [0.985, yF + 0.07],
          [0.99, yF],
        ],
        { segments: segs(2), divisions: 1 },
      );
      squareWarp(parapet);
      toPlan(parapet);
      T.bake.fill(parapet, C.white);
      T.bake.gradient(parapet, { bottom: plinthDark, top: plinthLight, from: yF, to: yF + 0.21 });
      T.bake.direction(parapet, {
        color: C.foliageDeep,
        direction: [0, 1, 0],
        threshold: 0.8,
        softness: 0.1,
        strength: 0.35,
      });
      put("parapet", parapet, "stone_step");
      // dome on the back half, tile courses as stepped rows
      const dz = -0.3;
      const rimD = 0.8;
      const t = tileRoof({
        under: [
          [0, yF],
          [0.4, yF],
          [0.7, yF - 0.012],
          [0.78, yF - 0.03],
        ],
        tip: { r: rimD, top: yF + 0.0, under: yF - 0.035 },
        flare: [],
        base: [
          [0.77, yF + 0.14],
          [0.67, yF + 0.42],
          [0.48, yF + 0.71],
          [0.26, yF + 0.94],
          [0.1, yF + 1.09],
          [0, yF + 1.15],
        ],
        courses: [0.77, 0.62, 0.46, 0.3, 0.14, 0],
        lip: 0.024,
        yLow: yF,
        yHigh: yF + 1.15,
      });
      finishRoof(t, "roof", { folds, depth: 0.03, lift: 0.03, r0: 0.7, r1: rimD }, zc + dz);
      if (done) {
        eaveRing(rimD, yF, zc + dz, 0.02);
        meridians(t, 0.74, 0.14, 4, zc + dz);
      }
      result.apex = [0, yF + 1.15, dz];
      result.prof = t.prof;
      result.terrace = { y: yF, dz };
    }
    return result;
  }

  // ---- finial, chimney, lantern, dressing --------------------------------------------------
  const apex = roof.apex;
  const finialTop = finial(apex[0], apex[1] - 0.012, zc + apex[2], { flagToward: -1 });
  if (roof.bead) {
    const bead = K.blob(0.05, 0.05, 0.05, 8);
    place(bead, { x: apex[0], y: finialTop + 0.035, z: zc + apex[2] });
    put("bead", bead, "gilt");
  }
  doorLantern();

  // chimney: on the roof surface, off axis; capped, leaning 4 degrees, its own girth
  let chimneyTop = 0;
  {
    const c = cfg.chimney;
    const lean = [0.07, -0.07, 0.07, -0.07, 0.07, -0.07][v];
    const girth = [1, 0.9, 1.1, 1.2, 0.85, 1][v];
    const o = { tilt: lean, girth };
    if (v === 3) {
      const y0 = roof.surface(c.x, c.z) - 0.1;
      chimneyTop = chimney(c.x, y0, zc + c.z, 0.78, o);
    } else if (v === 5) {
      const y0 = yT + 0.05;
      chimneyTop = chimney(c.x, y0, zc + c.z, 0.62, o);
    } else if (v === 4) {
      // on the balcony floor, leaning against the turret
      const x = Math.sin(c.theta) * c.r;
      const z = zc + Math.cos(c.theta) * c.r;
      chimneyTop = chimney(x, roof.balcony.y, z, 0.8, o);
    } else {
      const x = Math.sin(c.theta) * c.r;
      const z = zc + Math.cos(c.theta) * c.r;
      const ySurface = v === 2 ? yT + 0.25 : roof.surface(c.r);
      chimneyTop = chimney(x, ySurface - 0.12, z, 0.7, o);
    }
  }

  // vines, loom, growth (in progress) / dry ivy (locked)
  const vineLeaf = (name, x, y, z, ry, tilt, size, hex, mat = "vine_leaf") => {
    const g = K.leaf(size, size * 0.42);
    place(g, { x, y, z, ry, rx: tilt });
    put(name, g, mat, hex);
  };
  if (progress || locked) {
    const dry = locked;
    const ribThetas = cfg.square
      ? [1.0, -1.0]
      : [(0.5 + (cfg.folds > 6 ? 1 : 0)) * (TAU / folds), -1.5 * (TAU / folds)];
    ribThetas.forEach((theta, k) => {
      const turns = 1.1 + k * 0.4;
      const reach = dry ? 0.5 : 0.82;
      const pts = [];
      const n = 9;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const y = P + 0.12 + t * (H * reach);
        const f = wallFrame(theta + Math.sin(t * PI * turns) * 0.07, y, 0.064);
        pts.push([f.x, y, f.z]);
      }
      put(
        dry ? `ivy${k}` : `vine${k}`,
        K.tube(pts, 0.014, { tubular: 18, radial: 4, caps: "round" }),
        dry ? "vine_dry" : "vine",
        dry ? C.timberDark : C.foliageDeep,
      );
      // leaves along the stem
      for (let i = 1; i < n; i++) {
        const side = i % 2 ? 1 : -1;
        const p = pts[i];
        const f = wallFrame(theta, p[1], 0.07);
        const ry = f.ry + side * 0.9;
        vineLeaf(
          dry ? "dry_leaf" : "leaf",
          p[0] + Math.cos(ry) * 0.02,
          p[1],
          p[2] - Math.sin(ry) * 0.02,
          ry,
          -0.5 * side,
          dry ? 0.07 : 0.085,
          dry ? (i % 2 ? C.sandDark : C.timber) : i % 3 ? C.foliageMid : C.foliageLight,
          dry ? "vine_dry" : "vine_leaf",
        );
      }
      if (!dry) {
        // bud at the tip
        const tip = pts[n];
        const bud = K.blob(0.032, 0.036, 0.032, 6);
        place(bud, { x: tip[0], y: tip[1] + 0.03, z: tip[2] });
        put("bud", bud, "vine_bloom");
      }
    });
  }

  // loom (in progress): a wooden A-frame, 0.6 m wide and 0.5 m tall, on the front eave; three
  // glowing threads run from its crossbar to a peg on the wall behind it, a basket of yarn beside it
  if (progress) {
    const c = cfg.loom;
    let lx, ly, lz, lry, pegDz, pegDy;
    const radial = (theta, r) => {
      lx = Math.sin(theta) * r;
      lz = zc + Math.cos(theta) * r;
      lry = theta;
    };
    if (v === 3) {
      lx = c.x;
      lz = zc + c.z;
      ly = roof.surface(c.x, c.z);
      lry = 0;
      pegDz = -0.42;
      pegDy = roof.surface(c.x, c.z - 0.42) - ly + 0.04;
    } else if (v === 5) {
      lx = c.x;
      lz = zc + c.z;
      ly = roof.terrace.y;
      lry = -0.58; // faces away from the dome, towards the path
      pegDz = -0.3;
      pegDy = 0.2;
    } else if (v === 4) {
      radial(c.theta, c.r);
      ly = roof.balcony.y;
      pegDz = -(c.r - 0.54);
      pegDy = 0.2;
    } else if (v === 2) {
      radial(c.theta, 1.0);
      ly = yT + 0.04;
      pegDz = -0.05;
      pegDy = 0.26;
    } else if (v === 1) {
      radial(c.theta, c.r);
      ly = roof.skirtY(c.r);
      pegDz = -(c.r - roof.drum.r);
      pegDy = roof.drum.y - ly;
    } else {
      radial(c.theta, c.r);
      ly = roof.skirtY(c.r);
      pegDz = -(c.r - 0.62);
      pegDy = roof.surface(0.62) - ly + 0.05;
    }
    const at = (g) => place(g, { x: lx, y: ly, z: lz, ry: lry });
    const leg = (side) =>
      K.tube(
        [
          [side * 0.3, -0.02, 0],
          [side * 0.15, 0.24, 0],
          [0, 0.5, 0],
        ],
        0.028,
        { tubular: 6, radial: 5, caps: "round" },
      );
    [-1, 1].forEach((side, i) => {
      put(`loom_leg${i}`, at(leg(side)), "timber", timberColor);
    });
    put(
      "loom_bar",
      at(
        K.tube(
          [
            [-0.17, 0.22, 0],
            [0.17, 0.22, 0],
          ],
          0.024,
          { tubular: 2, radial: 5, caps: "round" },
        ),
      ),
      "timber",
      timberColor,
    );
    put(
      "loom_peg",
      at(
        K.tube(
          [
            [0, pegDy, pegDz],
            [0, pegDy, pegDz + 0.07],
          ],
          0.016,
          { tubular: 1, radial: 5, caps: "round" },
        ),
      ),
      "timber",
      timberColor,
    );
    [-0.1, 0, 0.1].forEach((dx, i) => {
      const g = K.tube(
        [
          [dx, 0.22, 0.02],
          [dx * 0.5, 0.22 + (pegDy - 0.22) * 0.5 + 0.02, pegDz * 0.5],
          [0, pegDy, pegDz + 0.035],
        ],
        0.0085,
        { tubular: 8, radial: 4, caps: "round" },
      );
      put(`thread${i}`, at(g), "window_glow");
    });
    // basket of yarn beside the frame
    const basket = T.lathe(
      [
        [0.0, 0.0],
        [0.07, 0.0],
        [0.1, 0.04],
        [0.105, 0.085],
        [0.09, 0.09],
        [0.0, 0.07],
      ],
      { segments: 9, divisions: 1 },
    );
    basket.translate(0.46, 0, 0.05);
    put("yarn_basket", at(basket), "timber", C.timberDark);
    [
      [0.43, 0.095, 0.04, C.blossom],
      [0.5, 0.1, 0.07, C.ginkgo],
      [0.47, 0.115, 0.1, C.tealLight],
    ].forEach(([x, y, z, hex], i) => {
      const b = K.blob(0.04, 0.036, 0.04, 6);
      b.translate(x, y, z);
      put(`yarn${i}`, at(b), "timber", hex);
    });
  }

  // locked: a few dry leaves on the steps (unswept)
  if (locked) {
    const frontZ = zc + plinthZ;
    [
      [-0.35, 0.33, 0.077, 0.7],
      [0.42, 0.2, 0.151, 2.2],
      [0.12, 0.08, 0.204, 4.0],
      [-0.5, 0.2, 0.151, 5.1],
    ].forEach(([x, dz, y, ry], i) => {
      const g = K.leaf(0.09, 0.04);
      g.rotateX(-PI / 2);
      place(g, { x, y, z: frontZ + dz, ry });
      put("dry_leaf", g, "vine_dry", i % 2 ? C.sandDark : C.timber);
    });
  }

  // clump helper: a smooth mass of foliage (polygonised once per variant of look)
  const clump = async (key, lobes) => {
    const cacheKey = `${key}`;
    if (!clumpCache.has(cacheKey)) {
      const { sdf } = T;
      const nodes = lobes.map(([x, y, z, rx, ry, rz]) => sdf.ellipsoid([x, y, z], [rx, ry, rz]));
      const field = sdf.subtract(sdf.smin(0.06, ...nodes), sdf.halfspace([0, 1, 0], -0.02), 0);
      const geo = await T.polygonise(field, { size: 22, maxTriangles: 90 });
      clumpCache.set(cacheKey, geo);
    }
    return clumpCache.get(cacheKey).clone();
  };
  const bushLobes = [
    [0, 0.09, 0, 0.16, 0.1, 0.15],
    [0.1, 0.07, 0.05, 0.1, 0.08, 0.1],
    [-0.1, 0.075, -0.03, 0.11, 0.08, 0.1],
    [0.0, 0.14, -0.03, 0.09, 0.07, 0.09],
  ];
  const makeBush = async (name, x, y, z, s, ry, lightHex, darkHex, matName = "garden_leaf") => {
    const g = await clump("bush", bushLobes);
    place(g, { x, y, z, s, ry });
    T.bake.fill(g, C.white);
    T.bake.gradient(g, { bottom: darkHex, top: lightHex, from: y, to: y + 0.22 * s, curve: 0.9 });
    put(name, g, matName);
    return g;
  };
  const makeBlooms = (name, x, y, z, s, count, hexes) => {
    for (let i = 0; i < count; i++) {
      const a = i * 2.4 + 0.5;
      const rr = 0.12 * s * (0.4 + 0.6 * ((i * 0.37) % 1));
      const b = K.blob(0.03 * s, 0.028 * s, 0.03 * s, 6);
      place(b, {
        x: x + Math.sin(a) * rr,
        y: y + 0.14 * s + (i % 3) * 0.025 * s,
        z: z + Math.cos(a) * rr,
      });
      put(`${name}${i}`, b, "garden_bloom", hexes[i % hexes.length]);
    }
  };

  // available: a potted plant by the door
  if (available) {
    const px = -cfg.lanternSide * 0.68;
    const pz = wallFrame(0, P, 0).z + 0.2;
    const pot = T.lathe(
      [
        [0.07, 0],
        [0.115, 0.07],
        [0.125, 0.13],
        [0.14, 0.18, 1],
        [0.115, 0.17],
        [0.0, 0.165],
      ],
      { segments: 10, divisions: 1 },
    );
    place(pot, { x: px, y: P, z: pz });
    T.bake.fill(pot, C.white);
    T.bake.gradient(pot, { bottom: C.terraDark, top: C.terraLight, from: P, to: P + 0.18 });
    put("pot", pot, "timber");
    await makeBush("potted_leaf", px, P + 0.17, pz, 0.85, 0.5, C.foliageLight, C.foliageMid);
  }

  // done: roof garden in bloom, floating motes
  if (done) {
    const spots = [];
    if (roof.eave) {
      // v0, v1, v2, v4: two low blossom tufts tucked into eave corners and one trailing vine with
      // pink buds, none rising above the thickness of the eave
      const e = roof.eave;
      const step = TAU / folds;
      const corner = (n) => (n + 0.5) * step; // eave corners sit between the lobes
      let k = 0;
      for (const [n, sc] of [
        [-2, 1],
        [0, 0.8],
      ]) {
        const theta = corner(n);
        const x = Math.sin(theta) * e.tuftR;
        const z = zc + Math.cos(theta) * e.tuftR;
        const y = e.y - 0.03;
        const g = await clump("bush", bushLobes);
        place(g, { x, y, z, sx: 0.85 * sc, sy: 0.5 * sc, sz: 0.85 * sc, ry: n });
        T.bake.fill(g, C.white);
        T.bake.gradient(g, { bottom: C.foliageDeep, top: C.foliageMid, from: y, to: y + 0.07 });
        put(`tuft${k}`, g, "garden_leaf");
        [0, 1, 2, 3, 4].forEach((i) => {
          const a = i * 1.7 + n;
          const b = K.blob(0.046 * sc, 0.036 * sc, 0.046 * sc, 6);
          place(b, {
            x: x + Math.sin(a) * 0.1 * sc,
            y: y + 0.09,
            z: z + Math.cos(a) * 0.1 * sc,
          });
          put(`tuft_bloom${k}_${i}`, b, "garden_bloom", C.blossom);
        });
        k++;
      }
      // one trailing vine hanging from the eave, pink buds along it
      {
        const theta = corner(1);
        const pts = [];
        const rr = e.r * (1 - e.depth) - 0.04;
        for (let i = 0; i <= 7; i++) {
          const t = i / 7;
          const a = theta + Math.sin(t * 3.1) * 0.035;
          const r = rr + t * 0.015;
          pts.push([Math.sin(a) * r, e.y - 0.04 - t * 0.4, zc + Math.cos(a) * r]);
        }
        put(
          "hanging_vine",
          K.tube(pts, 0.013, { tubular: 14, radial: 4, caps: "round" }),
          "vine",
          C.foliageMid,
        );
        [2, 4, 6].forEach((i, j) => {
          const [px, py, pz] = pts[i];
          const b = K.blob(0.034, 0.038, 0.034, 6);
          place(b, { x: px + (j % 2 ? 0.03 : -0.03), y: py - 0.01, z: pz });
          put(`vine_bud${j}`, b, "garden_bloom", C.blossom);
          const leaf = K.leaf(0.08, 0.034);
          place(leaf, { x: px, y: py - 0.02, z: pz, ry: theta + j * 2.1, rx: -0.6 });
          put(`vine_leaf${j}`, leaf, "garden_leaf", C.foliageMid);
        });
        const tip = pts[7];
        const bud = K.blob(0.03, 0.032, 0.03, 6);
        place(bud, { x: tip[0], y: tip[1] - 0.02, z: tip[2] });
        put("vine_bud_tip", bud, "garden_bloom", C.blossom);
      }
    } else if (v === 3) {
      for (const g of cfg.garden) {
        spots.push([0, roof.surface(0, g.x) + 0.0, zc + g.x, g.s]);
      }
    } else if (v === 5) {
      // the terrace: three beds in front of the dome, on the left of the door axis
      [
        [-0.55, 0.72, 1.0],
        [0.15, 0.8, 0.9],
        [0.68, 0.7, 0.8],
      ].forEach(([x, z, s]) => spots.push([x, roof.terrace.y, zc + z, s]));
    }
    let i = 0;
    for (const [x, y, z, s] of spots) {
      const big = v === 4 ? 1.5 : 1.9; // a few large clumps that show above the eave from the path
      await makeBush(`garden${i}`, x, y, z, s * big, i * 1.7, C.foliageLight, C.foliageDeep);
      makeBlooms(
        `bloom${i}`,
        x,
        y,
        z,
        s * big,
        6,
        i % 2 ? [C.blossom, C.warmWhite, C.gold] : [C.blossom, C.gold, C.blossom],
      );
      i++;
    }
    // four motes, drifting up the finial
    [
      [0.34, 0.12, 0.9],
      [-0.28, 0.32, 2.5],
      [0.08, 0.5, 4.1],
      [-0.4, 0.66, 5.3],
    ].forEach(([r, dy, a], k) => {
      const mote = K.blob(0.032, 0.032, 0.032, 6);
      place(mote, {
        x: apex[0] + Math.sin(a) * r,
        y: Math.min(apex[1] + dy, 4.3),
        z: zc + apex[2] + Math.cos(a) * r,
      });
      put(`mote${k}`, mote, "mote");
    });
  }

  // doormat and swept step
  if (!locked) {
    const mat = K.blob(0.26, 0.012, 0.13, 8);
    place(mat, { x: 0, y: P + 0.004, z: wallFrame(0, P, 0).z + 0.2, ry: 0.05 });
    put("doormat", mat, "timber", tone.dark);
  }

  // ---- assemble ---------------------------------------------------------------------------
  const root = T.group(`athena-house-${status}-v${v}`, ...parts);
  void chimneyTop;
  void finialTop;
  return { root: T.ground(root) };
}

/** 24 registry entries. `group: "houses"` and `source` let `--only=houses` select them. */
export const entries = [];
for (let v = 0; v < 6; v++)
  for (const status of STATUSES)
    entries.push({
      id: `house-${status}-v${v}`,
      family: "buildings",
      group: "houses",
      source: "houses",
      file: `athena-house-${status}-v${v}.glb`,
      build: (THREE, tools) => buildHouse(THREE, tools, v, status),
    });
