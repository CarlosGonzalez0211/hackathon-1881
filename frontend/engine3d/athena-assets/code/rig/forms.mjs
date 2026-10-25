/**
 * Sculpted forms for the people: soft egg heads with almond eyes, torso masses, limbs,
 * mitten hands and boots. Every builder works in head units (`hh` = chin to crown = 1) and
 * returns a BufferGeometry with position and normal; `Figure.add` scales it to metres, paints
 * vertex colours and tags `athena_style` / `athena_weave`.
 */
import { STYLE } from "./skeleton.mjs";

const TAU = Math.PI * 2;
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1)));
  return t * t * (3 - 2 * t);
};

// ---------------------------------------------------------------------------- figure
/**
 * Collects the meshes of one figure under the nodes of its rig. `add` takes geometry in head
 * units, relative to the node (or to `origin`, a point in head units of the node's parent
 * space, when given).
 */
export class Figure {
  constructor(THREE, T, rig, { suffix = "", weave = true, collapse = false, detail = 1 } = {}) {
    /** multiplies the polygonised budgets (heads, hair, feet): the study trio is lean */
    this.detail = detail;
    this.weave = weave;
    this.THREE = THREE;
    this.T = T;
    this.rig = rig;
    this.plan = rig.plan;
    this.suffix = suffix;
    this.materials = {
      skin: T.material("skin_tone", "#FFFFFF", { vertexColors: true, roughness: 0.85 }),
      hair: T.material("hair_strand", "#FFFFFF", { vertexColors: true, roughness: 0.8 }),
      eye: T.material("character_eye_ink", "#FFFFFF", { vertexColors: true, roughness: 0.4 }),
      top: T.material("top_cloth", "#FFFFFF", { vertexColors: true, roughness: 0.9 }),
      bottom: T.material("bottom_cloth", "#FFFFFF", { vertexColors: true, roughness: 0.9 }),
      shoes: T.material("shoe_leather", "#FFFFFF", { vertexColors: true, roughness: 0.8 }),
      gear: T.material("gear_cloth", "#FFFFFF", { vertexColors: true, roughness: 0.8 }),
      gold: T.material("gold_trim", "#FFFFFF", { vertexColors: true, roughness: 0.45 }),
      fur: T.material("fur_coat", "#FFFFFF", { vertexColors: true, roughness: 0.95 }),
    };
    if (collapse) {
      // NPC files: the runtime bakes plain materials into vertex colours anyway (and every
      // shading difference is carried by `athena_style`), so one material per file saves a
      // primitive for every bone that carries both skin and cloth.
      const surface = T.material("character_surface", "#FFFFFF", {
        vertexColors: true,
        roughness: 0.85,
      });
      for (const key of Object.keys(this.materials)) this.materials[key] = surface;
    }
    this.count = 0;
    this.meshes = [];
    this.groups = new Map();
    this.used = new Set(Object.values(rig.nodes).map((node) => node.name));
    /** when set, only meshes with these `part` tags are added (avatar part GLBs) */
    this.only = null;
  }

  /** First free name: `name`, `name_1`, `name_2` (node names are unique per model). */
  unique(base) {
    let name = base;
    for (let i = 1; this.used.has(name); i++) name = `${base}_${i}`;
    this.used.add(name);
    return name;
  }

  /** Name of a rig node (suffixed in the trio). */
  node(base) {
    return this.rig.nodes[base];
  }

