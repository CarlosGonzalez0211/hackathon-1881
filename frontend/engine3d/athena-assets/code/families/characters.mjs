/**
 * Characters family: the student's avatar (base + 31 part GLBs + the scarf/satchel accessory),
 * the 19 NPC files and Lumen the cat, sculpted headlessly with the kit toolkit.
 *
 * Every entry is registered under `family: "characters"` so `generate:kit --only=characters`
 * selects them all, while `file` carries a relative folder (`../avatar/...`, `../npcs/...`)
 * that puts each GLB where the committed kit keeps it (`models/avatar|npcs|characters`).
 * Identities (names, skin tones, hair colours, roles, props) come from the legacy cast; the
 * forms live in `rig/forms.mjs` and `rig/wardrobe.mjs`, the node tree and clips in
 * `rig/skeleton.mjs` and `rig/clips.mjs`.
 */
import { buildHare, buildLumen, buildOrbi, buildOwl } from "../rig/animals.mjs";
import { applyPeopleRest, peopleClips, pruneClips } from "../rig/clips.mjs";
import {
  Figure,
  calfProfile,
  consolidate,
  flattenStatic,
  faceFeatures,
  footGeometry,
  forearmProfile,
  headField,
  headGeometry,
  mitten,
  revolve,
  thighProfile,
  torsoProfile,
  tube,
  upperArmProfile,
} from "../rig/forms.mjs";
import {
  AVATAR_PARTS,
  NPC_IDS,
  RIG_CONTRACT,
  STYLE,
  bodyPlan,
  buildPeopleRig,
} from "../rig/skeleton.mjs";
import {
  GEAR,
  GOLD,
  HAT,
  HELD,
  addBottom,
  addCowl,
  addHair,
  addMantle,
  addShoes,
  addTop,
  shade,
} from "../rig/wardrobe.mjs";

