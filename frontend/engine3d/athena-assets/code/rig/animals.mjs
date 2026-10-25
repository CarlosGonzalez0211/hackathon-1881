/**
 * The animals and the visitor: Lumen the cat, the sage owl, Pip the hare and Orbi. Rounded
 * SDF bodies with a few swept details; node names follow RIG_CONTRACT.animals. Units are
 * metres (the Figure here uses `hh = 1`).
 */
import { Figure, ellipsoid, revolve, ring, roundBox, tube, taperCapsule, paint } from "./forms.mjs";
import { STYLE } from "./skeleton.mjs";
import { blinkClip, catClips, hareClips, owlClips, visitorClips } from "./clips.mjs";

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1)));
  return t * t * (3 - 2 * t);
};

function makeRig(THREE, names, tree) {
  const nodes = {};
  const make = (name, [x, y, z] = [0, 0, 0]) => {
    const g = new THREE.Group();
    g.name = name;
    g.position.set(x, y, z);
    nodes[name] = g;
    return g;
  };
  const root = new THREE.Group();
  root.name = "character";
  for (const [name, parent, at] of tree) {
    const node = make(name, at);
    (parent ? nodes[parent] : root).add(node);
  }
  void names;
  return { root, nodes, plan: { hh: 1 } };
}

const glowMaterial = (T, name, hex, intensity = 1.2) =>
  T.material(name, hex, { emissive: hex, emissiveIntensity: intensity, roughness: 0.5 });

/** Place a mesh by `at` inside a node (metres). */
function put(F, node, name, geometry, spec, at = [0, 0, 0]) {
  const g = geometry.clone();
  g.translate(...at);
  return F.add(node, name, g, { part: "base", ...spec, keep: true });
}

const gradientFn = (THREE, dark, light, from, to, axis = "y") => {
  const a = new THREE.Color(dark);
  const b = new THREE.Color(light);
  const out = new THREE.Color();
  return (p) => out.copy(a).lerp(b, smooth(from, to, p[axis]));
};

/** Two round eyes on the `face` node: ink disc, coloured iris ring, two highlights. */
function eyes(THREE, F, node, { at, spread, r, irisHex, slit = false, lookZ }) {
  for (const s of [-1, 1]) {
    const x = s * spread;
    put(
      F,
      node,
      `eye_${s}`,
      ellipsoid(THREE, [r, r * 1.08, r * 0.45], { w: 10, h: 7 }),
      { style: STYLE.eye, material: "eye", color: irisHex },
      [at[0] + x, at[1], lookZ],
    );
    put(
      F,
      node,
      `pupil_${s}`,
      ellipsoid(THREE, [slit ? r * 0.28 : r * 0.62, r * (slit ? 0.95 : 0.72), r * 0.3], {
        w: 8,
        h: 6,
      }),
      { style: STYLE.eye, material: "eye", color: "#232936" },
      [at[0] + x, at[1], lookZ + r * 0.32],
    );
    put(
      F,
      node,
      `glint_${s}`,
      ellipsoid(THREE, [r * 0.2, r * 0.2, r * 0.12], { w: 6, h: 4 }),
      { style: STYLE.eye, material: "eye", color: "#FBF3E4" },
      [at[0] + x - r * 0.2, at[1] + r * 0.35, lookZ + r * 0.5],
    );
  }
}

