/**
 * Clips for the people rig and the animals. Node-animated and absolute: every track is a
 * `<node>.quaternion` (radians through Euler angles), `<node>.position` or `<node>.scale`
 * sampled at fixed steps, and every frame of a clip names the same set of tracks so clips
 * crossfade without popping.
 *
 * Conventions (the same as the legacy clips): `_l` is on -x; a positive x rotation of a leg
 * swings the foot backwards, a negative x rotation of an arm swings the hand forwards; a
 * knee flexes with a positive x rotation and an elbow with a negative one.
 */
const TAU = Math.PI * 2;
const sin = (t) => Math.sin(t * TAU);
const cos = (t) => Math.cos(t * TAU);
const ease = (t) => 0.5 - 0.5 * Math.cos(t * Math.PI);
const bump = (value, power = 1.2) => Math.pow(Math.max(0, value), power);

/** Sampled clip. `frame(t)` returns `{ "<node>.<path>": [numbers] }` for t in 0..1. */
function sampled(THREE, name, duration, frames, frame) {
  const times = Array.from({ length: frames + 1 }, (_, i) => (duration * i) / frames);
  const columns = {};
  for (let i = 0; i <= frames; i++) {
    const pose = frame(i / frames);
    for (const [target, value] of Object.entries(pose)) (columns[target] ??= []).push(...value);
  }
  const tracks = Object.entries(columns).map(([target, values]) =>
    target.endsWith(".quaternion")
      ? new THREE.QuaternionKeyframeTrack(target, times, values)
      : new THREE.VectorKeyframeTrack(target, times, values),
  );
  return new THREE.AnimationClip(name, duration, tracks);
}

const quaternionOf = (THREE) => (x, y, z) =>
  new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z)).toArray();

/**
 * Blink: eyes close for a tenth of a second near the end of a 5.6 s loop. `scale.y` of the
 * `face_expression` node is 0.1 at 3.78 s and 0.08 at 3.86 s, 1 again from 3.96 s.
 */
export function blinkClip(THREE, node = "face_expression") {
  const times = [0, 3.7, 3.78, 3.86, 3.96, 5.6];
  const values = [1, 1, 1, 1, 1, 1, 1, 0.1, 1, 1, 0.08, 1, 1, 1, 1, 1, 1, 1];
  return new THREE.AnimationClip("expression_blink", 5.6, [
    new THREE.VectorKeyframeTrack(`${node}.scale`, times, values),
  ]);
}

/**
 * All clips of a person.
 *
 * @param {import("three")} THREE
 * @param {{ hh: number, hipY: number, sitY: number }} plan
 * @param {(base: string) => string} name  node name mapper (suffix for the study trio)
 */