// ---------------------------------------------------------------------------- body
/** Skin, face and (for sandals) bare feet: everything a person has under the clothes. */
async function addBody(F, cfg, { feet = false } = {}) {
  const { THREE, T, plan } = F;
  const kid = plan.heads < 4;
  const blush = `#${new THREE.Color(cfg.skin).lerp(new THREE.Color("#E58A86"), 0.5).getHexString()}`;
  const field = headField(T, { kid, jaw: cfg.jaw ?? 1, cheek: cfg.cheek ?? 1 });
  const head = await headGeometry(
    T,
    THREE,
    `${kid}|${cfg.jaw ?? 1}|${cfg.cheek ?? 1}|${F.detail}`,
    field,
    { skinHex: cfg.skin, blushHex: blush, kid, triangles: Math.round(480 * F.detail) },
  );
  F.add("head_geo", "head_skin", head, {
    part: "base",
    style: STYLE.skin,
    material: "skin",
    keep: true,
  });
  const face = faceFeatures(THREE, field, {
    kid,
    eyeHex: cfg.eye ?? "#4A3B36",
    browHex: cfg.brow ?? shade(THREE, cfg.hairColor ?? "#4A362D", 0.8),
    tilt: cfg.tilt ?? 0.1,
  });
  const eyeOrigin = [0, 0.58, 0];
  for (const eye of face.eyes)
    F.add("face_expression", `eye_${eye.side}`, eye.geometry, {
      part: "base",
      style: STYLE.eye,
      material: "eye",
      origin: eyeOrigin,
      keep: true,
    });
  for (const light of F.detail < 0.7 ? [] : face.lights) {
    F.add("face_expression", `glint_${light.side}`, light.big, {
      part: "base",
      style: STYLE.eye,
      material: "eye",
      origin: eyeOrigin,
      keep: true,
    });
    F.add("face_expression", `glint_small_${light.side}`, light.small, {
      part: "base",
      style: STYLE.eye,
      material: "eye",
      origin: eyeOrigin,
      keep: true,
    });
  }
  for (const brow of face.brows)
    F.add(
      "head_geo",
      `brow_${brow.side}`,
      tube(T, THREE, brow.points, 0.017, { tubular: 4, radial: 3 }),
      { part: "base", style: STYLE.hair, material: "hair", color: brow.color },
    );
  F.add("mouth", "lips", tube(T, THREE, face.mouth, 0.012, { tubular: 6, radial: 3 }), {
    part: "base",
    style: STYLE.eye,
    material: "eye",
    color: "#B5625C",
    origin: [0, 0.32, 0.4],
  });

  // torso, arms, hands, legs: only what the clothes leave bare (budgets are tight)
  const skin = { part: "base", style: STYLE.skin, material: "skin", color: cfg.skin };
  const bare = cfg.bare ?? bareSkin(cfg);
  if (bare.torso)
    F.add(
      "torso",
      "torso_skin",
      revolve(T, torsoProfile(plan, -0.012), { rz: 0.78, segments: 12, divisions: 1 }),
      skin,
    );
  for (const side of ["l", "r"]) {
    if (bare.upperArm)
      F.add(
        `arm_${side}`,
        `arm_skin_${side}`,
        revolve(T, upperArmProfile(plan), {
          segments: F.detail < 0.7 ? 8 : 10,
          divisions: 1,
          rz: 0.96,
        }),
        skin,
      );
    if (bare.forearm)
      F.add(
        `elbow_${side}`,
        `forearm_skin_${side}`,
        revolve(T, forearmProfile(plan), {
          segments: F.detail < 0.7 ? 8 : 10,
          divisions: 1,
          rz: 0.96,
        }),
        skin,
      );
    F.add(
      `hand_${side}`,
      `hand_skin_${side}`,
      mitten(T, THREE, side === "l" ? -1 : 1, { lean: F.detail < 0.7 }),
      skin,
    );
    if (bare.thigh)
      F.add(
        `leg_${side}`,
        `thigh_skin_${side}`,
        revolve(T, thighProfile(plan), {
          segments: F.detail < 0.7 ? 8 : 10,
          divisions: 1,
          rz: 0.96,
        }),
        skin,
      );
    if (bare.calf)
      F.add(
        `knee_${side}`,
        `calf_skin_${side}`,
        revolve(T, calfProfile(plan), {
          segments: F.detail < 0.7 ? 8 : 10,
          divisions: 1,
          rz: 0.96,
        }),
        skin,
      );
    if (feet) {
      const foot = await footGeometry(T, THREE, "sandals");
      foot.scale(0.8, 0.8, 0.9);
      F.add(`knee_${side}`, `foot_skin_${side}`, foot, {
        ...skin,
        origin: [0, plan.calf / plan.hh, 0],
        group: `foot_${side}`,
        keep: true,
      });
    }
  }
}

/** Which skin the outfit leaves visible (the avatar base shows everything). */
function bareSkin(cfg) {
  const top = cfg.top?.style;
  const bottom = cfg.bottom?.style;
  const covered = ["trousers", "cargo", "leggings", "wide", "overalls"].includes(bottom);
  return {
    torso: !top,
    upperArm: !top,
    forearm: !top || top === "tee",
    thigh: !covered,
    calf: !covered,
  };
}

/** Everything a person wears and carries, from one description. */
async function dress(F, cfg) {
  if (cfg.hair) await addHair(F, cfg.hair[0], cfg.hair[1]);
  if (cfg.top) addTop(F, cfg.top);
  if (cfg.bottom) addBottom(F, cfg.bottom);
  if (cfg.shoes) await addShoes(F, cfg.shoes);
  if (cfg.mantle) addMantle(F, cfg.mantle);
  for (const [name, ...args] of cfg.head ?? []) HAT[name](F, ...args);
  for (const [name, ...args] of cfg.gear ?? []) GEAR[name](F, ...args);
  for (const [name, ...args] of cfg.held ?? []) HELD[name](F, ...args);
}

// ---------------------------------------------------------------------------- the student
const STUDENT = {
  height: 1.2,
  heads: 3.5,
  width: 1,
  skin: "#E9C2A2",
  eye: "#4A3B36",
  hairColor: "#5A4136",
  brow: "#4A362D",
};
const HAIR_COLOR = "#5A4136";