// ---------------------------------------------------------------------------- Lumen
export async function buildLumen(THREE, T) {
  const rig = makeRig(THREE, null, [
    ["body", null],
    ["head", "body", [0, 0.33, 0.07]],
    ["ear_l", "head", [-0.075, 0.145, -0.01]],
    ["ear_r", "head", [0.075, 0.145, -0.01]],
    ["face_expression", "head", [0, 0.085, 0.082]],
    ["tail", "body", [0, 0.07, -0.1]],
  ]);
  const F = new Figure(THREE, T, rig, { weave: false });
  const { sdf } = T;
  const fur = "#CFC4B8";
  const cream = "#F7F2EA";
  const stripe = "#8D8278";
  const pink = "#E7A6A0";

  const bodyField = sdf.smin(
    0.12,
    sdf.ellipsoid([0, 0.2, -0.02], [0.115, 0.18, 0.13]),
    sdf.ellipsoid([0, 0.1, -0.07], [0.15, 0.1, 0.16]),
    sdf.ellipsoid([0, 0.22, 0.07], [0.085, 0.14, 0.07]),
    taperCapsule([-0.055, 0.3, 0.08], [-0.055, 0.02, 0.11], 0.036, 0.03),
    taperCapsule([0.055, 0.3, 0.08], [0.055, 0.02, 0.11], 0.036, 0.03),
    sdf.ellipsoid([-0.055, 0.025, 0.14], [0.034, 0.024, 0.05]),
    sdf.ellipsoid([0.055, 0.025, 0.14], [0.034, 0.024, 0.05]),
  );
  const body = await T.polygonise(bodyField, { size: 44, maxTriangles: 640 });
  paint(THREE, body, (p, n) => {
    const c = new THREE.Color(fur);
    const chest = smooth(0.0, 0.1, p.z) * smooth(0.05, 0.14, p.y) * smooth(0.36, 0.2, p.y);
    c.lerp(new THREE.Color(cream), Math.min(1, chest + smooth(0.06, 0.0, p.y) * 0.5));
    const band = Math.abs(Math.sin((p.z + 0.02) * 46));
    const back = smooth(0.18, 0.5, n.y) * smooth(0.12, 0.2, p.y) * smooth(0.02, -0.02, p.z - 0.04);
    if (band > 0.72) c.lerp(new THREE.Color(stripe), 0.85 * back);
    c.multiplyScalar(0.86 + 0.16 * smooth(0.0, 0.36, p.y));
    return c;
  });
  F.add("body", "torso_fur", body, {
    part: "base",
    style: STYLE.fur,
    material: "fur",
    color: (p, n, i) => new THREE.Color().fromBufferAttribute(body.attributes.color, i),
    keep: true,
  });

  // head
  const headField = sdf.smin(
    0.07,
    sdf.ellipsoid([0, 0.08, 0], [0.108, 0.088, 0.095]),
    sdf.sphere([0, 0.04, 0.085], 0.05),
    sdf.sphere([-0.06, 0.04, 0.05], 0.058),
    sdf.sphere([0.06, 0.04, 0.05], 0.058),
    sdf.sphere([0, 0.0, -0.02], 0.1),
  );
  const head = await T.polygonise(headField, { size: 40, maxTriangles: 520 });
  paint(THREE, head, (p) => {
    const c = new THREE.Color(fur);
    c.lerp(new THREE.Color(cream), smooth(0.0, 0.1, p.z) * smooth(0.1, 0.0, p.y - 0.02));
    // forehead tabby marks
    if (p.y > 0.12 && Math.abs(Math.sin(p.x * 70)) > 0.8) c.lerp(new THREE.Color(stripe), 0.7);
    return c;
  });
  F.add("head", "skull_fur", head, {
    part: "base",
    style: STYLE.fur,
    material: "fur",
    color: (p, n, i) => new THREE.Color().fromBufferAttribute(head.attributes.color, i),
    keep: true,
  });
  put(
    F,
    "head",
    "nose",
    ellipsoid(THREE, [0.016, 0.011, 0.012], { w: 8, h: 5 }),
    { style: STYLE.fur, material: "fur", color: pink },
    [0, 0.062, 0.133],
  );
  for (const s of [-1, 1])
    for (const k of [-1, 0, 1])
      F.add(
        "head",
        `whisker_${s}_${k}`,
        tube(
          T,
          THREE,
          [
            [s * 0.03, 0.045 + k * 0.012, 0.125],
            [s * 0.1, 0.05 + k * 0.025, 0.115],
            [s * 0.17, 0.045 + k * 0.04, 0.09],
          ],
          0.0022,
          { tubular: 4, radial: 3 },
        ),
        { part: "base", style: STYLE.fur, material: "fur", color: "#F7F2EA" },
      );

  // ears: cones with pink inner
  for (const s of [-1, 1]) {
    const node = s < 0 ? "ear_l" : "ear_r";
    F.add(
      node,
      `ear_${s}`,
      revolve(
        T,
        [
          [0.0, 0.0],
          [0.04, 0.0, 1],
          [0.036, 0.04],
          [0.02, 0.085],
          [0, 0.105],
        ],
        { segments: 10, divisions: 2, rz: 0.55 },
      ),
      {
        part: "base",
        style: STYLE.fur,
        material: "fur",
        color: gradientFn(THREE, fur, "#E9DDD2", 0, 0.1),
      },
    );
    F.add(
      node,
      `ear_inner_${s}`,
      revolve(
        T,
        [
          [0.0, 0.004],
          [0.026, 0.004, 1],
          [0.022, 0.04],
          [0, 0.085],
        ],
        { segments: 8, divisions: 1, rz: 0.4 },
      ).translate(0, 0, 0.012),
      { part: "base", style: STYLE.fur, material: "fur", color: pink },
    );
  }

  // eyes under face_expression
  eyes(THREE, F, "face_expression", {
    at: [0, 0, 0],
    spread: 0.045,
    r: 0.03,
    irisHex: "#E9C26A",
    slit: true,
    lookZ: 0.0,
  });

  // tail: wrapped round the haunch to the front, tip curling up (a sitting cat keeps it close)
  const curve = [
    [0, 0, 0],
    [0.05, -0.03, -0.07],
    [0.12, -0.045, -0.03],
    [0.155, -0.04, 0.06],
    [0.135, -0.005, 0.14],
    [0.11, 0.06, 0.16],
  ];
  F.add(
    "tail",
    "tail_fur",
    tube(T, THREE, curve, (t) => 0.034 - 0.012 * t, { tubular: 14, radial: 7 }),
    {
      part: "base",
      style: STYLE.fur,
      material: "fur",
      color: (p) =>
        p.z > 0.12
          ? new THREE.Color(cream)
          : Math.abs(Math.sin(p.x * 55 + p.z * 55)) > 0.8
            ? new THREE.Color(stripe)
            : new THREE.Color(fur),
    },
  );

  // collar and the charm that glows
  F.add(
    "body",
    "collar",
    ring(THREE, 0.082, 0.014, { tubular: 18, radial: 5 }).translate(0, 0.34, 0.06).rotateX(-0.12),
    { part: "base", style: STYLE.cloth, material: "gear", color: "#2F7D7A" },
  );
  const charm = F.addGlow(
    "body",
    "charm",
    ellipsoid(THREE, [0.02, 0.022, 0.012], { w: 10, h: 7 }).translate(0, 0.292, 0.138),
    glowMaterial(T, "charm_glow", "#F2C26B", 1.4),
    { part: "base", style: STYLE.cloth, color: "#FFFFFF", keep: true },
  );
  void charm;
  F.add(
    "body",
    "charm_rim",
    ring(THREE, 0.024, 0.005, { tubular: 12, radial: 4 })
      .rotateX(Math.PI / 2)
      .translate(0, 0.292, 0.14),
    { part: "base", style: STYLE.cloth, material: "gold", color: "#F2C26B" },
  );

  return { root: rig.root, clips: catClips(THREE), extras: { athenaKeepHierarchy: true } };
}