export function peopleClips(THREE, plan, name = (base) => base) {
  const q = quaternionOf(THREE);
  // Amplitudes are authored for a 0.34 m head; scale the metre-based ones with the figure.
  const k = plan.hh / 0.34;
  const base = (over = {}) => ({
    body: { position: [0, 0, 0] },
    torso: q(0, 0, 0),
    head: q(0, 0, 0),
    arm_l: q(0, 0, -0.1),
    arm_r: q(0, 0, 0.1),
    elbow_l: q(-0.14, 0, 0),
    elbow_r: q(-0.14, 0, 0),
    // a relaxed stance: thighs a touch forward, knees softly bent
    leg_l: q(-0.045, 0, 0),
    leg_r: q(-0.045, 0, 0),
    knee_l: q(0.09, 0, 0),
    knee_r: q(0.09, 0, 0),
    mouth: { scale: [1, 1, 1] },
    ...over,
  });
  const clip = (clipName, duration, frames, frame) =>
    sampled(THREE, clipName, duration, frames, (t) => {
      const pose = base(frame(t));
      const out = {};
      for (const [node, value] of Object.entries(pose)) {
        if (Array.isArray(value)) out[`${name(node)}.quaternion`] = value;
        else if (value.position) out[`${name(node)}.position`] = value.position;
        else out[`${name(node)}.scale`] = value.scale;
      }
      return out;
    });
  const bob = (y) => ({ body: { position: [0, y, 0] } });

  // Legs and arms for a gait: swing `a` (legs) and `b` (arms), knee flex `kf`, elbow flex `ef`.
  const gait = (a, b, lean, bobHeight, kf, ef) => (t) => {
    const l = sin(t);
    const r = -l;
    return {
      ...bob(bobHeight * k * Math.abs(cos(t))),
      leg_l: q(a * l, 0, 0),
      leg_r: q(a * r, 0, 0),
      // the knee folds while its leg swings through (the thigh passes from back to front)
      knee_l: q(0.06 + kf * bump(-cos(t)), 0, 0),
      knee_r: q(0.06 + kf * bump(cos(t)), 0, 0),
      arm_l: q(-b * l, 0, -0.12),
      arm_r: q(-b * r, 0, 0.12),
      elbow_l: q(-(0.18 + ef * (0.5 + 0.5 * -l)), 0, 0),
      elbow_r: q(-(0.18 + ef * (0.5 + 0.5 * -r)), 0, 0),
      torso: q(lean, 0.06 * sin(t), 0),
      head: q(-lean * 0.5, -0.04 * sin(t), 0),
    };
  };

  return [
    clip("idle", 3, 24, (t) => ({
      ...bob(0.006 * k * sin(t)),
      arm_l: q(0.03 * sin(t), 0, -0.1 - 0.02 * sin(t)),
      arm_r: q(0.03 * sin(t), 0, 0.1 + 0.02 * sin(t)),
      elbow_l: q(-0.14 - 0.03 * sin(t), 0, 0),
      elbow_r: q(-0.14 - 0.03 * sin(t), 0, 0),
      head: q(0.03 * sin(t), 0.04 * sin(t * 0.5), 0),
      torso: q(0.012 * sin(t), 0, 0),
    })),
    clip("walk", 1, 24, gait(0.5, 0.4, 0.04, 0.02, 0.85, 0.35)),
    clip("run", 0.7, 24, gait(0.9, 0.85, 0.16, 0.04, 1.25, 0.9)),
    clip("sprint", 0.5, 24, gait(1.15, 1.1, 0.3, 0.05, 1.5, 1.2)),
    clip("air", 1, 24, (t) => ({
      ...bob(0.03 * k * sin(t)),
      leg_l: q(-0.75, 0, 0),
      leg_r: q(0.4, 0, 0),
      knee_l: q(0.9 + 0.1 * sin(t), 0, 0),
      knee_r: q(0.35, 0, 0),
      arm_l: q(0, 0, -1.1 - 0.1 * sin(t)),
      arm_r: q(0, 0, 1.1 + 0.1 * sin(t)),
      elbow_l: q(-0.3, 0, 0),
      elbow_r: q(-0.3, 0, 0),
      torso: q(-0.04, 0, 0),
    })),
    clip("afk1_lookaround", 4, 24, (t) => ({
      ...bob(0.005 * k * sin(t * 2)),
      head: q(0, 0.55 * sin(t), 0),
      torso: q(0, 0.1 * sin(t), 0),
    })),
    clip("afk2_stretch", 3, 24, (t) => {
      const a = ease(Math.min(1, Math.sin(t * Math.PI) * 1.4));
      return {
        arm_l: q(0, 0, -0.1 - 2.7 * a),
        arm_r: q(0, 0, 0.1 + 2.7 * a),
        elbow_l: q(-0.14 - 0.2 * a, 0, 0),
        elbow_r: q(-0.14 - 0.2 * a, 0, 0),
        torso: q(-0.12 * a, 0, 0),
        head: q(-0.25 * a, 0, 0),
      };
    }),
    clip("afk3_sit", 4, 24, (t) => ({
      // the hip drops to `sitY`; thighs rest forward, knees relaxed, hands on the lap
      body: { position: [0, -(plan.hipY - plan.sitY), 0] },
      leg_l: q(-1.42, 0, -0.1),
      leg_r: q(-1.42, 0, 0.1),
      knee_l: q(0.14, 0, 0),
      knee_r: q(0.14, 0, 0),
      arm_l: q(0.5, 0, -0.28),
      arm_r: q(0.5, 0, 0.28),
      elbow_l: q(-0.7, 0, 0),
      elbow_r: q(-0.7, 0, 0),
      torso: q(-0.1 + 0.02 * sin(t), 0, 0),
      head: q(0.05 + 0.03 * sin(t), 0.1 * sin(t * 0.5), 0),
    })),
    clip("talk", 2, 24, (t) => ({
      ...bob(0.004 * k * Math.abs(sin(t * 2))),
      head: q(0.08 * sin(t * 2), 0.08 * sin(t), 0),
      arm_r: q(-0.6 - 0.25 * sin(t * 2), 0, 0.35),
      elbow_r: q(-0.9 - 0.3 * sin(t * 2 + 0.25), 0, 0),
      mouth: { scale: [1, 1 + 1.6 * Math.abs(sin(t * 4)), 1] },
    })),
    clip("emote_wave", 1.5, 24, (t) => ({
      arm_r: q(0, 0, 2.6 + 0.3 * sin(t * 2)),
      elbow_r: q(-0.35 - 0.45 * sin(t * 4), 0, 0),
      head: q(0, 0, 0.08 * sin(t)),
    })),
    blinkClip(THREE, name("face_expression")),
  ];
}