/** Default colours of every part, from the legacy parts (identities kept). */
const PART_STYLE = {
  hair: Object.fromEntries(AVATAR_PARTS.hair.map((name) => [name, HAIR_COLOR])),
  top: {
    poncho: { style: "poncho", color: "#D9A441", color2: "#F1E4D0" },
    tee: { style: "tee", color: "#2F7D7A", color2: "#F4E9D8" },
    hoodie: { style: "hoodie", color: "#B7A6D6", color2: "#F4E9D8" },
    stripe: { style: "stripe", color: "#F4E9D8", color2: "#2F7D7A" },
    jacket: { style: "jacket", color: "#3E4A5E", color2: "#F4E9D8" },
    raincoat: { style: "raincoat", color: "#F3D78A", color2: "#F4E9D8", trim: "#6E4F3C" },
    cardigan: { style: "cardigan", color: "#C9785F", color2: "#F4E9D8" },
    vest: { style: "vest", color: "#6E4F3C", color2: "#F4E9D8" },
    labcoat: { style: "labcoat", color: "#FFFFFF", color2: "#2F7D7A" },
  },
  bottom: {
    shorts: "#C99A5B",
    trousers: "#3E4A5E",
    skirt: "#C9785F",
    overalls: "#5E7FA8",
    cargo: "#7A8B5A",
    leggings: "#3E4A5E",
    wide: "#E7CDA6",
  },
  shoes: {
    boots: { color: "#6E4F3C", sole: "#3A3230", trim: "#E7CDA6" },
    sneakers: { color: "#C9785F", sole: "#F4EFE6" },
    sandals: { color: "#9C7356", sole: "#7A5A42" },
    rainboots: { color: "#2F7D7A", sole: "#3A3230" },
    clogs: { color: "#C9785F", sole: "#C8A36A" },
    loafers: { color: "#4A3B36", sole: "#3A3230" },
    hiking: { color: "#7A8B5A", sole: "#3A3230", lace: "#E99A8E" },
  },
};

async function buildStudentParts(THREE, T, only, build, withClips = false) {
  const plan = bodyPlan({ height: STUDENT.height, heads: STUDENT.heads, width: STUDENT.width });
  const rig = buildPeopleRig(THREE, plan, { rootName: "athena_avatar" });
  const F = new Figure(THREE, T, rig);
  F.only = only;
  await build(F);
  consolidate(THREE, T, rig.root, new Set(RIG_CONTRACT.people.animated));
  let clips;
  if (withClips) {
    applyPeopleRest(THREE, rig.nodes);
    clips = pruneClips(THREE, peopleClips(THREE, plan, rig.name), rig.root);
  }
  return { root: rig.root, clips, extras: { athenaKeepHierarchy: true } };
}

const avatarEntries = [
  {
    id: "avatar-base",
    family: "characters",
    file: "../avatar/athena-avatar-base.glb",
    build: (THREE, T) =>
      buildStudentParts(
        THREE,
        T,
        new Set(["base"]),
        (F) => addBody(F, STUDENT, { feet: true }),
        true,
      ),
  },
];
for (const [group, names] of Object.entries(AVATAR_PARTS)) {
  for (const name of names) {
    avatarEntries.push({
      id: `avatar-${group}-${name}`,
      family: "characters",
      file: `../avatar/athena-avatar-${group}-${name}.glb`,
      build: (THREE, T) => {
        const tag = group === "acc" ? "acc" : group;
        return buildStudentParts(THREE, T, new Set([tag]), async (F) => {
          if (group === "hair") await addHair(F, name, PART_STYLE.hair[name]);
          if (group === "top") {
            const top = PART_STYLE.top[name];
            addTop(F, top);
            if (name === "poncho") addCowl(F, { color: "#2F7D7A", lining: "#F1E4D0" });
          }
          if (group === "bottom")
            addBottom(F, { style: name, color: PART_STYLE.bottom[name], trim: GOLD });
          if (group === "shoes") await addShoes(F, { style: name, ...PART_STYLE.shoes[name] });
          if (group === "acc") {
            GEAR.scarf(F, "#2F7D7A");
            GEAR.satchel(F, "#9C7356", { out: 1.45, back: 0.22 });
            HELD.lanternStaff(F);
            HELD.book(F, "#C9785F", "r");
          }
        });
      },
    });
  }
}

