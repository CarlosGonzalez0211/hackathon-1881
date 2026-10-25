/**
 * Spike family: five tiny assets that prove every toolkit operation survives the real build
 * (export, asset pipeline, runtime loader). They are test fixtures, not final art, and are
 * the only family the registry builds today.
 *
 *   athena-spike-lathe   profile lathe with a scalloped rim, baked gradient, gilt + glow materials
 *   athena-spike-sdf     smooth-min crown of five lobes, polygonised at 64^3 and decimated
 *   athena-spike-cage    8-vertex cage, Loop-subdivided twice, noise displaced, crease normals
 *   athena-spike-cards   ring of eight alpha cards painted from the foliage atlas
 *   athena-spike-rig     node-animated figure with the avatar's joint naming and style attributes
 *
 * Every `build(THREE, tools, opts)` returns `{ root, clips?, textures?, extras? }`.
 */

const TAU = Math.PI * 2;

// --------------------------------------------------------------------------- lathe vase
function buildLathe(_THREE, T) {
  const wall = T.material("wall", "#FFFFFF", { vertexColors: true, roughness: 0.9 });
  const gilt = T.material("gilt", "#E9BC5C", {
    emissive: "#C99232",
    emissiveIntensity: 0.6,
    metalness: 0.2,
    roughness: 0.45,
  });
  const glow = T.material("window_glow", "#FFE2A6", {
    emissive: "#F6C46A",
    emissiveIntensity: 0.8,
    roughness: 0.5,
  });
  // Outside bottom to top (foot, belly, neck, flared lip), a crisp rim corner, then the
  // inner wall running back down. Corners are flagged with a third element.
  const body = T.lathe(
    [
      [0, 0],
      [0.17, 0, 1],
      [0.3, 0.3],
      [0.34, 0.44],
      [0.13, 0.72],
      [0.2, 0.95],
      [0.22, 0.97, 1],
      [0.17, 0.9],
      [0.09, 0.65],
      [0, 0.5],
    ],
    { segments: 24, divisions: 2, scallop: { folds: 6, depth: 0.1, from: 0.8, lift: 0.025 } },
  );
  T.bake.fill(body, "#F4E9D8");
  T.bake.gradient(body, { bottom: "#9C7356", top: "#FBF3E4", curve: 1.4 });
  T.bake.occlusion(body, { radius: 0.12, strength: 0.35 });
  // One crisp accent per three soft masses: a gilt bead on the neck.
  const band = T.lathe(
    [
      [0.133, 0.74],
      [0.15, 0.748],
      [0.15, 0.782],
      [0.133, 0.79],
    ],
    { segments: 16, divisions: 2 },
  );
  // A lit patch on the belly: an arc of the body profile pushed 12 mm outward.
  const patch = T.lathe(
    [
      [0.322, 0.3],
      [0.352, 0.42],
      [0.282, 0.58],
    ],
    { segments: 8, divisions: 3, phiStart: -0.4, phiLength: 0.8 },
  );
  const root = T.group(
    "athena-spike-lathe",
    T.mesh("vase_wall", body, wall),
    T.mesh("vase_band", band, gilt),
    T.mesh("vase_glow", patch, glow),
  );
  return { root };
}

// --------------------------------------------------------------------------- SDF crown
async function buildSdf(_THREE, T) {
  const { sdf } = T;
  const lobes = [
    sdf.ellipsoid([0, 0.55, 0], [0.42, 0.3, 0.4]),
    sdf.ellipsoid([0.3, 0.42, 0.12], [0.3, 0.22, 0.28]),
    sdf.ellipsoid([-0.28, 0.4, 0.18], [0.28, 0.2, 0.26]),
    sdf.ellipsoid([0.1, 0.38, -0.3], [0.3, 0.22, 0.26]),
    sdf.ellipsoid([-0.12, 0.86, 0], [0.26, 0.2, 0.24]),
  ];
  // A flat underside so the crown sits on its trunk instead of floating as a blob.
  const crown = sdf.subtract(sdf.smin(0.14, ...lobes), sdf.halfspace([0, 1, 0], 0.2), 0.04);
  const geometry = await T.polygonise(crown, { size: 64, maxTriangles: 1100 });
  T.bake.fill(geometry, "#FFFFFF");
  T.bake.gradient(geometry, { bottom: "#3F7A5B", top: "#A8C97A", curve: 0.9 });
  T.bake.occlusion(geometry, { sdf: crown, radius: 0.18, strength: 0.4 });
  const material = T.material("crown", "#FFFFFF", { vertexColors: true, roughness: 0.9 });
  const root = T.group("athena-spike-sdf", T.mesh("crown", geometry, material));
  return { root: T.ground(root) };
}

