/**
 * Wardrobe: hair, tops, bottoms, shoes, mantles, hats and props for the people rig. Every
 * function adds meshes to a `Figure` (rig/forms.mjs). Shapes are in head units (`hh`), colours
 * are vertex colours, and `part` tags follow the avatar part names (hair, top, bottom, shoes,
 * acc) so the same functions build the student's part GLBs and the NPC outfits.
 *
 * Garments hang from nodes that move with the body they cover: sleeves follow the arms,
 * trouser legs and skirt bells follow the legs, the tunic and the mantle follow the torso. This
 * keeps cloth out of the limbs in every clip, including the seated one.
 */
import {
  calfProfile,
  ellipsoid,
  footGeometry,
  forearmProfile,
  grow,
  revolve,
  ring,
  roundBox,
  thighProfile,
  tube,
  upperArmProfile,
} from "./forms.mjs";
import { STYLE } from "./skeleton.mjs";

const TAU = Math.PI * 2;

/** Single-walled cloth from an outside profile (the inside is never seen: hems and cuffs are open). */
const sheet = (T, outside, _thickness, options = {}) => revolve(T, outside, options);
export const GOLD = "#F2C36B";
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1)));
  return t * t * (3 - 2 * t);
};

/** Darken (factor < 1) or lighten towards warm white (factor > 1) a hex colour. */
export function shade(THREE, hex, factor) {
  const c = new THREE.Color(hex);
  if (factor <= 1) c.multiplyScalar(factor);
  else c.lerp(new THREE.Color("#FBF3E4"), Math.min(1, factor - 1));
  return `#${c.getHexString()}`;
}

/** Vertical painter in head units: darker at `from`, lighter at `to` (art rule: dark base, light top). */
export function gradient(
  THREE,
  hex,
  { low = 0.84, high = 1.06, from = 0, to = 1, trim, band = 0.05 } = {},
) {
  const dark = new THREE.Color(hex).multiplyScalar(low);
  const light = new THREE.Color(hex).lerp(new THREE.Color("#FBF3E4"), Math.max(0, high - 1));
  const edge = trim ? new THREE.Color(trim) : null;
  const out = new THREE.Color();
  return (p) => {
    out.copy(dark).lerp(light, smooth(from, to, p.y));
    if (edge) out.lerp(edge, 1 - smooth(from, from + band, p.y));
    return out;
  };
}

// ---------------------------------------------------------------------------- hair
const smoothIntersect = (k, a, b) => {
  const fn = (x, y, z) => {
    const d1 = a(x, y, z);
    const d2 = b(x, y, z);
    const h = Math.max(k - Math.abs(d1 - d2), 0) / k;
    return Math.max(d1, d2) + h * h * k * 0.25;
  };
  return Object.assign(fn, { bounds: a.bounds });
};
const chain = (sdf, points, radii) => {
  const parts = [];
  for (let i = 0; i < points.length - 1; i++)
    parts.push(sdf.capsule(points[i], points[i + 1], (radii[i] + radii[i + 1]) / 2));
  return sdf.smin(0.06, ...parts, ...points.map((p, i) => sdf.sphere(p, radii[i])));
};

/** Hair volumes (SDF, polygonised) plus a few swept locks, in head space. */
export async function addHair(F, style, hex) {
  const { THREE, T } = F;
  if (style === "bald") return;
  const { sdf } = T;
  const dark = new THREE.Color(hex).multiplyScalar(0.7);
  const mid = new THREE.Color(hex);
  const light = new THREE.Color(hex).lerp(new THREE.Color("#FBF3E4"), 0.16);
  const skull = sdf.ellipsoid([0, 0.7, -0.03], [0.485, 0.465, 0.5]);
  const faceCut = sdf.ellipsoid([0, 0.46, 0.5], [0.37, 0.46, 0.36]);
  const lower =
    (y, k = 0.05) =>
    (field) =>
      smoothIntersect(k, field, sdf.halfspace([0, -1, 0], -y));
  const bang = (w, y, depth = 0.1) => sdf.ellipsoid([0, y, 0.4], [w, depth, 0.13]);
  const cap = (extra = []) => sdf.subtract(sdf.smin(0.06, skull, ...extra), faceCut, 0.07);
  const sideCut = sdf.ellipsoid([0, 0.46, 0.5], [0.3, 0.4, 0.36]);
  const volumes = {
    crop: () => lower(0.66)(cap([bang(0.31, 0.9, 0.075)])),
    swept: () =>
      lower(0.64)(
        sdf.subtract(
          sdf.smin(0.08, skull, sdf.ellipsoid([0.1, 1.0, 0.2], [0.38, 0.2, 0.34])),
          sdf.translate(faceCut, [-0.04, -0.02, 0]),
          0.07,
        ),
      ),
    bob: () =>
      lower(
        0.3,
        0.08,
      )(
        sdf.subtract(
          sdf.smin(
            0.1,
            skull,
            sdf.ellipsoid([-0.38, 0.5, -0.06], [0.15, 0.3, 0.36]),
            sdf.ellipsoid([0.38, 0.5, -0.06], [0.15, 0.3, 0.36]),
            sdf.ellipsoid([0, 0.5, -0.32], [0.42, 0.34, 0.2]),
            bang(0.34, 0.86, 0.1),
          ),
          sideCut,
          0.06,
        ),
      ),
    long: () =>
      lower(
        -0.12,
        0.1,
      )(
        sdf.subtract(
          sdf.smin(
            0.1,
            skull,
            sdf.ellipsoid([-0.4, 0.3, -0.08], [0.13, 0.62, 0.3]),
            sdf.ellipsoid([0.4, 0.3, -0.08], [0.13, 0.62, 0.3]),
            sdf.ellipsoid([0, 0.25, -0.34], [0.4, 0.68, 0.18]),
            bang(0.34, 0.86, 0.1),
          ),
          sideCut,
          0.06,
        ),
      ),
    ponytail: () =>
      sdf.smin(
        0.08,
        lower(0.64)(cap([bang(0.32, 0.88, 0.08)])),
        chain(
          sdf,
          [
            [0, 0.98, -0.42],
            [0, 0.78, -0.72],
            [0.03, 0.3, -0.8],
            [0.0, -0.18, -0.7],
          ],
          [0.12, 0.13, 0.11, 0.05],
        ),
      ),
    curls: () => {
      const spots = [
        [0, 1.12, 0],
        [0.25, 1.06, 0.2],
        [-0.25, 1.06, 0.2],
        [0.42, 0.95, -0.02],
        [-0.42, 0.95, -0.02],
        [0.3, 1.04, -0.32],
        [-0.3, 1.04, -0.32],
        [0, 1.0, -0.46],
        [0.46, 0.75, -0.2],
        [-0.46, 0.75, -0.2],
        [0.18, 0.86, -0.46],
        [-0.18, 0.86, -0.46],
        [0, 1.1, 0.26],
      ];
      return sdf.subtract(
        sdf.smin(0.05, lower(0.66)(skull), ...spots.map((p) => sdf.sphere(p, 0.19))),
        faceCut,
        0.05,
      );
    },
    braids: () =>
      sdf.smin(
        0.05,
        lower(0.62)(cap([bang(0.3, 0.9, 0.075)])),
        chain(
          sdf,
          [
            [-0.46, 0.6, -0.06],
            [-0.5, 0.35, -0.04],
            [-0.48, 0.05, 0],
            [-0.46, -0.2, 0],
          ],
          [0.1, 0.085, 0.075, 0.06],
        ),
        chain(
          sdf,
          [
            [0.46, 0.6, -0.06],
            [0.5, 0.35, -0.04],
            [0.48, 0.05, 0],
            [0.46, -0.2, 0],
          ],
          [0.1, 0.085, 0.075, 0.06],
        ),
      ),
    bun: () =>
      sdf.smin(0.08, lower(0.64)(cap([bang(0.32, 0.88, 0.08)])), sdf.sphere([0, 1.18, -0.26], 0.2)),
  }[style];
  const geometry = await T.polygonise(volumes(), {
    size: style === "long" || style === "ponytail" ? 56 : 48,
    maxTriangles: Math.round((style === "curls" ? 560 : 420) * F.detail),
  });
  const out = new THREE.Color();
  F.add("hair", "hair_cap", geometry, {
    part: "hair",
    style: STYLE.hair,
    material: "hair",
    keep: true,
    color: (p, n) => {
      // strands flow from the crown: bands around the head axis, darker at the roots
      const a = Math.atan2(p.x, p.z + 0.1);
      const band = 0.5 + 0.5 * Math.sin(a * 11 + p.y * 7);
      out.copy(dark).lerp(mid, smooth(0.2, 1.0, p.y + 0.2 * band));
      out.lerp(light, smooth(0.4, 1.0, n.y) * (0.25 + 0.45 * band) * smooth(0.8, 1.1, p.y));
      return out;
    },
  });
  const lockColor = `#${light.getHexString()}`;
  const lock = (name, pts, r0, r1) =>
    F.add(
      "hair",
      name,
      tube(T, THREE, pts, (t) => r0 + (r1 - r0) * t, { tubular: 6, radial: 4 }),
      { part: "hair", style: STYLE.hair, material: "hair", color: lockColor },
    );
  if (style === "swept")
    lock(
      "swoop",
      [
        [-0.1, 1.06, 0.3],
        [0.1, 1.15, 0.36],
        [0.34, 1.12, 0.32],
        [0.46, 1.0, 0.2],
      ],
      0.09,
      0.02,
    );
  if (style === "crop")
    lock(
      "cowlick",
      [
        [0.0, 1.1, 0.1],
        [0.06, 1.2, 0.18],
        [0.16, 1.24, 0.22],
      ],
      0.06,
      0.015,
    );
  if (style === "ponytail")
    F.add("hair", "hair_tie", ellipsoid(THREE, [0.1, 0.07, 0.1]).translate(0, 0.95, -0.45), {
      part: "hair",
      style: STYLE.cloth,
      material: "gold",
      color: GOLD,
    });
  if (style === "braids")
    for (const s of [-1, 1])
      F.add(
        "hair",
        `braid_tie_${s}`,
        ellipsoid(THREE, [0.075, 0.05, 0.075]).translate(s * 0.46, -0.2, 0),
        { part: "hair", style: STYLE.cloth, material: "gold", color: "#E99A8E" },
      );
  if (style === "bun")
    F.add(
      "hair",
      "bun_band",
      ring(THREE, 0.17, 0.028, { tubular: 14, radial: 3 }).translate(0, 1.08, -0.26),
      { part: "hair", style: STYLE.cloth, material: "gold", color: GOLD },
    );
}