// ---------------------------------------------------------------------------- the cast
const N = (o) => ({ heads: 4.5, width: 1, ...o });
const CAST = {
  "mentor-elena": N({
    height: 1.56,
    skin: "#F0CFB4",
    eye: "#6B4A37",
    hairColor: "#3A2E28",
    hair: ["bob", "#3A2E28"],
    top: { style: "cardigan", color: "#C9785F", color2: "#F4E9D8" },
    bottom: { style: "skirt", color: "#E7CDA6", trim: GOLD },
    shoes: { style: "boots", color: "#4A3B36", sole: "#3A3230" },
    mantle: { kind: "capelet", color: "#C9785F" },
    gear: [["satchel", "#9C7356"]],
    held: [["book", "#2F7D7A", "l"]],
  }),
  "guide-rafa": N({
    height: 1.79,
    width: 1.06,
    skin: "#C99A7A",
    eye: "#3F3029",
    hairColor: "#5A4136",
    hair: ["crop", "#5A4136"],
    top: { style: "jacket", color: "#C9785F", color2: "#F4E9D8" },
    bottom: { style: "cargo", color: "#7A8B5A" },
    shoes: { style: "hiking", color: "#6E4F3C", sole: "#3A3230", lace: "#E99A8E" },
    mantle: { kind: "capelet", color: "#2F7D7A" },
    head: [["beanie", "#2F7D7A"]],
    gear: [["backpack", "#7A8B5A"], ["rope"]],
  }),
  "gardener-carmen": N({
    height: 1.44,
    width: 1.06,
    skin: "#E2B596",
    eye: "#5C7A5A",
    hairColor: "#E8E4DE",
    hair: ["bun", "#E8E4DE"],
    brow: "#B9B4AE",
    cheek: 1.08,
    top: { style: "vest", color: "#93BE8B", color2: "#F4E9D8" },
    bottom: { style: "skirt", color: "#C9785F", trim: "#E99A8E" },
    shoes: { style: "clogs", color: "#5F9575", sole: "#C8A36A" },
    mantle: { kind: "shawl", color: "#E99A8E" },
    head: [["sunhat", "#E6CDA6", "#E99A8E"]],
    held: [["basket"], ["cane"]],
  }),
  "headmaster-ilda": N({
    height: 1.62,
    skin: "#C99A7A",
    eye: "#3F3029",
    hairColor: "#B9B4AE",
    hair: ["bun", "#B9B4AE"],
    brow: "#8D8780",
    top: { style: "jacket", color: "#3E4A5E", color2: "#F4E9D8" },
    bottom: { style: "trousers", color: "#3E4A5E" },
    shoes: { style: "loafers", color: "#4A3B36", sole: "#3A3230" },
    mantle: { kind: "capelet", color: "#3E4A5E" },
    head: [["glasses", "#3A3230"]],
    held: [["clipboard", "l"]],
  }),
  "librarian-oscar": N({
    height: 1.63,
    skin: "#E9C2A2",
    eye: "#4A3B36",
    hairColor: "#3A2E28",
    hair: ["curls", "#3A2E28"],
    top: { style: "cardigan", color: "#5F9575", color2: "#F4E9D8" },
    bottom: { style: "trousers", color: "#4A3B36" },
    shoes: { style: "loafers", color: "#6E4F3C", sole: "#3A3230" },
    mantle: { kind: "shawl", color: "#5F9575" },
    head: [["glasses", "#3A3230"]],
    held: [["book", "#2F7D7A", "r"]],
  }),
  "cook-marisol": N({
    height: 1.67,
    skin: "#8D5B42",
    eye: "#2F2420",
    hairColor: "#2B2220",
    hair: ["curls", "#2B2220"],
    top: { style: "jacket", color: "#FFFFFF", color2: "#C9785F" },
    bottom: { style: "trousers", color: "#3E4A5E" },
    shoes: { style: "clogs", color: "#C9785F", sole: "#C8A36A" },
    mantle: { kind: "capelet", color: "#C9785F" },
    head: [["toque"]],
    gear: [["apron", "#FBF3E4", "#E99A8E"]],
    held: [["spoon"]],
  }),
  "builder-ana": N({
    height: 1.59,
    skin: "#E9C2A2",
    eye: "#4A3B36",
    hairColor: "#7A4A32",
    hair: ["ponytail", "#7A4A32"],
    top: { style: "tee", color: "#C9785F", color2: "#F4E9D8" },
    bottom: { style: "overalls", color: "#5E7FA8", trim: GOLD },
    shoes: { style: "boots", color: "#6E4F3C", sole: "#3A3230" },
    mantle: { kind: "capelet", color: "#2F7D7A" },
    head: [["hardhat", "#F2C36B"]],
    held: [["hammer"]],
  }),
  "builder-leo": N({
    height: 1.72,
    width: 1.1,
    skin: "#A5704F",
    eye: "#2F2420",
    hairColor: "#2B2220",
    hair: ["crop", "#2B2220"],
    top: { style: "vest", color: "#F3B35B", color2: "#3E4A5E" },
    bottom: { style: "cargo", color: "#6E6A62" },
    shoes: { style: "boots", color: "#4A3B36", sole: "#3A3230" },
    mantle: { kind: "capelet", color: "#F3B35B" },
    head: [["hardhat", "#F2C36B"]],
    gear: [["plank"]],
  }),
  "engineer-noor": N({
    height: 1.64,
    skin: "#C99A7A",
    eye: "#3F3029",
    hairColor: "#2B2220",
    hair: ["braids", "#2B2220"],
    top: { style: "jacket", color: "#2F7D7A", color2: "#F4E9D8" },
    bottom: { style: "trousers", color: "#3E4A5E" },
    shoes: { style: "hiking", color: "#6E4F3C", sole: "#3A3230", lace: "#E99A8E" },
    mantle: { kind: "capelet", color: "#2F7D7A" },
    head: [
      ["hardhat", "#FFFFFF"],
      ["glasses", "#3A3230"],
    ],
    held: [["clipboard", "l"]],
  }),
  "dr-amaia": N({
    height: 1.58,
    skin: "#F0CFB4",
    eye: "#6B4A37",
    hairColor: "#C47A4A",
    hair: ["ponytail", "#C47A4A"],
    top: { style: "labcoat", color: "#FFFFFF", color2: "#B7A6D6" },
    bottom: { style: "trousers", color: "#3E4A5E" },
    shoes: { style: "sneakers", color: "#2F7D7A", sole: "#F4EFE6" },
    mantle: { kind: "capelet", color: "#B7A6D6" },
    head: [["goggles"]],
    held: [["book", "#C9785F", "r"]],
  }),
  "dr-bruno": N({
    height: 1.67,
    width: 1.04,
    skin: "#E2B596",
    eye: "#4F6D8E",
    hairColor: "#B9B4AE",
    hair: ["crop", "#B9B4AE"],
    brow: "#8D8780",
    top: { style: "labcoat", color: "#FFFFFF", color2: "#93C1D6" },
    bottom: { style: "trousers", color: "#6E4F3C" },
    shoes: { style: "loafers", color: "#4A3B36", sole: "#3A3230" },
    mantle: { kind: "capelet", color: "#93C1D6" },
    head: [
      ["glasses", "#3A3230"],
      ["beard", "#B9B4AE"],
    ],
    held: [["magnifier"]],
  }),
  "historian-tomas": N({
    height: 1.63,
    width: 1.1,
    skin: "#B88462",
    eye: "#3F3029",
    hairColor: "#3A2E28",
    hair: ["curls", "#3A2E28"],
    top: { style: "vest", color: "#7A8B5A", color2: "#F4E9D8" },
    bottom: { style: "trousers", color: "#B9A893" },
    shoes: { style: "hiking", color: "#6E4F3C", sole: "#3A3230", lace: "#E99A8E" },
    mantle: { kind: "shawl", color: "#7A8B5A" },
    head: [["sunhat", "#E7CDA6", "#E99A8E"]],
    gear: [["scroll"]],
    held: [["trowel"]],
  }),
  "marine-kai": N({
    height: 1.63,
    skin: "#D6A27E",
    eye: "#3F3029",
    hairColor: "#2B2220",
    hair: ["crop", "#2B2220"],
    top: { style: "wetsuit", color: "#2F7D7A", trim: GOLD },
    bottom: { style: "leggings", color: "#2F7D7A" },
    shoes: { style: "fins", color: "#F2C36B", sole: "#C8A36A" },
    mantle: { kind: "capelet", color: "#F3D78A" },
    head: [["divemask"]],
    gear: [["tank"]],
  }),
  "explorer-nico": N({
    height: 1.22,
    heads: 3.5,
    skin: "#D6A27E",
    eye: "#3F3029",
    hairColor: "#5A4136",
    hair: ["crop", "#5A4136"],
    top: { style: "tee", color: "#F3D78A", color2: "#C9785F" },
    bottom: { style: "shorts", color: "#7A8B5A" },
    shoes: { style: "sneakers", color: "#2F7D7A", sole: "#F4EFE6" },
    mantle: { kind: "capelet", color: "#C9785F" },
    head: [["cap", "#C9785F"]],
    gear: [["satchel", "#9C7356", { side: -1 }], ["compass"]],
    held: [["telescope"]],
  }),
  "musician-lia": N({
    height: 1.57,
    skin: "#8D5B42",
    eye: "#2F2420",
    hairColor: "#2B2220",
    hair: ["braids", "#2B2220"],
    top: { style: "hoodie", color: "#B7A6D6", color2: "#F3D78A" },
    bottom: { style: "wide", color: "#2F7D7A" },
    shoes: { style: "sandals", color: "#9C7356", sole: "#7A5A42" },
    mantle: { kind: "capelet", color: "#B7A6D6" },
    head: [["headband", "#F3D78A"]],
    gear: [["lute"]],
    feet: true,
  }),
};

