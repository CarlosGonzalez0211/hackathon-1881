/** Reference-led traveller costume. Everything is rigged geometry, including the pack and props. */
export function dressExplorer(document, source, kit) {
  if (!source.includes("models/avatar/")) return;
  const { root, linear, material, primitive, surface, sphere, node, remove, lathe } = kit;
  const hoodCloth = material("traveller_hood", "#9c603b");
  const lining = material("traveller_lining", "#704a33").setDoubleSided(true);
  const leather = material("traveller_canvas", "#725740");
  const strap = material("traveller_strap", "#574633");
  const linen = material("traveller_linen", "#e0cba0");
  const ink = material("traveller_seam", "#8b7655");
  const brass = material("traveller_brass", "#c8aa67");
  const slate = linear("#44434b"),
    sleeve = linear("#9a9580"),
    boot = linear("#756d58");
  function box(name, x, y, z, mat) {
    return sphere(name, x, y, z, mat, (p) =>
      p.map((v, k) => {
        const r = [x, y, z][k];
        return Math.sign(v) * Math.pow(Math.abs(v / r), 0.58) * r;
      }),
    );
  }
  const meshes = [...root.listNodes()].filter((n) => n.getMesh());
  for (const n of meshes) {
    const name = n.getName(),
      prims = n.getMesh().listPrimitives();
    if (source.includes("bottom-") || name === "chest")
      for (const p of prims)
        p.getMaterial()?.setBaseColorFactor([...(name === "chest" ? sleeve : slate), 1]);
    if (source.includes("top-") && /^(arm|cuff)$/.test(name))
      for (const p of prims) p.getMaterial()?.setBaseColorFactor([...sleeve, 1]);
    if (source.includes("shoes-boots") && /upper|sole|cuff/.test(name))
      for (const p of prims) p.getMaterial()?.setBaseColorFactor([...boot, 1]);
  }
  // The opening is a real hole through an ellipsoidal hood, with an inner lining.
  if (source.includes("hair-bob")) {
    const head = root.listNodes().find((n) => n.getName() === "head_geo");
    const hair = root.listNodes().find((n) => n.getName() === "hair");
    for (const child of [...hair.listChildren()])
      if (/back_lock|side_lock|temple_lock|crown_swoop/.test(child.getName())) remove(child);
    const shell = (rx, ry, rz, mat, name) =>
      surface(
        name,
        48,
        24,
        (u, v) => {
          const a = u * Math.PI * 2,
            t = 0.98 + (Math.PI - 0.98) * v;
          return [
            Math.sin(a) * Math.sin(t) * rx,
            0.202 + Math.cos(a) * Math.sin(t) * ry,
            -0.018 + Math.cos(t) * rz,
          ];
        },
        mat,
      );
    node(head, "traveller_hood", shell(0.235, 0.255, 0.23, hoodCloth, "tailored_hood"));
    node(head, "hood_lining", shell(0.224, 0.244, 0.219, lining, "hood_lining"));
    // Narrow bound edge follows the face opening instead of covering the face.
    const positions = [],
      normals = [],
      indices = [];
    const rx = Math.sin(0.98) * 0.23,
      ry = Math.sin(0.98) * 0.25,
      z = -0.018 + Math.cos(0.98) * 0.225;
    for (let j = 0; j <= 48; j++)
      for (let i = 0; i <= 10; i++) {
        const a = (j / 48) * Math.PI * 2,
          b = (i / 10) * Math.PI * 2;
        const nx = Math.sin(a),
          ny = Math.cos(a),
          r = 0.01;
        positions.push(
          nx * (rx + Math.cos(b) * r),
          0.202 + ny * (ry + Math.cos(b) * r),
          z + Math.sin(b) * r,
        );
        normals.push(nx * Math.cos(b), ny * Math.cos(b), Math.sin(b));
        if (j < 48 && i < 10) {
          let q = j * 11 + i;
          indices.push(q, q + 11, q + 1, q + 1, q + 11, q + 12);
        }
      }
    // Verify winding against authored normals; the same rule also handles the back half of the rim.
    for (let i = 0; i < indices.length; i += 3) {
      const [a, b, c] = indices.slice(i, i + 3),
        pa = positions.slice(a * 3, a * 3 + 3),
        pb = positions.slice(b * 3, b * 3 + 3),
        pc = positions.slice(c * 3, c * 3 + 3);
      const u = pb.map((x, k) => x - pa[k]),
        v = pc.map((x, k) => x - pa[k]);
      const normal = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
      ];
      if (normal.reduce((s, x, k) => s + x * normals[a * 3 + k], 0) < 0)
        [indices[i + 1], indices[i + 2]] = [indices[i + 2], indices[i + 1]];
    }
    node(
      head,
      "hood_bound_edge",
      primitive(
        "hood_edge",
        positions,
        normals,
        indices,
        material("traveller_hood_edge", "#bd8652"),
      ),
    );
  }
  // Pointed woven cape with colour woven into the mesh: chevrons and diamond border.
  for (const n of [...root.listNodes()])
    if (n.getName() === "poncho" && n.getMesh()) {
      const base = linear("#d49a4d"),
        red = linear("#b87543"),
        cream = linear("#edc479");
      const cape = surface(
        "woven_traveller_poncho",
        96,
        52,
        (u, v) => {
          const a = u * Math.PI * 2,
            r =
              0.067 +
              0.197 * Math.pow(Math.sin(v * Math.PI * 0.5), 0.8) +
              Math.sin(a * 6) * 0.003 * Math.sin(v * Math.PI);
          const drop = 0.2 * Math.pow(Math.abs(Math.cos(a)), 3) * Math.pow(v, 4);
          return [Math.sin(a) * r, 0.48 - 0.42 * v - drop, Math.cos(a) * r];
        },
        material("traveller_woven_cape", "#ffffff").setDoubleSided(true),
        (u, v) => {
          const a = u * Math.PI * 2,
            chevron = 0.34 + 0.18 * Math.abs(Math.cos(a));
          const motif = Math.abs(((u * 12) % 1) - 0.5) * 2 + Math.abs((v - 0.77) / 0.065);
          let c = base;
          if (Math.abs(v - chevron) < 0.023 || v > 0.94) c = red;
          if ((v > 0.89 && v < 0.914) || motif < 0.78) c = cream;
          const weave =
            1 - 0.018 * Math.pow(Math.sin(u * 240 * Math.PI) * Math.sin(v * 150 * Math.PI), 2);
          return c.map((x) => x * weave);
        },
      );
      const paint = [];
      for (let j = 0; j <= 52; j++) for (let i = 0; i <= 96; i++) paint.push(i / 96, j / 52);
      cape
        .listPrimitives()[0]
        .setAttribute(
          "_ATHENA_WEAVE",
          document
            .createAccessor("cape_paint")
            .setType("VEC2")
            .setArray(new Float32Array(paint))
            .setBuffer(root.listBuffers()[0]),
        );
      n.setMesh(cape);
    }
  // The old circular binding and pin belong to the former cropped cape.
  if (source.includes("top-poncho"))
    for (const n of [...root.listNodes()])
      if (n.getMesh() && /^(band|pin)$/.test(n.getName())) remove(n);
  if (source.includes("shoes-boots"))
    for (const n of [...root.listNodes()])
      if (n.getName() === "upper" && n.getMesh()) {
        n.setMesh(
          surface(
            "round_traveller_boot",
            32,
            20,
            (u, v) => {
              const a = u * Math.PI * 2,
                t = Math.min(1, Math.max(0, (v - 0.1) / 0.75));
              return [
                Math.sin(a) * (0.059 - 0.009 * t),
                -0.045 + v * 0.13,
                Math.cos(a) * (0.098 - 0.044 * t) + 0.025 * (1 - t),
              ];
            },
            material("traveller_boot", "#756d58"),
          ),
        ).setTranslation([0, 0, 0]);
        node(
          n.getParentNode(),
          "boot_fastening",
          box("leather_fastening", 0.042, 0.012, 0.006, strap),
          [0, 0.035, 0.057],
        );
      }
  if (!source.includes("acc-scarf-satchel")) return;
  for (const n of [...root.listNodes()]) if (/^acc_(scarf|satchel)$/.test(n.getName())) remove(n);
  const torso = root.listNodes().find((n) => n.getName() === "torso");
  const pack = node(torso, "expedition_pack", null);
  node(pack, "canvas_pack", box("soft_canvas_pack", 0.195, 0.235, 0.12, leather), [0, 0.24, -0.28]);
  node(pack, "pack_flap", box("canvas_flap", 0.205, 0.075, 0.132, hoodCloth), [0, 0.39, -0.285]);
  node(pack, "pack_pocket", box("front_pocket", 0.12, 0.075, 0.035, leather), [0, 0.17, -0.405]);
  node(pack, "pocket_clasp", box("brass_clasp", 0.013, 0.018, 0.006, brass), [0, 0.2, -0.443]);
  for (const x of [-0.13, 0.13]) {
    node(pack, "backpack_binding", box("pack_binding", 0.014, 0.22, 0.008, strap), [
      x,
      0.24,
      -0.405,
    ]);
    // Shoulder straps sit outside the cape and follow its drape.
    node(
      torso,
      "shoulder_strap",
      surface(
        "curved_shoulder_strap",
        8,
        28,
        (u, v) => {
          const t = 0.1 + v * 0.7,
            r = 0.067 + 0.197 * Math.pow(Math.sin(t * Math.PI * 0.5), 0.8);
          const xx = x + (u - 0.5) * 0.035,
            a = Math.asin(Math.max(-1, Math.min(1, xx / r)));
          const rr = r + Math.sin(a * 6) * 0.003 * Math.sin(t * Math.PI);
          return [
            xx,
            0.48 - 0.42 * t - 0.2 * Math.pow(Math.abs(Math.cos(a)), 3) * Math.pow(t, 4),
            Math.cos(a) * rr * 0.85 + 0.014,
          ];
        },
        strap.clone().setDoubleSided(true),
      ),
    );
  }
  const roll = node(pack, "bedroll", null, [0, 0.555, -0.365]);
  node(
    roll,
    "rolled_canvas",
    surface(
      "canvas_bedroll",
      40,
      16,
      (u, v) => {
        const a = u * Math.PI * 2,
          r = 0.085 * (0.94 + 0.06 * Math.sin(v * Math.PI));
        return [(v - 0.5) * 0.54, Math.sin(a) * r, Math.cos(a) * r];
      },
      linen,
    ),
  );
  for (const sign of [-1, 1]) {
    node(roll, "bedroll_end", sphere("rolled_end", 0.008, 0.08, 0.08, linen), [sign * 0.272, 0, 0]);
    const positions = [],
      normals = [],
      indices = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 4.6,
        r = 0.009 + (i / 64) * 0.064;
      for (const edge of [-1, 1]) {
        positions.push(
          sign * 0.281,
          Math.sin(a) * (r + edge * 0.0017),
          Math.cos(a) * (r + edge * 0.0017),
        );
        normals.push(sign, 0, 0);
      }
      if (i < 64) {
        let q = i * 2;
        indices.push(q, q + 1, q + 2, q + 1, q + 3, q + 2);
      }
    }
    const spiral = primitive(
      "rolled_fabric_spiral",
      positions,
      normals,
      indices,
      ink.clone().setDoubleSided(true),
    );
    node(roll, "bedroll_spiral", spiral);
  }
  for (const x of [-0.16, 0.16])
    node(
      roll,
      "bedroll_tie",
      surface(
        "bedroll_tie",
        32,
        4,
        (u, v) => {
          const a = u * Math.PI * 2;
          return [x + (v - 0.5) * 0.024, Math.sin(a) * 0.087, Math.cos(a) * 0.087];
        },
        strap.clone().setDoubleSided(true),
      ),
    );
  for (let i = 0; i < 2; i++) {
    const scroll = node(
      pack,
      "map_scroll",
      lathe(
        "rolled_map",
        [
          [0.022, -0.14],
          [0.024, -0.13],
          [0.024, 0.13],
          [0.022, 0.14],
        ],
        linen,
      ),
      [-0.225 - i * 0.035, 0.48 + i * 0.065, -0.3],
    );
    scroll.setRotation([0, 0, 0.12 + i * 0.04, Math.sqrt(1 - Math.pow(0.12 + i * 0.04, 2))]);
    node(scroll, "map_opening", sphere("map_opening", 0.017, 0.002, 0.017, ink), [0, 0.142, 0]);
  }
  // A folded field journal peeks out of the side pocket.
  node(
    pack,
    "field_journal",
    box("journal_cover", 0.045, 0.09, 0.025, material("traveller_journal", "#633f32")),
    [0.205, 0.37, -0.29],
  );
  node(
    pack,
    "journal_pages",
    box("journal_pages", 0.039, 0.079, 0.026, linen),
    [0.208, 0.37, -0.292],
  );
  node(
    torso,
    "warm_cowl",
    surface(
      "folded_cowl",
      48,
      18,
      (u, v) => {
        const a = u * Math.PI * 2,
          r = 0.098 + 0.043 * Math.sin(v * Math.PI);
        return [Math.sin(a) * r, 0.515 - v * 0.07 - Math.cos(a) * 0.035, Math.cos(a) * r * 0.9];
      },
      material("traveller_cowl", "#b67c38").setDoubleSided(true),
    ),
  );
  const left = root.listNodes().find((n) => n.getName() === "hand_l"),
    right = root.listNodes().find((n) => n.getName() === "hand_r");
  if (left) {
    const lantern = node(left, "traveller_lantern", null, [0, -0.15, 0.015]);
    const metal = material("traveller_lantern_metal", "#514539");
    node(
      lantern,
      "lamp_base",
      lathe(
        "lamp_base",
        [
          [0.035, -0.063],
          [0.051, -0.055],
          [0.048, -0.041],
        ],
        metal,
      ),
    );
    node(
      lantern,
      "lamp_cap",
      lathe(
        "lamp_cap",
        [
          [0.046, 0.043],
          [0.052, 0.052],
          [0.025, 0.069],
          [0.018, 0.075],
        ],
        metal,
      ),
    );
    const light = material("traveller_lantern_light", "#ffd98b").setEmissiveFactor([
      0.22, 0.12, 0.025,
    ]);
    node(lantern, "lamp_light", sphere("warm_lamp", 0.032, 0.047, 0.032, light));
    for (const sign of [-1, 1])
      node(
        lantern,
        "lamp_guard",
        lathe(
          "lamp_guard",
          [
            [0.005, -0.047],
            [0.005, 0.053],
          ],
          metal,
        ),
        [sign * 0.04, 0, 0],
      );
    node(
      lantern,
      "lamp_handle",
      surface(
        "lamp_handle",
        24,
        8,
        (u, v) => {
          const a = u * Math.PI,
            b = v * Math.PI * 2;
          return [
            Math.cos(a) * (0.031 + Math.cos(b) * 0.005),
            0.076 + Math.sin(a) * (0.034 + Math.cos(b) * 0.005),
            Math.sin(b) * 0.005,
          ];
        },
        metal,
      ),
    );
  }
  if (right) {
    const book = node(right, "traveller_book", null, [0, -0.075, 0.02]);
    const green = material("traveller_book_cover", "#62634c");
    for (const x of [-0.021, 0.021])
      node(book, "book_cover", box("book_cover", 0.004, 0.105, 0.065, green), [x, 0, 0]);
    node(book, "book_pages", box("book_pages", 0.017, 0.098, 0.059, linen));
    node(book, "book_spine", box("book_spine", 0.023, 0.105, 0.006, green), [0, 0, -0.062]);
  }
}
