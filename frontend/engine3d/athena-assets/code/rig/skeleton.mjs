/**
 * Character rig: the node tree, the proportions and the contract the runtime and the tests
 * read (docs/art/briefs/characters.md, "Rig and clip contract").
 *
 * People (student, 19 NPC files, the study trio) share one node tree. Every animated node
 * is an empty group; meshes hang below them under names that are never animated, so the
 * runtime merge (`src/athena/merge.ts`) can fold the whole figure into two skinned draws
 * whose bones are the animated nodes themselves.
 *
 *   body > hip > { leg_l > knee_l, leg_r > knee_r,
 *                  torso > { chest, top_detail,
 *                            arm_l > elbow_l > hand_l, arm_r > elbow_r > hand_r,
 *                            head > { head_geo > { hair, mouth }, face_expression } } }
 *
 * `_l` is on -x and `_r` on +x (the convention of the legacy clips). +Z is forward, metres,
 * feet at y = 0 and the figure centred on the origin.
 */

/** Custom vertex attribute value per surface class (read by `src/athena/character-look.ts`). */
export const STYLE = Object.freeze({
  skin: 1,
  hair: 2,
  eye: 3,
  cloth: 4,
  /** the signature mantle / hood / shawl: `src/village/cloth.ts` takes the cape colour from it */
  mantle: 5,
  fur: 6,
  /** woven poncho: chevron motif from `athena_weave` */
  woven: 7,
});

export const PART_TAGS = Object.freeze(["base", "hair", "top", "bottom", "shoes", "acc"]);

export const PEOPLE_CLIPS = Object.freeze([
  "idle",
  "walk",
  "run",
  "sprint",
  "air",
  "afk1_lookaround",
  "afk2_stretch",
  "afk3_sit",
  "talk",
  "emote_wave",
  "expression_blink",
]);

/** parent of every node of the people tree (`body` is the root of the rig). */
const PEOPLE_PARENT = Object.freeze({
  hip: "body",
  leg_l: "hip",
  knee_l: "leg_l",
  leg_r: "hip",
  knee_r: "leg_r",
  torso: "hip",
  chest: "torso",
  top_detail: "torso",
  arm_l: "torso",
  elbow_l: "arm_l",
  hand_l: "elbow_l",
  arm_r: "torso",
  elbow_r: "arm_r",
  hand_r: "elbow_r",
  head: "torso",
  head_geo: "head",
  hair: "head_geo",
  mouth: "head_geo",
  face_expression: "head",
});

/** Nodes the people clips drive (tracks `<name>.quaternion`, `.position` or `.scale`). */
const PEOPLE_ANIMATED = Object.freeze([
  "body",
  "torso",
  "head",
  "arm_l",
  "arm_r",
  "elbow_l",
  "elbow_r",
  "leg_l",
  "leg_r",
  "knee_l",
  "knee_r",
  "mouth",
  "face_expression",
]);

export const AVATAR_PARTS = Object.freeze({
  hair: ["bob", "crop", "long", "ponytail", "curls", "braids", "swept"],
  top: ["poncho", "tee", "hoodie", "stripe", "jacket", "raincoat", "cardigan", "vest", "labcoat"],
  bottom: ["shorts", "trousers", "skirt", "overalls", "cargo", "leggings", "wide"],
  shoes: ["boots", "sneakers", "sandals", "rainboots", "clogs", "loafers", "hiking"],
  acc: ["scarf-satchel"],
});

/** The 19 files of `models/npcs/` (`athena-npc-<id>.glb`) and Lumen in `models/characters/`. */
export const NPC_IDS = Object.freeze([
  "mentor-elena",
  "guide-rafa",
  "gardener-carmen",
  "headmaster-ilda",
  "librarian-oscar",
  "cook-marisol",
  "builder-ana",
  "builder-leo",
  "engineer-noor",
  "dr-amaia",
  "dr-bruno",
  "historian-tomas",
  "marine-kai",
  "explorer-nico",
  "musician-lia",
  "study-trio",
  "visitor-orbi",
  "owl-sage",
  "hare-pip",
]);

/**
 * Everything automated tests and the runtime may rely on. `tests/village-rig.test.ts` and
 * `tests/kit-rig.test.ts` are written against this object; change it together with them.
 */