async function buildNpc(THREE, T, id) {
  const cfg = CAST[id];
  const plan = bodyPlan({ height: cfg.height, heads: cfg.heads, width: cfg.width });
  const rig = buildPeopleRig(THREE, plan, { rootName: `npc_${id.replaceAll("-", "_")}` });
  const F = new Figure(THREE, T, rig, { weave: false, collapse: true });
  await addBody(F, cfg, { feet: !!cfg.feet });
  await dress(F, cfg);
  // the cape hangs from `chest`: seat it on the back of the garments, in front of any pack
  rig.nodes.chest.position.z = F.torsoBack();
  consolidate(THREE, T, rig.root, new Set(RIG_CONTRACT.people.animated));
  applyPeopleRest(THREE, rig.nodes);
  // `height` is the figure's height as the village sees it, hat or hair included
  rig.root.updateMatrixWorld(true);
  const tall = new THREE.Box3().setFromObject(rig.root).getSize(new THREE.Vector3()).y;
  if (Math.abs(tall / cfg.height - 1) > 0.02) rig.root.scale.setScalar(cfg.height / tall);
  return {
    root: rig.root,
    clips: pruneClips(
      THREE,
      peopleClips(THREE, plan, rig.name).filter((clip) =>
        RIG_CONTRACT.people.npcClips.includes(clip.name),
      ),
      rig.root,
    ),
    extras: { athenaKeepHierarchy: true },
  };
}