  /**
   * @param {string} nodeBase       base name of the parent node (`torso`, `knee_l`, ...)
   * @param {string} name           mesh name (unique per figure; suffixed automatically)
   * @param {import("three").BufferGeometry} geometry head units, relative to `origin`
   * @param {{ part: string, style?: number, material?: string, color?: any, origin?: number[],
   *   group?: string, weave?: boolean, keep?: boolean }} spec
   */
  add(nodeBase, name, geometry, spec) {
    const { THREE, plan } = this;
    const hh = plan.hh;
    if (this.only && !this.only.has(spec.part)) return null;
    let g = geometry;
    if (!spec.keep) g = geometry.clone();
    if (spec.origin) g.translate(-spec.origin[0], -spec.origin[1], -spec.origin[2]);
    // paint and tag in head units, then scale to metres
    if (spec.color !== undefined || !g.attributes.color) paint(THREE, g, spec.color ?? "#FFFFFF");
    tag(THREE, g, spec.style ?? STYLE.cloth, spec.weave, this.weave);
    g.scale(hh, hh, hh);
    g.deleteAttribute("uv");
    if (g.index === null) g.setIndex([...Array(g.attributes.position.count).keys()]);
    const mesh = new THREE.Mesh(g, this.materials[spec.material ?? "top"]);
    mesh.name = this.unique(this.suffix ? `${name}_${this.suffix}` : name);
    mesh.userData.part = spec.part;
    let parent = this.node(nodeBase);
    if (spec.group) {
      const key = `${parent.uuid}|${spec.group}`;
      let group = this.groups.get(key);
      if (!group) {
        group = new THREE.Group();
        group.userData.generated = true;
        group.name = this.unique(this.suffix ? `${spec.group}_${this.suffix}` : spec.group);
        parent.add(group);
        this.groups.set(key, group);
      }
      parent = group;
    }
    parent.add(mesh);
    this.meshes.push(mesh);
    this.count += g.index.count / 3;
    return mesh;
  }

  /**
   * z (metres) of the rearmost garment or skin of the torso at the shoulder line: where the
   * cape's `chest` node sits, and what backpacks and tanks must stay behind.
   */
  torsoBack() {
    const { THREE } = this;
    this.rig.root.updateMatrixWorld(true);
    const chest = this.node("chest").getWorldPosition(new THREE.Vector3());
    const v = new THREE.Vector3();
    let back = Infinity;
    for (const mesh of this.meshes) {
      if (mesh.userData.part !== "top" && mesh.userData.part !== "base") continue;
      let node = mesh.parent;
      let onTorso = false;
      let excluded = false;
      while (node) {
        if (node.name === "torso") onTorso = true;
        if (/^(arm|elbow|hand|head|face|mantle|cowl)/.test(node.name)) excluded = true;
        node = node.parent;
      }
      if (!onTorso || excluded) continue;
      const position = mesh.geometry.attributes.position;
      for (let i = 0; i < position.count; i++) {
        v.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
        if (
          Math.abs(v.y - chest.y) < 0.06 * this.plan.height &&
          Math.abs(v.x) < 0.1 * this.plan.height
        )
          back = Math.min(back, v.z);
      }
    }
    return Number.isFinite(back) ? back : this.plan.backZ;
  }

  /**
   * How far (head units, <= 0) a pack that normally fronts at z = -0.25 must move back so that it
   * sits behind the cape (which hangs 1.4 % of the height behind the garments).
   */
  packShift() {
    const cape = (this.torsoBack() - 0.014 * this.plan.height) / this.plan.hh;
    return Math.min(0, cape - 0.08 + 0.25);
  }

  /** A mesh with its own (non-merging) emissive material, e.g. `lamp_light`. */
  addGlow(nodeBase, name, geometry, material, spec) {
    const mesh = this.add(nodeBase, name, geometry, { ...spec, material: "gear" });
    if (!mesh) return null;
    mesh.material = material;
    return mesh;
  }
}

// ---------------------------------------------------------------------------- painting
/**
 * Vertex colours. `color` is a hex string, an array of hex strings [bottom, top] (a vertical
 * gradient over the geometry), or `(position, normal) => hex | THREE.Color`.
 */