// --------------------------------------------------------------------------- cage rock
function buildCage(_THREE, T) {
  // Eight corners, six quads, wound counter-clockwise from outside.
  const cage = T.cage({
    vertices: [
      [-0.5, 0, -0.4],
      [0.55, 0, -0.45],
      [0.5, 0, 0.5],
      [-0.45, 0, 0.4],
      [-0.35, 0.55, -0.3],
      [0.3, 0.65, -0.25],
      [0.35, 0.5, 0.3],
      [-0.3, 0.6, 0.25],
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
  const rock = T.subdivide(cage, 2);
  const noise = T.createNoise(11);
  // Low-frequency, authored displacement: two octaves, a few centimetres.
  T.displace(rock, (p) => 0.06 * noise.fbm3(p.x * 2.2, p.y * 2.2, p.z * 2.2, { octaves: 2 }));
  T.smoothNormals(rock, 50);
  T.bake.fill(rock, "#B9C4C8");
  T.bake.gradient(rock, { bottom: "#6F8491", top: "#D9C3A3", curve: 1.2 });
  T.bake.direction(rock, {
    color: "#3F7A5B",
    direction: [0, 1, 0],
    threshold: 0.72,
    strength: 0.85,
  });
  T.bake.occlusion(rock, { radius: 0.2, strength: 0.3 });
  const material = T.material("rock", "#FFFFFF", { vertexColors: true, roughness: 0.95 });
  const root = T.group("athena-spike-cage", T.mesh("rock", rock, material));
  return { root: T.ground(root) };
}

// --------------------------------------------------------------------------- alpha cards
function buildCards(_THREE, T) {
  const atlas = T.paint.paintFoliageAtlas({ seed: 7 });
  const geometry = T.cards.fringeRing({
    center: [0, 0, 0],
    radius: 0.32,
    count: 8,
    width: 0.46,
    height: 0.42,
    tilt: 0.55,
    rect: atlas.rects.leafCluster,
    atlasSize: atlas.size,
    seed: 3,
  });
  // Texture-less in Node: finalizeGlb attaches `atlas.png` to this material afterwards.
  const material = T.material("leaf_card", "#FFFFFF", {
    vertexColors: true,
    doubleSided: true,
    alphaTest: 0.5,
    roughness: 0.9,
  });
  const root = T.group("athena-spike-cards", T.mesh("fringe", geometry, material));
  return { root, textures: [{ png: atlas.png, materials: ["leaf_card"] }] };
}

// --------------------------------------------------------------------------- rig
const styleOf = (T, geometry, style, weave) => {
  const count = geometry.attributes.position.count;
  geometry.setAttribute(
    "athena_style",
    new T.THREE.Float32BufferAttribute(new Float32Array(count).fill(style), 1),
  );
  const uv = geometry.attributes.uv;
  const values = new Float32Array(count * 2).fill(-1);
  // Woven garments carry weave coordinates (here the lathe uv scaled to a few repeats).
  if (weave && uv)
    for (let i = 0; i < count; i++) values.set([uv.getX(i) * 6, uv.getY(i) * 4], i * 2);
  geometry.setAttribute("athena_weave", new T.THREE.Float32BufferAttribute(values, 2));
  return geometry;
};

function buildRig(THREE, T) {
  const skin = T.material("skin_f0cfb4", "#F0CFB4", { roughness: 0.85 });
  const hair = T.material("hair_6e4f3c", "#6E4F3C", { roughness: 0.85 });
  const cloth = T.material("top_ochre", "#C99232", { roughness: 0.9, doubleSided: true });
  const trousers = T.material("bottom_navy", "#3E4057", { roughness: 0.9 });
  const boots = T.material("shoe_timber", "#6E4F3C", { roughness: 0.8 });
  const eye = T.material("character_eye_ink", "#2B2936", { roughness: 0.4 });

  const tag = (object, part) => {
    object.userData.part = part;
    return object;
  };
  const part = (name, geometry, material, partName, style = 4, weave = false, position) => {
    const mesh = tag(T.mesh(name, styleOf(T, geometry, style, weave), material), partName);
    if (position) mesh.position.set(...position);
    return mesh;
  };
  // THREE.CapsuleGeometry is a lathe with zero-area triangles at its poles; this one is not.
  const capsule = (radius, length) => {
    const arc = [-90, -60, -30, 0].map((degrees) => (degrees * Math.PI) / 180);
    const bottom = arc.map((a) => [radius * Math.cos(a), -length / 2 + radius * Math.sin(a)]);
    const top = arc.map((a) => [radius * Math.cos(a), length / 2 - radius * Math.sin(a)]).reverse();
    return T.lathe([...bottom, ...top], { segments: 8, divisions: 1 });
  };
  const joint = (name, x = 0, y = 0, z = 0) => {
    const node = T.group(name);
    node.position.set(x, y, z);
    return node;
  };

  const root = T.group("athena-spike-rig");
  const body = joint("body");
  const hip = joint("hip", 0, 0.5, 0);
  root.add(body);
  body.add(hip);

  // Legs: thigh on leg_*, shin and boot on knee_*; the feet stand at y = 0.
  for (const [side, x] of [
    ["l", -0.08],
    ["r", 0.08],
  ]) {
    const leg = joint(`leg_${side}`, x, 0, 0);
    const knee = joint(`knee_${side}`, 0, -0.25, 0);
    leg.add(
      part(`thigh_${side}`, capsule(0.055, 0.14), trousers, "bottom", 4, false, [0, -0.125, 0]),
    );
    knee.add(
      part(`shin_${side}`, capsule(0.045, 0.1), trousers, "bottom", 4, false, [0, -0.11, 0]),
      part(
        `boot_${side}`,
        new THREE.BoxGeometry(0.09, 0.05, 0.16),
        boots,
        "shoes",
        4,
        false,
        [0, -0.225, 0.035],
      ),
    );
    leg.add(knee);
    hip.add(leg);
  }

  // Torso: a woven poncho profile (style 7 + weave coordinates).
  const torso = joint("torso", 0, 0.03, 0);
  const chest = T.lathe(
    [
      [0, 0],
      [0.13, 0.01],
      [0.15, 0.1],
      [0.13, 0.26],
      [0.09, 0.36],
      [0, 0.38],
    ],
    { segments: 16, divisions: 2 },
  );
  torso.add(part("chest", chest, cloth, "top", 7, true));
  hip.add(torso);

  for (const [side, x] of [
    ["l", -0.17],
    ["r", 0.17],
  ]) {
    const arm = joint(`arm_${side}`, x, 0.32, 0);
    const elbow = joint(`elbow_${side}`, 0, -0.2, 0);
    const hand = joint(`hand_${side}`, 0, -0.18, 0);
    arm.add(part(`upper_arm_${side}`, capsule(0.04, 0.12), skin, "base", 1, false, [0, -0.1, 0]));
    elbow.add(part(`forearm_${side}`, capsule(0.036, 0.1), skin, "base", 1, false, [0, -0.09, 0]));
    hand.add(part(`fist_${side}`, new THREE.SphereGeometry(0.042, 8, 6), skin, "base", 1));
    elbow.add(hand);
    arm.add(elbow);
    torso.add(arm);
  }

  // Head: skull + one swept hair lock under head_geo, blink target face_expression beside it.
  const head = joint("head", 0, 0.42, 0);
  const headGeo = joint("head_geo", 0, 0.1, 0);
  headGeo.add(part("skull", new THREE.SphereGeometry(0.11, 16, 12), skin, "base", 1));
  const lock = T.sweep(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.1, 0.02),
      new THREE.Vector3(0.1, 0.09, -0.04),
      new THREE.Vector3(0.11, 0, -0.1),
      new THREE.Vector3(0.09, -0.1, -0.1),
    ]),
    { radius: (t) => 0.035 * (1 - 0.75 * t), tubular: 8, radial: 6, caps: "round" },
  );
  headGeo.add(part("hair_lock", lock, hair, "hair", 2));
  const face = joint("face_expression", 0, 0.1, 0);
  for (const [side, x] of [
    ["l", -0.04],
    ["r", 0.04],
  ])
    face.add(
      part(`eye_${side}`, new THREE.SphereGeometry(0.014, 8, 6), eye, "base", 3, false, [
        x,
        0.01,
        0.103,
      ]),
    );
  head.add(headGeo, face);
  torso.add(head);

  // ---- clips (node-animated, absolute rotations in radians; node names are unique).
  const q = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z)).toArray();
  const sample = (duration, frames, frame) => {
    const times = Array.from({ length: frames + 1 }, (_, i) => (duration * i) / frames);
    const values = {};
    times.forEach((time, i) => {
      for (const [target, value] of Object.entries(frame(i / frames)))
        (values[target] ??= []).push(...value);
    });
    return { times, values };
  };
  const clip = (name, duration, frames, frame) => {
    const { times, values } = sample(duration, frames, frame);
    const tracks = Object.entries(values).map(([target, array]) =>
      target.endsWith(".quaternion")
        ? new THREE.QuaternionKeyframeTrack(target, times, array)
        : new THREE.VectorKeyframeTrack(target, times, array),
    );
    return new THREE.AnimationClip(name, duration, tracks);
  };
  const s = (t) => Math.sin(t * TAU);
  const pose = (o = {}) => ({
    "body.position": [0, 0, 0],
    "torso.quaternion": q(0, 0, 0),
    "head.quaternion": q(0, 0, 0),
    "arm_l.quaternion": q(0, 0, -0.1),
    "arm_r.quaternion": q(0, 0, 0.1),
    "leg_l.quaternion": q(0, 0, 0),
    "leg_r.quaternion": q(0, 0, 0),
    "knee_l.quaternion": q(0, 0, 0),
    "knee_r.quaternion": q(0, 0, 0),
    ...o,
  });
  const clips = [
    clip("idle", 3, 12, (t) =>
      pose({
        "body.position": [0, 0.006 * s(t), 0],
        "head.quaternion": q(0.03 * s(t), 0.04 * s(t * 0.5), 0),
      }),
    ),
    clip("walk", 1, 12, (t) =>
      pose({
        "leg_l.quaternion": q(0.5 * s(t), 0, 0),
        "leg_r.quaternion": q(-0.5 * s(t), 0, 0),
        "knee_l.quaternion": q(0.35 * Math.max(0, -s(t)), 0, 0),
        "knee_r.quaternion": q(0.35 * Math.max(0, s(t)), 0, 0),
        "arm_l.quaternion": q(-0.4 * s(t), 0, -0.12),
        "arm_r.quaternion": q(0.4 * s(t), 0, 0.12),
        "torso.quaternion": q(0.04, 0.06 * s(t), 0),
        "body.position": [0, 0.02 * Math.abs(Math.cos(t * TAU)), 0],
      }),
    ),
    clip("expression_blink", 2, 20, (t) => ({
      "face_expression.scale": [1, t > 0.5 && t < 0.6 ? 0.1 : 1, 1],
    })),
  ];
  return { root, clips, extras: { athenaKeepHierarchy: true } };
}

/** @type {Array<{ id: string, family: string, file: string, build: Function }>} */
export const entries = [
  { id: "spike-lathe", family: "spike", file: "athena-spike-lathe.glb", build: buildLathe },
  { id: "spike-sdf", family: "spike", file: "athena-spike-sdf.glb", build: buildSdf },
  { id: "spike-cage", family: "spike", file: "athena-spike-cage.glb", build: buildCage },
  { id: "spike-cards", family: "spike", file: "athena-spike-cards.glb", build: buildCards },
  { id: "spike-rig", family: "spike", file: "athena-spike-rig.glb", build: buildRig },
];
