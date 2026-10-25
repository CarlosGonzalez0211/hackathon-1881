import { dressExplorer } from "./story-explorer.mjs";
/** Offline character authoring pass. Keeps the existing rig, sockets and clips intact. */
export function refineCharacters(document, source) {
  if (!/models\/(avatar|npcs|characters)\//.test(source)) return false;
  const root = document.getRoot(),
    buffer = root.listBuffers()[0] ?? document.createBuffer();
  const linear = (h) => {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
  };
  const material = (name, hex) =>
    document
      .createMaterial(name)
      .setBaseColorFactor([...linear(hex), 1])
      .setRoughnessFactor(0.9);
  const eyeInk = material("character_eye_ink", "#49342b");
  const blush = material("character_blush", "#d8a183");
  const acc = (name, type, array) =>
    document.createAccessor(name).setType(type).setArray(array).setBuffer(buffer);
  function primitive(name, positions, normals, indices, mat, colors) {
    const p = document
      .createPrimitive()
      .setAttribute("POSITION", acc(name + "_p", "VEC3", new Float32Array(positions)))
      .setAttribute("NORMAL", acc(name + "_n", "VEC3", new Float32Array(normals)))
      .setIndices(acc(name + "_i", "SCALAR", new Uint32Array(indices)))
      .setMaterial(mat);
    if (colors) p.setAttribute("COLOR_0", acc(name + "_c", "VEC3", new Float32Array(colors)));
    return document.createMesh(name).addPrimitive(p);
  }
  function surface(name, nu, nv, sample, mat, colorAt) {
    const positions = [],
      normals = [],
      indices = [],
      colors = [];
    const cross = (a, b) => [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
    for (let j = 0; j <= nv; j++)
      for (let i = 0; i <= nu; i++) {
        const u = i / nu,
          v = j / nv,
          p = sample(u, v),
          pa = sample(u + 0.0001, v),
          pb = sample(u, v + 0.0001);
        let n = cross(
          pa.map((x, k) => x - p[k]),
          pb.map((x, k) => x - p[k]),
        );
        let len = Math.hypot(...n);
        const center = [0, 0, 0];
        for (const q of [0, 0.25, 0.5, 0.75])
          sample(q, v).forEach((x, k) => (center[k] += x * 0.25));
        const flipped = n.reduce((sum, x, k) => sum + x * (p[k] - center[k]), 0) < 0;
        if (flipped) n = n.map((x) => -x);
        if (len < 1e-14) {
          n = [p[0], p[1], p[2]];
          len = Math.hypot(...n) || 1;
        }
        positions.push(...p);
        normals.push(...n.map((x) => x / len));
        if (colorAt) colors.push(...colorAt(u, v, p));
        if (i < nu && j < nv) {
          const a = j * (nu + 1) + i,
            b = a + nu + 1;
          if (flipped) indices.push(a, b, a + 1, a + 1, b, b + 1);
          else indices.push(a, a + 1, b, a + 1, b + 1, b);
        }
      }
    return primitive(name, positions, normals, indices, mat, colorAt ? colors : undefined);
  }
  function sphere(name, rx, ry, rz, mat, deform) {
    return surface(
      name,
      rx < 0.05 ? 16 : 32,
      rx < 0.05 ? 10 : 20,
      (u, v) => {
        const theta = v * Math.PI,
          phi = u * Math.PI * 2;
        let p = [
          -Math.cos(phi) * Math.sin(theta) * rx,
          Math.cos(theta) * ry,
          Math.sin(phi) * Math.sin(theta) * rz,
        ];
        return deform ? deform(p) : p;
      },
      mat,
    );
  }
  function node(parent, name, mesh, translation) {
    const n = document.createNode(name).setMesh(mesh);
    if (translation) n.setTranslation(translation);
    parent.addChild(n);
    return n;
  }
  function remove(n) {
    for (const child of [...n.listChildren()]) remove(child);
    n.dispose();
  }
  const descendants = (n) => {
    const out = [];
    n.traverse((x) => out.push(x));
    return out;
  };
  const smooth = (a, b, x) => {
    let t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const expressionNodes = [];
  for (const head of root.listNodes().filter((n) => n.getName() === "head_geo")) {
    // A slightly taller oval and tapered jaw replace the perfectly spherical toy head.
    const oldScale = head.getScale();
    head.setScale([oldScale[0] * 0.96, oldScale[1] * 1.02, oldScale[2] * 0.96]);
    const skull = descendants(head).find((n) => n.getName() === "skull" && n.getMesh());
    if (!skull) continue;
    const skin = skull.getMesh().listPrimitives()[0].getMaterial();
    skull.setMesh(
      sphere("storybook_face", 0.17, 0.17, 0.17, skin, (p) => {
        const jaw = 0.94 + 0.06 * smooth(-0.16, 0.015, p[1]);
        return [p[0] * jaw, p[1], p[2] * (0.91 + 0.09 * smooth(-0.14, 0.04, p[1]))];
      }),
    );
    const face = descendants(head).find((n) => n.getName() === "face");
    if (!face) continue;
    for (const child of [...face.listChildren()]) {
      if (/^(eye|eye_hl|cheek)(_|$)/.test(child.getName())) remove(child);
      if (child.getName().startsWith("nose")) child.setScale(child.getScale().map((x) => x * 0.57));
      if (child.getName().startsWith("brow")) {
        child.setScale([0.62, 0.34, 0.5]);
        const p = child.getTranslation();
        child.setTranslation([p[0], 0.258, p[2] + 0.003]);
      }
      if (child.getName().startsWith("ear")) {
        node(child, "ear_inner", sphere("ear_inner", 0.022, 0.026, 0.008, blush), [0, 0, 0.026]);
      }
    }
    const mouth = descendants(face).find((n) => n.getName() === "mouth");
    if (mouth) {
      const positions = [],
        normals = [],
        indices = [];
      for (let i = 0; i <= 24; i++) {
        const x = (i / 24 - 0.5) * 0.038,
          y = 0.006 * Math.pow(x / 0.019, 2);
        for (const sign of [-1, 1]) {
          positions.push(x, y + sign * 0.0015, 0.003);
          normals.push(0, 0, 1);
        }
        if (i < 24) {
          let a = i * 2;
          indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
        }
      }
      mouth
        .setMesh(
          primitive(
            "soft_smile",
            positions,
            normals,
            indices,
            material("character_lips", "#8e514e"),
          ),
        )
        .setTranslation([0, 0.126, 0.161])
        .setRotation([0, 0, 0, 1])
        .setScale([1, 1, 1]);
    }
    const expression = document.createNode("face_expression").setTranslation([0, 0.214, 0]);
    face.addChild(expression);
    expressionNodes.push(expression);
    const skinFront = (x, y) =>
      Math.sqrt(Math.max(0.001, 0.17 * 0.17 - x * x - (y - 0.2) * (y - 0.2)));
    function patch(name, cx, cy, rx, ry, offset, mat, colorAt, almond = true) {
      const positions = [cx, cy, skinFront(cx, cy + 0.214) + offset],
        normals = [0, 0, 1],
        indices = [],
        colors = [];
      if (colorAt) colors.push(...colorAt(0, 0));
      const rings = colorAt ? 3 : 2,
        segments = colorAt ? 32 : 24;
      for (let r = 1; r <= rings; r++)
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2,
            t = r / rings;
          const x = Math.cos(a) * rx * t,
            y = Math.sin(a) * ry * t * (almond ? 0.64 + 0.36 * Math.abs(Math.sin(a)) : 1);
          positions.push(
            cx + x,
            cy + y,
            skinFront(cx + x, cy + y + 0.214) + offset + 0.002 * (1 - t * t),
          );
          normals.push(0, 0, 1);
          if (colorAt) colors.push(...colorAt(x / rx, y / ry));
          if (i < segments) {
            const b = 1 + (r - 1) * (segments + 1) + i;
            if (r === 1) indices.push(0, b, b + 1);
            else {
              const a = b - (segments + 1);
              indices.push(a, b, b + 1, a, b + 1, a + 1);
            }
          }
        }
      return primitive(name, positions, normals, indices, mat, colorAt ? colors : undefined);
    }
    const skinColor = skin.getBaseColorFactor().slice(0, 3);
    const cheekMaterial = material("character_blush", "#ffffff");
    for (const sign of [-1, 1]) {
      node(
        expression,
        "storybook_eye_" + sign,
        patch("bean_eye", sign * 0.058, -0.006, 0.0085, 0.0145, 0.004, eyeInk, undefined, false),
      );
      const cheek = node(
        face,
        "soft_cheek_" + sign,
        patch(
          "painted_cheek",
          sign * 0.091,
          -0.057,
          0.022,
          0.014,
          0.0018,
          cheekMaterial,
          (x, y) => {
            const tint = Math.pow(Math.max(0, 1 - x * x - y * y), 2) * 0.27;
            const rose = linear("#d88c6f");
            return skinColor.map((c, k) => c * (1 - tint) + rose[k] * tint);
          },
          false,
        ),
      );
      cheek.setTranslation([0, 0.214, 0]);
    }
  }
  // Sculpted swept locks share a scalp silhouette; every tip follows a smooth Bezier.
  for (const hair of root.listNodes().filter((n) => n.getName() === "hair")) {
    const old = descendants(hair).filter((n) => n.getMesh());
    if (!old.length) continue;
    const names = old.map((n) => n.getName());
    const style =
      source.includes("hair-long") || names.includes("hair_back")
        ? "long"
        : source.includes("ponytail") || names.includes("tail")
          ? "ponytail"
          : source.includes("curls") || names.some((n) => n.startsWith("curl"))
            ? "curls"
            : source.includes("braids") || names.some((n) => n.startsWith("braid"))
              ? "braids"
              : names.includes("bun")
                ? "bun"
                : names.includes("swoop") || source.includes("swept")
                  ? "swept"
                  : names.length === 1 || source.includes("hair-crop")
                    ? "crop"
                    : "bob";
    const mat = old[0]
      .getMesh()
      .listPrimitives()[0]
      .getMaterial()
      .clone()
      .setName("character_hair")
      .setDoubleSided(true);
    const base = mat.getBaseColorFactor();
    const light = mat
      .clone()
      .setName("character_hair_sheen")
      .setBaseColorFactor([
        base[0] * 1.2 + 0.008,
        base[1] * 1.15 + 0.005,
        base[2] * 1.1 + 0.004,
        1,
      ]);
    for (const child of [...hair.listChildren()]) remove(child);
    const cap = surface(
      "swept_scalp",
      40,
      20,
      (u, v) => {
        const phi = u * Math.PI * 2,
          front = Math.max(0, Math.cos(phi));
        const theta = v * Math.PI * (0.64 - front * 0.3);
        const r = 0.18;
        return [
          Math.sin(phi) * Math.sin(theta) * r - 0.014 * (1 - v) * (1 - v),
          0.202 + Math.cos(theta) * r,
          Math.cos(phi) * Math.sin(theta) * r - 0.012,
        ];
      },
      mat,
    );
    node(hair, "hair_cap", cap);
    function lock(name, points, width, depth, material = mat) {
      const shape = surface(
        name,
        8,
        16,
        (u, v) => {
          const c = points[0].map(
            (x, k) => (1 - v) * (1 - v) * x + 2 * v * (1 - v) * points[1][k] + v * v * points[2][k],
          );
          const taper =
            Math.pow(Math.max(0, 1 - v), 0.6) *
            (0.35 + 0.65 * Math.sin(Math.PI * (v * 0.85 + 0.13)));
          const a = u * Math.PI * 2;
          return [c[0] + Math.cos(a) * width * taper, c[1], c[2] + Math.sin(a) * depth * taper];
        },
        material,
      );
      node(hair, name, shape);
    }
    const fringe = style === "crop" ? 4 : 6;
    for (let i = 0; i < fringe; i++) {
      const f = i / (fringe - 1),
        x = -0.13 + f * 0.26;
      const tipY = 0.235 + 0.064 * f + 0.009 * Math.sin(f * Math.PI * 2);
      lock(
        "fringe_lock_" + i,
        [
          [-0.08 + f * 0.1, 0.365, 0.035],
          [x - 0.045, 0.315, 0.15],
          [x + 0.024, tipY, 0.16 - (0.018 * Math.abs(x)) / 0.13],
        ],
        0.038,
        0.013,
        i === 1 || i === 4 ? light : mat,
      );
    }
    for (const sign of [-1, 1]) {
      lock(
        "temple_lock_" + sign,
        [
          [sign * 0.13, 0.32, 0.015],
          [sign * 0.187, 0.23, 0.065],
          [sign * 0.16, style === "crop" ? 0.155 : 0.115, 0.042],
        ],
        0.031,
        0.022,
      );
      if (style !== "crop")
        lock(
          "side_lock_" + sign,
          [
            [sign * 0.15, 0.29, -0.03],
            [sign * 0.195, 0.15, -0.06],
            [sign * 0.162, 0.075, -0.04],
          ],
          0.035,
          0.025,
        );
    }
    const count = style === "curls" ? 11 : 7;
    for (let i = 0; i < count; i++) {
      const a = Math.PI * 0.55 + (i / (count - 1)) * Math.PI * 0.9;
      const x = Math.sin(a) * 0.17,
        z = Math.cos(a) * 0.17 - 0.015;
      const y = style === "long" ? -0.22 : style === "crop" ? 0.15 : 0.095;
      lock(
        "back_lock_" + i,
        [
          [x * 0.65, 0.31, z * 0.6],
          [x * 1.13, 0.18, z * 1.1],
          [x * 0.92, y + 0.016 * Math.sin(i * 1.8), z - 0.012],
        ],
        style === "curls" ? 0.048 : 0.04,
        0.027,
        i === 2 ? light : mat,
      );
    }
    if (style === "ponytail" || style === "bun") {
      lock(
        "gathered_tail",
        [
          [0, 0.3, -0.16],
          [0.055, 0.25, -0.3],
          [0.028, style === "bun" ? 0.25 : -0.15, -0.24],
        ],
        0.07,
        0.057,
      );
      node(
        hair,
        "hair_tie",
        sphere("hair_tie", 0.055, 0.025, 0.03, material("character_trim", "#c7a55b")),
        [0, 0.28, -0.193],
      );
    }
    if (style === "braids")
      for (const sign of [-1, 1])
        for (let i = 0; i < 6; i++)
          node(hair, "braid_" + sign + "_" + i, sphere("braid", 0.026, 0.038, 0.027, mat), [
            sign * (0.16 + 0.005 * Math.sin(i * 2)),
            0.14 - i * 0.047,
            -0.025,
          ]);
    // A small upward swept tuft gives the student a distinctive silhouette.
    if (source.includes("hair-bob"))
      lock(
        "crown_swoop",
        [
          [-0.1, 0.342, -0.01],
          [-0.06, 0.43, 0.035],
          [0.015, 0.379, 0.06],
        ],
        0.042,
        0.024,
      );
  }
  // Continuous shoulder and hem profiles, with restrained cloth folds.
  function lathe(name, profile, mat) {
    const detailed = /poncho|chest/.test(name);
    return surface(
      name,
      detailed ? 40 : 24,
      detailed ? 24 : 16,
      (u, v) => {
        const t = v * (profile.length - 1),
          i = Math.min(profile.length - 2, Math.floor(t)),
          f = t - i;
        const p0 = profile[Math.max(0, i - 1)],
          p1 = profile[i],
          p2 = profile[i + 1],
          p3 = profile[Math.min(profile.length - 1, i + 2)];
        const cat = (k) =>
          0.5 *
          (2 * p1[k] +
            (-p0[k] + p2[k]) * f +
            (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * f * f +
            (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * f * f * f);
        const a = u * Math.PI * 2,
          r = Math.max(0.001, cat(0)) + (Math.sin(a * 9) + Math.sin(a * 5) * 0.4) * 0.0025 * v * v;
        return [Math.sin(a) * r, cat(1) + Math.sin(a * 6) * 0.003 * v * v, Math.cos(a) * r];
      },
      mat,
    );
  }
  for (const n of root.listNodes()) {
    if (!n.getMesh()) continue;
    const mat = n.getMesh().listPrimitives()[0].getMaterial();
    if (n.getName() === "poncho")
      n.setMesh(
        lathe(
          "flowing_poncho",
          [
            [0.07, 0.47],
            [0.12, 0.455],
            [0.17, 0.43],
            [0.192, 0.34],
            [0.215, 0.23],
            [0.237, 0.14],
            [0.23, 0.12],
          ],
          mat,
        ),
      );
    if (n.getName() === "band" && n.getParentNode()?.getName() === "top_detail") {
      const scale = n.getScale();
      n.setScale([scale[0] * 0.88, scale[1] * 0.88, scale[2]]);
      const t = n.getTranslation();
      n.setTranslation([t[0], 0.142, t[2]]);
    }
    if (n.getName() === "chest")
      n.setMesh(
        lathe(
          "tailored_chest",
          [
            [0.14, -0.06],
            [0.16, 0.01],
            [0.165, 0.16],
            [0.178, 0.32],
            [0.15, 0.4],
            [0.095, 0.44],
          ],
          mat,
        ),
      );
    if (n.getName() === "hand") {
      n.setMesh(sphere("sculpted_hand", 0.039, 0.052, 0.031, mat));
      node(n, "thumb", sphere("thumb", 0.018, 0.028, 0.02, mat), [
        n.getParentNode()?.getName() === "arm_l" ? 0.033 : -0.033,
        0.005,
        0.011,
      ]);
    }
  }
  const hero = source.includes("models/avatar/");
  dressExplorer(document, source, {
    root,
    linear,
    material,
    primitive,
    surface,
    sphere,
    node,
    remove,
    lathe,
  });
  // Articulated knees and elbows replace the straight capsule limbs. These extra
  // sockets exist in every outfit part, so grafting and rigid skinning stay compatible.
  const joints = new Map();
  const hairByHead = new Map();
  for (const limb of [...root.listNodes()]) {
    const isLeg = /^leg_[lr]$/.test(limb.getName()),
      isArm = /^arm_[lr]$/.test(limb.getName());
    if (!isLeg && !isArm) continue;
    const name = (isLeg ? "knee_" : "elbow_") + limb.getName().slice(-1);
    const pivot = isLeg ? -0.29 : -0.215;
    const joint = node(limb, name, null, [0, pivot, 0]);
    joints.set(limb, { node: joint, isLeg });
    for (const child of [...limb.listChildren()]) {
      if (child === joint) continue;
      if (child.getName() === (isLeg ? "leg" : "arm") && child.getMesh()) {
        const mat = child.getMesh().listPrimitives()[0].getMaterial();
        const upper = isLeg
          ? [
              [0.055, 0],
              [0.064, -0.08],
              [0.061, -0.17],
              [0.045, -0.29],
            ]
          : [
              [0.05, 0.015],
              [0.056, -0.06],
              [0.048, -0.16],
              [0.04, -0.225],
            ];
        const lower = isLeg
          ? [
              [0.045, 0.015],
              [0.055, -0.07],
              [0.047, -0.15],
              [0.034, -0.25],
              [0.034, -0.29],
            ]
          : [
              [0.041, 0.01],
              [0.046, -0.055],
              [0.038, -0.13],
              [0.031, -0.19],
            ];
        child
          .setMesh(lathe(isLeg ? "sculpted_thigh" : "upper_sleeve", upper, mat))
          .setTranslation([0, 0, 0]);
        const calf = node(
          joint,
          isLeg ? "calf" : "forearm",
          lathe(isLeg ? "sculpted_calf" : "lower_sleeve", lower, mat),
        );
        if (hero && isLeg) {
          const factor = source.includes("avatar-base") ? 0.88 : 1.1;
          child.setScale([child.getScale()[0] * factor, 1, child.getScale()[2] * factor]);
          calf.setScale([factor, 1, factor]);
        }
        const depth = child.getScale()[2];
        calf.setScale([calf.getScale()[0], 1, depth]);
      } else if (child.getTranslation()[1] < (isLeg ? -0.4 : -0.23)) {
        const t = child.getTranslation();
        limb.removeChild(child);
        joint.addChild(child);
        child.setTranslation([t[0], t[1] - pivot, t[2]]);
      }
    }
  }
  for (const head of root.listNodes().filter((n) => n.getName() === "head_geo")) {
    let hair = head.listChildren().find((n) => n.getName() === "hair");
    if (!hair && source.includes("avatar-base")) hair = node(head, "hair", null);
    if (hair) hairByHead.set(head.getParentNode(), hair);
  }
  for (const animation of root.listAnimations()) {
    const sprint = animation.getName() === "sprint",
      sit = animation.getName().includes("sit");
    for (const channel of [...animation.listChannels()]) {
      if (channel.getTargetPath() !== "rotation") continue;
      const target = channel.getTargetNode(),
        sampler = channel.getSampler();
      const input = sampler.getInput(),
        output = sampler.getOutput();
      if (output.getCount() !== input.getCount()) continue;
      const joint = joints.get(target),
        hair = hairByHead.get(target);
      if (!joint && !hair) continue;
      const values = [];
      for (let i = 0; i < input.getCount(); i++) {
        const q = output.getElement(i, []),
          rx = Math.atan2(2 * (q[3] * q[0] + q[1] * q[2]), 1 - 2 * (q[0] * q[0] + q[1] * q[1]));
        const t = input.getScalar(i);
        const angle = joint
          ? joint.isLeg
            ? sit
              ? 1.4
              : 0.07 + Math.max(0, -rx) * (sprint ? 1.55 : 1.2)
            : (sprint ? -1.05 : -0.18) - Math.max(0, -rx) * 0.35
          : Math.sin(t * (sprint ? 11 : 3)) * (sprint ? 0.035 : 0.012);
        values.push(Math.sin(angle * 0.5), 0, 0, Math.cos(angle * 0.5));
      }
      const added = document
        .createAnimationSampler()
        .setInput(input)
        .setOutput(acc("joint_rotation", "VEC4", new Float32Array(values)))
        .setInterpolation("LINEAR");
      animation.addSampler(added).addChannel(
        document
          .createAnimationChannel()
          .setTargetNode(joint?.node ?? hair)
          .setTargetPath("rotation")
          .setSampler(added),
      );
    }
  }
  if (expressionNodes.length) {
    const animation = document.createAnimation("expression_blink");
    const times = acc("blink_time", "SCALAR", new Float32Array([0, 3.7, 3.78, 3.86, 3.96, 5.6]));
    const values = acc(
      "blink_scale",
      "VEC3",
      new Float32Array([1, 1, 1, 1, 1, 1, 1, 0.1, 1, 1, 0.08, 1, 1, 1, 1, 1, 1, 1]),
    );
    for (const n of expressionNodes) {
      const sampler = document
        .createAnimationSampler()
        .setInput(times)
        .setOutput(values)
        .setInterpolation("LINEAR");
      animation
        .addSampler(sampler)
        .addChannel(
          document
            .createAnimationChannel()
            .setTargetNode(n)
            .setTargetPath("scale")
            .setSampler(sampler),
        );
    }
  }
  // Material categories survive batching and drive the dedicated storybook surface shader.
  for (const mesh of root.listMeshes())
    for (const p of mesh.listPrimitives()) {
      const name = p.getMaterial()?.getName() ?? "";
      const style = /traveller_woven_cape/.test(name)
        ? 7
        : /character_eye/.test(name)
          ? 3
          : /hair|brow/.test(name)
            ? 2
            : /skin|cheek|blush/.test(name)
              ? 1
              : /fur/.test(name)
                ? 6
                : 4;
      const count = p.getAttribute("POSITION").getCount();
      if (!p.getAttribute("_ATHENA_WEAVE"))
        p.setAttribute(
          "_ATHENA_WEAVE",
          acc("plain_paint", "VEC2", new Float32Array(count * 2).fill(-1)),
        );
      p.setAttribute(
        "_ATHENA_STYLE",
        acc("character_style", "SCALAR", new Float32Array(count).fill(style)),
      );
      p.getMaterial()?.setRoughnessFactor(0.85);
    }
  root.setExtras({ ...root.getExtras(), athenaCharacterVersion: 2 });
  return true;
}