// ---------------------------------------------------------------------------- tops
const TOP_TRAITS = {
  poncho: { sleeves: "long", hem: 0.02, fat: 0.014 },
  tee: { sleeves: "short", hem: 0.0, fat: 0.016 },
  stripe: { sleeves: "long", hem: 0.0, fat: 0.016 },
  hoodie: { sleeves: "long", hem: -0.08, fat: 0.034, flare: 0.02 },
  jacket: { sleeves: "long", hem: -0.06, fat: 0.026, flare: 0.03 },
  raincoat: { sleeves: "long", hem: -0.42, fat: 0.04, flare: 0.13 },
  cardigan: { sleeves: "long", hem: -0.14, fat: 0.03, flare: 0.04 },
  vest: { sleeves: "long", hem: -0.04, fat: 0.026, flare: 0.02 },
  labcoat: { sleeves: "long", hem: -0.5, fat: 0.034, flare: 0.1 },
  wetsuit: { sleeves: "long", hem: -0.02, fat: 0.012 },
};

function tunicProfile(plan, { hem, fat, flare = 0 }) {
  const L = plan.torsoLen / plan.hh;
  const w = plan.w;
  const pts = [[0.262 * w + fat + flare, hem]];
  if (hem < -0.1) pts.push([0.262 * w + fat + flare * 0.45, hem * 0.5]);
  pts.push(
    [0.268 * w + fat, 0.1],
    [0.246 * w + fat, 0.4 * L],
    [0.276 * w + fat, 0.68 * L],
    [0.306 * w + fat, L - 0.3],
    [0.286 * w + fat, L - 0.13],
    [0.19 * w + fat * 0.5, L - 0.02],
    [0.138, L + 0.03],
  );
  return pts;
}

/**
 * Adds the torso garment, sleeves and details. `top = { style, color, color2?, trim? }`.
 * Returns the sleeve mode so callers can decide which skin to keep.
 */
export function addTop(F, top) {
  const { THREE, T, plan } = F;
  const L = plan.torsoLen / plan.hh;
  const { style, color: hex } = top;
  const hex2 = top.color2 ?? shade(THREE, hex, 1.25);
  const traits = TOP_TRAITS[style] ?? TOP_TRAITS.tee;
  const { hem, fat, flare = 0 } = traits;
  const add = (node, name, geometry, o = {}) =>
    F.add(node, name, geometry, {
      part: "top",
      material: "top",
      style: STYLE.cloth,
      group: "garment",
      ...o,
    });
  const paintBody = (c, o) => gradient(THREE, c, { from: hem, to: L, low: 0.82, high: 1.06, ...o });

  if (style !== "poncho") {
    const painter =
      style === "stripe"
        ? (p) => new THREE.Color(Math.floor((p.y + 2) / 0.17) % 2 === 0 ? hex : hex2)
        : paintBody(hex);
    add(
      "top_detail",
      `${style}_body`,
      sheet(T, tunicProfile(plan, { hem, fat, flare }), 0.015, {
        rz: 0.78,
        segments: F.detail < 0.7 ? 10 : 14,
        divisions: 1,
      }),
      { color: painter, group: "shell" },
    );
  }

  // sleeves follow the arms
  const ua = plan.upperArm / plan.hh;
  const fa = plan.forearm / plan.hh;
  const sleeveColor =
    style === "vest" ? hex2 : style === "poncho" ? (top.color2 ?? "#F1E4D0") : hex;
  for (const side of ["l", "r"]) {
    const upper = grow(upperArmProfile(plan), 0.022)
      .slice(1)
      .filter(([, y]) => y >= (traits.sleeves === "short" ? -ua * 0.5 : -ua));
    add(
      `arm_${side}`,
      `sleeve_upper_${side}`,
      revolve(T, upper, { segments: 10, divisions: 1, rz: 0.96 }),
      {
        color: gradient(THREE, sleeveColor, { from: -ua, to: 0.1, low: 0.84 }),
        group: `sleeve_${side}`,
      },
    );
    if (traits.sleeves === "long") {
      const lowerArm = grow(forearmProfile(plan), 0.02)
        .slice(1)
        .filter(([, y]) => y >= -fa * 0.93);
      add(
        `elbow_${side}`,
        `sleeve_lower_${side}`,
        revolve(T, lowerArm, { segments: 10, divisions: 1, rz: 0.96 }),
        {
          color: gradient(THREE, sleeveColor, {
            from: -fa,
            to: 0.05,
            low: 0.84,
            trim: style === "labcoat" || style === "cardigan" ? hex2 : undefined,
            band: 0.035,
          }),
          group: `sleeve_${side}`,
        },
      );
    }
  }

  const bit = (name, geometry, o = {}) =>
    add("top_detail", name, geometry, { group: "detail", ...o });
  switch (style) {
    case "poncho": {
      add("top_detail", "poncho", poncho(F), {
        style: STYLE.woven,
        weave: true,
        color: hex,
        group: "shell",
      });
      add(
        "top_detail",
        "poncho_tunic",
        sheet(T, tunicProfile(plan, { hem: -0.05, fat: 0.01 }), 0.015, {
          rz: 0.78,
          segments: F.detail < 0.7 ? 10 : 14,
          divisions: 1,
        }),
        { color: paintBody(top.color2 ?? "#F1E4D0", { low: 0.9 }), group: "shell" },
      );
      bit(
        "poncho_pin",
        ellipsoid(THREE, [0.055, 0.055, 0.03], { w: 10, h: 6 }).translate(0, L - 0.22, 0.43),
        { material: "gold", color: GOLD },
      );
      bit(
        "poncho_pin_ring",
        ring(THREE, 0.064, 0.012, { tubular: 12, radial: 3 })
          .rotateX(Math.PI / 2)
          .translate(0, L - 0.22, 0.435),
        { material: "gold", color: GOLD },
      );
      break;
    }
    case "tee":
      bit(
        "collar",
        ring(THREE, 0.14, 0.034, { tubular: 14, radial: 3 }).translate(0, L - 0.01, 0),
        { color: hex2 },
      );
      bit(
        "tee_badge",
        ellipsoid(THREE, [0.055, 0.055, 0.02], { w: 8, h: 5 }).translate(-0.13, 0.62 * L, 0.27),
        { color: hex2 },
      );
      break;
    case "stripe":
      bit(
        "collar",
        ring(THREE, 0.14, 0.034, { tubular: 14, radial: 3 }).translate(0, L - 0.01, 0),
        { color: hex2 },
      );
      break;
    case "hoodie":
      bit(
        "hood_roll",
        ring(THREE, 0.19, 0.075, { tubular: 14, radial: 4 }).translate(0, L - 0.05, -0.04),
        { color: shade(THREE, hex, 1.06) },
      );
      bit(
        "hood_bag",
        ellipsoid(THREE, [0.21, 0.21, 0.12], { w: 10, h: 6 }).translate(0, L - 0.22, -0.26),
        { color: shade(THREE, hex, 0.9) },
      );
      bit("pocket", roundBox(THREE, [0.34, 0.15, 0.05], 0.03).translate(0, 0.28 * L - 0.1, 0.285), {
        color: shade(THREE, hex, 0.93),
      });
      for (const s of [-1, 1])
        bit(
          `string_${s}`,
          tube(
            T,
            THREE,
            [
              [s * 0.06, L - 0.14, 0.26],
              [s * 0.07, L - 0.34, 0.315],
              [s * 0.06, L - 0.5, 0.31],
            ],
            0.013,
            { tubular: 4, radial: 3 },
          ),
          { color: hex2 },
        );
      break;
    case "jacket":
    case "labcoat":
    case "raincoat": {
      for (const s of [-1, 1])
        bit(
          `lapel_${s}`,
          tube(
            T,
            THREE,
            [
              [s * 0.1, L - 0.02, 0.26],
              [s * 0.16, L - 0.18, 0.31],
              [s * 0.07, L - 0.52, 0.33],
            ],
            (t) => 0.055 - 0.03 * t,
            { tubular: 5, radial: 3 },
          ),
          { color: hex2 },
        );
      bit("collar", ring(THREE, 0.155, 0.045, { tubular: 14, radial: 3 }).translate(0, L, -0.02), {
        color: hex2,
      });
      if (style === "jacket")
        bit(
          "button",
          ellipsoid(THREE, [0.026, 0.026, 0.016], { w: 6, h: 4 }).translate(0.055, 0.42 * L, 0.31),
          { material: "gold", color: GOLD },
        );
      if (style === "labcoat") {
        for (const s of [-1, 1])
          bit(
            `pocket_${s}`,
            roundBox(THREE, [0.16, 0.14, 0.04], 0.025).translate(s * 0.19, -0.08, 0.34),
            { color: shade(THREE, hex, 0.94) },
          );
        bit("lab_pen", roundBox(THREE, [0.02, 0.1, 0.02], 0.006).translate(-0.17, 0.0, 0.36), {
          material: "gold",
          color: GOLD,
        });
      }
      if (style === "raincoat") {
        for (let i = 0; i < 3; i++)
          bit(
            `toggle_${i}`,
            roundBox(THREE, [0.11, 0.035, 0.03], 0.012).translate(0, 0.68 * L - i * 0.22, 0.34),
            { material: "gear", color: top.trim ?? "#6E4F3C" },
          );
        bit(
          "rain_hood",
          ellipsoid(THREE, [0.22, 0.16, 0.13], { w: 10, h: 6 }).translate(0, L - 0.2, -0.28),
          { color: shade(THREE, hex, 0.9) },
        );
      }
      break;
    }
    case "cardigan":
      bit(
        "placket",
        tube(
          T,
          THREE,
          [
            [0, L - 0.05, 0.27],
            [0, 0.55 * L, 0.32],
            [0, hem + 0.04, 0.36],
          ],
          0.04,
          { tubular: 6, radial: 3 },
        ),
        { color: hex2 },
      );
      for (let i = 0; i < 3; i++)
        bit(
          `btn_${i}`,
          ellipsoid(THREE, [0.026, 0.026, 0.015], { w: 6, h: 4 }).translate(
            0,
            0.8 * L - i * 0.27,
            0.34,
          ),
          { material: "gold", color: GOLD },
        );
      break;
    case "vest":
      bit("collar", ring(THREE, 0.15, 0.04, { tubular: 14, radial: 3 }).translate(0, L, -0.01), {
        color: hex2,
      });
      for (let i = 0; i < 2; i++)
        bit(
          `btn_${i}`,
          ellipsoid(THREE, [0.024, 0.024, 0.014], { w: 6, h: 4 }).translate(
            0,
            0.72 * L - i * 0.3,
            0.33,
          ),
          { material: "gold", color: GOLD },
        );
      break;
    case "wetsuit":
      bit(
        "zip",
        tube(
          T,
          THREE,
          [
            [0, L - 0.04, 0.275],
            [0, 0.5 * L, 0.3],
            [0, 0.0, 0.3],
          ],
          0.016,
          { tubular: 5, radial: 3 },
        ),
        { material: "gold", color: GOLD },
      );
      for (const s of [-1, 1])
        bit(
          `stripe_${s}`,
          tube(
            T,
            THREE,
            [
              [s * 0.3, L - 0.35, 0.1],
              [s * 0.285, 0.5 * L, 0.12],
              [s * 0.26, 0.05, 0.12],
            ],
            0.02,
            { tubular: 5, radial: 3 },
          ),
          { material: "gold", color: top.trim ?? GOLD },
        );
      break;
    default:
      break;
  }
  return { sleeves: traits.sleeves };
}