// ---------------------------------------------------------------------------- owl
export async function buildOwl(THREE, T) {
  const rig = makeRig(THREE, null, [
    ["body", null],
    ["head", "body", [0, 0.4, 0.0]],
    ["wing_l", "body", [-0.14, 0.34, 0.0]],
    ["wing_r", "body", [0.14, 0.34, 0.0]],
  ]);
  const F = new Figure(THREE, T, rig, { weave: false });
  const { sdf } = T;
  const feather = "#A88C74";
  const belly = "#EBDDC8";
  const dark = "#6E5648";

  const bodyField = sdf.smin(
    0.1,
    sdf.ellipsoid([0, 0.22, 0], [0.145, 0.22, 0.14]),
    sdf.ellipsoid([0, 0.1, 0.02], [0.13, 0.1, 0.13]),
  );
  const body = await T.polygonise(bodyField, { size: 40, maxTriangles: 520 });
  paint(THREE, body, (p, n) => {
    const c = new THREE.Color(feather);
    const front = smooth(0.0, 0.1, p.z) * smooth(0.02, 0.14, p.y) * smooth(0.46, 0.34, p.y);
    c.lerp(new THREE.Color(belly), front);
    // chevrons on the belly
    const row = Math.floor((p.y - 0.04) / 0.06);
    const chev =
      Math.abs(((p.x / 0.045 + (row % 2) * 0.5) % 1) - 0.5) * 0.04 + ((p.y - 0.04) % 0.06);
    if (front > 0.5 && chev < 0.012) c.lerp(new THREE.Color(dark), 0.55);
    c.multiplyScalar(0.84 + 0.2 * smooth(0, 0.44, p.y) * Math.max(0.3, n.y + 0.7));
    return c;
  });
  F.add("body", "torso_feathers", body, {
    part: "base",
    style: STYLE.fur,
    material: "fur",
    color: (p, n, i) => new THREE.Color().fromBufferAttribute(body.attributes.color, i),
    keep: true,
  });

  const headField = sdf.smin(
    0.05,
    sdf.ellipsoid([0, 0.1, 0], [0.15, 0.115, 0.125]),
    sdf.sphere([-0.1, 0.19, -0.01], 0.04),
    sdf.sphere([0.1, 0.19, -0.01], 0.04),
  );
  const head = await T.polygonise(headField, { size: 40, maxTriangles: 480 });
  paint(THREE, head, (p) => {
    const c = new THREE.Color(feather);
    c.lerp(new THREE.Color(belly), smooth(0.04, 0.1, p.z) * smooth(0.04, 0.12, p.y));
    return c;
  });
  F.add("head", "skull_feathers", head, {
    part: "base",
    style: STYLE.fur,
    material: "fur",
    color: (p, n, i) => new THREE.Color().fromBufferAttribute(head.attributes.color, i),
    keep: true,
  });
  for (const s of [-1, 1]) {
    F.add(
      "head",
      `eye_disc_${s}`,
      ellipsoid(THREE, [0.056, 0.056, 0.014], { w: 12, h: 8 }).translate(s * 0.065, 0.105, 0.112),
      { part: "base", style: STYLE.cloth, material: "fur", color: belly },
    );
    F.add(
      "head",
      `iris_${s}`,
      ellipsoid(THREE, [0.034, 0.034, 0.01], { w: 10, h: 7 }).translate(s * 0.065, 0.105, 0.124),
      { part: "base", style: STYLE.eye, material: "eye", color: "#E9B64A" },
    );
    F.add(
      "head",
      `pupil_${s}`,
      ellipsoid(THREE, [0.019, 0.019, 0.009], { w: 8, h: 6 }).translate(s * 0.065, 0.105, 0.131),
      { part: "base", style: STYLE.eye, material: "eye", color: "#232936" },
    );
    F.add(
      "head",
      `glint_${s}`,
      ellipsoid(THREE, [0.007, 0.007, 0.005], { w: 6, h: 4 }).translate(
        s * 0.065 - 0.008,
        0.115,
        0.137,
      ),
      { part: "base", style: STYLE.eye, material: "eye", color: "#FBF3E4" },
    );
    F.add(
      "head",
      `tuft_${s}`,
      revolve(
        T,
        [
          [0, 0],
          [0.032, 0, 1],
          [0.024, 0.05],
          [0, 0.11],
        ],
        { segments: 8, divisions: 1 },
      )
        .rotateZ(-s * 0.35)
        .translate(s * 0.1, 0.2, -0.01),
      { part: "base", style: STYLE.fur, material: "fur", color: dark },
    );
    // spectacles
    F.add(
      "head",
      `spec_rim_${s}`,
      ring(THREE, 0.052, 0.006, { tubular: 16, radial: 4 })
        .rotateX(Math.PI / 2)
        .translate(s * 0.065, 0.105, 0.128),
      { part: "base", style: STYLE.cloth, material: "gold", color: "#C8A36A" },
    );
  }
  F.add(
    "head",
    "spec_bridge",
    tube(
      T,
      THREE,
      [
        [-0.016, 0.108, 0.13],
        [0, 0.116, 0.134],
        [0.016, 0.108, 0.13],
      ],
      0.005,
      { tubular: 4, radial: 3 },
    ),
    { part: "base", style: STYLE.cloth, material: "gold", color: "#C8A36A" },
  );
  F.add(
    "head",
    "beak",
    revolve(
      T,
      [
        [0, -0.01],
        [0.026, 0, 1],
        [0.02, 0.025],
        [0.008, 0.052],
        [0, 0.065],
      ],
      { segments: 8, divisions: 2 },
    )
      .rotateX(Math.PI / 2 + 0.25)
      .translate(0, 0.075, 0.135),
    { part: "base", style: STYLE.cloth, material: "gold", color: "#F2C36B" },
  );

  for (const s of [-1, 1]) {
    const node = s < 0 ? "wing_l" : "wing_r";
    F.add(
      node,
      `wing_${s}`,
      ellipsoid(THREE, [0.04, 0.17, 0.095], { w: 10, h: 8 })
        .translate(s * 0.02, -0.12, -0.01)
        .rotateZ(s * 0.08),
      {
        part: "base",
        style: STYLE.fur,
        material: "fur",
        color: gradientFn(THREE, dark, feather, -0.3, 0.05),
      },
    );
    for (const k of [-1, 0, 1])
      F.add(
        "body",
        `talon_${s}_${k}`,
        ellipsoid(THREE, [0.011, 0.01, 0.03], { w: 6, h: 4 }).translate(
          s * 0.05 + k * 0.016,
          0.01,
          0.11,
        ),
        { part: "base", style: STYLE.cloth, material: "gold", color: "#F2C36B" },
      );
  }
  return { root: rig.root, clips: owlClips(THREE), extras: { athenaKeepHierarchy: true } };
}