export function paint(THREE, geometry, color) {
  const count = geometry.attributes.position.count;
  const out = new Float32Array(count * 3);
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  const c = new THREE.Color();
  let fn;
  if (typeof color === "function") fn = color;
  else if (Array.isArray(color)) {
    geometry.computeBoundingBox();
    const lo = geometry.boundingBox.min.y;
    const hi = geometry.boundingBox.max.y;
    const a = new THREE.Color(color[0]);
    const b = new THREE.Color(color[1]);
    const mid = new THREE.Color();
    fn = (point) => mid.copy(a).lerp(b, smooth(0, 1, (point.y - lo) / (hi - lo || 1)));
  } else {
    const flat = new THREE.Color(color);
    fn = () => flat;
  }
  for (let i = 0; i < count; i++) {
    p.fromBufferAttribute(position, i);
    if (normal) n.fromBufferAttribute(normal, i);
    const value = fn(p, n, i);
    c.set(value);
    out.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(out, 3));
  return geometry;
}

/** `athena_style` per vertex and `athena_weave` (uv in the poncho, -1 elsewhere). */
export function tag(THREE, geometry, style, weave, withWeave = true) {
  const count = geometry.attributes.position.count;
  geometry.setAttribute(
    "athena_style",
    new THREE.Float32BufferAttribute(new Float32Array(count).fill(style), 1),
  );
  const values = new Float32Array(count * 2).fill(-1);
  if (weave) {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    const p = geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const u = Math.atan2(p.getX(i), p.getZ(i)) / TAU + 0.5;
      // 0 at the neck (top) to 1 at the hem (bottom)
      const v = (box.max.y - p.getY(i)) / (box.max.y - box.min.y || 1);
      values.set([u, v], i * 2);
    }
  }
  if (withWeave) geometry.setAttribute("athena_weave", new THREE.Float32BufferAttribute(values, 2));
  return geometry;
}

// ---------------------------------------------------------------------------- shapes
/** Profile lathe with an elliptical cross-section (`rx`, `rz` scale the profile radius). */
export function revolve(
  T,
  profile,
  { rx = 1, rz = 1, segments = 14, divisions = 2, scallop } = {},
) {
  const g = T.lathe(profile, { segments, divisions, scallop });
  g.scale(rx, 1, rz);
  g.deleteAttribute("uv");
  return T.smoothNormals(g, 60);
}

/** Offset a profile outwards by `d` (cloth shells hugging a limb). */
export const grow = (profile, d) => profile.map(([r, y, c]) => (r > 0 ? [r + d, y, c] : [r, y, c]));

/**
 * Closed cloth shell from an outside profile (bottom to top): the inner wall follows at
 * `thickness`, joined by a crisp lip at the hem and at the top opening.
 */
export function shell(T, outside, thickness, options = {}) {
  const inner = outside
    .map(([r, y]) => [Math.max(0.004, r - thickness), y + (options.liftInner ?? 0)])
    .reverse();
  const first = outside[0];
  const last = outside[outside.length - 1];
  const profile = [
    [first[0], first[1], 1],
    ...outside.slice(1, -1),
    [last[0], last[1], 1],
    [inner[0][0], inner[0][1], 1],
    ...inner.slice(1, -1),
    [inner[inner.length - 1][0], inner[inner.length - 1][1], 1],
  ];
  return revolve(T, profile, options);
}

export function merge(T, list) {
  const parts = list.filter(Boolean).map((g) => {
    const clone = g.index ? g : g;
    if (clone.attributes.uv) clone.deleteAttribute("uv");
    return clone;
  });
  return T.merge(parts.map((g) => (g.index ? g : g)));
}

/** Rigid transform helper: rotate (euler) then translate. Returns the same geometry. */
export function place(
  THREE,
  geometry,
  { at = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1] } = {},
) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...at),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),
    new THREE.Vector3(...scale),
  );
  geometry.applyMatrix4(m);
  return geometry;
}

/** Tube along points (Catmull-Rom) with a radius profile; used for locks, sweeps, trims. */
export function tube(T, THREE, points, radius, { tubular = 8, radial = 5, caps = "round" } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const g = T.sweep(curve, {
    radius: typeof radius === "function" ? radius : () => radius,
    tubular,
    radial,
    caps,
  });
  g.deleteAttribute("uv");
  return g;
}