/** The student's poncho: wide and short, six scallops, drop at the front and back. */
function poncho(F) {
  const { T, plan } = F;
  const L = plan.torsoLen / plan.hh;
  const w = plan.w;
  const hemY = 0.12 * L;
  const outside = [
    [0.6 * w, hemY],
    [0.595 * w, hemY + 0.12],
    [0.56 * w, 0.44 * L],
    [0.5 * w, 0.7 * L],
    [0.42 * w, L - 0.2],
    [0.27 * w, L - 0.06],
    [0.19, L + 0.03],
  ];
  const g = sheet(T, outside, 0.02, {
    rz: 0.86,
    segments: 24,
    divisions: 1,
    scallop: { folds: 6, depth: 0.1, from: 0.55, lift: 0 },
  });
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const k = smooth(0.5 * L, hemY, y);
    const front = Math.pow(Math.min(1, Math.abs(p.getZ(i)) / (0.5 * w)), 3);
    p.setY(i, y - 0.22 * k * front);
  }
  return T.smoothNormals(g, 60);
}

/** Hood folded down around the neck: bag at the back, soft roll at the shoulders. */
export function addCowl(F, { color, lining, name = "traveller_hood" }) {
  const { THREE } = F;
  const L = F.plan.torsoLen / F.plan.hh;
  F.add(
    "torso",
    name,
    ellipsoid(THREE, [0.3, 0.2, 0.17], { w: 12, h: 7 }).translate(0, L - 0.05, -0.3),
    {
      part: "top",
      style: STYLE.mantle,
      material: "top",
      color: gradient(THREE, color, { from: L - 0.3, to: L + 0.1, low: 0.82 }),
      group: "cowl",
    },
  );
  F.add(
    "torso",
    `${name}_roll`,
    ring(THREE, 0.2, 0.06, { tubular: 14, radial: 4 })
      .scale(1, 1, 0.9)
      .translate(0, L - 0.01, -0.02),
    { part: "top", style: STYLE.cloth, material: "top", color: lining, group: "cowl" },
  );
}