export const RIG_CONTRACT = Object.freeze({
  version: 1,
  /** `userData.part` on every mesh of a person */
  parts: PART_TAGS,
  /** `athena_style` values (the exporter writes `_ATHENA_STYLE`, the loader reads `_athena_style`) */
  styles: STYLE,
  attributes: Object.freeze(["athena_style", "athena_weave"]),
  people: Object.freeze({
    root: "body",
    parents: PEOPLE_PARENT,
    nodes: Object.freeze(["body", ...Object.keys(PEOPLE_PARENT)]),
    animated: PEOPLE_ANIMATED,
    clips: PEOPLE_CLIPS,
    /** the NPC files carry only what surface.ts plays (the avatar file keeps all `clips`) */
    npcClips: Object.freeze(["idle", "walk", "talk", "expression_blink"]),
    /** clips that must move knees and elbows */
    locomotion: Object.freeze(["walk", "run", "sprint", "air"]),
    joints: Object.freeze(["knee_l", "knee_r", "elbow_l", "elbow_r"]),
    blink: Object.freeze({
      clip: "expression_blink",
      node: "face_expression",
      /** `scale.y` is below `closed` at `closedAt` seconds and above `open` at `openAt` */
      closedAt: 3.82,
      closed: 0.2,
      openAt: 4.12,
      open: 0.99,
    }),
    /** the study trio is static: one merged mesh per material, no rig nodes, no clips */
    staticFiles: Object.freeze(["study-trio"]),
  }),
  /**
   * The built student (base + the default outfit): which animated bone must own the mesh named
   * `name` of the part file `file` after grafting and merging. Meshes are merged per (bone,
   * material) by the generator, so a name is `<bone>__<material>`; glow parts keep their own name.
   */
  student: Object.freeze({
    outfit: Object.freeze({
      hair: "bob",
      top: "poncho",
      bottom: "trousers",
      shoes: "boots",
      acc: "scarf-satchel",
    }),
    meshes: Object.freeze([
      { file: "hair-bob", name: "head__hair_strand", bone: "head" },
      { file: "shoes-boots", name: "knee_l__shoe_leather", bone: "knee_l" },
      { file: "shoes-boots", name: "knee_r__shoe_leather", bone: "knee_r" },
      { file: "top-poncho", name: "torso__top_cloth", bone: "torso" },
      { file: "bottom-trousers", name: "leg_l__bottom_cloth", bone: "leg_l" },
      { file: "acc-scarf-satchel", name: "torso__gear_cloth", bone: "torso" },
      { file: "acc-scarf-satchel", name: "lamp_light", bone: "elbow_l" },
      { file: "acc-scarf-satchel", name: "elbow_r__gear_cloth", bone: "elbow_r" },
    ]),
  }),
  animals: Object.freeze({
    "cat-lumen": Object.freeze({
      nodes: ["body", "head", "ear_l", "ear_r", "tail", "face_expression"],
      clips: ["idle", "talk", "expression_blink"],
    }),
    "owl-sage": Object.freeze({
      nodes: ["body", "head", "wing_l", "wing_r"],
      clips: ["idle", "talk"],
    }),
    "hare-pip": Object.freeze({
      nodes: ["body", "head", "ear_l", "ear_r", "tail"],
      clips: ["idle", "talk"],
    }),
    "visitor-orbi": Object.freeze({
      nodes: ["body", "head", "antenna_l", "antenna_r"],
      clips: ["idle", "talk"],
    }),
  }),
  files: Object.freeze({
    avatar: Object.freeze([
      "athena-avatar-base.glb",
      ...Object.entries(AVATAR_PARTS).flatMap(([group, names]) =>
        names.map((name) => `athena-avatar-${group}-${name}.glb`),
      ),
    ]),
    npcs: Object.freeze(NPC_IDS.map((id) => `athena-npc-${id}.glb`)),
    characters: Object.freeze(["athena-npc-cat-lumen.glb"]),
  }),
  /** emissive or transparent materials characters may use (everything else is opaque, plain) */
  glowMaterials: Object.freeze(["lamp_light", "charm_glow", "antenna_glow"]),
  /** the one plain material of every human NPC file (colour is in the vertices, shading in athena_style) */
  npcMaterial: "character_surface",
  /** garment material names avoid these (cloth.ts skips them when it looks for the cape colour) */
  nonGarment: /skin|hair|eye|blush|lips|sole|shoe|paper|ink/,
  budgets: Object.freeze({
    avatarBaseTriangles: 5000,
    avatarPartTriangles: 1500,
    characterTriangles: 7000,
    characterBytes: 60 * 1024,
    allNpcBytes: 1.2 * 1024 * 1024,
    skinnedDrawsPerCharacter: 2,
  }),
});