/** Closed ring (torus-like) lying flat: radius `r`, tube radius `t`, around +Y. */
export function ring(THREE, r, t, { tubular = 16, radial = 5 } = {}) {
  const g = new THREE.TorusGeometry(r, t, radial, tubular);
  g.rotateX(Math.PI / 2);
  g.deleteAttribute("uv");
  return g;
}

export function ellipsoid(THREE, [rx, ry, rz], { w = 12, h = 8 } = {}) {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(rx, ry, rz);
  g.deleteAttribute("uv");
  return g;
}

/** Rounded box (cheap): `segments` 1 gives ~108 triangles. */
export function roundBox(THREE, [w, h, d], radius = 0.03, segments = 1) {
  const g = new THREE.BoxGeometry(w, h, d, segments * 2, segments * 2, segments * 2);
  const p = g.attributes.position;
  const half = [w / 2 - radius, h / 2 - radius, d / 2 - radius];
  const v = new THREE.Vector3();
  const inner = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    inner.set(
      Math.max(-half[0], Math.min(half[0], v.x)),
      Math.max(-half[1], Math.min(half[1], v.y)),
      Math.max(-half[2], Math.min(half[2], v.z)),
    );
    const dir = v.clone().sub(inner);
    if (dir.lengthSq() > 1e-10) dir.normalize().multiplyScalar(radius);
    p.setXYZ(i, inner.x + dir.x, inner.y + dir.y, inner.z + dir.z);
  }
  g.deleteAttribute("uv");
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------- sdf helpers
export const offset = (node, d) => {
  const grown = (x, y, z) => node(x, y, z) - d;
  return Object.assign(grown, {
    bounds: [node.bounds[0].map((v) => v - d), node.bounds[1].map((v) => v + d)],
  });
};

/** Round cone: capsule whose radius runs from `ra` at `a` to `rb` at `b`. */
export function taperCapsule([ax, ay, az], [bx, by, bz], ra, rb) {
  const dx = bx - ax;
  const dy = by - ay;
  const dz = bz - az;
  const l2 = dx * dx + dy * dy + dz * dz || 1;
  const fn = (x, y, z) => {
    const t = Math.min(1, Math.max(0, ((x - ax) * dx + (y - ay) * dy + (z - az) * dz) / l2));
    return Math.hypot(x - ax - dx * t, y - ay - dy * t, z - az - dz * t) - (ra + (rb - ra) * t);
  };
  const r = Math.max(ra, rb);
  return Object.assign(fn, {
    bounds: [
      [Math.min(ax, bx) - r, Math.min(ay, by) - r, Math.min(az, bz) - r],
      [Math.max(ax, bx) + r, Math.max(ay, by) + r, Math.max(az, bz) + r],
    ],
  });
}

const polyCache = new Map();
/** Polygonise once per key (heads and boots repeat across the cast); returns a clone. */
export async function cached(key, make) {
  if (!polyCache.has(key)) polyCache.set(key, await make());
  return polyCache.get(key).clone();
}

// ---------------------------------------------------------------------------- head
/** Head SDF in head units; the node origin is the base of the neck, the chin at y = 0.12. */
export function headField(T, { kid = false, jaw = 1, cheek = 1 } = {}) {
  const { sdf } = T;
  const c = 0.12;
  const skull = sdf.ellipsoid([0, c + 0.57, -0.01], [0.44, 0.44, 0.45]);
  const lower = sdf.ellipsoid([0, c + 0.27, 0.04], [0.385 * jaw, 0.27, 0.35]);
  const chin = sdf.sphere([0, c + 0.07, 0.19], 0.1 * jaw);
  const cheeks = [-1, 1].map((s) =>
    sdf.sphere([s * 0.265, c + (kid ? 0.28 : 0.3), 0.3], (kid ? 0.14 : 0.115) * cheek),
  );
  const nose = sdf.sphere([0, c + 0.35, 0.43], kid ? 0.036 : 0.042);
  const ears = [-1, 1].map((s) => sdf.ellipsoid([s * 0.435, c + 0.42, -0.03], [0.05, 0.095, 0.07]));
  const neck = taperCapsule([0, -0.04, -0.01], [0, c + 0.1, 0], 0.15, 0.14);
  return sdf.smin(0.2, sdf.smin(0.12, skull, lower), chin, ...cheeks, nose, neck, ...ears);
}