// ---------------------------------------------------------------------------- study trio
const TRIO = [
  {
    key: "a",
    x: -0.44,
    yaw: 0.35,
    height: 1.2,
    skin: "#8D5B42",
    eye: "#2F2420",
    hairColor: "#2F2725",
    hair: ["curls", "#2F2725"],
    top: { style: "hoodie", color: "#B7A6D6", color2: "#F4E9D8" },
    bottom: { style: "trousers", color: "#3E4A5E" },
    shoes: { style: "sneakers", color: "#F3D78A", sole: "#F4EFE6" },
    mantle: { kind: "collar", color: "#B7A6D6", clasp: false },
    held: [["book", "#C9785F", "r"]],
  },
  {
    key: "b",
    x: 0.0,
    yaw: 0,
    height: 1.3,
    skin: "#F0CEB3",
    eye: "#6B4A37",
    hairColor: "#C3794B",
    hair: ["ponytail", "#C3794B"],
    top: { style: "stripe", color: "#F4E8D7", color2: "#C8775F" },
    bottom: { style: "skirt", color: "#E8998D", trim: GOLD },
    shoes: { style: "boots", color: "#337C79", sole: "#3D3533" },
    mantle: { kind: "collar", color: "#C8775F", clasp: false },
    head: [["glasses", "#3D3533"]],
    held: [["book", "#337C79", "l"]],
  },
  {
    key: "c",
    x: 0.44,
    yaw: -0.35,
    height: 1.12,
    skin: "#D5A17D",
    eye: "#3F3029",
    hairColor: "#3D322C",
    hair: ["bob", "#3D322C"],
    top: { style: "vest", color: "#92BD8A", color2: "#F4E8D7" },
    bottom: { style: "shorts", color: "#F3D689" },
    shoes: { style: "sandals", color: "#9B7257", sole: "#7A5A42" },
    mantle: { kind: "collar", color: "#92BD8A", clasp: false },
    gear: [["backpack", "#9B7257"]],
    feet: true,
  },
];