// ---------------------------------------------------------------------------- hare
export async function buildHare(THREE, T) {
  const rig = makeRig(THREE, null, [
    ["body", null],
    ["head", "body", [0, 0.34, 0.1]],
    ["ear_l", "head", [-0.045, 0.1, -0.02]],
    ["ear_r", "head", [0.045, 0.1, -0.02]],
    ["tail", "body", [0, 0.15, -0.2]],
  ]);
  const F = new Figure(THREE, T, rig, { weave: false });
  const { sdf } = T;
  const fur = "#C9A27E";
  const cream = "#F7F2EA";
  const pink = "#E7A6A0";

  const bodyField = sdf.smin(
    0.12,
    sdf.ellipsoid([0, 0.2, -0.04], [0.11, 0.17, 0.14]),
    sdf.ellipsoid([-0.09, 0.1, -0.1], [0.07, 0.1, 0.12]),
    sdf.ellipsoid([0.09, 0.1, -0.1], [0.07, 0.1, 0.12]),
    sdf.ellipsoid([0, 0.24, 0.07], [0.075, 0.12, 0.06]),
    sdf.ellipsoid([-0.09, 0.02, 0.08], [0.04, 0.025, 0.09]),
    sdf.ellipsoid([0.09, 0.02, 0.08], [0.04, 0.025, 0.09]),
    taperCapsule([-0.05, 0.3, 0.1], [-0.05, 0.03, 0.14], 0.032, 0.028),
    taperCapsule([0.05, 0.3, 0.1], [0.05, 0.03, 0.14], 0.032, 0.028),
  );
  const body = await T.polygonise(bodyField, { size: 44, maxTriangles: 620 });
  paint(THREE, body, (p, n) => {
    const c = new THREE.Color(fur);
    c.lerp(
      new THREE.Color(cream),
      smooth(0.02, 0.1, p.z) * smooth(0.04, 0.16, p.y) * smooth(0.34, 0.24, p.y),
    );
    c.multiplyScalar(0.84 + 0.2 * smooth(0, 0.36, p.y) * Math.max(0.4, n.y + 0.6));
    return c;
  });
  F.add("body", "torso_fur", body, {
    part: "base",
    style: STYLE.fur,
    material: "fur",
    color: (p, n, i) => new THREE.Color().fromBufferAttribute(body.attributes.color, i),
    keep: true,
  });

  const headField = sdf.smin(
    0.06,
    sdf.ellipsoid([0, 0.07, 0], [0.085, 0.075, 0.095]),
    sdf.sphere([0, 0.04, 0.085], 0.04),
    sdf.sphere([-0.045, 0.03, 0.06], 0.05),
    sdf.sphere([0.045, 0.03, 0.06], 0.05),
  );
  const head = await T.polygonise(headField, { size: 36, maxTriangles: 420 });
  paint(THREE, head, (p) =>
    new THREE.Color(fur).lerp(
      new THREE.Color(cream),
      smooth(0.05, 0.12, p.z) * smooth(0.06, 0.0, p.y - 0.02),
    ),
  );
  F.add("head", "skull_fur", head, {
    part: "base",
    style: STYLE.fur,
    material: "fur",
    color: (p, n, i) => new THREE.Color().fromBufferAttribute(head.attributes.color, i),
    keep: true,
  });
  F.add(
    "head",
    "nose",
    ellipsoid(THREE, [0.014, 0.01, 0.01], { w: 8, h: 5 }).translate(0, 0.057, 0.128),
    { part: "base", style: STYLE.fur, material: "fur", color: pink },
  );
  eyes(THREE, F, "head", {
    at: [0, 0.08],
    spread: 0.058,
    r: 0.026,
    irisHex: "#232936",
    lookZ: 0.076,
  });

  for (const s of [-1, 1]) {
    const node = s < 0 ? "ear_l" : "ear_r";
    F.add(
      node,
      `ear_${s}`,
      revolve(
        T,
        [
          [0, 0],
          [0.034, 0, 1],
          [0.038, 0.05],
          [0.03, 0.14],
          [0.012, 0.21],
          [0, 0.235],
        ],
        { segments: 10, divisions: 2, rz: 0.42 },
      ).rotateZ(-s * 0.12),
      {
        part: "base",
        style: STYLE.fur,
        material: "fur",
        color: gradientFn(THREE, "#B38C69", fur, 0, 0.22),
      },
    );
    F.add(
      node,
      `ear_inner_${s}`,
      revolve(
        T,
        [
          [0, 0.01],
          [0.022, 0.01, 1],
          [0.024, 0.06],
          [0.016, 0.14],
          [0, 0.2],
        ],
        { segments: 8, divisions: 1, rz: 0.32 },
      )
        .rotateZ(-s * 0.12)
        .translate(0, 0, 0.012),
      { part: "base", style: STYLE.fur, material: "fur", color: pink },
    );
  }
  F.add("tail", "tail_puff", ellipsoid(THREE, [0.045, 0.045, 0.045], { w: 10, h: 7 }), {
    part: "base",
    style: STYLE.fur,
    material: "fur",
    color: cream,
  });
  // butter scarf
  F.add(
    "body",
    "scarf",
    ring(THREE, 0.075, 0.026, { tubular: 18, radial: 6 }).translate(0, 0.32, 0.09).rotateX(-0.25),
    { part: "base", style: STYLE.cloth, material: "gear", color: "#F3D78A" },
  );
  F.add(
    "body",
    "scarf_tail",
    tube(
      T,
      THREE,
      [
        [0.05, 0.31, 0.13],
        [0.07, 0.2, 0.155],
        [0.06, 0.12, 0.15],
      ],
      (t) => 0.024 - 0.01 * t,
      { tubular: 8, radial: 5 },
    ),
    { part: "base", style: STYLE.cloth, material: "gear", color: "#F3D78A" },
  );
  F.add(
    "body",
    "scarf_stripe",
    ring(THREE, 0.077, 0.006, { tubular: 18, radial: 4 }).translate(0, 0.325, 0.09).rotateX(-0.25),
    { part: "base", style: STYLE.cloth, material: "gold", color: "#F2C36B" },
  );
  return { root: rig.root, clips: hareClips(THREE), extras: { athenaKeepHierarchy: true } };
}