// ---------------------------------------------------------------------------- bottoms
export function addBottom(F, bottom) {
  const { THREE, T, plan } = F;
  const w = plan.w;
  const th = plan.thigh / plan.hh;
  const cf = plan.calf / plan.hh;
  const { style, color: hex } = bottom;
  const paintLeg = (o = {}) =>
    gradient(THREE, hex, { from: -th - cf, to: 0.2, low: 0.82, high: 1.04, ...o });
  const add = (node, name, geometry, o = {}) =>
    F.add(node, name, geometry, {
      part: "bottom",
      material: "bottom",
      style: STYLE.cloth,
      color: paintLeg(),
      group: "legwear",
      ...o,
    });
  const waist = (extra = 0.026, depth = 0.34) =>
    add(
      "top_detail",
      `${style}_waist`,
      revolve(
        T,
        [
          [0.215 * w + extra, -0.1],
          [0.262 * w + extra, 0.02],
          [0.272 * w + extra, 0.14],
          [0.25 * w + extra, depth],
        ],
        { rz: 0.8, segments: F.detail < 0.7 ? 10 : 14, divisions: 1 },
      ),
      { group: "pelvis" },
    );

  if (style === "skirt") {
    // waist band on the torso, a bell on each leg so the legs never push through the cloth
    waist(0.03, 0.3);
    for (const side of ["l", "r"]) {
      const outside = [
        [0.25, -th * 0.62],
        [0.235, -th * 0.5],
        [0.2, -th * 0.2],
        [0.18, 0.02],
        [0.17, 0.14],
      ];
      add(
        `leg_${side}`,
        `skirt_bell_${side}`,
        sheet(T, outside, 0.016, {
          segments: 16,
          divisions: 1,
          scallop: { folds: 4, depth: 0.1, from: 0.0, lift: 0 },
        }),
        {
          color: gradient(THREE, hex, {
            from: -th * 0.62,
            to: 0.16,
            low: 0.8,
            high: 1.05,
            trim: bottom.trim,
            band: 0.05,
          }),
          group: `skirt_${side}`,
        },
      );
    }
    return;
  }
  waist(style === "overalls" ? 0.036 : 0.028);
  const flareR = style === "wide" ? 0.1 : style === "cargo" ? 0.012 : 0;
  const d = style === "leggings" ? 0.008 : style === "wide" ? 0.035 : 0.024;
  for (const side of ["l", "r"]) {
    const sign = side === "l" ? -1 : 1;
    let thigh = grow(thighProfile(plan), d).slice(1);
    let calf = grow(calfProfile(plan), d).slice(1);
    if (style === "shorts") thigh = thigh.filter(([, y]) => y >= -th * 0.55);
    if (flareR) calf = calf.map(([r, y]) => [r + flareR * smooth(-cf * 0.2, -cf, y), y]);
    add(
      `leg_${side}`,
      `${style}_thigh_${side}`,
      revolve(T, thigh, { segments: 10, divisions: 1, rz: 0.96 }),
      { group: `trouser_${side}` },
    );
    if (style !== "shorts")
      add(
        `knee_${side}`,
        `${style}_calf_${side}`,
        revolve(T, calf.slice(0, -1), { segments: 10, divisions: 1, rz: 0.96 }),
        { group: `trouser_low_${side}` },
      );
    if (style === "shorts")
      add(
        `leg_${side}`,
        `shorts_cuff_${side}`,
        ring(THREE, 0.158 + d, 0.025, { tubular: 14, radial: 3 }).translate(0, -th * 0.55, 0),
        { color: shade(THREE, hex, 1.12), group: `trouser_${side}` },
      );
    if (style === "cargo")
      add(
        `leg_${side}`,
        `pocket_${side}`,
        roundBox(THREE, [0.07, 0.19, 0.17], 0.03).translate(sign * 0.17, -th * 0.45, 0.0),
        { color: shade(THREE, hex, 0.92), group: `trouser_${side}` },
      );
    if (style === "overalls")
      add(
        `knee_${side}`,
        `turnup_${side}`,
        ring(THREE, 0.105 + d, 0.03, { tubular: 12, radial: 3 }).translate(0, -cf + 0.14, 0),
        { color: "#E6CCA5", group: `trouser_low_${side}` },
      );
  }
  if (style === "overalls") {
    add(
      "top_detail",
      "bib",
      roundBox(THREE, [0.32, 0.32, 0.05], 0.045, 2).translate(0, 0.52, 0.255),
      { group: "pelvis", color: gradient(THREE, hex, { from: 0.3, to: 0.75 }) },
    );
    add(
      "top_detail",
      "bib_pocket",
      roundBox(THREE, [0.16, 0.1, 0.03], 0.02).translate(0, 0.46, 0.29),
      { group: "pelvis", color: shade(THREE, hex, 0.88) },
    );
    const L = plan.torsoLen / plan.hh;
    for (const s of [-1, 1]) {
      add(
        "top_detail",
        `strap_${s}`,
        tube(
          T,
          THREE,
          [
            [s * 0.11, 0.66, 0.26],
            [s * 0.17, L - 0.18, 0.2],
            [s * 0.2, L - 0.1, 0.0],
            [s * 0.2, L - 0.2, -0.22],
          ],
          0.026,
          { tubular: 8, radial: 3 },
        ),
        { group: "pelvis", color: hex },
      );
      add(
        "top_detail",
        `bib_button_${s}`,
        ellipsoid(THREE, [0.03, 0.03, 0.018], { w: 6, h: 4 }).translate(s * 0.12, 0.64, 0.285),
        { group: "pelvis", material: "gold", color: GOLD },
      );
    }
  }
}

// ---------------------------------------------------------------------------- shoes
const SHOE_TOP = {
  boots: 0.36,
  rainboots: 0.52,
  hiking: 0.3,
  sneakers: 0.17,
  loafers: 0.14,
  clogs: 0.12,
  sandals: 0.08,
  fins: 0.2,
};

export async function addShoes(F, shoes) {
  const { THREE, T, plan } = F;
  const cf = plan.calf / plan.hh;
  const kind = shoes.style;
  const base = shoes.color;
  const sole = shoes.sole ?? shade(THREE, base, 0.5);
  const light = shade(THREE, base, 1.22);
  for (const side of ["l", "r"]) {
    const geo = await footGeometry(T, THREE, kind, { triangles: Math.round(150 * F.detail) });
    const cream = new THREE.Color("#F4EFE6");
    const tmp = new THREE.Color();
    const paintFoot = (p, n) => {
      if (p.y < 0.075) return tmp.set(sole);
      tmp.set(base);
      if (kind === "sneakers" && p.z > 0.2 && p.y < 0.16) tmp.lerp(cream, 0.55);
      return tmp.lerp(new THREE.Color(light), smooth(0.08, 0.5, p.y) * 0.3 + (n.y > 0.7 ? 0.1 : 0));
    };
    F.add(`knee_${side}`, "upper", geo, {
      part: "shoes",
      material: "shoes",
      color: paintFoot,
      origin: [0, cf, 0],
      group: `shoe_${side}`,
      style: STYLE.cloth,
      keep: true,
    });
    const top = SHOE_TOP[kind];
    const detail = (name, geometry, o = {}) =>
      F.add(`knee_${side}`, `${name}_${side}`, geometry, {
        part: "shoes",
        material: "shoes",
        origin: [0, cf, 0],
        group: `shoe_${side}`,
        style: STYLE.cloth,
        color: light,
        ...o,
      });
    if (["boots", "rainboots", "hiking"].includes(kind))
      detail(
        "shoe_cuff",
        ring(THREE, 0.1, 0.034, { tubular: 14, radial: 4 }).translate(0, top - 0.015, -0.02),
        { color: shoes.trim ?? light },
      );
    if (kind === "loafers")
      detail("loafer_bit", roundBox(THREE, [0.09, 0.025, 0.07], 0.01).translate(0, 0.165, 0.2), {
        material: "gold",
        color: GOLD,
      });
    if (kind === "sneakers" || kind === "hiking")
      detail(
        "laces",
        roundBox(THREE, [0.07, 0.02, 0.13], 0.008).translate(
          0,
          kind === "hiking" ? 0.24 : 0.19,
          0.17,
        ),
        { color: shoes.lace ?? "#FBF3E4" },
      );
    if (kind === "sandals")
      detail(
        "strap",
        ring(THREE, 0.088, 0.016, { tubular: 12, radial: 3 }).translate(0, 0.075, 0.1),
        { color: shade(THREE, base, 0.8) },
      );
    if (kind === "fins")
      detail("fin_edge", roundBox(THREE, [0.26, 0.02, 0.1], 0.008).translate(0, 0.05, 0.86), {
        material: "gold",
        color: GOLD,
      });
  }
}

// ---------------------------------------------------------------------------- mantle
/**
 * The signature mantle: a short cape, capelet or shawl over the shoulders in a style-5 colour.
 * The runtime cape (cloth.ts) hangs from the `chest` node in this colour, so the colour is the
 * part of the figure the player reads from far away.
 */
export function addMantle(F, mantle) {
  const { THREE, T, plan } = F;
  const L = plan.torsoLen / plan.hh;
  const w = plan.w;
  const { kind = "capelet", color: hex, trim = GOLD } = mantle;
  const part = mantle.part ?? "top";
  const drop = kind === "shawl" ? 0.62 : kind === "collar" ? 0.28 : 0.46;
  const hemY = L - drop;
  const outside = [
    [0.5 * w + (kind === "shawl" ? 0.05 : 0), hemY],
    [0.51 * w, hemY + 0.07],
    [0.47 * w, hemY + 0.22],
    [0.4 * w, L - 0.28],
    [0.3 * w, L - 0.1],
    [0.2, L + 0.01],
  ];
  const g = sheet(T, outside, 0.02, {
    rz: kind === "shawl" ? 0.74 : 0.82,
    segments: F.detail < 0.7 ? 12 : 20,
    divisions: 1,
    scallop: { folds: kind === "shawl" ? 5 : 4, depth: 0.1, from: 0.55, lift: 0 },
  });
  if (kind === "shawl") {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const k = smooth(L - 0.3, hemY, y);
      const z = p.getZ(i) / (0.5 * w);
      p.setY(i, y - 0.22 * k * Math.pow(Math.max(0, Math.min(1, z)), 2));
    }
    T.smoothNormals(g, 60);
  }
  F.add("top_detail", "mantle", g, {
    part,
    style: STYLE.mantle,
    material: "top",
    color: gradient(THREE, hex, { from: hemY, to: L, low: 0.84, high: 1.06, trim, band: 0.05 }),
    group: "mantle",
  });
  if (mantle.clasp !== false) {
    F.add(
      "top_detail",
      "mantle_clasp",
      ellipsoid(THREE, [0.06, 0.06, 0.035], { w: 8, h: 5 }).translate(0, L - 0.1, 0.32),
      { part, material: "gold", color: GOLD, group: "mantle" },
    );
    F.add(
      "top_detail",
      "mantle_clasp_ring",
      ring(THREE, 0.068, 0.012, { tubular: 12, radial: 3 })
        .rotateX(Math.PI / 2)
        .translate(0, L - 0.1, 0.325),
      { part, material: "gold", color: GOLD, group: "mantle" },
    );
  }
}

// ---------------------------------------------------------------------------- accessories
const gear = (F, node, name, geometry, color, o = {}) =>
  F.add(node, name, geometry, {
    part: "acc",
    material: o.material ?? "gear",
    style: STYLE.cloth,
    color,
    group: o.group,
  });
const gold = (F, node, name, geometry, o = {}) =>
  gear(F, node, name, geometry, GOLD, { material: "gold", ...o });