// ------------------------------------------------------------------------------ animals
/** Lumen: idle, talk and the blink of her large eyes (`face_expression`). */
export function catClips(THREE) {
  const q = quaternionOf(THREE);
  const pose = (over) => ({
    body: { position: [0, 0, 0] },
    head: q(0, 0, 0),
    tail: q(0, 0, 0),
    ear_l: q(0, 0, 0.25),
    ear_r: q(0, 0, -0.25),
    ...over,
  });
  const clip = (name, duration, frames, frame) =>
    sampled(THREE, name, duration, frames, (t) => {
      const out = {};
      for (const [node, value] of Object.entries(pose(frame(t))))
        out[`${node}.${Array.isArray(value) ? "quaternion" : "position"}`] = Array.isArray(value)
          ? value
          : value.position;
      return out;
    });
  return [
    clip("idle", 3, 24, (t) => ({
      head: q(0.05 * sin(t), 0.25 * sin(t * 0.5), 0.03 * sin(t)),
      tail: q(0.15 * sin(t), 0.35 * sin(t), 0.1 * sin(t * 2)),
      ear_l: q(0, 0, 0.25 + 0.1 * bump(sin(t * 2))),
      body: { position: [0, 0.004 * sin(t * 2), 0] },
    })),
    clip("talk", 1.6, 24, (t) => ({
      head: q(0.12 * sin(t * 2), 0.1 * sin(t), 0.06 * sin(t)),
      tail: q(0.2, 0.5 * sin(t * 2), 0),
      body: { position: [0, 0.006 * Math.abs(sin(t * 2)), 0] },
    })),
    blinkClip(THREE),
  ];
}

const nodeClip = (THREE, name, duration, frames, frame) => {
  const q = quaternionOf(THREE);
  return sampled(THREE, name, duration, frames, (t) => {
    const out = {};
    for (const [node, value] of Object.entries(frame(t, q)))
      out[`${node}.${Array.isArray(value) ? "quaternion" : "position"}`] = Array.isArray(value)
        ? value
        : value.position;
    return out;
  });
};

export function owlClips(THREE) {
  return [
    nodeClip(THREE, "idle", 4, 24, (t, q) => ({
      head: q(0, 0.5 * sin(t), 0.12 * sin(t * 2) * (Math.abs(sin(t)) > 0.9 ? 1 : 0)),
      wing_l: q(0, 0, 0.05 * sin(t * 2)),
      wing_r: q(0, 0, -0.05 * sin(t * 2)),
      body: { position: [0, 0.004 * sin(t * 2), 0] },
    })),
    nodeClip(THREE, "talk", 1.6, 24, (t, q) => ({
      head: q(0.1 * sin(t * 2), 0.1 * sin(t), 0.2 * sin(t)),
      wing_l: q(0, 0, 0.25 * bump(sin(t * 2), 1)),
      wing_r: q(0, 0, -0.25 * bump(sin(t * 2), 1)),
      body: { position: [0, 0.01 * Math.abs(sin(t * 2)), 0] },
    })),
  ];
}