/** z of the head surface at (x, y), found along +z by bisection. */
export function surfaceZ(field, x, y) {
  let lo = -0.9;
  let hi = 0.9;
  if (field(x, y, hi) < 0) return hi;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (field(x, y, mid) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function patch(
  THREE,
  field,
  centre,
  rx,
  ry,
  { tilt = 0, dome = 0.012, lift = 0.005, rings = 3, segments = 14, almond = true, colors },
) {
  const positions = [];
  const colorsOut = [];
  const indices = [];
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const point = (u, v, ring) => {
    const x = centre[0] + u * cos - v * sin;
    const y = centre[1] + u * sin + v * cos;
    const z = surfaceZ(field, x, y) + lift + dome * (1 - ring * ring);
    return [x, y, z];
  };
  const push = (p, col) => {
    positions.push(...p);
    colorsOut.push(...col);
  };
  push(point(0, 0, 0), colors(0, 0));
  for (let r = 1; r <= rings; r++)
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * TAU;
      const t = r / rings;
      const cu = Math.cos(a);
      const su = Math.sin(a);
      const shape = almond ? Math.sqrt(Math.max(0.0001, 1 - Math.pow(Math.abs(cu), 2.2))) : 1;
      const u = rx * t * cu;
      const v = ry * t * su * (almond ? shape : 1);
      push(point(u, v, t), colors(u / rx, v / ry));
      if (i < segments) {
        const b = 1 + (r - 1) * (segments + 1) + i;
        if (r === 1) indices.push(0, b + 1, b);
        else {
          const a0 = b - (segments + 1);
          indices.push(a0, b + 1, b, a0, a0 + 1, b + 1);
        }
      }
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colorsOut, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  // front-facing: normals must look towards +z
  const n = g.attributes.normal;
  let facing = 0;
  for (let i = 0; i < n.count; i++) facing += n.getZ(i);
  if (facing < 0) {
    const idx = g.index.array;
    for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
    g.computeVertexNormals();
  }
  return g;
}

/**
 * Face features in head units, in head space (the caller subtracts node origins):
 * almond eyes with two highlights, soft brows and a tiny smile.
 */
export function faceFeatures(THREE, field, { kid, eyeHex, browHex, tilt = 0.1 }) {
  const c = 0.12;
  const cy = c + 0.46 - (kid ? 0.03 : 0);
  const ex = kid ? 0.185 : 0.175;
  const rx = kid ? 0.108 : 0.098;
  const ry = kid ? 0.092 : 0.078;
  const ink = new THREE.Color("#2B2936");
  const iris = new THREE.Color(eyeHex);
  const cream = new THREE.Color("#FBF3E4");
  const tmp = new THREE.Color();
  const eyes = [];
  const lights = [];
  for (const s of [-1, 1]) {
    const centre = [s * ex, cy];
    eyes.push({
      side: s,
      geometry: patch(THREE, field, centre, rx, ry, {
        tilt: s * tilt,
        dome: 0.014,
        lift: 0.004,
        colors: (u, v) => {
          // ink on top, the iris glowing from below; the rim stays dark
          const t = smooth(-0.55, 0.35, v) * (1 - 0.35 * smooth(0.5, 1, Math.hypot(u, v)));
          tmp.copy(iris).lerp(ink, Math.min(1, 0.55 + t * 0.45));
          return [tmp.r, tmp.g, tmp.b];
        },
      }),
    });
    const small = (offX, offY, r, bump) =>
      patch(THREE, field, [centre[0] + offX, centre[1] + offY], r, r, {
        dome: 0.006,
        lift: 0.004 + bump,
        rings: 1,
        segments: 8,
        almond: false,
        colors: () => [cream.r, cream.g, cream.b],
      });
    lights.push({
      side: s,
      big: small(0.03, 0.3 * ry, 0.027, 0.012),
      small: small(-0.04, -0.4 * ry, 0.014, 0.012),
    });
  }
  // brows: soft sweeps above the eyes
  const brows = [-1, 1].map((s) => {
    const at = (u, v, lift = 0.01) => [
      s * (ex + u),
      cy + ry * 1.7 + v,
      surfaceZ(field, s * (ex + u), cy + ry * 1.7 + v) + lift,
    ];
    return {
      side: s,
      points: [at(-rx * 0.95, -0.005), at(0, 0.018), at(rx * 1.05, -0.012)],
      color: browHex,
    };
  });
  const my = c + 0.2;
  const mouthAt = (u, v) => [u, my + v, surfaceZ(field, u, my + v) + 0.008];
  const mouth = [
    mouthAt(-0.065, 0.012),
    mouthAt(-0.03, -0.006),
    mouthAt(0.03, -0.006),
    mouthAt(0.065, 0.012),
  ];
  return { eyes, lights, brows, mouth, eyeCentreY: cy, mouthY: my };
}

/** The head mesh (skin) polygonised from the field, blush painted into the vertex colours. */
export async function headGeometry(
  T,
  THREE,
  key,
  field,
  { skinHex, blushHex, kid, triangles = 480 },
) {
  const raw = await cached(`head|${key}`, async () =>
    T.polygonise(field, { size: 64, maxTriangles: triangles }),
  );
  const skin = new THREE.Color(skinHex);
  const blush = new THREE.Color(blushHex);
  const tmp = new THREE.Color();
  const c = 0.12;
  paint(THREE, raw, (p) => {
    let b = 0;
    for (const s of [-1, 1]) {
      const d = Math.hypot(
        (p.x - s * 0.265) * 1.1,
        (p.y - (c + (kid ? 0.27 : 0.3))) * 1.5,
        (p.z - 0.3) * 0.6,
      );
      b = Math.max(b, Math.exp(-d * d * 22));
    }
    // a warmer, lighter crown and a faint shadow under the chin
    tmp.copy(skin).lerp(blush, b * 0.5);
    const under = smooth(0.28, 0.12, p.y);
    tmp.multiplyScalar(1 - 0.12 * under);
    return tmp;
  });
  return raw;
}

// ---------------------------------------------------------------------------- torso
/** Soft torso mass (skin underlayer of the avatar base) in head units, torso space. */
export function torsoField(T, plan) {
  const { sdf } = T;
  const L = plan.torsoLen / plan.hh;
  const w = plan.w;
  const pelvis = sdf.ellipsoid([0, 0.1, 0], [0.275 * w, 0.27, 0.22]);
  const waist = sdf.ellipsoid([0, 0.38 * L, 0], [0.235 * w, 0.3 * L, 0.19]);
  const chest = sdf.ellipsoid([0, 0.72 * L, 0], [0.3 * w, 0.28 * L, 0.21]);
  const shoulders = [-1, 1].map((s) => sdf.sphere([s * 0.29 * w, L - 0.22, 0], 0.12));
  const neck = taperCapsule([0, L - 0.1, 0], [0, L + 0.04, 0], 0.12, 0.12);
  return sdf.smin(0.18, pelvis, waist, chest, ...shoulders, neck);
}

/**
 * Torso silhouette (outside profile bottom to top, head units, torso space) used by the
 * cloth shells: `half-width` at fractions of the torso, widened by `d`.
 */
export function torsoProfile(plan, d = 0, { hem = 0.0, top = 1 } = {}) {
  const L = plan.torsoLen / plan.hh;
  const w = plan.w;
  const pts = [
    [0.0, hem - 0.02],
    [0.255 * w, hem + 0.0],
    [0.27 * w, 0.12],
    [0.245 * w, 0.4 * L],
    [0.275 * w, 0.68 * L],
    [0.305 * w, L - 0.3],
    [0.285 * w, L - 0.13],
    [0.18 * w, L - 0.02],
    [0.125, L + 0.03 * top],
  ];
  return pts.map(([r, y], i) => (i === 0 ? [r, y] : [r + d, y]));
}

// ---------------------------------------------------------------------------- limbs
export const upperArmProfile = (plan) => {
  const ua = plan.upperArm / plan.hh;
  return [
    [0, -ua - 0.015],
    [0.056, -ua - 0.002],
    [0.07, -ua * 0.86],
    [0.086, -ua * 0.45],
    [0.092, -0.03],
    [0.08, 0.05],
    [0, 0.085],
  ];
};
export const forearmProfile = (plan) => {
  const fa = plan.forearm / plan.hh;
  return [
    [0, -fa],
    [0.052, -fa + 0.006],
    [0.062, -fa * 0.86],
    [0.084, -fa * 0.38],
    [0.08, -0.02],
    [0.06, 0.035],
    [0, 0.055],
  ];
};
export const thighProfile = (plan) => {
  const th = plan.thigh / plan.hh;
  return [
    [0, -th - 0.01],
    [0.098, -th],
    [0.116, -th * 0.84],
    [0.145, -th * 0.4],
    [0.153, -0.02],
    [0.12, 0.07],
    [0, 0.1],
  ];
};
export const calfProfile = (plan) => {
  const cf = plan.calf / plan.hh;
  return [
    [0, -cf],
    [0.062, -cf + 0.012],
    [0.07, -cf * 0.82],
    [0.1, -cf * 0.45],
    [0.105, -0.012],
    [0.088, 0.03],
    [0, 0.055],
  ];
};

/** Mitten with a thumb, origin at the wrist, pointing down. `side` -1 = left (-x). */
export function mitten(T, THREE, side, { scale = 1, lean = false } = {}) {
  const palm = revolve(
    T,
    [
      [0, -0.3],
      [0.05, -0.285],
      [0.096, -0.225],
      [0.106, -0.12],
      [0.088, -0.03],
      [0.062, 0.0],
      [0, 0.012],
    ],
    { rz: 0.62, segments: lean ? 6 : 8, divisions: 1 },
  );
  const thumb = revolve(
    T,
    [
      [0, -0.19],
      [0.026, -0.172],
      [0.04, -0.1],
      [0.044, -0.02],
      [0, 0.01],
    ],
    { segments: lean ? 4 : 6, divisions: 1 },
  );
  place(THREE, thumb, { at: [-side * 0.085, -0.045, 0.045], rot: [-0.35, 0, -side * 0.5] });
  const g = T.merge([palm, thumb]);
  g.scale(scale, scale, scale);
  return g;
}

// ---------------------------------------------------------------------------- boots
/** Foot forms (origin: centre of the sole under the ankle, +z toes). Cached per kind. */
export async function footGeometry(T, THREE, kind, { triangles = 150 } = {}) {
  const { sdf } = T;
  return cached(`foot|${kind}|${triangles}`, async () => {
    if (kind === "fins") {
      // a short foot with a long, flat paddle
      const paddle = sdf.roundBox([0, 0.03, 0.48], [0.13, 0.03, 0.4], 0.028);
      const ankle = taperCapsule([0, 0.07, -0.02], [0, 0.2, -0.02], 0.1, 0.088);
      const foot = sdf.ellipsoid([0, 0.07, 0.12], [0.1, 0.07, 0.22]);
      return T.polygonise(sdf.smin(0.05, paddle, ankle, foot), {
        size: 40,
        maxTriangles: triangles,
      });
    }
    const sole = sdf.roundBox([0, 0.05, 0.12], [0.1, 0.05, 0.28], 0.04);
    const toe = sdf.ellipsoid([0, 0.1, 0.3], [0.105, 0.085, 0.13]);
    const heel = sdf.ellipsoid([0, 0.1, -0.08], [0.095, 0.1, 0.1]);
    const shaftHeight =
      {
        boots: 0.36,
        rainboots: 0.52,
        hiking: 0.3,
        sneakers: 0.17,
        loafers: 0.14,
        clogs: 0.12,
        sandals: 0.08,
      }[kind] ?? 0.2;
    const shaftR = kind === "rainboots" ? 0.092 : 0.088;
    const shaft = taperCapsule([0, 0.1, -0.02], [0, shaftHeight, -0.02], 0.1, shaftR);
    const parts = [sole, toe, heel, shaft];
    const field = sdf.smin(0.07, ...parts);
    return T.polygonise(field, { size: 40, maxTriangles: triangles });
  });
}

// ---------------------------------------------------------------------------- consolidation
/**
 * Bake every mesh of `root` into the animated node that carries it and merge them per
 * (node, material): fewer primitives means far fewer accessors in the GLB (a figure only fits the
 * 60 KB budget this way). Glow-material meshes stay apart. The runtime merge groups the same way.
 */
export function consolidate(THREE, T, root, animated) {
  root.updateMatrixWorld(true);
  const groups = new Map();
  const meshes = [];
  root.traverse((object) => {
    if (object.isMesh) meshes.push(object);
  });
  const anchorOf = (object) => {
    let node = object.parent;
    while (node && node !== root && !animated.has(node.name)) node = node.parent;
    return node ?? root;
  };
  const inverse = new THREE.Matrix4();
  const relative = new THREE.Matrix4();
  for (const mesh of meshes) {
    if (mesh.material.emissiveIntensity > 0 && mesh.material.emissive?.getHex()) continue;
    const anchor = anchorOf(mesh);
    const key = `${anchor.uuid}|${mesh.material.name}`;
    if (!groups.has(key)) groups.set(key, { anchor, material: mesh.material, items: [] });
    groups.get(key).items.push(mesh);
  }
  for (const { anchor, material, items } of groups.values()) {
    inverse.copy(anchor.matrixWorld).invert();
    const geometries = items.map((mesh) => {
      const g = mesh.geometry.clone();
      g.applyMatrix4(relative.multiplyMatrices(inverse, mesh.matrixWorld));
      return g;
    });
    const merged = geometries.length === 1 ? geometries[0] : T.merge(geometries);
    const biggest = items.reduce((a, b) =>
      b.geometry.index.count > a.geometry.index.count ? b : a,
    );
    const mesh = new THREE.Mesh(merged, material);
    mesh.name = `${anchor.name}__${material.name}`;
    mesh.userData.part = biggest.userData.part;
    for (const item of items) item.removeFromParent();
    anchor.add(mesh);
  }
  const empty = [];
  root.traverse((object) => {
    if (object.isGroup && object.userData.generated && object.children.length === 0)
      empty.push(object);
  });
  for (const group of empty) group.removeFromParent();
}

/** Static models: bake the whole hierarchy into one mesh per material and drop the nodes. */
export function flattenStatic(THREE, T, root) {
  root.updateMatrixWorld(true);
  const groups = new Map();
  const meshes = [];
  root.traverse((object) => {
    if (object.isMesh) meshes.push(object);
  });
  const inverse = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const relative = new THREE.Matrix4();
  for (const mesh of meshes) {
    const key = mesh.material.name;
    if (!groups.has(key)) groups.set(key, { material: mesh.material, geometries: [] });
    const g = mesh.geometry.clone();
    g.applyMatrix4(relative.multiplyMatrices(inverse, mesh.matrixWorld));
    groups.get(key).geometries.push(g);
  }
  root.clear();
  for (const { material, geometries } of groups.values()) {
    const mesh = new THREE.Mesh(
      geometries.length === 1 ? geometries[0] : T.merge(geometries),
      material,
    );
    mesh.name = material.name;
    root.add(mesh);
  }
}