async function buildTrio(THREE, T) {
  const root = new THREE.Group();
  root.name = "npc_study_trio";
  for (const kid of TRIO) {
    const plan = bodyPlan({ height: kid.height, heads: 3.5 });
    const rig = buildPeopleRig(THREE, plan, { rootName: `kid_${kid.key}` });
    const F = new Figure(THREE, T, rig, { weave: false, collapse: true, detail: 0.45 });
    await addBody(F, kid, { feet: !!kid.feet });
    await dress(F, kid);
    applyPeopleRest(THREE, rig.nodes);
    rig.root.position.x = kid.x;
    rig.root.rotation.y = kid.yaw;
    root.add(rig.root);
  }
  // the trio never moves (no clips): bake all three kids into one mesh per material
  if (!process.env.KIT_NOFLAT) flattenStatic(THREE, T, root);
  // centre the group on the origin (the backpack and the fanned stance pull it off-axis)
  root.updateMatrixWorld(true);
  const centre = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
  root.traverse((mesh) => mesh.isMesh && mesh.geometry.translate(-centre.x, 0, -centre.z));
  return { root, extras: { athenaKeepHierarchy: true } };
}

// ---------------------------------------------------------------------------- registry
/** Heights (m) of the creatures, as the village scene was laid out for them. */
const ANIMAL_HEIGHT = { "cat-lumen": 0.52, "owl-sage": 0.61, "hare-pip": 0.6, "visitor-orbi": 0.7 };

/** Animals and visitors: merge their meshes per (bone, material), as the people are. */
function withAnimalBones(id, builder) {
  const height = ANIMAL_HEIGHT[id];
  return async (THREE, T) => {
    const built = await builder(THREE, T);
    const bones = RIG_CONTRACT.animals[id]?.nodes;
    if (bones) consolidate(THREE, T, built.root, new Set(bones));
    // Sculpted bodies round off a little below (or above) the ground plane: seat them on it, in
    // the rest pose and in every clip, which place `body` absolutely.
    built.root.updateMatrixWorld(true);
    const dy = -new THREE.Box3().setFromObject(built.root).min.y;
    const body = built.root.getObjectByName("body");
    if (body && Math.abs(dy) > 1e-4) {
      body.position.y += dy;
      for (const clip of built.clips ?? [])
        for (const track of clip.tracks)
          if (track.name === "body.position")
            for (let i = 1; i < track.values.length; i += 3) track.values[i] += dy;
    }
    // keep each creature at the size the village was laid out for
    const size = new THREE.Box3().setFromObject(built.root).getSize(new THREE.Vector3()).y;
    if (height && Math.abs(size / height - 1) > 0.03) built.root.scale.setScalar(height / size);
    return built;
  };
}

const npcEntries = NPC_IDS.map((id) => {
  const builders = {
    "study-trio": buildTrio,
    "visitor-orbi": buildOrbi,
    "owl-sage": buildOwl,
    "hare-pip": buildHare,
  };
  return {
    id: `npc-${id}`,
    family: "characters",
    file: `../npcs/athena-npc-${id}.glb`,
    build: (THREE, T) =>
      builders[id] ? withAnimalBones(id, builders[id])(THREE, T) : buildNpc(THREE, T, id),
  };
});

/** @type {Array<{ id: string, family: string, file: string, build: Function }>} */
export const entries = [
  ...avatarEntries,
  ...npcEntries,
  {
    id: "npc-cat-lumen",
    family: "characters",
    file: "athena-npc-cat-lumen.glb",
    build: withAnimalBones("cat-lumen", buildLumen),
  },
];