export function hareClips(THREE) {
  return [
    nodeClip(THREE, "idle", 2.5, 24, (t, q) => ({
      head: q(0.05 * sin(t), 0.2 * sin(t * 0.5), 0),
      ear_l: q(0.15 * bump(sin(t * 2), 1), 0, 0.15),
      ear_r: q(0, 0, -0.15 - 0.1 * sin(t)),
      tail: q(0, 0.3 * sin(t * 3), 0),
      body: { position: [0, 0.004 * sin(t * 2), 0] },
    })),
    nodeClip(THREE, "talk", 1.4, 24, (t, q) => ({
      head: q(0.12 * sin(t * 2), 0.1 * sin(t), 0),
      ear_l: q(0.3 * sin(t * 2), 0, 0.15),
      ear_r: q(0.3 * sin(t * 2), 0, -0.15),
      tail: q(0, 0, 0),
      body: { position: [0, 0.015 * Math.abs(sin(t * 2)), 0] },
    })),
  ];
}

export function visitorClips(THREE) {
  return [
    nodeClip(THREE, "idle", 3, 24, (t, q) => ({
      body: { position: [0, 0.03 + 0.03 * sin(t), 0] },
      head: q(0, 0.2 * sin(t * 0.5), 0),
      antenna_l: q(0.2 * sin(t * 2), 0, 0.35),
      antenna_r: q(-0.2 * sin(t * 2), 0, -0.35),
    })),
    nodeClip(THREE, "talk", 1.5, 24, (t, q) => ({
      body: { position: [0, 0.04 + 0.02 * sin(t * 2), 0] },
      head: q(0.1 * sin(t * 2), 0, 0.1 * sin(t)),
      antenna_l: q(0.4 * sin(t * 2), 0, 0.35),
      antenna_r: q(0.4 * sin(t * 2), 0, -0.35),
    })),
  ];
}

// ------------------------------------------------------------------------------ rest pose
/** The relaxed pose every clip starts from: a person's nodes rest here, so constant tracks are dropped. */
export function applyPeopleRest(THREE, nodes) {
  const q = quaternionOf(THREE);
  const rest = {
    arm_l: q(0, 0, -0.1),
    arm_r: q(0, 0, 0.1),
    elbow_l: q(-0.14, 0, 0),
    elbow_r: q(-0.14, 0, 0),
    leg_l: q(-0.045, 0, 0),
    leg_r: q(-0.045, 0, 0),
    knee_l: q(0.09, 0, 0),
    knee_r: q(0.09, 0, 0),
  };
  for (const [base, value] of Object.entries(rest))
    if (nodes[base]) nodes[base].quaternion.fromArray(value);
}

/**
 * Drop the tracks that never leave the node's rest transform: the mixer returns an unanimated
 * property to the rest pose, so nothing visible changes while every GLB sheds accessors.
 */
export function pruneClips(THREE, clips, root) {
  const byName = new Map();
  root.traverse((node) => byName.set(node.name, node));
  const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 2e-4);
  return clips.map((clip) => {
    const kept = clip.tracks.filter((track) => {
      const dot = track.name.lastIndexOf(".");
      const node = byName.get(track.name.slice(0, dot));
      if (!node) return false;
      const property = track.name.slice(dot + 1);
      const rest = {
        quaternion: node.quaternion.toArray(),
        position: node.position.toArray(),
        scale: node.scale.toArray(),
      }[property];
      if (!rest) return true;
      const width = rest.length;
      for (let i = 0; i < track.values.length; i += width)
        if (!near(Array.from(track.values.subarray(i, i + width)), rest)) return true;
      return false;
    });
    return new THREE.AnimationClip(clip.name, clip.duration, kept);
  });
}