export const HAT = {
  hardhat(F, hex = GOLD) {
    const { THREE, T } = F;
    const dome = revolve(
      T,
      [
        [0.5, 0.82],
        [0.505, 0.9],
        [0.47, 1.06],
        [0.34, 1.2],
        [0.14, 1.27],
        [0, 1.285],
      ],
      { segments: 14, divisions: 1, rz: 0.99 },
    );
    gear(
      F,
      "head_geo",
      "hardhat",
      dome,
      gradient(THREE, hex, { from: 0.8, to: 1.28, low: 0.82, high: 1.1 }),
      { group: "hat" },
    );
    gear(
      F,
      "head_geo",
      "hardhat_brim",
      ellipsoid(THREE, [0.43, 0.035, 0.32], { w: 14, h: 5 }).translate(0, 0.85, 0.34),
      hex,
      { group: "hat" },
    );
    gear(
      F,
      "head_geo",
      "hardhat_ridge",
      tube(
        T,
        THREE,
        [
          [0, 1.19, 0.38],
          [0, 1.31, 0.05],
          [0, 1.2, -0.42],
        ],
        0.05,
        { tubular: 6, radial: 3 },
      ),
      shade(THREE, hex, 1.1),
      { group: "hat" },
    );
    gold(
      F,
      "head_geo",
      "hardhat_badge",
      ellipsoid(THREE, [0.07, 0.07, 0.02], { w: 8, h: 5 }).translate(0, 1.0, 0.5),
      { group: "hat" },
    );
  },
  beanie(F, hex = "#2F7D7A") {
    const { THREE, T } = F;
    gear(
      F,
      "head_geo",
      "beanie",
      revolve(
        T,
        [
          [0.5, 0.78],
          [0.505, 0.9],
          [0.48, 1.05],
          [0.34, 1.2],
          [0.1, 1.28],
          [0, 1.3],
        ],
        { segments: 14, divisions: 1, rz: 0.99 },
      ),
      gradient(THREE, hex, { from: 0.8, to: 1.3, low: 0.85, high: 1.05 }),
      { group: "hat" },
    );
    gear(
      F,
      "head_geo",
      "beanie_cuff",
      ring(THREE, 0.5, 0.075, { tubular: 16, radial: 4 })
        .scale(1, 1, 0.99)
        .translate(0, 0.85, -0.02),
      shade(THREE, hex, 1.12),
      { group: "hat" },
    );
    gear(
      F,
      "head_geo",
      "beanie_pom",
      ellipsoid(THREE, [0.1, 0.1, 0.1], { w: 8, h: 6 }).translate(0, 1.36, -0.02),
      "#FBF3E4",
      { group: "hat" },
    );
    gold(
      F,
      "head_geo",
      "beanie_pin",
      ellipsoid(THREE, [0.045, 0.045, 0.02], { w: 7, h: 4 }).translate(0.2, 0.9, 0.46),
      { group: "hat" },
    );
  },
  toque(F) {
    const { THREE, T } = F;
    gear(
      F,
      "head_geo",
      "toque_band",
      revolve(
        T,
        [
          [0.49, 0.84],
          [0.5, 0.92],
          [0.5, 1.06],
        ],
        { segments: 14, divisions: 1, rz: 0.99 },
      ),
      "#FBF3E4",
      { group: "hat" },
    );
    for (const [x, y, z, r] of [
      [0, 1.34, 0, 0.3],
      [0.22, 1.22, 0.04, 0.22],
      [-0.22, 1.22, -0.04, 0.22],
      [0, 1.2, 0.22, 0.2],
      [0, 1.2, -0.22, 0.2],
    ])
      gear(
        F,
        "head_geo",
        `toque_puff_${x}_${z}`,
        ellipsoid(THREE, [r, r * 0.85, r], { w: 10, h: 6 }).translate(x, y, z),
        "#FBF3E4",
        { group: "hat" },
      );
  },
  cap(F, hex = "#C9785F") {
    const { THREE, T } = F;
    gear(
      F,
      "head_geo",
      "cap",
      revolve(
        T,
        [
          [0.5, 0.8],
          [0.505, 0.92],
          [0.46, 1.06],
          [0.3, 1.19],
          [0, 1.24],
        ],
        { segments: 14, divisions: 1, rz: 0.99 },
      ),
      gradient(THREE, hex, { from: 0.8, to: 1.24, low: 0.84, high: 1.06 }),
      { group: "hat" },
    );
    gear(
      F,
      "head_geo",
      "cap_brim",
      ellipsoid(THREE, [0.32, 0.03, 0.28], { w: 12, h: 5 }).rotateX(0.2).translate(0, 0.93, 0.5),
      shade(THREE, hex, 0.88),
      { group: "hat" },
    );
    gold(
      F,
      "head_geo",
      "cap_button",
      ellipsoid(THREE, [0.05, 0.05, 0.05], { w: 6, h: 4 }).translate(0, 1.25, 0),
      { group: "hat" },
    );
  },
  sunhat(F, hex = "#E6CDA6", band = "#E99A8E") {
    const { THREE, T } = F;
    gear(
      F,
      "head_geo",
      "sunhat_crown",
      revolve(
        T,
        [
          [0.5, 0.86],
          [0.51, 0.97],
          [0.45, 1.12],
          [0.32, 1.22],
          [0, 1.26],
        ],
        { segments: 12, divisions: 1, rz: 0.99 },
      ),
      gradient(THREE, hex, { from: 0.86, to: 1.26, low: 0.9, high: 1.05 }),
      { group: "hat" },
    );
    gear(
      F,
      "head_geo",
      "sunhat_brim",
      revolve(
        T,
        [
          [0.46, 0.83],
          [0.72, 0.83],
          [0.98, 0.88],
          [1.02, 0.915, 1],
          [0.98, 0.93],
          [0.72, 0.885],
          [0.46, 0.9],
        ],
        { segments: 18, divisions: 1, scallop: { folds: 8, depth: 0.04, from: 0.5, lift: 0.02 } },
      ),
      gradient(THREE, hex, { from: 0.83, to: 0.94, low: 0.84, high: 1.0 }),
      { group: "hat" },
    );
    gear(
      F,
      "head_geo",
      "sunhat_band",
      ring(THREE, 0.505, 0.055, { tubular: 12, radial: 3 }).translate(0, 0.97, -0.01),
      band,
      { group: "hat" },
    );
    gold(
      F,
      "head_geo",
      "sunhat_flower",
      ellipsoid(THREE, [0.08, 0.08, 0.04], { w: 7, h: 5 }).translate(0.34, 1.0, 0.38),
      { group: "hat" },
    );
  },
  headband(F, hex = "#F3D78A") {
    const { THREE, T } = F;
    const pts = Array.from({ length: 11 }, (_, i) => {
      const phi = -2.9 + (5.8 * i) / 10;
      return [0.5 * Math.sin(phi), 0.9, 0.5 * Math.cos(phi) - 0.03];
    });
    gear(F, "head_geo", "headband", tube(T, THREE, pts, 0.045, { tubular: 24, radial: 4 }), hex, {
      group: "hat",
    });
    gold(
      F,
      "head_geo",
      "headband_rosette",
      ellipsoid(THREE, [0.08, 0.08, 0.035], { w: 8, h: 5 }).translate(0.3, 0.9, 0.4),
      { group: "hat" },
    );
  },
  goggles(F) {
    const { THREE } = F;
    gear(
      F,
      "head_geo",
      "goggle_strap",
      ring(THREE, 0.51, 0.036, { tubular: 16, radial: 3 }).rotateX(-0.2).translate(0, 1.0, -0.02),
      "#3A3230",
      { group: "hat" },
    );
    for (const s of [-1, 1]) {
      gold(
        F,
        "head_geo",
        `goggle_rim_${s}`,
        ring(THREE, 0.115, 0.036, { tubular: 12, radial: 4 })
          .rotateX(Math.PI / 2 - 0.1)
          .translate(s * 0.2, 1.06, 0.47),
        { group: "hat" },
      );
      gear(
        F,
        "head_geo",
        `goggle_lens_${s}`,
        ellipsoid(THREE, [0.1, 0.1, 0.03], { w: 8, h: 5 }).translate(s * 0.2, 1.06, 0.49),
        "#DCEFF0",
        { group: "hat" },
      );
    }
  },
  glasses(F, hex = "#3A3230") {
    const { THREE, T } = F;
    const cy = 0.585;
    for (const s of [-1, 1]) {
      gear(
        F,
        "head_geo",
        `lens_rim_${s}`,
        ring(THREE, 0.118, 0.018, { tubular: 14, radial: 3 })
          .rotateX(Math.PI / 2)
          .translate(s * 0.18, cy, 0.455),
        hex,
        { group: "specs" },
      );
      gear(
        F,
        "head_geo",
        `glasses_arm_${s}`,
        tube(
          T,
          THREE,
          [
            [s * 0.3, cy, 0.4],
            [s * 0.45, cy, 0.2],
            [s * 0.46, cy - 0.02, -0.08],
          ],
          0.015,
          { tubular: 4, radial: 3 },
        ),
        hex,
        { group: "specs" },
      );
    }
    gear(
      F,
      "head_geo",
      "glasses_bridge",
      tube(
        T,
        THREE,
        [
          [-0.07, cy + 0.04, 0.5],
          [0, cy + 0.07, 0.52],
          [0.07, cy + 0.04, 0.5],
        ],
        0.014,
        { tubular: 4, radial: 3 },
      ),
      hex,
      { group: "specs" },
    );
  },
  divemask(F) {
    const { THREE, T } = F;
    gold(
      F,
      "head_geo",
      "mask_frame",
      roundBox(THREE, [0.78, 0.36, 0.16], 0.09, 2).translate(0, 0.9, 0.42),
      { group: "hat" },
    );
    gear(
      F,
      "head_geo",
      "mask_glass",
      roundBox(THREE, [0.64, 0.26, 0.05], 0.06, 1).translate(0, 0.9, 0.51),
      "#BFE3E6",
      { group: "hat" },
    );
    gear(
      F,
      "head_geo",
      "mask_strap",
      ring(THREE, 0.5, 0.036, { tubular: 16, radial: 3 }).translate(0, 0.95, -0.02),
      "#2B2936",
      { group: "hat" },
    );
    gold(
      F,
      "head_geo",
      "snorkel",
      tube(
        T,
        THREE,
        [
          [0.5, 0.9, 0.1],
          [0.58, 1.05, 0.0],
          [0.56, 1.25, -0.05],
        ],
        0.035,
        { tubular: 6, radial: 4 },
      ),
      { group: "hat" },
    );
  },
  beard(F, hex) {
    const { THREE } = F;
    F.add(
      "head_geo",
      "beard",
      ellipsoid(THREE, [0.37, 0.27, 0.3], { w: 12, h: 8 }).translate(0, 0.29, 0.2),
      {
        part: "acc",
        style: STYLE.hair,
        material: "hair",
        color: gradient(THREE, hex, { from: 0.0, to: 0.55, low: 0.8, high: 1.08 }),
        group: "beard",
      },
    );
    F.add(
      "head_geo",
      "stache",
      ellipsoid(THREE, [0.17, 0.05, 0.08], { w: 8, h: 5 }).translate(0, 0.4, 0.46),
      { part: "acc", style: STYLE.hair, material: "hair", color: hex, group: "beard" },
    );
  },
};