// ---------------------------------------------------------------------------- Orbi
export async function buildOrbi(THREE, T) {
  const rig = makeRig(THREE, null, [
    ["body", null, [0, 0.03, 0]],
    ["head", "body", [0, 0.36, 0]],
    ["antenna_l", "head", [-0.07, 0.2, 0]],
    ["antenna_r", "head", [0.07, 0.2, 0]],
  ]);
  const F = new Figure(THREE, T, rig, { weave: false });
  const { sdf } = T;
  const mint = "#A8D5C6";
  const pale = "#E3F3EC";
  const deep = "#6FB3A6";

  const bodyField = sdf.smin(
    0.1,
    sdf.ellipsoid([0, 0.2, 0], [0.2, 0.2, 0.19]),
    sdf.ellipsoid([0, 0.36, 0], [0.15, 0.14, 0.14]),
  );
  const body = await T.polygonise(bodyField, { size: 44, maxTriangles: 640 });
  paint(THREE, body, (p, n) => {
    const c = new THREE.Color(deep).lerp(new THREE.Color(mint), smooth(0.0, 0.3, p.y));
    c.lerp(
      new THREE.Color(pale),
      smooth(0.0, 0.1, p.z) * smooth(0.06, 0.2, p.y) * smooth(0.36, 0.26, p.y),
    );
    c.multiplyScalar(0.92 + 0.1 * n.y);
    return c;
  });
  F.add("body", "torso_orbi", body, {
    part: "base",
    style: STYLE.cloth,
    material: "gear",
    color: (p, n, i) => new THREE.Color().fromBufferAttribute(body.attributes.color, i),
    keep: true,
  });
  F.add(
    "body",
    "orbit_ring",
    ring(THREE, 0.29, 0.016, { tubular: 36, radial: 5 })
      .rotateX(0.35)
      .rotateZ(0.2)
      .translate(0, 0.24, 0),
    { part: "base", style: STYLE.cloth, material: "gold", color: "#F2C36B" },
  );

  // face: a screen-like oval with two big eyes
  F.add(
    "head",
    "face_plate",
    ellipsoid(THREE, [0.12, 0.08, 0.03], { w: 14, h: 8 }).translate(0, 0.0, 0.126),
    { part: "base", style: STYLE.cloth, material: "gear", color: pale },
  );
  for (const s of [-1, 1]) {
    F.add(
      "head",
      `eye_white_${s}`,
      ellipsoid(THREE, [0.04, 0.046, 0.014], { w: 10, h: 7 }).translate(s * 0.06, 0.0, 0.151),
      { part: "base", style: STYLE.eye, material: "eye", color: "#FFFFFF" },
    );
    F.add(
      "head",
      `pupil_${s}`,
      ellipsoid(THREE, [0.026, 0.032, 0.01], { w: 8, h: 6 }).translate(s * 0.06, 0.0, 0.162),
      { part: "base", style: STYLE.eye, material: "eye", color: "#232936" },
    );
    F.add(
      "head",
      `glint_${s}`,
      ellipsoid(THREE, [0.008, 0.008, 0.005], { w: 6, h: 4 }).translate(
        s * 0.06 - 0.01,
        0.014,
        0.17,
      ),
      { part: "base", style: STYLE.eye, material: "eye", color: "#FBF3E4" },
    );
    const node = s < 0 ? "antenna_l" : "antenna_r";
    F.add(
      node,
      `stalk_${s}`,
      tube(
        T,
        THREE,
        [
          [0, 0, 0],
          [s * 0.012, 0.05, 0],
          [s * 0.03, 0.1, 0],
        ],
        0.009,
        { tubular: 5, radial: 4 },
      ),
      { part: "base", style: STYLE.cloth, material: "gear", color: deep },
    );
    F.addGlow(
      node,
      `tip_${s}`,
      ellipsoid(THREE, [0.022, 0.022, 0.022], { w: 8, h: 6 }).translate(s * 0.032, 0.115, 0),
      glowMaterial(T, "antenna_glow", "#F2C36B", 1.5),
      { part: "base", style: STYLE.cloth, color: "#FFFFFF", keep: true },
    );
    F.add(
      "body",
      `foot_${s}`,
      ellipsoid(THREE, [0.055, 0.032, 0.08], { w: 8, h: 6 }).translate(s * 0.08, 0.02, 0.04),
      { part: "base", style: STYLE.cloth, material: "gear", color: deep },
    );
    F.add(
      "body",
      `arm_${s}`,
      tube(
        T,
        THREE,
        [
          [s * 0.19, 0.26, 0.02],
          [s * 0.26, 0.2, 0.05],
          [s * 0.27, 0.13, 0.07],
        ],
        0.024,
        { tubular: 6, radial: 5 },
      ),
      { part: "base", style: STYLE.cloth, material: "gear", color: mint },
    );
  }
  return { root: rig.root, clips: visitorClips(THREE), extras: { athenaKeepHierarchy: true } };
}
void blinkClip;
void roundBox;