/**
 * Proportions of one figure, in metres. Adults are 4.5 heads tall, children and the student
 * 3.5. `hh` is the height of the head from chin to crown; every other length is a multiple.
 *
 * @param {{ height: number, heads?: number, width?: number }} options
 */
export function bodyPlan({ height, heads = 4.5, width = 1 }) {
  const hh = height / heads;
  const neck = 0.12 * hh;
  const legLen = hh * (1.35 + (heads - 3.5) * 0.6);
  const torsoLen = height - legLen - neck - hh;
  const w = width;
  return {
    height,
    heads,
    hh,
    w,
    neck,
    legLen,
    thigh: legLen * 0.5,
    calf: legLen * 0.5,
    torsoLen,
    hipY: legLen,
    legX: 0.15 * hh * w,
    shoulderX: 0.335 * hh * w,
    shoulderY: torsoLen - 0.2 * hh,
    upperArm: (heads > 4 ? 0.56 : 0.5) * hh,
    forearm: (heads > 4 ? 0.62 : 0.55) * hh,
    /** y of the chin and the eyes in head space (`head` node origin = base of the neck) */
    chinY: neck,
    eyeY: neck + 0.46 * hh,
    /** back surface of the torso (cape anchor) */
    backZ: -0.2 * hh,
    /** sitting pose drops the hip to this height above the ground */
    sitY: 0.36 * hh,
  };
}

const NAME_SUFFIX = (suffix) => (name) => (suffix ? `${name}_${suffix}` : name);

/**
 * Builds the people node tree. Returns `{ nodes, name, root }`: `nodes[<base name>]` is the
 * THREE.Group; `name(base)` maps a base name to the (possibly suffixed) node name.
 *
 * @param {import("three")} THREE
 * @param {ReturnType<typeof bodyPlan>} plan
 * @param {{ suffix?: string, rootName?: string }} [options]
 */
export function buildPeopleRig(THREE, plan, { suffix = "", rootName = "character" } = {}) {
  const name = NAME_SUFFIX(suffix);
  const nodes = {};
  const make = (base, x = 0, y = 0, z = 0) => {
    const group = new THREE.Group();
    group.name = name(base);
    group.position.set(x, y, z);
    nodes[base] = group;
    return group;
  };
  const root = new THREE.Group();
  root.name = rootName;
  const body = make("body");
  root.add(body);
  const hip = make("hip", 0, plan.hipY, 0);
  body.add(hip);
  for (const [side, sign] of [
    ["l", -1],
    ["r", 1],
  ]) {
    const leg = make(`leg_${side}`, sign * plan.legX, 0, 0);
    const knee = make(`knee_${side}`, 0, -plan.thigh, 0);
    leg.add(knee);
    hip.add(leg);
  }
  const torso = make("torso", 0, 0, 0);
  hip.add(torso);
  torso.add(make("chest", 0, plan.shoulderY - 0.04 * plan.hh, plan.backZ));
  torso.add(make("top_detail"));
  for (const [side, sign] of [
    ["l", -1],
    ["r", 1],
  ]) {
    const arm = make(`arm_${side}`, sign * plan.shoulderX, plan.shoulderY, 0);
    const elbow = make(`elbow_${side}`, 0, -plan.upperArm, 0);
    const hand = make(`hand_${side}`, 0, -plan.forearm, 0);
    elbow.add(hand);
    arm.add(elbow);
    torso.add(arm);
  }
  const head = make("head", 0, plan.torsoLen, 0);
  const headGeo = make("head_geo");
  headGeo.add(make("hair"));
  headGeo.add(make("mouth", 0, plan.chinY + 0.2 * plan.hh, 0.4 * plan.hh));
  head.add(headGeo);
  head.add(make("face_expression", 0, plan.eyeY, 0));
  torso.add(head);
  return { root, nodes, name, plan };
}