export const GEAR = {
  /** pack on the back, centred behind the torso */
  backpack(F, hex = "#2F7D7A", o = {}) {
    const { THREE, T } = F;
    const L = F.plan.torsoLen / F.plan.hh;
    const at = (name, g, color, extra = {}) =>
      gear(F, "torso", name, g, color, { group: "pack", ...extra });
    at(
      o.name ?? "pack",
      roundBox(THREE, [0.6, 0.76, 0.36], 0.12, 2).translate(0, L * 0.5, -0.43),
      gradient(THREE, hex, { from: L * 0.1, to: L * 0.9, low: 0.8, high: 1.05 }),
    );
    at(
      "pack_flap",
      roundBox(THREE, [0.62, 0.28, 0.38], 0.1, 1).translate(0, L * 0.82, -0.43),
      shade(THREE, hex, 0.9),
    );
    at(
      "pack_pocket",
      roundBox(THREE, [0.4, 0.26, 0.14], 0.06, 1).translate(0, L * 0.38, -0.65),
      shade(THREE, hex, 1.08),
    );
    at(
      "pack_buckle",
      roundBox(THREE, [0.1, 0.08, 0.04], 0.015, 1).translate(0, L * 0.78, -0.64),
      GOLD,
      { material: "gold" },
    );
    for (const s of [-1, 1])
      at(
        `pack_strap_${s}`,
        tube(
          T,
          THREE,
          [
            [s * 0.18, L * 0.78, -0.3],
            [s * 0.2, L - 0.04, -0.08],
            [s * 0.2, L - 0.05, 0.14],
            [s * 0.19, L * 0.5, 0.27],
          ],
          0.032,
          { tubular: 8, radial: 3 },
        ),
        "#6E4F3C",
      );
  },
  satchel(F, hex = "#9C7356", o = {}) {
    const { THREE, T } = F;
    const L = F.plan.torsoLen / F.plan.hh;
    const side = o.side ?? 1;
    const at = (name, g, color, extra = {}) =>
      gear(F, "torso", name, g, color, { group: "satchel", ...extra });
    at(
      "satchel_bag",
      roundBox(THREE, [0.15, 0.3, 0.34], 0.07, 1).translate(side * 0.4, 0.04 * L, -0.02),
      hex,
    );
    at(
      "satchel_flap",
      roundBox(THREE, [0.16, 0.14, 0.35], 0.05, 1).translate(side * 0.4, 0.16 * L, -0.02),
      shade(THREE, hex, 0.82),
    );
    at(
      "satchel_clasp",
      ellipsoid(THREE, [0.02, 0.05, 0.05], { w: 6, h: 4 }).translate(side * 0.49, 0.13 * L, 0.08),
      GOLD,
      { material: "gold" },
    );
    at(
      "satchel_strap",
      tube(
        T,
        THREE,
        [
          [side * 0.4, 0.24 * L, -0.02],
          [side * 0.2, L * 0.7, 0.25],
          [-side * 0.1, L - 0.14, 0.0],
          [-side * 0.14, L * 0.62, -0.26],
          [side * 0.34, 0.1 * L, -0.2],
        ],
        0.026,
        { tubular: 12, radial: 3 },
      ),
      shade(THREE, hex, 0.72),
    );
  },
  /** knotted scarf at the neck with two tails and a gold stripe */
  scarf(F, hex = "#2F7D7A") {
    const { THREE, T } = F;
    const L = F.plan.torsoLen / F.plan.hh;
    const at = (name, g, color, extra = {}) =>
      gear(F, "torso", name, g, color, { group: "scarf", ...extra });
    at(
      "scarf_wrap",
      ring(THREE, 0.2, 0.075, { tubular: 18, radial: 6 })
        .scale(1, 1, 0.92)
        .translate(0, L + 0.0, 0.0),
      gradient(THREE, hex, { from: L - 0.08, to: L + 0.08, low: 0.86 }),
    );
    at(
      "scarf_tail",
      tube(
        T,
        THREE,
        [
          [0.1, L - 0.04, 0.24],
          [0.17, L - 0.3, 0.3],
          [0.19, L - 0.6, 0.28],
        ],
        (t) => 0.07 - 0.025 * t,
        { tubular: 8, radial: 4 },
      ),
      hex,
    );
    at(
      "scarf_tail_2",
      tube(
        T,
        THREE,
        [
          [0.0, L - 0.04, 0.26],
          [0.04, L - 0.24, 0.33],
          [0.07, L - 0.46, 0.32],
        ],
        (t) => 0.06 - 0.02 * t,
        { tubular: 8, radial: 4 },
      ),
      shade(THREE, hex, 0.9),
    );
    at(
      "scarf_stripe",
      ring(THREE, 0.2, 0.012, { tubular: 18, radial: 3 })
        .scale(1, 1, 0.92)
        .translate(0, L + 0.075, 0.0),
      GOLD,
      { material: "gold" },
    );
    at(
      "scarf_tip",
      ellipsoid(THREE, [0.05, 0.02, 0.05], { w: 6, h: 4 }).translate(0.19, L - 0.62, 0.28),
      GOLD,
      { material: "gold" },
    );
  },
  tank(F) {
    const { THREE, T } = F;
    const L = F.plan.torsoLen / F.plan.hh;
    for (const s of [-1, 1])
      gold(
        F,
        "torso",
        `tank_${s}`,
        revolve(
          T,
          [
            [0.001, 0],
            [0.12, 0.04],
            [0.145, 0.3],
            [0.13, 0.66],
            [0.07, 0.8],
            [0.001, 0.84],
          ],
          { segments: 10, divisions: 1 },
        ).translate(s * 0.15, L * 0.06, -0.38),
        { group: "tank" },
      );
    gear(
      F,
      "torso",
      "tank_valve",
      tube(
        T,
        THREE,
        [
          [0, L * 0.6, -0.38],
          [0, L * 0.8, -0.34],
        ],
        0.04,
        { tubular: 3, radial: 3 },
      ),
      "#C8A36A",
      { group: "tank" },
    );
    for (const s of [-1, 1])
      gear(
        F,
        "torso",
        `tank_strap_${s}`,
        tube(
          T,
          THREE,
          [
            [s * 0.2, L * 0.78, -0.3],
            [s * 0.2, L - 0.05, -0.06],
            [s * 0.2, L - 0.05, 0.14],
            [s * 0.19, L * 0.5, 0.26],
          ],
          0.03,
          { tubular: 8, radial: 3 },
        ),
        "#3A3230",
        { group: "tank" },
      );
  },
  apron(F, hex = "#FBF3E4", pocket = "#E99A8E") {
    const { THREE, T } = F;
    const L = F.plan.torsoLen / F.plan.hh;
    const at = (name, g, color) => gear(F, "top_detail", name, g, color, { group: "apron" });
    at(
      "apron_skirt",
      roundBox(THREE, [0.5, 0.62, 0.05], 0.05, 2).translate(0, -0.1, 0.31),
      gradient(THREE, hex, { from: -0.4, to: 0.2, low: 0.88, high: 1.0 }),
    );
    at(
      "apron_bib",
      roundBox(THREE, [0.34, 0.36, 0.045], 0.05, 1).translate(0, 0.4 * L + 0.1, 0.3),
      hex,
    );
    at(
      "apron_pocket",
      roundBox(THREE, [0.3, 0.16, 0.05], 0.03, 1).translate(0, -0.15, 0.345),
      pocket,
    );
    at(
      "apron_tie",
      tube(
        T,
        THREE,
        [
          [-0.24, 0.12, 0.2],
          [-0.38, 0.12, -0.05],
          [-0.28, 0.12, -0.3],
          [0, 0.12, -0.32],
        ],
        0.02,
        { tubular: 8, radial: 3 },
      ),
      hex,
    );
    gold(
      F,
      "top_detail",
      "apron_button",
      ellipsoid(THREE, [0.03, 0.03, 0.015], { w: 6, h: 4 }).translate(0, 0.4 * L + 0.25, 0.335),
      { group: "apron" },
    );
  },
  lute(F) {
    const { THREE, T } = F;
    const L = F.plan.torsoLen / F.plan.hh;
    const wood = gradient(THREE, "#9C7356", { from: -0.4, to: 1.0, low: 0.8, high: 1.05 });
    const geo = T.merge([
      ellipsoid(THREE, [0.3, 0.36, 0.14], { w: 12, h: 8 }),
      tube(
        T,
        THREE,
        [
          [0, 0.3, 0],
          [0, 0.8, 0],
          [0, 1.1, -0.02],
        ],
        0.045,
        { tubular: 5, radial: 3 },
      ),
      ellipsoid(THREE, [0.07, 0.12, 0.05], { w: 6, h: 4 }).translate(0, 1.15, -0.03),
    ]);
    geo
      .rotateZ(0.75)
      .rotateX(0.2)
      .translate(0.1, 0.18 * L, 0.38);
    gear(F, "torso", "lute", geo, wood, { group: "lute" });
    gold(
      F,
      "torso",
      "lute_rosette",
      ring(THREE, 0.08, 0.016, { tubular: 10, radial: 3 })
        .rotateX(Math.PI / 2)
        .rotateX(0.2)
        .rotateZ(0.75)
        .translate(0.1, 0.18 * L, 0.5),
      { group: "lute" },
    );
  },
  rope(F) {
    const { THREE } = F;
    gear(
      F,
      "torso",
      "rope_coil",
      ring(THREE, 0.27, 0.06, { tubular: 18, radial: 4 })
        .rotateZ(Math.PI / 2)
        .translate(0.42, 0.56, 0.0),
      "#E6CCA5",
      { group: "rope" },
    );
    gear(
      F,
      "torso",
      "rope_coil_2",
      ring(THREE, 0.27, 0.055, { tubular: 18, radial: 4 })
        .rotateZ(Math.PI / 2)
        .translate(0.52, 0.56, 0.0),
      "#D9BE92",
      { group: "rope" },
    );
  },
  plank(F) {
    const { THREE } = F;
    const L = F.plan.torsoLen / F.plan.hh;
    gear(
      F,
      "torso",
      "plank",
      roundBox(THREE, [0.17, 0.09, 1.7], 0.03, 1)
        .rotateX(-0.2)
        .translate(0.3, L + 0.05, -0.1),
      "#9C7356",
      { group: "plank" },
    );
    gear(
      F,
      "torso",
      "plank_grain",
      roundBox(THREE, [0.18, 0.02, 1.2], 0.008, 1)
        .rotateX(-0.2)
        .translate(0.3, L + 0.1, -0.1),
      "#B98F63",
      { group: "plank" },
    );
  },
  scroll(F) {
    const { THREE, T } = F;
    gear(
      F,
      "torso",
      "scroll",
      revolve(
        T,
        [
          [0.001, -0.36],
          [0.075, -0.34],
          [0.08, 0.3],
          [0.075, 0.34],
          [0.001, 0.36],
        ],
        { segments: 8, divisions: 1 },
      )
        .rotateZ(1.25)
        .translate(-0.28, 0.12, -0.36),
      "#F4E9D8",
      { group: "scroll" },
    );
    gold(
      F,
      "torso",
      "scroll_seal",
      ellipsoid(THREE, [0.045, 0.045, 0.02], { w: 6, h: 4 }).translate(-0.28, 0.14, -0.28),
      { group: "scroll" },
    );
  },
  compass(F) {
    const { THREE, T } = F;
    const L = F.plan.torsoLen / F.plan.hh;
    gold(
      F,
      "torso",
      "compass",
      revolve(
        T,
        [
          [0.001, -0.03],
          [0.11, -0.03],
          [0.12, 0],
          [0.11, 0.04],
          [0.001, 0.05],
        ],
        { segments: 12, divisions: 1 },
      )
        .rotateX(Math.PI / 2)
        .translate(0.15, 0.55 * L, 0.3),
      { group: "compass" },
    );
    gear(
      F,
      "torso",
      "compass_cord",
      tube(
        T,
        THREE,
        [
          [0.15, 0.6 * L, 0.28],
          [0.08, 0.86 * L, 0.3],
          [-0.1, 0.86 * L, 0.3],
          [-0.2, 0.6 * L, 0.28],
        ],
        0.012,
        { tubular: 8, radial: 3 },
      ),
      "#6E4F3C",
      { group: "compass" },
    );
  },
};

/** Held props: geometry in the hand node's space (origin at the wrist, hanging down). */
export const HELD = {
  book(F, hex = "#2F7D7A", side = "r") {
    const { THREE } = F;
    gear(
      F,
      `hand_${side}`,
      "book_cover",
      roundBox(THREE, [0.1, 0.36, 0.27], 0.03, 1).translate(0, -0.2, 0.1),
      hex,
      { group: "book" },
    );
    gear(
      F,
      `hand_${side}`,
      "book_pages",
      roundBox(THREE, [0.078, 0.33, 0.245], 0.012, 1).translate(
        0.016 * (side === "r" ? 1 : -1),
        -0.2,
        0.105,
      ),
      "#F4E9D8",
      { group: "book" },
    );
    gold(
      F,
      `hand_${side}`,
      "book_clasp",
      roundBox(THREE, [0.02, 0.06, 0.05], 0.01, 1).translate(
        0.052 * (side === "r" ? -1 : 1),
        -0.12,
        0.2,
      ),
      { group: "book" },
    );
  },
  clipboard(F, side = "l") {
    const { THREE } = F;
    const k = side === "l" ? 1 : -1;
    gear(
      F,
      `hand_${side}`,
      "board",
      roundBox(THREE, [0.045, 0.52, 0.38], 0.02, 1).translate(0, -0.3, 0.18),
      "#9C7356",
      { group: "clipboard" },
    );
    gear(
      F,
      `hand_${side}`,
      "board_paper",
      roundBox(THREE, [0.02, 0.44, 0.3], 0.008, 1).translate(0.03 * k, -0.32, 0.18),
      "#FBF8F3",
      { group: "clipboard" },
    );
    gold(
      F,
      `hand_${side}`,
      "board_clip",
      roundBox(THREE, [0.06, 0.07, 0.15], 0.02, 1).translate(0.03 * k, -0.05, 0.18),
      { group: "clipboard" },
    );
  },
  trowel(F) {
    const { THREE, T } = F;
    gear(
      F,
      "hand_r",
      "trowel_handle",
      tube(
        T,
        THREE,
        [
          [0, 0.03, 0.0],
          [0, -0.2, 0.02],
        ],
        0.04,
        { tubular: 3, radial: 4 },
      ),
      "#9C7356",
      { group: "trowel" },
    );
    gear(
      F,
      "hand_r",
      "trowel_blade",
      ellipsoid(THREE, [0.065, 0.24, 0.016], { w: 7, h: 6 }).translate(0, -0.46, 0.02),
      "#A7ACB1",
      { group: "trowel" },
    );
    gold(
      F,
      "hand_r",
      "trowel_collar",
      ring(THREE, 0.05, 0.016, { tubular: 8, radial: 3 }).translate(0, -0.22, 0.02),
      { group: "trowel" },
    );
  },
  cane(F) {
    const { THREE, T } = F;
    gear(
      F,
      "hand_r",
      "cane",
      tube(
        T,
        THREE,
        [
          [0, 0.08, 0.0],
          [0, -0.55, 0.02],
          [0, -1.2, 0.05],
        ],
        0.034,
        { tubular: 6, radial: 4 },
      ),
      "#6E4F3C",
      { group: "cane" },
    );
    gear(
      F,
      "hand_r",
      "cane_handle",
      tube(
        T,
        THREE,
        [
          [0, 0.08, 0],
          [0.04, 0.18, 0.0],
          [0.15, 0.2, 0.0],
          [0.18, 0.1, 0],
        ],
        0.04,
        { tubular: 6, radial: 4 },
      ),
      "#6E4F3C",
      { group: "cane" },
    );
    gold(
      F,
      "hand_r",
      "cane_band",
      ring(THREE, 0.04, 0.017, { tubular: 8, radial: 3 }).translate(0, -0.06, 0.0),
      { group: "cane" },
    );
  },
  basket(F) {
    const { THREE, T } = F;
    gear(
      F,
      "hand_l",
      "basket",
      revolve(
        T,
        [
          [0.001, -0.5],
          [0.18, -0.48],
          [0.27, -0.34],
          [0.3, -0.24],
          [0.27, -0.22],
        ],
        { segments: 12, divisions: 1 },
      ),
      gradient(THREE, "#D9BE92", { from: -0.5, to: -0.2, low: 0.76, high: 1.0 }),
      { group: "basket" },
    );
    gear(
      F,
      "hand_l",
      "basket_handle",
      tube(
        T,
        THREE,
        [
          [-0.27, -0.25, 0.0],
          [-0.1, 0.02, 0.0],
          [0.1, 0.02, 0.0],
          [0.27, -0.25, 0.0],
        ],
        0.024,
        { tubular: 8, radial: 3 },
      ),
      "#9C7356",
      { group: "basket" },
    );
    [
      ["#E99A8E", -0.1, 0.02],
      ["#F3D78A", 0.1, 0.06],
      ["#FBF3E4", 0.0, -0.1],
      ["#E99A8E", 0.16, -0.06],
      ["#F3D78A", -0.17, -0.07],
    ].forEach(([c, x, z], i) =>
      gear(
        F,
        "hand_l",
        `bloom_${i}`,
        ellipsoid(THREE, [0.075, 0.065, 0.075], { w: 5, h: 3 }).translate(x, -0.22, z),
        c,
        { group: "basket" },
      ),
    );
    gear(
      F,
      "hand_l",
      "basket_stems",
      ellipsoid(THREE, [0.22, 0.05, 0.2], { w: 6, h: 3 }).translate(0, -0.25, 0),
      "#5F9575",
      { group: "basket" },
    );
  },
  hammer(F) {
    const { THREE, T } = F;
    gear(
      F,
      "hand_r",
      "hammer_shaft",
      tube(
        T,
        THREE,
        [
          [0, 0.04, 0.0],
          [0, -0.36, 0.03],
        ],
        0.036,
        { tubular: 3, radial: 4 },
      ),
      "#9C7356",
      { group: "hammer" },
    );
    gear(
      F,
      "hand_r",
      "hammer_head",
      roundBox(THREE, [0.3, 0.13, 0.13], 0.03, 1).translate(0, -0.42, 0.03),
      "#A7ACB1",
      { group: "hammer" },
    );
    gold(
      F,
      "hand_r",
      "hammer_band",
      ring(THREE, 0.04, 0.014, { tubular: 8, radial: 3 }).translate(0, -0.3, 0.025),
      { group: "hammer" },
    );
  },
  spoon(F) {
    const { THREE, T } = F;
    gear(
      F,
      "hand_r",
      "spoon_handle",
      tube(
        T,
        THREE,
        [
          [0, 0.05, 0.0],
          [0, -0.45, 0.06],
        ],
        0.03,
        { tubular: 4, radial: 3 },
      ),
      "#9C7356",
      { group: "spoon" },
    );
    gear(
      F,
      "hand_r",
      "spoon_bowl",
      ellipsoid(THREE, [0.11, 0.15, 0.05], { w: 8, h: 6 }).translate(0, -0.62, 0.09),
      "#B98F63",
      { group: "spoon" },
    );
  },
  flask(F) {
    const { THREE, T } = F;
    gear(
      F,
      "hand_r",
      "flask",
      revolve(
        T,
        [
          [0.001, -0.5],
          [0.11, -0.48],
          [0.18, -0.36],
          [0.11, -0.2],
          [0.055, -0.12],
          [0.055, -0.03],
        ],
        { segments: 10, divisions: 1 },
      ),
      gradient(THREE, "#BFE3E6", { from: -0.5, to: -0.04, low: 0.8, high: 1.0 }),
      { group: "flask" },
    );
    gold(
      F,
      "hand_r",
      "flask_cork",
      ring(THREE, 0.055, 0.02, { tubular: 8, radial: 3 }).translate(0, -0.03, 0),
      { group: "flask" },
    );
  },
  magnifier(F) {
    const { THREE, T } = F;
    gear(
      F,
      "hand_r",
      "lens_handle",
      tube(
        T,
        THREE,
        [
          [0, 0.03, 0],
          [0, -0.3, 0.04],
        ],
        0.032,
        { tubular: 3, radial: 4 },
      ),
      "#6E4F3C",
      { group: "lens" },
    );
    gold(
      F,
      "hand_r",
      "lens_ring",
      ring(THREE, 0.15, 0.028, { tubular: 16, radial: 4 })
        .rotateX(Math.PI / 2)
        .translate(0, -0.46, 0.06),
      { group: "lens" },
    );
    gear(
      F,
      "hand_r",
      "lens_glass",
      ellipsoid(THREE, [0.135, 0.135, 0.012], { w: 12, h: 6 }).translate(0, -0.46, 0.06),
      "#DCEFF0",
      { group: "lens" },
    );
  },
  telescope(F) {
    const { THREE, T } = F;
    gear(
      F,
      "hand_l",
      "telescope",
      revolve(
        T,
        [
          [0.001, -0.3],
          [0.05, -0.29],
          [0.06, 0.1],
          [0.085, 0.14],
          [0.085, 0.4],
          [0.08, 0.42],
          [0.001, 0.42],
        ],
        { segments: 10, divisions: 1 },
      )
        .rotateX(1.25)
        .translate(0, -0.16, 0.2),
      "#9C7356",
      { group: "scope" },
    );
    gold(
      F,
      "hand_l",
      "telescope_ring",
      ring(THREE, 0.09, 0.02, { tubular: 10, radial: 3 }).rotateX(1.25).translate(0, -0.08, 0.5),
      { group: "scope" },
    );
  },
  /** the student's lantern staff (left hand): staff, hook, brass lantern with a glowing core */
  lanternStaff(F) {
    const { THREE, T } = F;
    gear(
      F,
      "hand_l",
      "staff",
      tube(
        T,
        THREE,
        [
          [0, -1.05, 0.0],
          [0, 0.2, 0.0],
          [0, 1.2, 0.02],
        ],
        0.036,
        { tubular: 8, radial: 4 },
      ),
      "#8A6246",
      { group: "staff" },
    );
    gold(
      F,
      "hand_l",
      "staff_hook",
      tube(
        T,
        THREE,
        [
          [0, 1.2, 0.02],
          [0.05, 1.32, 0.02],
          [0.14, 1.34, 0.02],
          [0.18, 1.26, 0.02],
        ],
        0.022,
        { tubular: 8, radial: 3 },
      ),
      { group: "staff" },
    );
    gold(
      F,
      "hand_l",
      "staff_cap",
      ellipsoid(THREE, [0.05, 0.035, 0.05], { w: 8, h: 4 }).translate(0, -1.07, 0),
      { group: "staff" },
    );
    gold(
      F,
      "hand_l",
      "lantern_cap",
      revolve(
        T,
        [
          [0.001, 0.0],
          [0.11, -0.03],
          [0.09, -0.06],
          [0.001, 0.04],
        ],
        { segments: 8, divisions: 1 },
      ).translate(0.18, 1.0, 0.02),
      { group: "staff" },
    );
    gold(
      F,
      "hand_l",
      "lantern_base",
      ellipsoid(THREE, [0.095, 0.03, 0.095], { w: 8, h: 4 }).translate(0.18, 0.67, 0.02),
      { group: "staff" },
    );
    const material = T.material("lamp_light", "#FFE2A6", {
      emissive: "#F6C46A",
      emissiveIntensity: 1.1,
      roughness: 0.5,
    });
    F.addGlow(
      "hand_l",
      "lamp_light",
      ellipsoid(THREE, [0.09, 0.14, 0.09], { w: 10, h: 7 }).translate(0.18, 0.83, 0.02),
      material,
      { part: "acc", style: STYLE.cloth, color: "#FFFFFF", keep: true },
    );
    for (let a = 0; a < 4; a++) {
      const x = 0.18 + 0.095 * Math.cos((a * TAU) / 4 + 0.785);
      const z = 0.02 + 0.095 * Math.sin((a * TAU) / 4 + 0.785);
      gold(
        F,
        "hand_l",
        `lantern_bar_${a}`,
        tube(
          T,
          THREE,
          [
            [x, 0.69, z],
            [x, 0.97, z],
          ],
          0.012,
          { tubular: 2, radial: 3 },
        ),
        { group: "staff" },
      );
    }
  },
};
