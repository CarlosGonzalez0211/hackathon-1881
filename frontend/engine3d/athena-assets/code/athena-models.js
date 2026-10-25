// Athena original asset library. Pure builders: pass THREE in, get named Object3Ds out.
// Units: meters, +Y up, +Z forward, pivot at base center. Materials: MeshStandardMaterial (GLB-safe).
export function createAthena(THREE) {
  const PI = Math.PI, TAU = PI * 2;
  const K = { ink: '#1E2433', plaster: '#F4E9D8', sand: '#E7CDA6', stone: '#D8C9B6', stoneDark: '#B9A893', grey: '#A7ACB1', greyDark: '#8A9098', roof: '#C9785F', roofDark: '#A85E49', wood: '#9C7356', woodDark: '#6E4F3C', door: '#4A3B36', leaf: '#93BE8B', leafDeep: '#5F9575', leafDark: '#47785D', grass: '#A8CB8E', water: '#86C7CB', teal: '#2F7D7A', gold: '#F2C36B', brass: '#C9A46A', rose: '#E99A8E', butter: '#F3D78A', lilac: '#B7A6D6', sky: '#93C1D6', navy: '#3E4A5E', cream: '#FFF8EE', glass: '#DDEFF0', paper: '#FBF8F3' };
  const M = {};
  function mat(name, color, o = {}) {
    if (M[name]) return M[name];
    const m = new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.85, metalness: o.m ?? 0, vertexColors: !!o.vc });
    if (o.e) { m.emissive = new THREE.Color(o.e); m.emissiveIntensity = o.ei ?? 1; }
    if (o.op != null) { m.transparent = true; m.opacity = o.op; m.depthWrite = o.op > 0.8; }
    if (o.ds) m.side = THREE.DoubleSide;
    m.name = name; return (M[name] = m);
  }
  const C = (hex, role = 'c', o) => mat(role + '_' + hex.replace('#', '').toLowerCase() + (o?.ds ? '_ds' : ''), hex, o);
  const X = {
    gold: () => mat('beacon_gold', K.gold, { e: '#F2B24E', ei: 1.1, r: 0.5 }),
    goldDim: () => mat('beacon_dim', '#E4C690', { e: '#E0A94F', ei: 0.35 }),
    win: () => mat('window_glow', '#FFE2A6', { e: '#F6C46A', ei: 0.8 }),
    winOff: () => mat('window_unlit', '#5B6470', { r: 0.5 }),
    water: () => mat('lagoon', K.water, { r: 0.3, op: 0.88 }),
    foam: () => mat('foam', '#F4FBFA', { r: 0.6, op: 0.85, ds: true }),
    glass: () => mat('glass', K.glass, { r: 0.1, op: 0.42 }),
    brass: () => mat('brass', K.brass, { m: 0.3, r: 0.45 }),
    ink: () => mat('eye_ink', K.ink, { r: 0.4 }),
    white: () => mat('eye_white', '#FFFFFF', { r: 0.4 }),
    glow: (c = '#9FE3D6') => mat('glow_' + c.slice(1), c, { e: c, ei: 1.2 }),
  };
  // ---------- geometry helpers ----------
  const mesh = (name, geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.name = name; o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; };
  const grp = (name, ...kids) => { const g = new THREE.Group(); g.name = name; kids.forEach(k => k && g.add(k)); return g; };
  const at = (o, x = 0, y = 0, z = 0, ry = 0, s = 1) => { o.position.set(x, y, z); o.rotation.y = ry; o.scale.setScalar(s); return o; };
  const lathe = (pts, seg = 40) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
  const cyl = (rt, rb, h, s = 24) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r, w = 24, h = 16) => new THREE.SphereGeometry(r, w, h);
  const caps = (r, len, s = 16) => new THREE.CapsuleGeometry(r, len, 6, s);
  const tor = (r, t, arc = TAU, rs = 12, ts = 40) => new THREE.TorusGeometry(r, t, rs, ts, arc);
  function rbox(w, h, d, r = 0.04, k = 3) {
    r = Math.max(0.0005, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4)); const n = 2 * k + 1;
    const g = new THREE.BoxGeometry(2, 2, 2, n, n, n); const p = g.attributes.position, nm = g.attributes.normal;
    const H = [w / 2 - r, h / 2 - r, d / 2 - r]; const dv = new THREE.Vector3();
    const off = u => { const i = Math.round((u + 1) * n / 2); return i <= k ? [-(1 - i / k), -1] : [(i - k - 1) / k, 1]; };
    for (let j = 0; j < p.count; j++) {
      const o = [off(p.getX(j)), off(p.getY(j)), off(p.getZ(j))];
      dv.set(o[0][0], o[1][0], o[2][0]); if (dv.lengthSq() < 1e-9) dv.set(0, 1, 0); dv.normalize();
      p.setXYZ(j, o[0][1] * H[0] + dv.x * r, o[1][1] * H[1] + dv.y * r, o[2][1] * H[2] + dv.z * r); nm.setXYZ(j, dv.x, dv.y, dv.z);
    }
    return g;
  }
  const extrude = (shape, depth = 0.04, bevel = 0.012) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 24 }); g.center(); return g; };
  const tag = (o, part) => { o.traverse(c => { if (c.isMesh) c.userData.part = part; }); return o; };
  const blob = (name, r, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = mesh(name, sph(r, 20, 14), m, x, y, z); o.scale.set(sx, sy, sz); return o; };
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const n2 = (x, z) => Math.sin(x * 0.9 + 1.3) * Math.cos(z * 0.7 + 0.4) * 0.5 + Math.sin(z * 1.9 + x * 1.3) * 0.3 + Math.sin(x * 3.1 - z * 2.3) * 0.12;

  // ---------- animation ----------
  const q = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
  function mkClip(name, dur, f, n = 24) {
    const times = [...Array(n + 1)].map((_, i) => dur * i / n), fr = times.map(t => f(t / dur)), tracks = [];
    Object.keys(fr[0]).forEach(k => {
      if (k.endsWith('@p')) tracks.push(new THREE.VectorKeyframeTrack(k.slice(0, -2) + '.position', times, fr.flatMap(o => o[k])));
      else if (k.endsWith('@s')) tracks.push(new THREE.VectorKeyframeTrack(k.slice(0, -2) + '.scale', times, fr.flatMap(o => o[k])));
      else tracks.push(new THREE.QuaternionKeyframeTrack(k + '.quaternion', times, fr.flatMap(o => q(...o[k]).toArray())));
    });
    return new THREE.AnimationClip(name, dur, tracks);
  }
  const CLIPS = new WeakMap(); const setClips = (o, c) => (CLIPS.set(o, c), o); const getClips = o => CLIPS.get(o) || [];
  const S = t => Math.sin(t * TAU), Cs = t => Math.cos(t * TAU), ease = t => 0.5 - 0.5 * Math.cos(t * PI);
  function humanClips(hip) {
    const base = (o = {}) => ({ 'body@p': [0, 0, 0], torso: [0, 0, 0], head: [0, 0, 0], arm_l: [0, 0, -0.1], arm_r: [0, 0, 0.1], leg_l: [0, 0, 0], leg_r: [0, 0, 0], 'mouth@s': [1, 1, 1], ...o });
    const gait = (a, b, lean, bob) => t => base({ leg_l: [a * S(t), 0, 0], leg_r: [-a * S(t), 0, 0], arm_l: [-b * S(t), 0, -0.12], arm_r: [b * S(t), 0, 0.12], torso: [lean, 0.06 * S(t), 0], 'body@p': [0, bob * Math.abs(Cs(t)), 0] });
    return [
      mkClip('idle', 3, t => base({ 'body@p': [0, 0.006 * S(t), 0], arm_l: [0.03 * S(t), 0, -0.1 - 0.02 * S(t)], arm_r: [0.03 * S(t), 0, 0.1 + 0.02 * S(t)], head: [0.03 * S(t), 0.04 * S(t * 0.5), 0] })),
      mkClip('walk', 1, gait(0.5, 0.4, 0.04, 0.02)),
      mkClip('run', 0.7, gait(0.9, 0.85, 0.16, 0.04)),
      mkClip('sprint', 0.5, gait(1.15, 1.1, 0.3, 0.05)),
      mkClip('air', 1, t => base({ leg_l: [-0.75, 0, 0], leg_r: [0.4, 0, 0], arm_l: [0, 0, -1.1 - 0.1 * S(t)], arm_r: [0, 0, 1.1 + 0.1 * S(t)], 'body@p': [0, 0.03 * S(t), 0] })),
      mkClip('afk1_lookaround', 4, t => base({ head: [0, 0.55 * S(t), 0], torso: [0, 0.1 * S(t), 0], 'body@p': [0, 0.005 * S(t * 2), 0] })),
      mkClip('afk2_stretch', 3, t => { const a = ease(Math.min(1, Math.sin(t * PI) * 1.4)); return base({ arm_l: [0, 0, -0.1 - 2.7 * a], arm_r: [0, 0, 0.1 + 2.7 * a], torso: [-0.12 * a, 0, 0], head: [-0.25 * a, 0, 0] }); }),
      mkClip('afk3_sit', 4, t => base({ 'body@p': [0, -hip + 0.17, 0], leg_l: [-1.5, 0, -0.08], leg_r: [-1.5, 0, 0.08], arm_l: [0.45, 0, -0.3], arm_r: [0.45, 0, 0.3], torso: [-0.12 + 0.02 * S(t), 0, 0], head: [0.04 * S(t), 0, 0] })),
      mkClip('talk', 2, t => base({ head: [0.08 * S(t * 2), 0.08 * S(t), 0], arm_r: [-0.6 - 0.25 * S(t * 2), 0, 0.35], 'mouth@s': [1, 1 + 1.6 * Math.abs(S(t * 4)), 1] })),
      mkClip('emote_wave', 1.5, t => base({ arm_r: [0, 0, 2.6 + 0.3 * S(t * 2)], head: [0, 0, 0.08 * S(t)] })),
    ];
  }

  // ---------- characters ----------
  function shoe(kind, sc, sk) {
    const g = grp('shoe'), dark = C('#3A3230', 'sole'), light = C('#F4EFE6', 'sole');
    const sole = (c, h = 0.025, w = 0.105, d = 0.19) => mesh('sole', rbox(w, h, d, 0.01), c, 0, -0.045, 0.03);
    switch (kind) {
      case 'sneakers': g.add(mesh('upper', rbox(0.095, 0.065, 0.17, 0.03), sc, 0, -0.01, 0.03), sole(light), mesh('laces', rbox(0.05, 0.012, 0.06, 0.005), light, 0, 0.024, 0.06)); break;
      case 'boots': g.add(mesh('upper', rbox(0.1, 0.13, 0.17, 0.035), sc, 0, 0.02, 0.025), sole(dark, 0.03), mesh('cuff', cyl(0.06, 0.06, 0.025, 16), C('#E7CDA6', 'trim'), 0, 0.09, 0)); break;
      case 'sandals': g.add(mesh('foot', rbox(0.08, 0.05, 0.15, 0.025), sk, 0, -0.01, 0.03), sole(sc, 0.02), mesh('strap_a', rbox(0.09, 0.016, 0.03, 0.007), sc, 0, 0.005, 0.07), mesh('strap_b', rbox(0.09, 0.016, 0.03, 0.007), sc, 0, 0.005, -0.01)); break;
      case 'rainboots': g.add(mesh('shaft', cyl(0.066, 0.062, 0.2, 18), sc, 0, 0.07, 0), mesh('upper', rbox(0.1, 0.06, 0.17, 0.03), sc, 0, -0.02, 0.03), sole(dark)); break;
      case 'clogs': g.add(blob('upper', 0.075, sc, 0, -0.01, 0.035, 0.72, 0.55, 1.25), sole(C('#C9A46A', 'sole'), 0.03)); break;
      case 'loafers': g.add(mesh('upper', rbox(0.09, 0.05, 0.17, 0.025), sc, 0, -0.015, 0.03), mesh('tongue', rbox(0.05, 0.012, 0.04, 0.005), C(K.gold, 'trim'), 0, 0.012, 0.07), sole(dark, 0.02)); break;
      case 'hiking': g.add(mesh('upper', rbox(0.105, 0.11, 0.18, 0.035), sc, 0, 0.01, 0.03), sole(dark, 0.04, 0.115, 0.2)); for (let i = 0; i < 3; i++) g.add(mesh('lace' + i, rbox(0.05, 0.009, 0.012, 0.004), C(K.rose, 'lace'), 0, 0.045 - i * 0.025, 0.11)); break;
      case 'fins': g.add(mesh('upper', rbox(0.1, 0.06, 0.15, 0.03), sc, 0, -0.01, 0.02), mesh('fin', rbox(0.16, 0.012, 0.22, 0.006), sc, 0, -0.04, 0.2)); break;
      case 'none': break;
    }
    return tag(g, 'shoes');
  }
  function hair(style, hex) {
    const hc = C(hex, 'hair'), hd = C(hex, 'hair', { ds: true }), g = grp('hair'), cy = 0.2;
    const cap = (r = 0.182, th = 0.5, tilt = -0.3) => { const m = mesh('hair_cap', new THREE.SphereGeometry(r, 40, 20, 0, TAU, 0, PI * th), hd, 0, cy, -0.01); m.rotation.x = tilt; return m; };
    const fringe = (s = 1) => blob('fringe', 0.1, hc, 0, cy + 0.12, 0.1, 1.5 * s, 0.55, 0.7);
    const shell = (gap = 1.7, t0 = 0.22, t1 = 0.42, r = 0.196) => mesh('hair_shell', new THREE.SphereGeometry(r, 40, 20, PI / 2 + gap / 2, TAU - gap, PI * t0, PI * t1), hd, 0, cy, -0.005);
    switch (style) {
      case 'crop': g.add(cap(0.18, 0.46, -0.35)); break;
      case 'bob': g.add(cap(0.186, 0.5, -0.2), fringe(), shell()); break;
      case 'long': g.add(cap(0.186, 0.5, -0.2), fringe(0.9), shell(1.7, 0.22, 0.45), mesh('hair_back', rbox(0.34, 0.42, 0.08, 0.04), hc, 0, cy - 0.16, -0.13)); break;
      case 'ponytail': { g.add(cap(0.182, 0.5, -0.3), fringe(0.8), mesh('tie', sph(0.035), C(K.gold, 'trim'), 0, cy + 0.07, -0.18)); const t = mesh('tail', caps(0.05, 0.2), hc, 0, cy - 0.06, -0.23); t.rotation.x = 0.35; g.add(t); break; }
      case 'curls': for (let i = 0; i < 26; i++) { const th = (i % 13) / 13 * TAU, ph = i < 13 ? 0.35 : 0.75; const v = new THREE.Vector3(Math.cos(th) * Math.sin(ph), Math.cos(ph), Math.sin(th) * Math.sin(ph)); if (v.z > 0.55 && v.y < 0.6) continue; g.add(mesh('curl' + i, sph(0.068, 14, 10), hc, v.x * 0.17, cy + v.y * 0.17 + 0.02, v.z * 0.17 - 0.02)); } g.add(blob('curl_top', 0.12, hc, 0, cy + 0.15, -0.02, 1.2, 0.8, 1.2)); break;
      case 'braids': g.add(cap(0.183, 0.5, -0.25), fringe(0.7)); for (const x of [-1, 1]) { for (let i = 0; i < 4; i++) g.add(mesh('braid' + i, sph(0.042 - i * 0.004, 14, 10), hc, x * 0.16, cy - 0.06 - i * 0.07, -0.03)); g.add(mesh('braid_tie', sph(0.022), C(K.rose, 'trim'), x * 0.16, cy - 0.34, -0.03)); } break;
      case 'swept': { g.add(cap(0.18, 0.47, -0.3)); const s = blob('swoop', 0.12, hc, 0.04, cy + 0.15, 0.07, 1.4, 0.5, 0.9); s.rotation.z = -0.35; g.add(s); break; }
      case 'bun': g.add(cap(0.184, 0.5, -0.2), fringe(0.8), mesh('bun', sph(0.075, 20, 14), hc, 0, cy + 0.17, -0.1)); break;
      case 'bald': break;
    }
    return tag(g, 'hair');
  }
  const ACC = {
    hardhat: (r, c = '#F2C36B') => { const m = C(c, 'hat'); r.hd.add(tag(grp('acc_hardhat', mesh('dome', new THREE.SphereGeometry(0.2, 32, 14, 0, TAU, 0, PI / 2), m, 0, 0.25, 0), mesh('brim', cyl(0.235, 0.235, 0.018, 32), m, 0, 0.25, 0.01), mesh('ridge', tor(0.2, 0.018, PI, 8, 24), m, 0, 0.25, 0), mesh('badge', cyl(0.03, 0.03, 0.01, 16), C(K.teal, 'trim'), 0, 0.37, 0.12)), 'acc')); r.hd.getObjectByName('ridge').rotation.y = PI / 2; },
    beanie: (r, c = K.rose) => { const m = C(c, 'hat'); r.hd.add(tag(grp('acc_beanie', mesh('dome', new THREE.SphereGeometry(0.192, 32, 14, 0, TAU, 0, PI / 2), m, 0, 0.24, -0.01), mesh('fold', cyl(0.198, 0.198, 0.07, 32), C(c, 'hat'), 0, 0.25, -0.01), mesh('pom', sph(0.045, 16, 12), C(K.cream, 'hat'), 0, 0.45, -0.01)), 'acc')); },
    toque: r => { const m = C('#FFFFFF', 'hat'); r.hd.add(tag(grp('acc_toque', mesh('band', cyl(0.175, 0.175, 0.1, 32), m, 0, 0.32, 0), blob('puff_a', 0.11, m, 0, 0.46, 0, 1.1, 0.8, 1.1), blob('puff_b', 0.08, m, 0.08, 0.43, 0.02), blob('puff_c', 0.08, m, -0.08, 0.43, -0.02)), 'acc')); },
    cap: (r, c = K.teal) => { const m = C(c, 'hat'); r.hd.add(tag(grp('acc_cap', mesh('dome', new THREE.SphereGeometry(0.19, 32, 14, 0, TAU, 0, PI / 2), m, 0, 0.25, 0), mesh('brim', rbox(0.17, 0.014, 0.13, 0.006), m, 0, 0.26, 0.17), mesh('button', sph(0.02), m, 0, 0.44, 0)), 'acc')); },
    sunhat: r => r.hd.add(tag(grp('acc_sunhat', mesh('crown', cyl(0.14, 0.17, 0.13, 32), C(K.sand, 'hat'), 0, 0.34, 0), mesh('brim', cyl(0.33, 0.33, 0.016, 40), C(K.sand, 'hat'), 0, 0.28, 0), mesh('ribbon', cyl(0.172, 0.172, 0.035, 32), C(K.rose, 'trim'), 0, 0.3, 0)), 'acc')),
    headband: (r, c = K.teal) => { const b = mesh('acc_headband', tor(0.18, 0.015), C(c, 'trim'), 0, 0.29, 0); b.rotation.x = PI / 2 + 0.25; r.hd.add(tag(b, 'acc')); },
    goggles: (r, up = true) => { const g = grp('acc_goggles'); const b = mesh('strap', tor(0.181, 0.012), C('#3A3230', 'strap'), 0, 0, 0); b.rotation.x = PI / 2; g.add(b); for (const x of [-1, 1]) { const rim = mesh('rim', tor(0.042, 0.012, TAU, 8, 24), X.brass(), x * 0.058, 0, 0.17); const l = mesh('lens', new THREE.CircleGeometry(0.04, 24), X.glass(), x * 0.058, 0, 0.172); g.add(rim, l); } g.position.y = up ? 0.31 : 0.21; if (up) g.rotation.x = -0.25; r.hd.add(tag(g, 'acc')); },
    glasses: r => { const g = grp('acc_glasses'), m = C('#3A3230', 'frame'); for (const x of [-1, 1]) g.add(mesh('lens_rim', tor(0.034, 0.006, TAU, 8, 24), m, x * 0.062, 0.2, 0.172), mesh('arm', rbox(0.006, 0.006, 0.16, 0.002), m, x * 0.165, 0.2, 0.09)); g.add(mesh('bridge', rbox(0.03, 0.006, 0.006, 0.002), m, 0, 0.205, 0.174)); r.hd.add(tag(g, 'acc')); },
    headphones: r => { const g = grp('acc_headphones'), m = C(K.navy, 'gear'); const b = mesh('band', tor(0.19, 0.014, PI, 8, 24), m, 0, 0.2, 0); g.add(b); for (const x of [-1, 1]) { const c = mesh('cup', cyl(0.05, 0.05, 0.04, 20), C(K.rose, 'gear'), x * 0.185, 0.19, 0); c.rotation.z = PI / 2; g.add(c); } r.hd.add(tag(g, 'acc')); },
    divemask: r => r.hd.add(tag(grp('acc_divemask', mesh('frame', rbox(0.2, 0.1, 0.05, 0.03), C('#F2C36B', 'gear'), 0, 0.21, 0.155), mesh('glass', rbox(0.17, 0.075, 0.02, 0.025), X.glass(), 0, 0.21, 0.18), (() => { const s = mesh('strap', tor(0.18, 0.012), C('#3A3230', 'strap'), 0, 0.21, 0); s.rotation.x = PI / 2; return s; })(), mesh('snorkel', caps(0.015, 0.25), C('#F2C36B', 'gear'), 0.17, 0.32, 0.05)), 'acc')),
    beard: (r, c) => r.hd.add(tag(grp('acc_beard', blob('beard', 0.13, C(c, 'hair'), 0, 0.11, 0.07, 1.05, 0.85, 0.85), blob('stache', 0.05, C(c, 'hair'), 0, 0.15, 0.165, 1.5, 0.45, 0.6)), 'acc')),
    mustache: (r, c) => r.hd.add(tag(blob('acc_mustache', 0.045, C(c, 'hair'), 0, 0.15, 0.165, 1.6, 0.45, 0.6), 'acc')),
    backpack: (r, c = K.teal) => { const m = C(c, 'bag'); r.torso.add(tag(grp('acc_backpack', mesh('pack', rbox(0.26, 0.32, 0.13, 0.05), m, 0, 0.22, -0.17), mesh('flap', rbox(0.27, 0.13, 0.14, 0.04), C(K.wood, 'bag'), 0, 0.33, -0.17), mesh('pocket', rbox(0.17, 0.1, 0.04, 0.02), m, 0, 0.12, -0.245), mesh('buckle', rbox(0.035, 0.03, 0.01, 0.005), X.brass(), 0, 0.28, -0.245), mesh('strap_l', rbox(0.035, 0.3, 0.02, 0.008), C(K.woodDark, 'bag'), -0.09, 0.27, 0.125), mesh('strap_r', rbox(0.035, 0.3, 0.02, 0.008), C(K.woodDark, 'bag'), 0.09, 0.27, 0.125)), 'acc')); },
    satchel: (r, c = K.wood) => { const s = mesh('strap', rbox(0.035, 0.62, 0.015, 0.007), C(K.woodDark, 'bag'), 0.02, 0.18, 0.13); s.rotation.z = 0.75; r.torso.add(tag(grp('acc_satchel', mesh('bag', rbox(0.18, 0.15, 0.06, 0.03), C(c, 'bag'), 0.21, -0.02, 0.06), mesh('flap', rbox(0.185, 0.07, 0.065, 0.02), C(K.woodDark, 'bag'), 0.21, 0.03, 0.065), (() => { const p = mesh('satchel_pin', cyl(0.018, 0.018, 0.008, 16), X.gold(), 0.21, 0.02, 0.1); p.rotation.x = PI / 2; return p; })(), s), 'acc')); },
    tank: r => r.torso.add(tag(grp('acc_tank', mesh('tank_a', caps(0.055, 0.28), C(K.gold, 'gear'), -0.06, 0.22, -0.18), mesh('tank_b', caps(0.055, 0.28), C(K.gold, 'gear'), 0.06, 0.22, -0.18), mesh('valve', cyl(0.02, 0.02, 0.06), X.brass(), 0, 0.42, -0.18)), 'acc')),
    scarf: (r, c = K.teal) => { const m = C(c, 'scarf'); const ring = mesh('ring', tor(0.1, 0.042, TAU, 14, 32), m, 0, 0.45, 0.01); ring.rotation.x = PI / 2; const t = mesh('tail', rbox(0.07, 0.24, 0.025, 0.012), m, 0.07, 0.32, 0.135); t.rotation.z = 0.12; r.torso.add(tag(grp('acc_scarf', ring, t, mesh('fringe', rbox(0.072, 0.03, 0.026, 0.008), C(K.gold, 'trim'), 0.085, 0.2, 0.137)), 'acc')); },
    apron: (r, c = '#FFFFFF') => r.torso.add(tag(grp('acc_apron', mesh('bib', rbox(0.22, 0.2, 0.015, 0.006), C(c, 'apron'), 0, 0.3, 0.14), mesh('skirt', rbox(0.3, 0.36, 0.015, 0.008), C(c, 'apron'), 0, -0.05, 0.145), mesh('pocket', rbox(0.14, 0.08, 0.018, 0.006), C(K.rose, 'apron'), 0, -0.02, 0.152)), 'acc')),
    book: (r, c = K.roof) => r.hand_r.add(tag(grp('acc_book', mesh('cover', rbox(0.13, 0.17, 0.035, 0.008), C(c, 'book'), 0, -0.04, 0.05), mesh('pages', rbox(0.12, 0.16, 0.028, 0.004), C(K.paper, 'paper'), 0.006, -0.04, 0.05)), 'acc')),
    clipboard: r => r.hand_l.add(tag(grp('acc_clipboard', mesh('board', rbox(0.17, 0.23, 0.012, 0.006), C(K.wood, 'wood'), 0, -0.06, 0.06), mesh('paper', rbox(0.14, 0.19, 0.004, 0.002), C(K.paper, 'paper'), 0, -0.07, 0.068), mesh('clip', rbox(0.06, 0.025, 0.02, 0.006), X.brass(), 0, 0.05, 0.068)), 'acc')),
    lute: r => { const g = grp('acc_lute', blob('body', 0.13, C(K.wood, 'wood'), 0, 0, 0, 1, 1.15, 0.45), mesh('hole', new THREE.CircleGeometry(0.03, 20), C(K.door, 'wood'), 0, 0.02, 0.06), mesh('neck', rbox(0.04, 0.3, 0.025, 0.008), C(K.woodDark, 'wood'), 0, 0.27, 0), mesh('head', rbox(0.05, 0.07, 0.03, 0.01), C(K.woodDark, 'wood'), 0, 0.44, -0.01)); g.position.set(0.02, 0.1, 0.2); g.rotation.z = 0.9; r.torso.add(tag(g, 'acc')); },
    trowel: r => r.hand_r.add(tag(grp('acc_trowel', mesh('handle', cyl(0.015, 0.015, 0.1), C(K.wood, 'wood'), 0, -0.02, 0.03), mesh('blade', rbox(0.06, 0.1, 0.006, 0.003), C(K.grey, 'metal'), 0, -0.12, 0.03)), 'acc')),
    rope: r => { const t = mesh('acc_rope', tor(0.09, 0.022, TAU, 8, 28), C(K.sand, 'rope'), 0.2, 0.1, 0.02); t.rotation.y = PI / 2; r.torso.add(tag(t, 'acc')); },
    cane: r => r.hand_r.add(tag(grp('acc_cane', mesh('shaft', cyl(0.014, 0.014, 0.82), C(K.woodDark, 'wood'), 0, -0.4, 0.03), mesh('handle', tor(0.035, 0.014, PI, 8, 16), C(K.woodDark, 'wood'), 0.035, 0.01, 0.03)), 'acc')),
    basket: r => { const g = grp('acc_basket', mesh('basket', lathe([[0, 0], [0.08, 0], [0.1, 0.08], [0.095, 0.085], [0, 0.03]], 20), C(K.sand, 'basket', { ds: true }), 0, -0.14, 0.03), mesh('handle', tor(0.08, 0.008, PI, 6, 20), C(K.wood, 'basket'), 0, -0.06, 0.03)); for (let i = 0; i < 5; i++) g.add(mesh('bloom' + i, sph(0.025, 10, 8), i % 2 ? C(K.rose, 'flower') : C(K.butter, 'flower'), Math.cos(i * 1.3) * 0.05, -0.06, 0.03 + Math.sin(i * 1.3) * 0.05)); r.hand_l.add(tag(g, 'acc')); },
    plank: r => { const p = mesh('acc_plank', rbox(0.08, 0.03, 1.1, 0.01), C(K.wood, 'wood'), 0.22, 0.47, 0); p.rotation.x = 0.1; r.torso.add(tag(p, 'acc')); },
    lantern: r => r.hand_r.add(tag(at(insightLantern(), 0, -0.3, 0.04, 0, 0.8), 'acc')),
  };
  function person(opt = {}) {
    const o = { name: 'character', skin: '#E9C2A2', hair: 'crop', hairC: '#5A4136', top: 'tee', topC: K.teal, top2: K.plaster, bottom: 'trousers', botC: K.navy, shoes: 'sneakers', shoeC: K.roof, acc: [], h: 1.5, w: 1, hs: 1, ...opt };
    const sk = C(o.skin, 'skin'), tc = C(o.topC, 'top'), t2 = C(o.top2, 'top2'), bc = C(o.botC, 'bottom'), sc = C(o.shoeC, 'shoe');
    const g = grp(o.name), body = grp('body'), hip = grp('hip'), torso = grp('torso'); g.add(body); body.add(hip); hip.position.y = 0.66; hip.add(torso);
    const W = o.w;
    const fullLeg = ['trousers', 'overalls', 'cargo', 'leggings', 'wide', 'wetsuit'].includes(o.bottom);
    for (const [s, x] of [['l', -1], ['r', 1]]) {
      const L = grp('leg_' + s); L.position.x = x * 0.085 * W; hip.add(L);
      const lc = fullLeg ? bc : (o.tights ? C(o.tights, 'tights') : sk);
      if (o.bottom === 'wide') L.add(tag(mesh('leg', cyl(0.072, 0.09, 0.56, 18), bc, 0, -0.3, 0), 'bottom'));
      else L.add(tag(mesh('leg', caps(o.bottom === 'leggings' ? 0.052 : 0.06, 0.46), lc, 0, -0.29, 0), fullLeg ? 'bottom' : 'base'));
      if (o.bottom === 'shorts') L.add(tag(mesh('shorts_leg', cyl(0.075, 0.082, 0.2, 18), bc, 0, -0.08, 0), 'bottom'));
      if (o.bottom === 'cargo') L.add(tag(mesh('pocket', rbox(0.04, 0.1, 0.09, 0.015), bc, x * 0.065, -0.22, 0), 'bottom'));
      if (o.bottom === 'overalls') L.add(tag(mesh('cuff', cyl(0.068, 0.068, 0.04, 18), C(K.sand, 'trim'), 0, -0.52, 0), 'bottom'));
      const sh = shoe(o.shoes, sc, sk); sh.position.y = -0.6; L.add(sh);
    }
    const chest = mesh('chest', lathe([[0, -0.06], [0.16, -0.06], [0.18, 0.04], [0.17, 0.22], [0.19, 0.36], [0.13, 0.44], [0, 0.46]], 36), tc); chest.scale.set(W, 1, 0.72); torso.add(tag(chest, 'top'));
    if (o.bottom !== 'skirt') { const h = mesh('hips', cyl(0.172, 0.165, 0.13, 28), bc, 0, -0.04, 0); h.scale.set(W, 1, 0.76); torso.add(tag(h, 'bottom')); }
    if (o.bottom === 'skirt') { const s = mesh('skirt', lathe([[0.16, 0.03], [0.2, -0.12], [0.27, -0.32], [0.26, -0.34]].reverse(), 32), C(o.botC, 'bottom', { ds: true })); s.scale.set(W, 1, 0.8); torso.add(tag(s, 'bottom')); }
    if (o.bottom === 'overalls') torso.add(tag(grp('bib', mesh('bib', rbox(0.2, 0.2, 0.02, 0.008), bc, 0, 0.12, 0.13), mesh('strap_l', rbox(0.03, 0.22, 0.015, 0.006), bc, -0.08, 0.32, 0.11), mesh('strap_r', rbox(0.03, 0.22, 0.015, 0.006), bc, 0.08, 0.32, 0.11), mesh('btn_l', sph(0.014), X.brass(), -0.08, 0.22, 0.14), mesh('btn_r', sph(0.014), X.brass(), 0.08, 0.22, 0.14)), 'bottom'));
    const longSleeve = !['tee', 'vest'].includes(o.top);
    const ring = (name, y, r, m, t = 0.014) => { const t_ = mesh(name, tor(r, t, TAU, 8, 40), m, 0, y, 0); t_.rotation.x = PI / 2; t_.scale.set(W, 0.72, 1); return t_; };
    const tp = grp('top_detail'); torso.add(tp);
    switch (o.top) {
      case 'hoodie': { const h = mesh('hood', tor(0.12, 0.055, TAU, 12, 28), tc, 0, 0.43, -0.07); h.rotation.x = PI / 2 + 0.5; tp.add(h, mesh('pocket', rbox(0.22, 0.09, 0.04, 0.02), tc, 0, 0.06, 0.12), mesh('string_l', rbox(0.01, 0.1, 0.01, 0.004), t2, -0.04, 0.34, 0.14), mesh('string_r', rbox(0.01, 0.1, 0.01, 0.004), t2, 0.04, 0.34, 0.14)); break; }
      case 'stripe': tp.add(ring('stripe_a', 0.1, 0.177, t2), ring('stripe_b', 0.2, 0.172, t2), ring('stripe_c', 0.3, 0.182, t2), ring('collar', 0.43, 0.11, t2, 0.02)); break;
      case 'poncho': { const p = mesh('poncho', lathe([[0.07, 0.47], [0.17, 0.44], [0.24, 0.3], [0.27, 0.1], [0.26, 0.08]].reverse(), 40), C(o.topC, 'top', { ds: true })); p.scale.set(W, 1, 0.85); const band = mesh('band', tor(0.265, 0.016, TAU, 8, 48), t2, 0, 0.11, 0); band.rotation.x = PI / 2; band.scale.set(W, 0.85, 1); tp.add(p, band, mesh('pin', sph(0.022), X.gold(), 0.06, 0.38, 0.17)); break; }
      case 'jacket': tp.add(mesh('shirt', rbox(0.12, 0.36, 0.03, 0.01), t2, 0, 0.22, 0.12), mesh('lapel_l', rbox(0.05, 0.16, 0.02, 0.008), tc, -0.07, 0.34, 0.13), mesh('lapel_r', rbox(0.05, 0.16, 0.02, 0.008), tc, 0.07, 0.34, 0.13), mesh('btn', sph(0.013), X.brass(), 0.07, 0.12, 0.135)); tp.getObjectByName('lapel_l').rotation.z = -0.35; tp.getObjectByName('lapel_r').rotation.z = 0.35; break;
      case 'labcoat': { const c = mesh('coat', lathe([[0.19, 0.3], [0.19, 0.0], [0.23, -0.22], [0.26, -0.44], [0.25, -0.46]].reverse(), 36), C(o.topC, 'top', { ds: true })); c.scale.set(W, 1, 0.8); tp.add(c, mesh('shirt', rbox(0.1, 0.3, 0.03, 0.01), t2, 0, 0.26, 0.12), mesh('pocket_l', rbox(0.08, 0.07, 0.02, 0.008), tc, -0.12, -0.1, 0.17), mesh('pocket_r', rbox(0.08, 0.07, 0.02, 0.008), tc, 0.12, -0.1, 0.17), mesh('pen', rbox(0.012, 0.06, 0.012, 0.005), C(K.teal, 'trim'), -0.09, 0.27, 0.13)); break; }
      case 'vest': tp.add(mesh('shirt', rbox(0.11, 0.3, 0.03, 0.01), t2, 0, 0.27, 0.115), mesh('collar', rbox(0.16, 0.04, 0.03, 0.012), t2, 0, 0.43, 0.06), mesh('btn_a', sph(0.012), X.brass(), 0.03, 0.08, 0.13), mesh('btn_b', sph(0.012), X.brass(), 0.03, 0.16, 0.128)); break;
      case 'raincoat': { const c = mesh('coat', lathe([[0.19, 0.2], [0.21, -0.05], [0.24, -0.3], [0.23, -0.32]].reverse(), 36), C(o.topC, 'top', { ds: true })); c.scale.set(W, 1, 0.8); const h = mesh('hood', tor(0.12, 0.06, TAU, 12, 28), tc, 0, 0.43, -0.07); h.rotation.x = PI / 2 + 0.5; tp.add(c, h); for (let i = 0; i < 3; i++) tp.add(mesh('toggle' + i, rbox(0.04, 0.015, 0.015, 0.006), C(K.woodDark, 'trim'), 0, 0.32 - i * 0.12, 0.14)); break; }
      case 'cardigan': tp.add(mesh('placket', rbox(0.05, 0.42, 0.02, 0.008), t2, 0, 0.18, 0.13)); for (let i = 0; i < 4; i++) tp.add(mesh('btn' + i, sph(0.012), X.brass(), 0, 0.36 - i * 0.1, 0.14)); tp.add(ring('hem', -0.03, 0.172, t2, 0.02)); break;
      case 'tee': tp.add(ring('collar', 0.43, 0.11, t2, 0.016)); break;
      case 'wetsuit': tp.add(mesh('zip', rbox(0.015, 0.38, 0.01, 0.005), C(K.gold, 'trim'), 0, 0.22, 0.13), ring('stripe', 0.3, 0.183, C(K.gold, 'trim'), 0.012)); break;
    }
    tag(tp, 'top');
    const hands = {};
    for (const [s, x] of [['l', -1], ['r', 1]]) {
      const A = grp('arm_' + s); A.position.set(x * 0.205 * W, 0.4, 0); A.rotation.z = x * 0.1; torso.add(A);
      const armC = longSleeve ? (o.top === 'poncho' ? t2 : tc) : sk;
      A.add(tag(mesh('arm', caps(0.048, 0.3), armC, 0, -0.2, 0), armC === sk ? 'base' : 'top'));
      if (!longSleeve) A.add(tag(mesh('sleeve', cyl(0.062, 0.066, 0.12, 16), o.top === 'vest' ? t2 : tc, 0, -0.05, 0), 'top'));
      if (['labcoat', 'jacket', 'raincoat', 'cardigan'].includes(o.top)) A.add(tag(mesh('cuff', cyl(0.056, 0.056, 0.035, 16), o.top === 'labcoat' ? tc : t2, 0, -0.36, 0), 'top'));
      A.add(tag(mesh('hand', sph(0.05, 16, 12), sk, 0, -0.41, 0), 'base'));
      const H = grp('hand_' + s); H.position.y = -0.43; A.add(H); hands[s] = H;
    }
    const head = grp('head'); head.position.y = 0.46; torso.add(head);
    head.add(tag(mesh('neck', cyl(0.045, 0.05, 0.09, 12), sk, 0, 0.02, 0), 'base'));
    const hd = grp('head_geo'); hd.scale.setScalar(o.hs); head.add(hd);
    hd.add(tag(mesh('skull', sph(0.17, 40, 28), sk, 0, 0.2, 0), 'base'));
    const face = grp('face');
    for (const x of [-1, 1]) {
      face.add(blob('eye', 0.022, X.ink(), x * 0.06, 0.2, 0.155, 0.85, 1.2, 0.5), mesh('eye_hl', sph(0.0075, 8, 6), X.white(), x * 0.06 + 0.007, 0.21, 0.165), blob('cheek', 0.024, C('#EBA79A', 'cheek'), x * 0.098, 0.15, 0.13, 1, 0.6, 0.4), blob('ear', 0.036, sk, x * 0.168, 0.19, 0, 0.6, 1, 0.8));
      const br = mesh('brow', rbox(0.05, 0.012, 0.012, 0.005), C(o.hairC, 'hair'), x * 0.062, 0.258, 0.15); br.rotation.z = -x * 0.12; face.add(br);
    }
    const mouth = mesh('mouth', caps(0.0055, 0.022, 8), X.ink(), 0, 0.125, 0.162); mouth.rotation.z = PI / 2; mouth.name = 'mouth';
    face.add(mesh('nose', sph(0.018, 12, 10), sk, 0, 0.172, 0.17), mouth); hd.add(tag(face, 'base'));
    hd.add(hair(o.hair, o.hairC));
    const refs = { hd, torso, hand_r: hands.r, hand_l: hands.l };
    for (const a of o.acc) { const [k, ...args] = Array.isArray(a) ? a : [a]; ACC[k]?.(refs, ...args); }
    g.scale.setScalar(o.h / 1.5);
    return setClips(g, humanClips(0.66));
  }
  // ---------- avatar ----------
  const AVATAR_PARTS = {
    hair: ['bob', 'crop', 'long', 'ponytail', 'curls', 'braids', 'swept'],
    top: ['poncho', 'tee', 'hoodie', 'stripe', 'jacket', 'raincoat', 'cardigan', 'vest', 'labcoat'],
    bottom: ['shorts', 'trousers', 'skirt', 'overalls', 'cargo', 'leggings', 'wide'],
    shoes: ['boots', 'sneakers', 'sandals', 'rainboots', 'clogs', 'loafers', 'hiking'],
  };
  const AV_COL = { hair: '#5A4136', top: { poncho: '#F1E4D0', tee: '#2F7D7A', hoodie: '#B7A6D6', stripe: '#F4E9D8', jacket: '#3E4A5E', raincoat: '#F3D78A', cardigan: '#C9785F', vest: '#6E4F3C', labcoat: '#FFFFFF' }, top2: { poncho: '#2F7D7A', stripe: '#2F7D7A', tee: '#F4E9D8' }, bottom: { shorts: '#C99A5B', trousers: '#3E4A5E', skirt: '#C9785F', overalls: '#5E7FA8', cargo: '#7A8B5A', leggings: '#3E4A5E', wide: '#E7CDA6' }, shoes: { boots: '#6E4F3C', sneakers: '#C9785F', sandals: '#9C7356', rainboots: '#2F7D7A', clogs: '#C9785F', loafers: '#4A3B36', hiking: '#7A8B5A' } };
  function avatar(sel = {}) {
    const s = { hair: 'bob', top: 'poncho', bottom: 'shorts', shoes: 'boots', ...sel };
    return person({ name: 'avatar_student', h: 1.2, hs: 1.22, hair: s.hair, hairC: AV_COL.hair, top: s.top, topC: AV_COL.top[s.top], top2: AV_COL.top2[s.top] || '#F4E9D8', bottom: s.bottom, botC: AV_COL.bottom[s.bottom], shoes: s.shoes, shoeC: AV_COL.shoes[s.shoes], tights: s.bottom === 'skirt' ? '#3E4A5E' : null, acc: [['scarf', K.teal], 'satchel'] });
  }
  // ---------- NPC cast (one per legacy slot) ----------
  const NPC = {
    'boss': ['npc_headmaster_ilda', { h: 1.55, skin: '#C99A7A', hair: 'bun', hairC: '#B9B4AE', top: 'jacket', topC: '#3E4A5E', top2: '#F4E9D8', bottom: 'skirt', botC: '#3E4A5E', tights: '#4A3B36', shoes: 'loafers', shoeC: '#4A3B36', acc: ['glasses', 'clipboard'] }, 'Headmaster Ilda'],
    'caveman': ['npc_historian_tomas', { h: 1.6, w: 1.1, skin: '#B88462', hair: 'crop', hairC: '#3A2E28', top: 'vest', topC: '#7A8B5A', top2: '#F4E9D8', bottom: 'cargo', botC: '#B9A893', shoes: 'hiking', shoeC: '#6E4F3C', acc: ['sunhat', ['beard', '#3A2E28'], 'trowel'] }, 'Historian Tomás'],
    'chef': ['npc_cook_marisol', { h: 1.5, w: 1.1, skin: '#8D5B42', hair: 'crop', hairC: '#2B2220', top: 'tee', topC: '#FFFFFF', top2: '#C9785F', bottom: 'trousers', botC: '#3E4A5E', shoes: 'clogs', shoeC: '#C9785F', acc: ['toque', 'apron'] }, 'Cook Marisol'],
    'diver': ['npc_marine_kai', { h: 1.55, skin: '#D6A27E', hair: 'swept', hairC: '#2B2220', top: 'wetsuit', topC: '#2F7D7A', bottom: 'wetsuit', botC: '#2F7D7A', shoes: 'fins', shoeC: '#F2C36B', acc: ['divemask', 'tank'] }, 'Marine biologist Kai'],
    'factory-worker-a': ['npc_builder_ana', { h: 1.5, skin: '#E9C2A2', hair: 'ponytail', hairC: '#7A4A32', top: 'tee', topC: '#C9785F', bottom: 'overalls', botC: '#5E7FA8', shoes: 'boots', shoeC: '#6E4F3C', acc: [['hardhat', '#F2C36B']] }, 'Builder Ana'],
    'factory-worker-b': ['npc_builder_leo', { h: 1.62, w: 1.12, skin: '#A5704F', hair: 'crop', hairC: '#2B2220', top: 'vest', topC: '#F3B35B', top2: '#3E4A5E', bottom: 'cargo', botC: '#6E6A62', shoes: 'boots', shoeC: '#4A3B36', acc: [['hardhat', '#F2C36B'], 'plank', ['mustache', '#2B2220']] }, 'Builder Leo'],
    'factory-worker-c': ['npc_engineer_noor', { h: 1.55, skin: '#C99A7A', hair: 'long', hairC: '#2B2220', top: 'jacket', topC: '#2F7D7A', top2: '#F4E9D8', bottom: 'trousers', botC: '#3E4A5E', shoes: 'hiking', shoeC: '#6E4F3C', acc: [['hardhat', '#FFFFFF'], 'glasses', 'clipboard'] }, 'Engineer Noor'],
    'female-scientist': ['npc_dr_amaia', { h: 1.55, skin: '#F0CFB4', hair: 'bob', hairC: '#C47A4A', top: 'labcoat', topC: '#FFFFFF', top2: '#B7A6D6', bottom: 'trousers', botC: '#3E4A5E', shoes: 'sneakers', shoeC: '#2F7D7A', acc: [['goggles', true], 'book'] }, 'Dr. Amaia'],
    'male-scientist': ['npc_dr_bruno', { h: 1.62, w: 1.08, skin: '#E2B596', hair: 'swept', hairC: '#B9B4AE', top: 'labcoat', topC: '#FFFFFF', top2: '#93C1D6', bottom: 'trousers', botC: '#6E4F3C', shoes: 'loafers', shoeC: '#4A3B36', acc: ['glasses', ['mustache', '#B9B4AE']] }, 'Dr. Bruno'],
    'mountainman': ['npc_guide_rafa', { h: 1.66, w: 1.15, skin: '#C99A7A', hair: 'crop', hairC: '#5A4136', top: 'raincoat', topC: '#C9785F', top2: '#F4E9D8', bottom: 'cargo', botC: '#7A8B5A', shoes: 'hiking', shoeC: '#6E4F3C', acc: [['beanie', '#2F7D7A'], ['beard', '#5A4136'], 'rope', ['backpack', '#7A8B5A']] }, 'Mountain guide Rafa'],
    'musician': ['npc_musician_lia', { h: 1.5, skin: '#8D5B42', hair: 'curls', hairC: '#2B2220', top: 'cardigan', topC: '#B7A6D6', top2: '#F3D78A', bottom: 'skirt', botC: '#2F7D7A', tights: '#4A3B36', shoes: 'sandals', shoeC: '#9C7356', acc: [['headband', '#F3D78A'], 'lute'] }, 'Musician Lía'],
    'office-worker': ['npc_librarian_oscar', { h: 1.58, skin: '#E9C2A2', hair: 'swept', hairC: '#3A2E28', top: 'vest', topC: '#5F9575', top2: '#F4E9D8', bottom: 'trousers', botC: '#4A3B36', shoes: 'loafers', shoeC: '#6E4F3C', acc: ['glasses', ['book', '#2F7D7A']] }, 'Librarian Óscar'],
    'oldwoman': ['npc_gardener_carmen', { h: 1.38, w: 1.08, skin: '#E2B596', hair: 'bun', hairC: '#E8E4DE', top: 'cardigan', topC: '#93BE8B', top2: '#F4E9D8', bottom: 'skirt', botC: '#C9785F', tights: '#E7CDA6', shoes: 'clogs', shoeC: '#5F9575', acc: ['sunhat', 'basket', 'cane'] }, 'Gardener Carmen'],
    'scout': ['npc_explorer_nico', { h: 1.08, hs: 1.25, skin: '#D6A27E', hair: 'crop', hairC: '#5A4136', top: 'tee', topC: '#F3D78A', top2: '#C9785F', bottom: 'shorts', botC: '#7A8B5A', shoes: 'sneakers', shoeC: '#2F7D7A', acc: [['cap', '#C9785F'], ['backpack', '#C9785F']] }, 'Explorer Nico'],
    'young-lady': ['npc_mentor_elena', { h: 1.55, skin: '#F0CFB4', hair: 'long', hairC: '#3A2E28', top: 'jacket', topC: '#C9785F', top2: '#F4E9D8', bottom: 'wide', botC: '#E7CDA6', shoes: 'loafers', shoeC: '#4A3B36', acc: ['satchel', ['book', '#2F7D7A']] }, 'Mentor Elena'],
  };
  function studyTrio() {
    const a = person({ name: 'kid_a', h: 1.0, hs: 1.25, skin: '#8D5B42', hair: 'braids', hairC: '#2B2220', top: 'hoodie', topC: '#B7A6D6', bottom: 'leggings', botC: '#3E4A5E', shoes: 'sneakers', shoeC: '#F3D78A', acc: [['book', '#C9785F']] });
    const b = person({ name: 'kid_b', h: 1.05, hs: 1.25, skin: '#F0CFB4', hair: 'curls', hairC: '#C47A4A', top: 'stripe', topC: '#F4E9D8', top2: '#C9785F', bottom: 'shorts', botC: '#3E4A5E', shoes: 'rainboots', shoeC: '#2F7D7A', acc: ['glasses'] });
    const c = person({ name: 'kid_c', h: 0.95, hs: 1.25, skin: '#D6A27E', hair: 'ponytail', hairC: '#3A2E28', top: 'tee', topC: '#93BE8B', top2: '#F4E9D8', bottom: 'skirt', botC: '#F3D78A', tights: '#F4E9D8', shoes: 'sneakers', shoeC: '#C9785F', acc: [['backpack', '#F3D78A']] });
    at(a, -0.38, 0, 0, 0.3); at(b, 0, 0, -0.15); at(c, 0.38, 0, 0.02, -0.3);
    return grp('npc_study_trio', a, b, c);
  }
  // ---------- animals ----------
  function cat() {
    const fur = C('#CFC4B8', 'fur'), dark = C('#8D8278', 'fur'), white = C('#F7F2EA', 'fur'), pink = C('#E7A6A0', 'fur');
    const g = grp('npc_cat_lumen'), body = grp('body'); g.add(body);
    const b = mesh('torso', caps(0.1, 0.2, 20), fur, 0, 0.17, 0); b.rotation.x = PI / 2; body.add(b);
    body.add(blob('chest', 0.105, white, 0, 0.21, 0.13, 1, 1, 0.9));
    for (let i = 0; i < 3; i++) { const s = mesh('stripe' + i, tor(0.1, 0.012, PI, 6, 20), dark, 0, 0.17, -0.1 + i * 0.07); s.rotation.y = PI / 2; s.scale.set(1, 1.02, 1); body.add(s); }
    const head = grp('head'); head.position.set(0, 0.36, 0.17); body.add(head);
    head.add(mesh('skull', sph(0.11, 32, 24), fur), blob('muzzle', 0.05, white, 0, -0.03, 0.08, 1.2, 0.8, 0.8), mesh('nose', sph(0.014, 10, 8), pink, 0, -0.005, 0.12));
    for (const x of [-1, 1]) {
      const e = grp('ear_' + (x < 0 ? 'l' : 'r')); e.position.set(x * 0.06, 0.09, -0.01); e.rotation.z = -x * 0.25; head.add(e);
      e.add(mesh('ear', new THREE.ConeGeometry(0.042, 0.085, 4), dark, 0, 0.03, 0), mesh('ear_inner', new THREE.ConeGeometry(0.026, 0.055, 4), pink, 0, 0.025, 0.012));
      head.add(blob('eye', 0.024, C('#E9C26A', 'iris'), x * 0.042, 0.015, 0.093, 1, 1.1, 0.5), blob('pupil', 0.012, X.ink(), x * 0.042, 0.015, 0.104, 0.5, 1.1, 0.4));
      for (let k = 0; k < 2; k++) { const w = mesh('whisker', cyl(0.002, 0.002, 0.09, 4), C('#F7F2EA', 'whisker'), x * 0.08, -0.025 - k * 0.012, 0.09); w.rotation.z = PI / 2 + x * (0.1 - k * 0.15); head.add(w); }
    }
    for (const [x, z, n] of [[-1, 0.12, 'fl'], [1, 0.12, 'fr'], [-1, -0.12, 'bl'], [1, -0.12, 'br']]) body.add(mesh('paw_' + n, caps(0.028, 0.1), fur, x * 0.055, 0.065, z), mesh('toe_' + n, sph(0.03, 12, 8), white, x * 0.055, 0.02, z + 0.015));
    const tail = grp('tail'); tail.position.set(0, 0.2, -0.2); body.add(tail);
    const curve = new THREE.CatmullRomCurve3([[0, 0, 0], [0, 0.02, -0.12], [0.05, 0.18, -0.16], [0.12, 0.28, -0.08]].map(p => new THREE.Vector3(...p)));
    tail.add(mesh('tail', new THREE.TubeGeometry(curve, 32, 0.022, 10), dark), mesh('tail_tip', sph(0.024, 12, 10), white, 0.12, 0.28, -0.08));
    const col = mesh('collar', tor(0.075, 0.012, TAU, 8, 32), C(K.teal, 'collar'), 0, 0.29, 0.15); col.rotation.x = PI / 2.4; body.add(col, mesh('charm', sph(0.02, 14, 10), X.gold(), 0, 0.245, 0.23));
    return setClips(g, [mkClip('idle', 3, t => ({ head: [0.05 * S(t), 0.25 * S(t * 0.5), 0], tail: [0.15 * S(t), 0.35 * S(t), 0], ear_l: [0, 0, 0.25 + 0.1 * Math.max(0, S(t * 2))], ear_r: [0, 0, -0.25], 'body@p': [0, 0.004 * S(t * 2), 0] })), mkClip('talk', 1.6, t => ({ head: [0.12 * S(t * 2), 0.1 * S(t), 0.06 * S(t)], tail: [0.2, 0.5 * S(t * 2), 0], ear_l: [0, 0, 0.25], ear_r: [0, 0, -0.25], 'body@p': [0, 0, 0] }))]);
  }
  function owl() {
    const f = C('#A88C74', 'feather'), belly = C('#EBDDC8', 'feather'), dark = C('#6E5648', 'feather');
    const g = grp('npc_owl_sage'), body = grp('body'); g.add(body);
    body.add(mesh('body', lathe([[0, 0.04], [0.14, 0.06], [0.19, 0.2], [0.17, 0.36], [0.12, 0.44], [0, 0.46]], 32), f));
    body.add(blob('belly', 0.13, belly, 0, 0.2, 0.07, 1, 1.25, 0.7));
    for (let i = 0; i < 6; i++) { const v = mesh('chevron' + i, new THREE.ConeGeometry(0.018, 0.02, 3), dark, ((i % 3) - 1) * 0.05, 0.14 + Math.floor(i / 3) * 0.08, 0.16); v.rotation.x = PI / 2; v.rotation.y = PI; body.add(v); }
    const head = grp('head'); head.position.y = 0.42; body.add(head);
    head.add(blob('head', 0.15, f, 0, 0.04, 0, 1.15, 0.9, 1), blob('mask', 0.12, belly, 0, 0.03, 0.06, 1.25, 0.8, 0.6));
    for (const x of [-1, 1]) {
      const d = mesh('eye_disc', cyl(0.052, 0.052, 0.02, 24), X.white(), x * 0.058, 0.04, 0.125); d.rotation.x = PI / 2; head.add(d);
      const ir = mesh('iris', cyl(0.035, 0.035, 0.02, 24), C('#E9B64A', 'iris'), x * 0.058, 0.04, 0.133); ir.rotation.x = PI / 2; head.add(ir);
      head.add(mesh('pupil', sph(0.02, 12, 10), X.ink(), x * 0.058, 0.04, 0.142));
      const tuft = mesh('tuft', new THREE.ConeGeometry(0.03, 0.08, 6), dark, x * 0.11, 0.15, -0.01); tuft.rotation.z = -x * 0.5; head.add(tuft);
      const w = grp('wing_' + (x < 0 ? 'l' : 'r')); w.position.set(x * 0.17, 0.32, 0); body.add(w);
      w.add(blob('wing', 0.1, dark, 0, -0.1, 0, 0.35, 1.3, 0.9));
      for (let k = 0; k < 3; k++) body.add(mesh('talon', caps(0.012, 0.04, 6), C(K.gold, 'beak'), x * 0.05 + k * 0.015 - 0.015, 0.03, 0.1));
    }
    const beak = mesh('beak', new THREE.ConeGeometry(0.022, 0.05, 8), C(K.gold, 'beak'), 0, 0, 0.15); beak.rotation.x = PI / 2 + 0.6; head.add(beak);
    const sp = mesh('spectacles', tor(0.06, 0.006, TAU, 6, 24), X.brass(), 0.058, 0.04, 0.15); head.add(sp);
    return setClips(g, [mkClip('idle', 4, t => ({ head: [0, 0.5 * S(t), 0.12 * S(t * 2) * (Math.abs(S(t)) > 0.9 ? 1 : 0)], wing_l: [0, 0, 0.05 * S(t * 2)], wing_r: [0, 0, -0.05 * S(t * 2)], 'body@p': [0, 0.004 * S(t * 2), 0] })), mkClip('talk', 1.6, t => ({ head: [0.1 * S(t * 2), 0.1 * S(t), 0.2 * S(t)], wing_l: [0, 0, 0.25 * Math.max(0, S(t * 2))], wing_r: [0, 0, -0.25 * Math.max(0, S(t * 2))], 'body@p': [0, 0.01 * Math.abs(S(t * 2)), 0] }))]);
  }
  function hare() {
    const f = C('#C9A27E', 'fur'), white = C('#F7F2EA', 'fur'), pink = C('#E7A6A0', 'fur');
    const g = grp('npc_hare_pip'), body = grp('body'); g.add(body);
    body.add(blob('torso', 0.13, f, 0, 0.15, -0.02, 0.9, 1, 1.25), blob('belly', 0.09, white, 0, 0.13, 0.07, 0.9, 1, 0.8), blob('haunch_l', 0.08, f, -0.08, 0.1, -0.08, 0.7, 1, 1.2), blob('haunch_r', 0.08, f, 0.08, 0.1, -0.08, 0.7, 1, 1.2));
    for (const x of [-1, 1]) body.add(blob('foot', 0.04, f, x * 0.08, 0.02, 0.02, 0.8, 0.5, 1.8), mesh('paw', caps(0.022, 0.08), f, x * 0.045, 0.07, 0.11));
    const head = grp('head'); head.position.set(0, 0.3, 0.08); body.add(head);
    head.add(blob('skull', 0.085, f, 0, 0, 0, 1, 1, 1.1), blob('muzzle', 0.04, white, 0, -0.025, 0.07, 1.2, 0.8, 0.8), mesh('nose', sph(0.012, 10, 8), pink, 0, -0.005, 0.105));
    for (const x of [-1, 1]) {
      head.add(blob('eye', 0.018, X.ink(), x * 0.05, 0.015, 0.06, 0.8, 1.1, 0.6), mesh('eye_hl', sph(0.006, 6, 6), X.white(), x * 0.05 + 0.005, 0.022, 0.07));
      const e = grp('ear_' + (x < 0 ? 'l' : 'r')); e.position.set(x * 0.035, 0.07, -0.02); e.rotation.z = -x * 0.15; head.add(e);
      e.add(blob('ear', 0.03, f, 0, 0.11, 0, 0.8, 4, 0.45), blob('ear_inner', 0.02, pink, 0, 0.11, 0.008, 0.7, 3.6, 0.3));
    }
    const tail = grp('tail'); tail.position.set(0, 0.14, -0.19); body.add(tail); tail.add(mesh('tail', sph(0.04, 14, 10), white));
    body.add(blob('scarf', 0.06, C(K.butter, 'scarf'), 0, 0.24, 0.05, 1.3, 0.45, 1.1));
    return setClips(g, [mkClip('idle', 2.5, t => ({ head: [0.05 * S(t), 0.2 * S(t * 0.5), 0], ear_l: [0.15 * Math.max(0, S(t * 2)), 0, 0.15], ear_r: [0, 0, -0.15 - 0.1 * S(t)], tail: [0, 0.3 * S(t * 3), 0], 'body@p': [0, 0.004 * S(t * 2), 0] })), mkClip('talk', 1.4, t => ({ head: [0.12 * S(t * 2), 0.1 * S(t), 0], ear_l: [0.3 * S(t * 2), 0, 0.15], ear_r: [0.3 * S(t * 2), 0, -0.15], tail: [0, 0, 0], 'body@p': [0, 0.015 * Math.abs(S(t * 2)), 0] }))]);
  }
  function visitor() {
    const skin = C('#A8D5C6', 'visitor'), deep = C('#6FB3A6', 'visitor');
    const g = grp('npc_visitor_orbi'), body = grp('body'); g.add(body);
    body.add(mesh('body', lathe([[0, 0], [0.16, 0.02], [0.24, 0.18], [0.22, 0.38], [0.14, 0.5], [0, 0.53]], 36), skin), blob('belly', 0.15, C('#E3F3EC', 'visitor'), 0, 0.2, 0.08, 1, 1, 0.7));
    const ring = mesh('orbit_ring', tor(0.3, 0.014, TAU, 8, 48), C(K.gold, 'ring'), 0, 0.3, 0); ring.rotation.x = PI / 2 - 0.25; body.add(ring);
    const head = grp('head'); head.position.y = 0.4; body.add(head);
    head.add(blob('eye_white', 0.075, X.white(), 0, 0.02, 0.17, 1, 1, 0.45), mesh('pupil', sph(0.035, 16, 12), X.ink(), 0, 0.02, 0.2), mesh('eye_hl', sph(0.012, 8, 6), X.white(), 0.015, 0.035, 0.225));
    for (const x of [-1, 1]) {
      const a = grp('antenna_' + (x < 0 ? 'l' : 'r')); a.position.set(x * 0.07, 0.11, 0); a.rotation.z = -x * 0.35; head.add(a);
      a.add(mesh('stalk', cyl(0.008, 0.01, 0.16, 8), deep, 0, 0.08, 0), mesh('tip', sph(0.026, 14, 10), X.glow('#F2C36B'), 0, 0.17, 0));
      body.add(mesh('foot', caps(0.04, 0.05), deep, x * 0.09, 0.03, 0.04), blob('arm', 0.04, deep, x * 0.24, 0.24, 0.02, 0.7, 1.4, 0.7));
    }
    return setClips(g, [mkClip('idle', 3, t => ({ 'body@p': [0, 0.03 + 0.03 * S(t), 0], head: [0, 0.2 * S(t * 0.5), 0], antenna_l: [0.2 * S(t * 2), 0, 0.35], antenna_r: [-0.2 * S(t * 2), 0, -0.35] })), mkClip('talk', 1.5, t => ({ 'body@p': [0, 0.04 + 0.02 * S(t * 2), 0], head: [0.1 * S(t * 2), 0, 0.1 * S(t)], antenna_l: [0.4 * S(t * 2), 0, 0.35], antenna_r: [0.4 * S(t * 2), 0, -0.35] }))]);
  }
  // ---------- nature ----------
  function tree(s = 1, name = 'tree_round') {
    const g = grp(name, mesh('trunk', cyl(0.07, 0.12, 1.1, 12), C(K.wood, 'bark'), 0, 0.55, 0));
    const br = mesh('branch', cyl(0.025, 0.04, 0.45, 8), C(K.wood, 'bark'), 0.16, 0.95, 0); br.rotation.z = -0.8; g.add(br);
    const cp = grp('canopy');
    [[0, 1.45, 0, 0.62], [0.42, 1.28, 0.12, 0.42], [-0.36, 1.32, -0.1, 0.46], [0.05, 1.88, -0.05, 0.42], [-0.15, 1.2, 0.35, 0.36], [0.3, 1.7, -0.3, 0.34]].forEach(([x, y, z, r], i) => cp.add(blob('leaf_' + i, r, i % 2 ? C(K.leafDeep, 'leaf') : C(K.leaf, 'leaf'), x, y, z, 1, 0.86, 1)));
    g.add(cp); g.scale.setScalar(s); return g;
  }
  function treeSpire(s = 1) { const g = grp('tree_spire', mesh('trunk', cyl(0.06, 0.09, 0.9, 12), C(K.wood, 'bark'), 0, 0.45, 0)); [0, 1, 2, 3].forEach(i => g.add(mesh('tier_' + i, lathe([[0, 0], [0.55 - i * 0.11, 0.08], [0.5 - i * 0.1, 0.22], [0.02, 0.62 - i * 0.06], [0, 0.63 - i * 0.06]], 20), i % 2 ? C(K.leafDark, 'leaf') : C(K.leafDeep, 'leaf'), 0, 0.6 + i * 0.36, 0))); g.scale.setScalar(s); return g; }
  function treeBirch(s = 1) { const g = grp('tree_birch', mesh('trunk', cyl(0.045, 0.06, 1.8, 10), C('#EDE6DA', 'bark'), 0, 0.9, 0)); for (let i = 0; i < 6; i++) g.add(mesh('mark' + i, rbox(0.05, 0.015, 0.02, 0.006), C('#4A3B36', 'bark'), (i % 2 ? 0.035 : -0.035), 0.3 + i * 0.25, 0.03)); [[0, 1.85, 0, 0.38], [0.2, 1.6, 0.1, 0.28], [-0.2, 1.65, -0.05, 0.3], [0.05, 1.4, -0.18, 0.25]].forEach(([x, y, z, r], i) => g.add(blob('leaf_' + i, r, C(i % 2 ? '#B6D38F' : K.leaf, 'leaf'), x, y, z, 1, 1.15, 1))); g.scale.setScalar(s); return g; }
  function bush(s = 1) { const g = grp('bush'); [[0, 0.22, 0, 0.3], [0.26, 0.16, 0.08, 0.22], [-0.22, 0.17, -0.06, 0.24], [0.05, 0.15, 0.22, 0.18]].forEach(([x, y, z, r], i) => g.add(blob('bush_' + i, r, i % 2 ? C(K.leaf, 'leaf') : C(K.leafDeep, 'leaf'), x, y, z, 1, 0.8, 1))); for (let i = 0; i < 4; i++) g.add(mesh('berry' + i, sph(0.03, 8, 6), C(K.rose, 'flower'), Math.cos(i * 1.7) * 0.25, 0.3 + (i % 2) * 0.05, Math.sin(i * 1.7) * 0.22)); g.scale.setScalar(s); return g; }
  function rocks(s = 1) { const g = grp('rock_set'); [[0, 0.2, 0, 0.35, 1.2, 0.7], [0.45, 0.1, 0.2, 0.18, 1, 0.7], [-0.35, 0.08, 0.25, 0.14, 1.2, 0.6]].forEach(([x, y, z, r, a, b], i) => { const m = mesh('rock_' + i, new THREE.DodecahedronGeometry(r, 1), C(i ? K.stoneDark : K.stone, 'stone'), x, y, z); m.scale.set(a, b, 1); m.rotation.y = i; g.add(m); }); g.scale.setScalar(s); return g; }
  function flowers() { const g = grp('flower_patch'); for (let i = 0; i < 12; i++) { const a = i * 2.4, r = 0.1 + (i % 4) * 0.08, x = Math.cos(a) * r, z = Math.sin(a) * r; g.add(mesh('stem' + i, cyl(0.008, 0.008, 0.18, 5), C(K.leafDeep, 'leaf'), x, 0.09, z)); const c = [K.rose, K.butter, K.lilac, '#FFFFFF'][i % 4]; for (let p = 0; p < 5; p++) g.add(blob('petal', 0.022, C(c, 'flower'), x + Math.cos(p * 1.26) * 0.022, 0.19, z + Math.sin(p * 1.26) * 0.022, 1, 0.4, 1)); g.add(mesh('center' + i, sph(0.014, 8, 6), C(K.gold, 'flower'), x, 0.2, z)); } return g; }
  function grassTuft() { const g = grp('grass_tuft'); for (let i = 0; i < 14; i++) { const b = mesh('blade' + i, new THREE.ConeGeometry(0.018, 0.24 + (i % 3) * 0.06, 4), C(i % 2 ? K.leaf : K.grass, 'leaf'), Math.cos(i * 2.2) * 0.07, 0.12, Math.sin(i * 2.2) * 0.07); b.rotation.set(Math.sin(i) * 0.3, 0, Math.cos(i * 1.3) * 0.3); g.add(b); } return g; }
  function mushrooms() { const g = grp('mushrooms'); [[0, 0, 1], [0.12, 0.05, 0.7], [-0.08, 0.1, 0.55]].forEach(([x, z, s], i) => { g.add(mesh('stem' + i, cyl(0.025 * s, 0.03 * s, 0.12 * s, 10), C(K.cream, 'mush'), x, 0.06 * s, z), mesh('cap' + i, new THREE.SphereGeometry(0.08 * s, 20, 10, 0, TAU, 0, PI / 2), C(K.roof, 'mush'), x, 0.11 * s, z)); for (let k = 0; k < 3; k++) g.add(mesh('dot', sph(0.012 * s, 6, 6), C(K.cream, 'mush'), x + Math.cos(k * 2.1) * 0.045 * s, 0.16 * s, z + Math.sin(k * 2.1) * 0.045 * s)); }); return g; }
  function reeds() { const g = grp('reeds'); for (let i = 0; i < 9; i++) { const x = Math.cos(i * 2.6) * 0.15, z = Math.sin(i * 2.6) * 0.12, h = 0.5 + (i % 3) * 0.15; const s = mesh('reed' + i, cyl(0.007, 0.01, h, 5), C(K.leafDeep, 'leaf'), x, h / 2, z); s.rotation.z = Math.sin(i) * 0.12; g.add(s); if (i % 2) g.add(mesh('cattail' + i, caps(0.018, 0.07, 8), C(K.woodDark, 'reed'), x + Math.sin(i) * 0.12 * h * -0.5, h + 0.02, z)); } return g; }
  function cloud(s = 1) { const g = grp('cloud_cumulus'); [[0, 0.5, 0, 0.6], [0.6, 0.38, 0.1, 0.45], [-0.62, 0.36, -0.05, 0.48], [0.25, 0.8, -0.1, 0.42], [-0.3, 0.7, 0.15, 0.38], [1.05, 0.28, 0, 0.3], [-1.05, 0.26, 0.05, 0.3]].forEach(([x, y, z, r], i) => g.add(blob('puff_' + i, r, C('#FFF8EE', 'cloud'), x, y, z, 1, 0.82, 1))); g.scale.setScalar(s); return g; }
  function butterfly() { const g = grp('butterfly'), body = grp('body'); g.add(body); body.add(mesh('thorax', caps(0.008, 0.05, 8), C(K.door, 'bug'), 0, 0, 0)); body.children[0].rotation.x = PI / 2; for (const x of [-1, 1]) { const w = grp('wing_' + (x < 0 ? 'l' : 'r')); body.add(w); const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.bezierCurveTo(x * 0.05, 0.05, x * 0.09, 0.03, x * 0.07, -0.01); sh.bezierCurveTo(x * 0.08, -0.05, x * 0.03, -0.06, 0, -0.01); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh, 16), C(K.butter, 'wing', { ds: true })); m.name = 'wing'; m.rotation.x = -PI / 2; w.add(m); } return setClips(g, [mkClip('flutter', 0.3, t => ({ wing_l: [0, 0, -1.1 * Math.abs(S(t / 2)) ], wing_r: [0, 0, 1.1 * Math.abs(S(t / 2))], 'body@p': [0, 0.01 * S(t), 0] }), 12)]); }
  function bird(kind = 'swift') {
    const swift = kind === 'swift', top = C(swift ? '#3E4A5E' : '#C9785F', 'bird'), belly = C(swift ? '#F4E9D8' : '#F3D78A', 'bird');
    const g = grp('bird_' + kind), body = grp('body'); g.add(body);
    const b = blob('torso', 0.06, top, 0, 0, 0, swift ? 0.8 : 1, swift ? 0.75 : 1, swift ? 1.6 : 1.2); body.add(b, blob('belly', 0.05, belly, 0, -0.015, 0.01, 0.8, 0.7, 1.3), mesh('head', sph(swift ? 0.04 : 0.045, 16, 12), top, 0, 0.03, 0.08));
    const beak = mesh('beak', new THREE.ConeGeometry(0.012, 0.035, 6), C(K.gold, 'beak'), 0, 0.025, 0.13); beak.rotation.x = PI / 2; body.add(beak);
    for (const x of [-1, 1]) { body.add(mesh('eye', sph(0.008, 6, 6), X.ink(), x * 0.03, 0.04, 0.1)); const w = grp('wing_' + (x < 0 ? 'l' : 'r')); w.position.set(x * 0.04, 0.01, 0); body.add(w); const sh = new THREE.Shape(); const L = swift ? 0.22 : 0.12; sh.moveTo(0, 0.03); sh.quadraticCurveTo(x * L * 0.6, 0.04, x * L, -0.04); sh.quadraticCurveTo(x * L * 0.5, -0.02, 0, -0.05); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh, 12), C(swift ? '#3E4A5E' : '#A85E49', 'bird', { ds: true })); m.name = 'wing'; m.rotation.x = -PI / 2; w.add(m); }
    const tail = new THREE.Shape(); tail.moveTo(0, 0); tail.lineTo(0.03, -0.09); tail.lineTo(0, swift ? -0.05 : -0.07); tail.lineTo(-0.03, -0.09); tail.closePath(); const tm = new THREE.Mesh(new THREE.ShapeGeometry(tail), C(swift ? '#3E4A5E' : '#A85E49', 'bird', { ds: true })); tm.name = 'tail'; tm.rotation.x = -PI / 2; tm.position.z = -0.07; body.add(tm);
    return setClips(g, [mkClip('flap', swift ? 0.35 : 0.25, t => ({ wing_l: [0, 0, 0.9 * S(t)], wing_r: [0, 0, -0.9 * S(t)], 'body@p': [0, 0.01 * Cs(t), 0] }), 12), mkClip('glide', 2, t => ({ wing_l: [0, 0, 0.1 * S(t)], wing_r: [0, 0, -0.1 * S(t)], 'body@p': [0, 0.02 * S(t), 0] }), 12)]);
  }
  function flightCurve(i = 1) { const pts = [...Array(9)].map((_, k) => { const a = k / 8 * TAU; return new THREE.Vector3(Math.cos(a) * (6 + (i === 2 ? 2 * Math.sin(a * 2) : 0)), 5 + Math.sin(a * (i + 1)) * 1.2, Math.sin(a) * (i === 1 ? 4 : 7)); }); const c = new THREE.CatmullRomCurve3(pts, true); return grp('bird_curve_' + i, mesh('curve', new THREE.TubeGeometry(c, 160, 0.03, 6, true), C('#B9A88F', 'guide'))); }
  // ---------- props ----------
  function insightLantern() { return grp('prop_insight_lantern', mesh('base', lathe([[0, 0], [0.09, 0], [0.1, 0.02], [0.07, 0.04], [0, 0.04]], 32), X.brass()), mesh('glass', lathe([[0, 0.04], [0.07, 0.05], [0.095, 0.14], [0.07, 0.24], [0, 0.25]], 40), X.glass()), mesh('core', sph(0.045, 24, 16), X.gold(), 0, 0.14, 0), mesh('cage_a', tor(0.095, 0.005, TAU, 6, 32), X.brass(), 0, 0.14, 0), mesh('cap', new THREE.ConeGeometry(0.08, 0.07, 32), X.brass(), 0, 0.28, 0), mesh('handle', tor(0.04, 0.007, TAU, 8, 24), X.brass(), 0, 0.34, 0)); }
  function lampPost() { const g = grp('prop_lamp_post', mesh('base', cyl(0.12, 0.15, 0.12, 16), C(K.navy, 'iron'), 0, 0.06, 0), mesh('post', cyl(0.04, 0.05, 2.2, 12), C(K.navy, 'iron'), 0, 1.2, 0), mesh('collar', tor(0.05, 0.015, TAU, 6, 16), X.brass(), 0, 1.9, 0), mesh('arm', rbox(0.5, 0.04, 0.04, 0.015), C(K.navy, 'iron'), 0.22, 2.2, 0), mesh('curl', tor(0.1, 0.015, PI, 6, 16), C(K.navy, 'iron'), 0.22, 2.1, 0)); g.getObjectByName('collar').rotation.x = PI / 2; const l = insightLantern(); at(l, 0.42, 1.78, 0, 0, 1.4); g.add(l, mesh('hook', cyl(0.006, 0.006, 0.08, 6), X.brass(), 0.42, 2.15, 0)); return g; }
  function bench() { const w = C(K.wood, 'wood'), i = C(K.navy, 'iron'), g = grp('prop_bench'); for (let k = 0; k < 3; k++) g.add(mesh('seat' + k, rbox(1.3, 0.04, 0.1, 0.015), w, 0, 0.42, -0.12 + k * 0.12)); for (let k = 0; k < 2; k++) g.add(mesh('back' + k, rbox(1.3, 0.09, 0.03, 0.012), w, 0, 0.62 + k * 0.13, -0.24)); for (const x of [-0.55, 0.55]) g.add(mesh('leg_f', rbox(0.05, 0.42, 0.05, 0.015), i, x, 0.21, 0.08), mesh('leg_b', rbox(0.05, 0.85, 0.05, 0.015), i, x, 0.42, -0.25), mesh('arm', rbox(0.05, 0.04, 0.42, 0.015), i, x, 0.6, -0.06)); return g; }
  function postBox() { const t = C(K.teal, 'postbox'), g = grp('prop_post_box', mesh('post', cyl(0.04, 0.04, 0.8, 10), C(K.navy, 'iron'), 0, 0.4, 0), mesh('box', rbox(0.34, 0.28, 0.42, 0.05), t, 0, 0.94, 0)); const top = mesh('top', cyl(0.17, 0.17, 0.42, 24, 1, false, 0, PI), t, 0, 1.08, 0); top.geometry = new THREE.CylinderGeometry(0.17, 0.17, 0.42, 24, 1, false, -PI / 2, PI); top.rotation.x = PI / 2; g.add(top, mesh('slot', rbox(0.18, 0.025, 0.02, 0.008), X.ink(), 0, 1.02, 0.21), mesh('flag_pole', cyl(0.008, 0.008, 0.2, 6), C(K.navy, 'iron'), 0.19, 1.05, 0.05), mesh('flag', rbox(0.01, 0.07, 0.1, 0.005), C(K.roof, 'flag'), 0.19, 1.12, 0.09), mesh('emblem', cyl(0.04, 0.04, 0.01, 20), X.gold(), 0, 0.92, 0.215)); g.getObjectByName('emblem').rotation.x = PI / 2; return g; }
  function fence(n = 4) { const g = grp('prop_fence'), w = C(K.cream, 'paint'); for (let i = 0; i < n; i++) g.add(mesh('picket' + i, rbox(0.09, 0.7, 0.03, 0.02), w, -0.6 + i * 0.4, 0.35, 0), mesh('cap' + i, new THREE.ConeGeometry(0.06, 0.08, 4), w, -0.6 + i * 0.4, 0.74, 0)); g.add(mesh('rail_a', rbox(1.4, 0.05, 0.03, 0.01), C(K.wood, 'wood'), 0, 0.5, -0.03), mesh('rail_b', rbox(1.4, 0.05, 0.03, 0.01), C(K.wood, 'wood'), 0, 0.2, -0.03)); g.children.forEach(c => { if (c.name.startsWith('cap')) c.rotation.y = PI / 4; }); return g; }
  function signpost() { const g = grp('prop_topic_sign', mesh('post', cyl(0.035, 0.045, 1.4, 10), C(K.wood, 'wood'), 0, 0.7, 0), mesh('finial', sph(0.05, 12, 10), X.brass(), 0, 1.43, 0)); const arrow = (y, dir, c, rz) => { const sh = new THREE.Shape(); sh.moveTo(-0.3, -0.09); sh.lineTo(0.22, -0.09); sh.lineTo(0.32, 0); sh.lineTo(0.22, 0.09); sh.lineTo(-0.3, 0.09); sh.closePath(); const m = mesh('board', extrude(sh, 0.03, 0.01), C(c, 'sign'), dir * 0.28, y, 0.03); m.rotation.y = dir < 0 ? PI : 0; m.rotation.z = rz; return m; }; g.add(arrow(1.2, 1, K.cream, 0.03), arrow(0.95, -1, K.butter, -0.04), arrow(0.72, 1, '#C6E0E4', 0)); return g; }
  function crates() { const g = grp('prop_crates_books'), w = C(K.wood, 'wood'), d = C(K.woodDark, 'wood'); const crate = (x, y, z, r) => { const c = grp('crate', mesh('box', rbox(0.5, 0.36, 0.4, 0.03), w), mesh('band_a', rbox(0.52, 0.05, 0.42, 0.01), d, 0, 0.1, 0), mesh('band_b', rbox(0.52, 0.05, 0.42, 0.01), d, 0, -0.1, 0)); at(c, x, y, z, r); return c; }; g.add(crate(0, 0.18, 0, 0), crate(0.12, 0.54, 0.02, 0.3)); const cols = [K.roof, K.teal, K.butter, K.lilac, K.leafDeep]; for (let i = 0; i < 5; i++) { const b = mesh('book' + i, rbox(0.06, 0.24 - (i % 2) * 0.04, 0.17, 0.008), C(cols[i], 'book'), -0.45 + i * 0.065, 0.12, 0.05); b.rotation.z = i === 4 ? -0.35 : 0; g.add(b); } g.add(mesh('book_flat', rbox(0.2, 0.04, 0.15, 0.008), C(K.teal, 'book'), 0.6, 0.02, 0.1)); return g; }
  function plantPot(s = 1) { const g = grp('prop_potted_plant', mesh('pot', lathe([[0, 0], [0.12, 0], [0.16, 0.24], [0.17, 0.26], [0.17, 0.28], [0.15, 0.28], [0.14, 0.22], [0, 0.22]], 28), C(K.roof, 'clay')), mesh('soil', cyl(0.145, 0.145, 0.02, 20), C(K.door, 'soil'), 0, 0.25, 0)); for (let i = 0; i < 8; i++) { const l = blob('leaf' + i, 0.05, C(i % 2 ? K.leaf : K.leafDeep, 'leaf'), Math.cos(i * 0.8) * 0.06, 0.4, Math.sin(i * 0.8) * 0.06, 0.4, 2.6, 0.15); l.rotation.set(Math.sin(i * 0.8) * 0.5, -i * 0.8, -Math.cos(i * 0.8) * 0.5); g.add(l); } g.scale.setScalar(s); return g; }
  function noticeBoard() { const g = grp('prop_notice_board'); for (const x of [-0.5, 0.5]) g.add(mesh('post', rbox(0.07, 1.6, 0.07, 0.02), C(K.wood, 'wood'), x, 0.8, 0)); g.add(mesh('board', rbox(1.0, 0.7, 0.04, 0.02), C('#C9A27E', 'cork'), 0, 1.05, 0.03), mesh('frame', rbox(1.06, 0.76, 0.03, 0.02), C(K.woodDark, 'wood'), 0, 1.05, 0.01)); const roof = mesh('roof', rbox(1.25, 0.04, 0.3, 0.015), C(K.roof, 'roof'), 0, 1.62, 0.05); roof.rotation.x = 0.25; g.add(roof); [[-0.3, 1.15, K.paper, 0.05], [0.05, 1.2, K.butter, -0.08], [0.32, 1.0, '#C6E0E4', 0.1], [-0.2, 0.88, K.rose, -0.05]].forEach(([x, y, c, r], i) => { const p = mesh('note' + i, rbox(0.22, 0.26, 0.006, 0.003), C(c, 'paper'), x, y, 0.055); p.rotation.z = r; g.add(p, mesh('pin' + i, sph(0.012, 8, 6), C(K.roof, 'pin'), x, y + 0.11, 0.065)); }); return g; }
  function barrel() { const g = grp('prop_barrel', mesh('barrel', lathe([[0, 0], [0.22, 0], [0.26, 0.3], [0.22, 0.6], [0, 0.6]], 24), C(K.wood, 'wood'))); for (const y of [0.08, 0.3, 0.52]) { const r = mesh('hoop', tor(y === 0.3 ? 0.262 : 0.235, 0.012, TAU, 6, 32), C(K.navy, 'iron'), 0, y, 0); r.rotation.x = PI / 2; g.add(r); } g.add(mesh('water', cyl(0.2, 0.2, 0.01, 24), X.water(), 0, 0.57, 0)); return g; }
  function marker() { return grp('prop_path_marker', mesh('base', rbox(0.34, 0.04, 0.34, 0.015), C(K.roof, 'marker'), 0, 0.02, 0), mesh('cone', new THREE.ConeGeometry(0.13, 0.42, 20), C(K.roof, 'marker'), 0, 0.25, 0), mesh('band', cyl(0.085, 0.1, 0.07, 20), C(K.cream, 'marker'), 0, 0.22, 0)); }
  // ---------- buildings ----------
  function windowUnit(r, lit, locked, box) {
    const g = grp('window'), tr = locked ? C('#8E949B', 'trim') : C(K.wood, 'trim');
    g.add(mesh('frame', tor(r, 0.024, TAU, 8, 32), tr, 0, 0, 0.01), mesh('glass', new THREE.CircleGeometry(r * 0.93, 32), lit ? X.win() : X.winOff()), mesh('mullion_v', rbox(0.022, r * 1.9, 0.02, 0.008), tr, 0, 0, 0.012), mesh('mullion_h', rbox(r * 1.9, 0.022, 0.02, 0.008), tr, 0, 0, 0.012), mesh('sill', rbox(r * 2.3, 0.04, 0.09, 0.015), tr, 0, -r - 0.03, 0.03));
    if (locked) g.add(mesh('shutter_l', rbox(r, r * 2, 0.025, 0.01), C('#9399A0', 'shutter'), -r / 2, 0, 0.035), mesh('shutter_r', rbox(r, r * 2, 0.025, 0.01), C('#9399A0', 'shutter'), r / 2, 0, 0.035));
    if (box) { g.add(mesh('flower_box', rbox(r * 2.2, 0.08, 0.1, 0.02), C(K.roof, 'clay'), 0, -r - 0.09, 0.06)); for (let i = 0; i < 5; i++) g.add(mesh('fb' + i, sph(0.028, 8, 6), C(i % 2 ? K.rose : K.butter, 'flower'), -r * 0.8 + i * r * 0.4, -r - 0.03, 0.07)); }
    return g;
  }
  function emblem(state) {
    const disc = mesh('emblem_disc', cyl(0.17, 0.17, 0.03, 32), state === 'locked' ? C(K.greyDark, 'roof') : C(K.plaster, 'wall')); disc.rotation.x = PI / 2;
    const m = state === 'locked' ? X.ink() : state === 'done' ? X.gold() : C(K.teal, 'emblem'); let mark;
    if (state === 'locked') { mark = mesh('mark_diamond', rbox(0.13, 0.13, 0.03, 0.01), m, 0, 0, 0.02); mark.rotation.z = PI / 4; }
    if (state === 'available') { const c = mesh('mh_roof', new THREE.ConeGeometry(0.11, 0.08, 4), m, 0, 0.05, 0.02); c.rotation.y = PI / 4; mark = grp('mark_house', mesh('mh_base', rbox(0.13, 0.08, 0.03, 0.008), m, 0, -0.03, 0.02), c); }
    if (state === 'in_progress') { mark = mesh('mark_half', new THREE.CylinderGeometry(0.11, 0.11, 0.03, 32, 1, false, 0, PI), m, 0, 0, 0.02); mark.rotation.x = PI / 2; }
    if (state === 'done') { const a = mesh('ck_a', rbox(0.06, 0.028, 0.03, 0.01), m, -0.04, -0.02, 0.02); a.rotation.z = -PI / 4; const b = mesh('ck_b', rbox(0.15, 0.028, 0.03, 0.01), m, 0.03, 0.01, 0.02); b.rotation.z = PI / 3.4; mark = grp('mark_check', a, b); }
    return grp('state_emblem', disc, mark);
  }
  function scaffold(h = 1.3, r = 0.7) { const g = grp('scaffold'), w = C(K.wood, 'wood'); for (let i = 0; i < 4; i++) { const a = PI / 4 + i * PI / 2; g.add(mesh('pole' + i, cyl(0.025, 0.025, h, 6), w, Math.cos(a) * r, h / 2, Math.sin(a) * r)); } for (const y of [h * 0.45, h * 0.95]) { const ring = mesh('rail', tor(r, 0.018, TAU, 6, 4), w, 0, y, 0); ring.rotation.x = PI / 2; ring.rotation.z = PI / 4; g.add(ring); } g.add(mesh('deck', rbox(r * 1.2, 0.03, 0.25, 0.01), w, 0, h * 0.45 + 0.03, r * 0.72)); return g; }
  function ladder(h = 1.6) { const g = grp('ladder'), w = C(K.wood, 'wood'); g.add(mesh('rail_l', rbox(0.035, h, 0.035, 0.01), w, -0.15, h / 2, 0), mesh('rail_r', rbox(0.035, h, 0.035, 0.01), w, 0.15, h / 2, 0)); for (let i = 0; i < Math.floor(h / 0.25); i++) g.add(mesh('rung' + i, rbox(0.3, 0.025, 0.025, 0.008), w, 0, 0.2 + i * 0.25, 0)); return g; }
  const HOUSE_VARIANTS = [
    { name: 'terracotta', n: 48, h: 1.35, roof: 'cone', wall: '#F4E9D8', roofC: '#C9785F', roofD: '#A85E49', door: '#4A3B36', trim: '#9C7356' },
    { name: 'teal', n: 6, h: 1.6, roof: 'spire', wall: '#E9F1EC', roofC: '#2F7D7A', roofD: '#225E5C', door: '#7A4A32', trim: '#6E4F3C' },
    { name: 'lilac', n: 8, h: 1.25, roof: 'dome', wall: '#F3EEF7', roofC: '#8F7BB8', roofD: '#6F5D99', door: '#3E4A5E', trim: '#9C7356' },
    { name: 'sage', n: 48, h: 1.5, roof: 'tiered', wall: '#F5EFDD', roofC: '#6FA07E', roofD: '#527D61', door: '#A85E49', trim: '#9C7356' },
    { name: 'sky', n: 6, h: 1.4, roof: 'cone', wall: '#EEF3F6', roofC: '#4F7FA8', roofD: '#3A6388', door: '#C9785F', trim: '#6E4F3C' },
    { name: 'rose', n: 8, h: 1.7, roof: 'spire', wall: '#FAEEE8', roofC: '#D9877C', roofD: '#B86A60', door: '#2F7D7A', trim: '#9C7356' },
  ];
  const greyOf = hex => { const c = new THREE.Color(hex); const l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11; c.setRGB(l * 0.85 + 0.08, l * 0.87 + 0.08, l * 0.9 + 0.08); return '#' + c.getHexString(); };
  function house(state, vi = 0) {
    const V = HOUSE_VARIANTS[vi % HOUSE_VARIANTS.length];
    const locked = state === 'locked', done = state === 'done', prog = state === 'in_progress';
    const col = h => locked ? greyOf(h) : h, poly = V.n < 20, fl = poly ? { ds: false } : undefined;
    const flat = (hex, role) => { const m = C(hex, role + (poly ? '_flat' : '')); if (poly) m.flatShading = true; return m; };
    const wallM = flat(col(V.wall), 'wall'), roofM = flat(col(V.roofC), 'roof'), roofD = C(col(V.roofD), 'roofline'), trim = C(col(V.trim), 'trim');
    const stoneM = C(locked ? '#9EA3A8' : K.stone, 'stone'), stone2 = C(locked ? '#959AA0' : K.stoneDark, 'stone');
    const gilt = mat('gilt', '#E9BC5C', { m: 0.35, r: 0.4, e: '#C99232', ei: 0.25 });
    const n = V.n, H = V.h, rot = PI / n, rf = poly ? 0.9 * Math.cos(PI / n) : 0.9, roofY = 0.22 + H;
    const g = grp('topic_house_' + V.name + '_' + state);
    g.add(mesh('plinth_core', cyl(1.08, 1.12, 0.2, 40), stoneM, 0, 0.1, 0));
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; const s = mesh('plinth_stone_' + i, rbox(0.42, 0.22, 0.2, 0.05), i % 3 ? stoneM : stone2, Math.sin(a) * 1.1, 0.11, Math.cos(a) * 1.1); s.rotation.y = a; g.add(s); }
    g.add(mesh('step_1', rbox(0.74, 0.1, 0.24, 0.03), stoneM, 0, 0.05, 1.44), mesh('step_2', rbox(0.62, 0.1, 0.2, 0.03), stone2, 0, 0.15, 1.3));
    const walls = mesh('walls', lathe([[0, 0], [0.92, 0], [0.9, H * 0.52], [0.88, H], [0, H]], n), wallM, 0, 0.22, 0); walls.rotation.y = rot; g.add(walls);
    const band = (nm, y, r, t, m = trim) => { const b = mesh(nm, cyl(r + t, r + t, t * 2, n), m, 0, y, 0); b.rotation.y = rot; return b; };
    g.add(band('base_band', 0.27, 0.92, 0.035), band('floor_band', 0.22 + H * 0.52, 0.9, 0.025));
    const posts = poly ? [...Array(n)].map((_, k) => k * TAU / n + rot) : [0.42, -0.42, 1.45, -1.45, 2.35, -2.35];
    for (const a of posts) { if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.3) continue; const r = poly ? 0.9 : 0.9; const p = mesh('timber', rbox(0.06, H - 0.05, 0.06, 0.015), trim, Math.sin(a) * r, 0.22 + H / 2, Math.cos(a) * r); p.rotation.y = a; g.add(p); }
    const faces = poly ? [...Array(n)].map((_, k) => k * TAU / n).filter(a => Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) > 0.5) : [-0.9, 0.9, PI, 1.95, -1.95];
    const upY = 0.22 + H * 0.74, loY = 0.22 + H * 0.3;
    faces.forEach((a, i) => { const upper = poly ? i % 2 === 0 : i < 3, y = upper ? upY : loY, r = upper ? 0.14 : 0.11; const lit = done || (state === 'available' && i < 3) || (prog && i === 0); const w = windowUnit(r, lit, locked, (done || state === 'available') && upper); w.position.set(Math.sin(a) * (rf + 0.005), y, Math.cos(a) * (rf + 0.005)); w.rotation.y = a; w.name = 'window_' + i; if (locked) w.traverse(o => { if (o.isMesh && o.name === 'frame') o.material = trim; }); g.add(w); });
    const dz = rf; g.add(mesh('door_post_l', rbox(0.07, 0.56, 0.08, 0.02), trim, -0.26, 0.5, dz), mesh('door_post_r', rbox(0.07, 0.56, 0.08, 0.02), trim, 0.26, 0.5, dz), mesh('door_arch_frame', tor(0.26, 0.035, PI, 8, 24), trim, 0, 0.78, dz));
    g.add(mesh('doorway', rbox(0.44, 0.56, 0.02, 0.005), locked ? C(K.door, 'door') : X.win(), 0, 0.5, dz - 0.015));
    const doorM = C(col(V.door), 'door'), door = grp('door'); door.position.set(-0.22, 0.22, dz);
    const leaf = grp('door_leaf', mesh('panel', rbox(0.44, 0.56, 0.05, 0.015), doorM, 0.22, 0.28, 0), mesh('panel_arch', new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24, 1, false, 0, PI).rotateX(PI / 2).rotateZ(PI / 2), doorM, 0.22, 0.56, 0));
    for (const x of [0.1, 0.34]) leaf.add(mesh('plank', rbox(0.015, 0.6, 0.012, 0.005), C('#3A2E2A', 'door'), x, 0.3, 0.03));
    leaf.add(mesh('knob', sph(0.022, 12, 10), X.brass(), 0.37, 0.28, 0.04)); door.add(leaf);
    if (!locked && !prog) door.rotation.y = -1.05; g.add(door);
    if (locked) [-1, 1].forEach((s, i) => { const b = mesh('board_' + i, rbox(0.6, 0.075, 0.03, 0.01), C(K.greyDark, 'board'), 0, 0.55, dz + 0.06); b.rotation.z = s * 0.55; g.add(b); });
    else g.add(mesh('doormat', rbox(0.5, 0.015, 0.3, 0.005), C(V.roofC, 'mat'), 0, 0.205, 1.12));
    const em = emblem(state); em.position.set(0, 0.22 + H * 0.66, dz); em.scale.setScalar(0.8); if (H * 0.66 < 0.85) em.position.y = 1.08; g.add(em);
    g.add(band('eave', roofY, 1.1, 0.035, done ? gilt : trim));
    const cone = [[0, 1.25], [0.06, 1.2], [0.35, 0.85], [0.8, 0.32], [1.12, 0.06], [1.18, 0], [0.9, 0.04], [0, 0.05]];
    let apex = 1.25;
    const addRoof = (pts, y = roofY, nm = 'roof') => { const m = mesh(nm, lathe([...pts].reverse(), n), roofM, 0, y, 0); m.rotation.y = rot; g.add(m); };
    const rows = (list, y0 = roofY) => list.forEach(([y, r], i) => { const b = mesh('shingle_row_' + i, cyl(r + 0.028, r + 0.028, 0.05, n), done ? gilt : roofD, 0, y0 + y, 0); b.rotation.y = rot; g.add(b); });
    if (prog) {
      addRoof([[0.55, 0.62], [0.8, 0.32], [1.12, 0.06], [1.18, 0], [0.9, 0.04], [0.5, 0.6]], roofY, 'roof_partial');
      const rafters = grp('rafters'); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; const r = mesh('rafter' + i, rbox(0.045, 1.25, 0.045, 0.012), C(K.wood, 'wood'), Math.sin(a) * 0.58, roofY + 0.42, Math.cos(a) * 0.58); r.rotation.order = 'YXZ'; r.rotation.set(-0.84, a, 0); rafters.add(r); } g.add(rafters);
      g.add(mesh('beacon', sph(0.11, 24, 16), X.goldDim(), 0, roofY + 1.32, 0), mesh('beacon_post', cyl(0.02, 0.02, 0.4, 6), C(K.wood, 'wood'), 0, roofY + 1.1, 0));
      g.add(at(scaffold(H + 0.05, 1.05), 0, 0.22, 0));
      const ld = ladder(H + 0.35); ld.position.set(0.95, 0.1, 0.95); ld.rotation.y = -PI / 4; ld.rotation.x = -0.25; g.add(ld);
      const tiles = grp('tile_stack'); for (let i = 0; i < 5; i++) tiles.add(mesh('tile' + i, rbox(0.25, 0.035, 0.15, 0.01), roofM, 0, 0.02 + i * 0.04, 0)); tiles.position.set(-1.25, 0, 0.9); g.add(tiles, at(crates(), 1.3, 0, -0.6, 0.6, 0.6));
      apex = 1.32;
    } else if (V.roof === 'cone') { addRoof(cone); rows([[0.2, 0.95], [0.45, 0.69], [0.7, 0.47], [0.95, 0.26]]); }
    else if (V.roof === 'spire') { addRoof([[0, 1.9], [0.05, 1.85], [0.3, 1.2], [0.75, 0.42], [1.1, 0.08], [1.16, 0], [0.9, 0.04], [0, 0.05]]); rows([[0.3, 0.96], [0.7, 0.66], [1.1, 0.4], [1.45, 0.2]]); apex = 1.9; }
    else if (V.roof === 'dome') { const d = mesh('roof', new THREE.SphereGeometry(1.0, n === 8 ? 8 : 40, 12, 0, TAU, 0, PI / 2), roofM, 0, roofY, 0); d.rotation.y = rot; d.scale.y = 0.85; g.add(d); rows([[0.35, 0.93], [0.6, 0.76]]); apex = 0.9; g.add(mesh('cupola', cyl(0.14, 0.16, 0.18, n), wallM, 0, roofY + 0.92, 0), mesh('cupola_cap', new THREE.ConeGeometry(0.2, 0.18, n), roofM, 0, roofY + 1.1, 0)); apex = 1.2; }
    else if (V.roof === 'tiered') { addRoof([[0.62, 0.52], [0.9, 0.22], [1.18, 0], [0.9, 0.04], [0.6, 0.5]], roofY, 'roof_low'); const up = mesh('upper_walls', lathe([[0, 0], [0.56, 0], [0.54, 0.45], [0, 0.45]], n), wallM, 0, roofY + 0.48, 0); up.rotation.y = rot; g.add(up); addRoof([[0, 0.8], [0.05, 0.76], [0.3, 0.45], [0.7, 0.05], [0.74, 0], [0.5, 0.03], [0, 0.04]], roofY + 0.92, 'roof_high'); rows([[0.25, 0.9]]); for (let k = 0; k < 4; k++) { const a = k * PI / 2 + PI / 4; const w = mesh('upper_window', new THREE.CircleGeometry(0.07, 20), done || state === 'available' ? X.win() : X.winOff(), Math.sin(a) * 0.555, roofY + 0.72, Math.cos(a) * 0.555); w.rotation.y = a; g.add(w); } apex = 1.72; }
    if (!prog) {
      if (V.roof === 'cone') { const dm = grp('dormer', mesh('dormer_body', rbox(0.38, 0.3, 0.34, 0.03), wallM, 0, 0, 0)); const r1 = mesh('dormer_roof_l', rbox(0.26, 0.035, 0.42, 0.012), roofM, -0.1, 0.2, 0); r1.rotation.z = 0.65; const r2 = mesh('dormer_roof_r', rbox(0.26, 0.035, 0.42, 0.012), roofM, 0.1, 0.2, 0); r2.rotation.z = -0.65; dm.add(r1, r2, mesh('dormer_window', new THREE.CircleGeometry(0.07, 24), done || state === 'available' ? X.win() : X.winOff(), 0, 0, 0.172), mesh('dormer_frame', tor(0.075, 0.018, TAU, 6, 24), trim, 0, 0, 0.175)); dm.position.set(0, roofY + 0.48, 0.62); g.add(dm); }
      if (V.roof !== 'dome') g.add(mesh('chimney', rbox(0.18, 0.5, 0.18, 0.03), stoneM, 0.5, roofY + 0.62, -0.38), mesh('chimney_cap', rbox(0.25, 0.06, 0.25, 0.02), stone2, 0.5, roofY + 0.9, -0.38));
      const top = roofY + apex;
      g.add(mesh('finial', cyl(0.02, 0.03, 0.32, 8), locked ? C(greyOf(K.brass), 'trim') : done ? gilt : X.brass(), 0, top + 0.11, 0));
      const bY = top + 0.33;
      g.add(mesh('beacon', sph(done ? 0.17 : 0.09, 24, 16), locked ? stoneM : done ? X.gold() : X.goldDim(), 0, bY, 0));
      const halo = mesh('beacon_ring', tor(done ? 0.25 : 0.13, done ? 0.018 : 0.012, TAU, 6, 32), locked ? C(greyOf(K.brass), 'trim') : done ? gilt : X.brass(), 0, bY, 0); halo.rotation.x = PI / 2; g.add(halo);
      if (done) {
        const rays = grp('beacon_rays'); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; const r = mesh('ray' + k, new THREE.ConeGeometry(0.03, 0.22, 6), X.gold(), Math.cos(a) * 0.36, bY, Math.sin(a) * 0.36); r.rotation.z = -PI / 2; r.rotation.y = -a; r.rotation.order = 'YZX'; rays.add(r); } g.add(rays);
        const fl = new THREE.Shape(); fl.moveTo(0, 0); fl.lineTo(0.42, -0.08); fl.lineTo(0.3, -0.12); fl.lineTo(0.42, -0.2); fl.lineTo(0, -0.2); fl.closePath(); const p = new THREE.Mesh(new THREE.ShapeGeometry(fl), C(V.roofC, 'flag', { ds: true })); p.name = 'pennant'; p.position.set(0.02, top + 0.05, 0); g.add(p);
        const glowRing = mesh('ground_glow', tor(1.28, 0.03, TAU, 6, 64), X.gold(), 0, 0.03, 0); glowRing.rotation.x = PI / 2; g.add(glowRing);
        for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; g.add(mesh('glow_stone' + k, sph(0.035, 10, 8), X.gold(), Math.sin(a) * 1.28, 0.05, Math.cos(a) * 1.28)); }
      }
    }
    const bracket = grp('hanging_sign', mesh('arm', rbox(0.34, 0.03, 0.03, 0.01), trim, 0.17, 0, 0), mesh('chain_a', cyl(0.004, 0.004, 0.08, 4), X.brass(), 0.08, -0.05, 0), mesh('chain_b', cyl(0.004, 0.004, 0.08, 4), X.brass(), 0.28, -0.05, 0), mesh('board', rbox(0.28, 0.16, 0.025, 0.01), C(locked ? K.grey : V.roofC, 'sign'), 0.18, -0.16, 0)); const ba = poly ? TAU / n * 0.5 : 0.62; bracket.position.set(Math.sin(ba) * 0.9, 0.22 + H * 0.9, Math.cos(ba) * 0.9); bracket.rotation.y = ba - PI / 2; g.add(bracket);
    if (state === 'available' || done) { const lp = grp('door_lantern', mesh('post', cyl(0.025, 0.03, 0.8, 8), C(K.navy, 'iron'), 0, 0.4, 0), at(insightLantern(), 0, 0.8, 0, 0, 0.8)); lp.position.set(0.62, 0.0, 1.35); g.add(lp, at(plantPot(0.8), -0.5, 0.0, 1.38)); }
    if (done) { g.add(at(flowers(), -0.95, 0.0, 1.25), at(flowers(), 1.15, 0.0, 0.85), at(flowers(), -1.2, 0, -0.2), at(bush(0.75), 1.25, 0, 0.1), at(tree(0.6), -1.35, 0, -0.75), at(bush(0.6), -1.3, 0, 0.55), at(treeBirch(0.55), 1.1, 0, -1.0)); const lp2 = g.getObjectByName('door_lantern').clone(); lp2.position.x = -0.62; g.add(lp2); }
    if (locked) { g.add(at(rocks(0.7), 1.05, 0.0, 1.0), at(grassTuft(), -1.1, 0, 1.0), at(grassTuft(), 1.2, 0, -0.5)); const vine = grp('vines'); for (let i = 0; i < 7; i++) vine.add(blob('vine' + i, 0.06, C(K.leafDeep, 'leaf'), Math.sin(-1.2 + i * 0.05) * 0.93, 0.3 + i * 0.12, Math.cos(-1.2 + i * 0.05) * 0.93, 1, 0.8, 0.5)); g.add(vine); }
    return g;
  }
  function library() { const wall = C(K.plaster, 'wall'), trim = C(K.wood, 'trim'), roof = C(K.teal, 'roof_teal'), g = grp('building_library'); g.add(mesh('base', cyl(1.6, 1.7, 0.25, 48), C(K.stone, 'stone'), 0, 0.12, 0), mesh('drum', cyl(1.45, 1.45, 2.2, 48), wall, 0, 1.35, 0), mesh('drum2', cyl(1.1, 1.15, 1.0, 48), wall, 0, 2.95, 0), mesh('dome', new THREE.SphereGeometry(1.15, 40, 16, 0, TAU, 0, PI / 2), roof, 0, 3.45, 0), mesh('lantern_drum', cyl(0.25, 0.25, 0.35, 16), wall, 0, 4.7, 0), mesh('lantern_cap', new THREE.ConeGeometry(0.32, 0.35, 16), roof, 0, 5.05, 0), mesh('beacon', sph(0.1, 16, 12), X.gold(), 0, 5.3, 0)); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; const col = mesh('column' + i, cyl(0.08, 0.09, 2.0, 12), C(K.cream, 'column'), Math.sin(a) * 1.55, 1.25, Math.cos(a) * 1.55); g.add(col); if (i % 2 === 0 && i !== 0) { const w = mesh('arch_window' + i, rbox(0.4, 0.9, 0.04, 0.04), X.win(), Math.sin(a + PI / 12) * 1.46, 1.4, Math.cos(a + PI / 12) * 1.46); w.rotation.y = a + PI / 12; g.add(w); } } const ring = mesh('cornice', tor(1.58, 0.07, TAU, 8, 64), trim, 0, 2.3, 0); ring.rotation.x = PI / 2; g.add(ring, mesh('door', rbox(0.6, 1.2, 0.06, 0.05), C(K.door, 'door'), 0, 0.85, 1.45), mesh('steps', rbox(1.2, 0.12, 0.5, 0.03), C(K.stone, 'stone'), 0, 0.06, 1.85), mesh('plaque', rbox(0.9, 0.2, 0.04, 0.02), C(K.gold, 'trim'), 0, 1.65, 1.47)); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; const rib = mesh('dome_rib' + i, tor(1.15, 0.025, PI / 2, 6, 20), C('#25615F', 'roof_teal'), 0, 3.45, 0); rib.rotation.set(0, a, 0); g.add(rib); } return g; }
  function observatory() { const g = grp('building_observatory'), wall = C(K.stone, 'stone'); g.add(mesh('tower', cyl(0.9, 1.05, 2.4, 32), wall, 0, 1.2, 0), mesh('band', cyl(0.95, 0.95, 0.15, 32), C(K.wood, 'trim'), 0, 2.45, 0), mesh('dome', new THREE.SphereGeometry(0.9, 32, 16, 0, TAU, 0, PI / 2), C('#E3E7EA', 'dome', { m: 0 }), 0, 2.5, 0), mesh('slit', rbox(0.28, 0.95, 0.1, 0.03), X.ink(), 0, 3.0, 0.62), mesh('door', rbox(0.5, 0.9, 0.06, 0.05), C(K.door, 'door'), 0, 0.45, 0.98)); g.getObjectByName('slit').rotation.x = -0.6; const scope = grp('telescope', mesh('tube', cyl(0.09, 0.12, 0.9, 16), X.brass(), 0, 0, 0), mesh('lens', cyl(0.1, 0.1, 0.03, 16), X.glass(), 0, 0.46, 0)); scope.position.set(0, 3.25, 0.55); scope.rotation.x = 0.8; g.add(scope); for (let i = 0; i < 3; i++) { const a = PI + (i - 1) * 0.6; const w = mesh('window' + i, new THREE.CircleGeometry(0.14, 20), X.win(), Math.sin(a) * 0.96, 1.5, Math.cos(a) * 0.96); w.rotation.y = a; g.add(w); } return g; }
  function greenhouse() { const g = grp('building_greenhouse'), fr = C(K.cream, 'frame'); g.add(mesh('base', rbox(3, 0.35, 2, 0.05), C(K.stone, 'stone'), 0, 0.17, 0), mesh('glass_walls', rbox(2.9, 1.3, 1.9, 0.02), X.glass(), 0, 1.0, 0)); const vault = mesh('glass_roof', new THREE.CylinderGeometry(0.95, 0.95, 2.9, 24, 1, true, -PI / 2, PI), X.glass(), 0, 1.65, 0); vault.rotation.z = PI / 2; g.add(vault); for (let i = 0; i <= 6; i++) { const x = -1.45 + i * 0.483; const arc = mesh('rib' + i, tor(0.95, 0.025, PI, 6, 24), fr, x, 1.65, 0); arc.rotation.y = PI / 2; g.add(arc, mesh('post' + i, rbox(0.04, 1.3, 0.04, 0.01), fr, x, 1.0, 0.95), mesh('post_b' + i, rbox(0.04, 1.3, 0.04, 0.01), fr, x, 1.0, -0.95)); } for (let i = 0; i < 6; i++) g.add(at(plantPot(1.2), -1.1 + i * 0.44, 0.35, 0.4 * (i % 2 ? 1 : -1))); g.add(at(treeBirch(0.6), 0.9, 0.35, 0)); return g; }
  function workshop() { const g = grp('building_workshop'), wall = C('#E9D9C2', 'wall'), roof = C(K.roof, 'roof'); g.add(mesh('body', rbox(3, 1.8, 2, 0.06), wall, 0, 0.9, 0)); for (let i = 0; i < 3; i++) { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(1, 0); sh.lineTo(1, 0.6); sh.closePath(); const t = mesh('sawtooth' + i, extrude(sh, 2.1, 0.02), roof, -1 + i * 1, 2.1, 0); t.rotation.y = 0; g.add(t); const gl = mesh('skylight' + i, rbox(0.04, 0.55, 2.0, 0.01), X.win(), -0.52 + i * 1, 2.12, 0); g.add(gl); } g.add(mesh('door', rbox(1.2, 1.2, 0.06, 0.03), C(K.teal, 'door'), -0.6, 0.6, 1.0), mesh('window', rbox(0.7, 0.5, 0.05, 0.03), X.win(), 0.8, 1.1, 1.0), mesh('chimney', cyl(0.12, 0.14, 1.2, 16), C(K.stoneDark, 'stone'), 1.2, 2.5, -0.6), mesh('awning', rbox(1.5, 0.05, 0.5, 0.02), C(K.butter, 'awning'), -0.6, 1.4, 1.2)); g.getObjectByName('awning').rotation.x = 0.2; g.add(at(crates(), 1.3, 0, 1.4, 0, 0.7), at(barrel(), -1.6, 0, 1.2)); return g; }
  function schoolHall() { const g = grp('building_school_hall'), wall = C(K.plaster, 'wall'), roof = C(K.roof, 'roof'); g.add(mesh('base', rbox(4.6, 0.25, 2.4, 0.05), C(K.stone, 'stone'), 0, 0.12, 0), mesh('body', rbox(4.4, 1.6, 2.2, 0.06), wall, 0, 1.05, 0)); const rf = new THREE.Shape(); rf.moveTo(-1.3, 0); rf.lineTo(1.3, 0); rf.lineTo(0, 0.9); rf.closePath(); const r = mesh('roof', extrude(rf, 4.6, 0.03), roof, 0, 2.3, 0); r.rotation.y = PI / 2; g.add(r); for (let i = 0; i < 5; i++) if (i !== 2) g.add(mesh('window' + i, rbox(0.5, 0.7, 0.05, 0.04), X.win(), -1.8 + i * 0.9, 1.15, 1.1), mesh('sill' + i, rbox(0.6, 0.05, 0.1, 0.02), C(K.wood, 'trim'), -1.8 + i * 0.9, 0.77, 1.13)); g.add(mesh('door', rbox(0.7, 1.1, 0.06, 0.05), C(K.teal, 'door'), 0, 0.8, 1.1), mesh('tower', rbox(0.7, 1.0, 0.7, 0.03), wall, 0, 3.4, 0), mesh('bell_arch', rbox(0.45, 0.5, 0.72, 0.03), X.ink(), 0, 3.5, 0), mesh('bell', lathe([[0, 0], [0.13, 0], [0.11, 0.06], [0.08, 0.2], [0, 0.22]], 20), X.brass(), 0, 3.32, 0), mesh('tower_roof', new THREE.ConeGeometry(0.6, 0.7, 4), roof, 0, 4.25, 0), mesh('clock', cyl(0.25, 0.25, 0.04, 32), C(K.cream, 'clock'), 0, 2.55, 1.06)); g.getObjectByName('tower_roof').rotation.y = PI / 4; g.getObjectByName('clock').rotation.x = PI / 2; return g; }
  function cottage() { const g = grp('building_cottage'), wall = C('#F0E3CF', 'wall'), roof = C(K.leafDeep, 'roof_moss'); g.add(mesh('body', rbox(1.8, 1.2, 1.5, 0.08), wall, 0, 0.6, 0)); const rf = new THREE.Shape(); rf.moveTo(-1.05, 0); rf.lineTo(1.05, 0); rf.quadraticCurveTo(0.3, 0.6, 0, 0.95); rf.quadraticCurveTo(-0.3, 0.6, -1.05, 0); const r = mesh('roof', extrude(rf, 2.0, 0.06), roof, 0, 1.6, 0); g.add(r); g.getObjectByName('roof').rotation.y = 0; g.add(mesh('door', rbox(0.45, 0.8, 0.06, 0.06), C(K.roof, 'door'), 0.3, 0.4, 0.76), mesh('window', new THREE.CircleGeometry(0.18, 24), X.win(), -0.4, 0.75, 0.76), mesh('window_frame', tor(0.18, 0.025, TAU, 6, 24), C(K.wood, 'trim'), -0.4, 0.75, 0.765), mesh('chimney', rbox(0.22, 0.6, 0.22, 0.04), C(K.stoneDark, 'stone'), 0.55, 1.95, -0.3)); g.add(at(flowers(), -0.6, 0, 1.0), at(bush(0.6), 1.05, 0, 0.6)); return g; }
  function bridge() { const g = grp('building_bridge'), st = C(K.stone, 'stone'); const sh = new THREE.Shape(); sh.moveTo(-2, 0); sh.lineTo(-2, 0.9); sh.lineTo(2, 0.9); sh.lineTo(2, 0); sh.lineTo(1.3, 0); sh.absarc(0, 0, 1.3, 0, PI, false); sh.lineTo(-2, 0); const b = mesh('arch', extrude(sh, 1.2, 0.04), st, 0, 0.45, 0); g.add(b); for (const z of [-0.6, 0.6]) { g.add(mesh('parapet', rbox(4, 0.3, 0.14, 0.04), C(K.stoneDark, 'stone'), 0, 1.06, z)); } for (let i = 0; i < 9; i++) { const a = PI * i / 8; g.add(mesh('voussoir' + i, rbox(0.18, 0.28, 1.22, 0.03), C(K.stoneDark, 'stone'), Math.cos(a) * 1.4, Math.sin(a) * 1.4 - 0.02, 0)); g.children.at(-1).rotation.z = a - PI / 2; } return g; }
  function well() { const g = grp('building_well', mesh('ring', lathe([[0.5, 0], [0.55, 0], [0.55, 0.6], [0.45, 0.6], [0.45, 0.05]], 32), C(K.stone, 'stone')), mesh('water', cyl(0.45, 0.45, 0.02, 24), X.water(), 0, 0.4, 0)); for (const x of [-0.5, 0.5]) g.add(mesh('post', rbox(0.08, 1.2, 0.08, 0.02), C(K.wood, 'wood'), x, 1.0, 0)); g.add(mesh('axle', cyl(0.03, 0.03, 1.1, 8), C(K.woodDark, 'wood'), 0, 1.35, 0), mesh('bucket', cyl(0.11, 0.09, 0.16, 14), C(K.wood, 'wood'), 0, 1.0, 0)); g.getObjectByName('axle').rotation.z = PI / 2; const rf = new THREE.Shape(); rf.moveTo(-0.75, 0); rf.lineTo(0.75, 0); rf.lineTo(0, 0.5); rf.closePath(); g.add(mesh('roof', extrude(rf, 0.8, 0.03), C(K.roof, 'roof'), 0, 1.8, 0)); return g; }
  function gate() { const g = grp('building_gate'), st = C(K.stone, 'stone'); for (const x of [-1, 1]) g.add(mesh('pillar', rbox(0.4, 2.2, 0.4, 0.05), st, x * 1.0, 1.1, 0), mesh('cap', rbox(0.5, 0.12, 0.5, 0.03), C(K.stoneDark, 'stone'), x * 1.0, 2.26, 0), mesh('orb', sph(0.1, 16, 12), X.brass(), x * 1.0, 2.42, 0)); const a = mesh('arch', tor(1.0, 0.1, PI, 10, 32), C(K.roof, 'roof'), 0, 2.2, 0); g.add(a, at(emblem('available'), 0, 3.0, 0.05, 0, 1.4)); return g; }
  function stairs(n = 6) { const g = grp('building_stairs'); for (let i = 0; i < n; i++) g.add(mesh('step' + i, rbox(1.4, 0.18, 0.4, 0.03), C(i % 2 ? K.stone : K.stoneDark, 'stone'), 0, 0.09 + i * 0.18, -i * 0.36)); for (const x of [-0.75, 0.75]) { const r = mesh('rail', rbox(0.06, 0.06, n * 0.4, 0.02), C(K.navy, 'iron'), x, 0.95 + n * 0.09, -n * 0.18 + 0.18); r.rotation.x = Math.atan2(0.18, 0.36); g.add(r); } return g; }
  function wallSeg() { const g = grp('building_wall_segment'); for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) g.add(mesh('block', rbox(0.5 + ((i + r) % 2) * 0.1, 0.3, 0.4, 0.05), C((i + r) % 3 ? K.stone : K.stoneDark, 'stone'), -1.1 + i * 0.55 + (r % 2) * 0.2, 0.15 + r * 0.3, 0)); g.add(mesh('coping', rbox(2.9, 0.08, 0.46, 0.03), C(K.stoneDark, 'stone'), 0.05, 0.94, 0)); for (let i = 0; i < 4; i++) g.add(blob('ivy' + i, 0.12, C(K.leafDeep, 'leaf'), -1 + i * 0.6, 0.7 - (i % 2) * 0.2, 0.2, 1, 1.2, 0.4)); return g; }
  function stall() { const g = grp('building_market_stall'); g.add(mesh('counter', rbox(1.6, 0.9, 0.7, 0.04), C(K.wood, 'wood'), 0, 0.45, 0)); for (const x of [-0.75, 0.75]) g.add(mesh('post', rbox(0.06, 2.1, 0.06, 0.02), C(K.woodDark, 'wood'), x, 1.05, -0.3)); for (let i = 0; i < 6; i++) { const s = mesh('stripe' + i, rbox(0.3, 0.03, 1.0, 0.01), C(i % 2 ? K.cream : K.roof, 'awning'), -0.75 + i * 0.3, 2.05, 0.1); s.rotation.x = 0.25; g.add(s); } for (let i = 0; i < 6; i++) g.add(mesh('fruit' + i, sph(0.07, 12, 10), C([K.roof, K.butter, K.leaf][i % 3], 'fruit'), -0.5 + i * 0.2, 0.96, 0.1)); g.add(at(crates(), 0.6, 0, 0.8, 0.4, 0.5)); return g; }
  // ---------- terrain tiles ----------
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const TERRAIN = {
    meadow: (x, z) => 0.25 * n2(x, z),
    hill: (x, z) => 1.8 * Math.exp(-(x * x + z * z) / 9) + 0.15 * n2(x, z),
    cliff: (x, z) => 2.6 * sm(0.6, -0.6, z + 0.35 * Math.sin(x * 1.3)) + 0.12 * n2(x * 2, z * 2),
    beach: (x, z) => 0.55 - 0.13 * (z + 4) + 0.08 * n2(x, z),
    river: (x, z) => 0.45 - 0.95 * Math.exp(-((z - 0.4 * Math.sin(x * 0.7)) ** 2) / 1.1) + 0.12 * n2(x, z),
    plaza: (x, z) => (Math.hypot(x, z) < 2.8 ? 0.05 : 0.05 + 0.25 * sm(2.8, 3.6, Math.hypot(x, z)) + 0.1 * n2(x, z)),
    forest: (x, z) => 0.35 * n2(x, z) + 0.15 * n2(x * 2.1, z * 1.7),
    terraces: (x, z) => Math.floor((-z + 4) / 1.6) * 0.45 + 0.04 * n2(x * 3, z * 3),
    waterfall: (x, z) => (z < -1.2 ? 2.6 - (Math.abs(x) < 0.7 ? 0.3 : 0) : 0.35 - 0.6 * Math.exp(-(x * x + (z - 0.5) ** 2) / 2.5)) + 0.08 * n2(x * 2, z * 2),
    summit: (x, z) => Math.max(0, 3.2 - Math.hypot(x, z) * 0.75) + 0.2 * n2(x * 1.5, z * 1.5),
  };
  const WATER_LVL = { beach: 0, river: 0.05, waterfall: 0.05 };
  function terrain(kind = 'meadow', lod = 0) {
    const seg = [64, 32, 16, 8][lod], Sz = 8, geo = new THREE.PlaneGeometry(Sz, Sz, seg, seg); geo.rotateX(-PI / 2);
    const p = geo.attributes.position, f = TERRAIN[kind];
    for (let i = 0; i < p.count; i++) p.setY(i, f(p.getX(i), p.getZ(i)));
    geo.computeVertexNormals(); const nm = geo.attributes.normal, col = new Float32Array(p.count * 3), c = new THREE.Color();
    const cG = new THREE.Color(K.grass), cG2 = new THREE.Color('#93BE7A'), cS = new THREE.Color(K.sand), cR = new THREE.Color(K.stone), cR2 = new THREE.Color(K.stoneDark), cP = new THREE.Color('#E3D3BB'), wl = WATER_LVL[kind];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ny = nm.getY(i);
      if (kind === 'plaza' && Math.hypot(x, z) < 2.8) c.copy(cP).lerp(cR, (Math.sin(x * 9) * Math.sin(z * 9) > 0.3) ? 0.35 : 0);
      else if (ny < 0.72) c.copy(cR).lerp(cR2, (Math.sin(y * 7) + 1) / 2);
      else if (wl != null && y < wl + 0.18) c.copy(cS);
      else if (kind === 'summit' && y > 2.2) c.set('#F4EADC');
      else c.copy(cG).lerp(cG2, (n2(x * 2, z * 2) + 1) / 2);
      col.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const g = grp('terrain_' + kind + '_lod' + lod, mesh('ground', geo, mat('terrain', '#FFFFFF', { vc: true, r: 0.95 })));
    if (wl != null) { const w = mesh('water', new THREE.PlaneGeometry(Sz, Sz), X.water(), 0, wl, 0); w.rotation.x = -PI / 2; g.add(w); }
    if (lod <= 1) {
      seed = kind.length * 977; const place = (o, x, z, ry = 0) => { o.position.set(x, f(x, z), z); o.rotation.y = ry; g.add(o); };
      const ok = (x, z) => { const y = f(x, z); return wl == null || y > wl + 0.2; };
      if (kind === 'forest') for (let i = 0; i < 14; i++) { const x = rnd() * 7 - 3.5, z = rnd() * 7 - 3.5; place(i % 3 ? tree(0.8 + rnd() * 0.5) : treeSpire(0.9 + rnd() * 0.5), x, z, rnd() * 6); }
      if (['meadow', 'hill', 'river', 'beach', 'terraces'].includes(kind)) for (let i = 0; i < 8; i++) { const x = rnd() * 7 - 3.5, z = rnd() * 7 - 3.5; if (ok(x, z)) place(i % 3 === 0 ? flowers() : i % 3 === 1 ? grassTuft() : bush(0.6), x, z, rnd() * 6); }
      if (['meadow', 'hill', 'terraces'].includes(kind)) for (let i = 0; i < 3; i++) { const x = rnd() * 6 - 3, z = rnd() * 6 - 3; place(i ? tree(0.7) : treeBirch(0.8), x, z); }
      if (['cliff', 'summit', 'waterfall'].includes(kind)) for (let i = 0; i < 5; i++) { const x = rnd() * 7 - 3.5, z = rnd() * 7 - 3.5; place(rocks(0.6 + rnd() * 0.6), x, z, rnd() * 6); }
      if (kind === 'river') { place(reeds(), -2, 0.9); place(reeds(), 2.5, -0.6); const b = bridge(); b.scale.setScalar(0.7); b.rotation.y = PI / 2; b.position.set(0.6, -0.05, 0.1); g.add(b); }
      if (kind === 'beach') { place(rocks(0.5), 2, 1.5); g.add(at(beachFoam(3.6), 0, 0.02, 0.4)); }
      if (kind === 'plaza') { g.add(at(well(), 0, 0.05, 0)); [[2.2, 0.8], [-2.2, -0.8]].forEach(([x, z]) => g.add(at(lampPost(), x, 0.05, z))); g.add(at(bench(), -1.6, 0.05, 1.6, 0.8), at(noticeBoard(), 1.5, 0.05, -1.8, -0.6)); }
      if (kind === 'waterfall') { g.add(at(waterfallRibbon(), 0, 0.15, -1.25), at(waterfallSplash(), 0, 0.08, -0.6), at(waterfallInlet(), 0, 2.3, -2.2)); }
      if (kind === 'summit') g.add(at(signpost(), 0.3, f(0.3, 0.3), 0.3));
    }
    return g;
  }
  // ---------- VFX meshes ----------
  function waterSurface() { const w = mesh('vfx_water_surface', new THREE.CircleGeometry(4, 64), X.water()); w.rotation.x = -PI / 2; return grp('vfx_water', w); }
  function waterfallRibbon() { const geo = new THREE.PlaneGeometry(1.2, 2.6, 6, 20), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), t = 1 - (y + 1.3) / 2.6; p.setZ(i, 0.5 * t * t - 0.05 * Math.sin(p.getX(i) * 5)); p.setY(i, y + 1.3); } geo.computeVertexNormals(); return grp('vfx_waterfall', mesh('ribbon', geo, mat('waterfall', '#E6F6F4', { op: 0.85, ds: true, r: 0.4 }))); }
  function waterfallSplash() { const g = grp('vfx_waterfall_splash'); const r = mesh('ring', tor(0.55, 0.08, TAU, 8, 40), X.foam(), 0, 0.03, 0); r.rotation.x = PI / 2; r.scale.z = 0.4; g.add(r); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; g.add(blob('spray' + i, 0.09 + (i % 3) * 0.03, X.foam(), Math.cos(a) * 0.4, 0.1 + (i % 2) * 0.08, Math.sin(a) * 0.3)); } return g; }
  function waterfallInlet() { const g = grp('vfx_waterfall_inlet'); const ch = mesh('channel', new THREE.CylinderGeometry(0.6, 0.6, 1.4, 20, 1, true, PI / 2, PI), C(K.stone, 'stone', { ds: true })); ch.rotation.x = PI / 2; const w = mesh('flow', new THREE.PlaneGeometry(1.1, 1.4), X.water(), 0, -0.25, 0); w.rotation.x = -PI / 2; g.add(ch, w); return g; }
  function beachFoam(r = 3) { const geo = new THREE.RingGeometry(r - 0.25, r, 64, 1, PI * 0.15, PI * 0.7); const m = mesh('foam', geo, X.foam()); m.rotation.x = -PI / 2; return grp('vfx_beach_foam', m); }
  function smoke() { const g = grp('vfx_smoke'); for (let i = 0; i < 6; i++) g.add(blob('puff' + i, 0.12 + i * 0.04, mat('smoke_' + i, '#EDE8E2', { op: 0.9 - i * 0.12 }), Math.sin(i * 1.3) * 0.08 * i, 0.15 + i * 0.28, 0)); return g; }
  // ---------- space / intro ----------
  function planet(lod = 'orbit', sites = true) {
    const geo = new THREE.IcosahedronGeometry(1, lod === 'orbit' ? 5 : 6), pos = geo.attributes.position, col = new Float32Array(pos.count * 3), v = new THREE.Vector3(), c = new THREE.Color();
    const sand = new THREE.Color(K.sand), grass = new THREE.Color(K.grass), deep = new THREE.Color('#6FA07E'), peak = new THREE.Color('#F4EADC');
    const noise3 = (x, y, z) => Math.sin(x * 3.1 + 1.3) * Math.cos(y * 2.7 + 0.4) * 0.5 + Math.sin(z * 4.3 + x * 1.7) * 0.3 + Math.sin(y * 6.1 - z * 2.9) * 0.15 + Math.cos(x * 9 + y * 7) * 0.05;
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).normalize(); const h = Math.max(0, noise3(v.x, v.y, v.z) + 0.35) * 0.075; v.multiplyScalar(1 + h); pos.setXYZ(i, v.x, v.y, v.z); c.copy(h < 0.024 ? sand : h < 0.05 ? grass : h < 0.068 ? deep : peak); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const g = grp('planet_' + lod, mesh('land', geo, mat('planet_land', '#FFFFFF', { vc: true, r: 0.95 })), mesh('ocean', sph(1.018, 64, 40), X.water()));
    if (sites) {
      const up = new THREE.Vector3(0, 1, 0), S6 = grp('topic_sites');
      [[0.5, 0.7, 0.5], [-0.6, 0.6, 0.45], [0.1, 0.9, -0.4], [-0.3, 0.5, -0.8], [0.8, 0.45, -0.3], [0.2, 0.35, 0.9]].forEach((p, i) => { const n = new THREE.Vector3(...p).normalize(); const h = grp('site_' + i, mesh('tower', cyl(0.025, 0.028, 0.05, 10), C(K.plaster, 'wall'), 0, 0.025, 0), mesh('roof', new THREE.ConeGeometry(0.035, 0.04, 10), C(i < 2 ? K.gold : K.roof, 'roof'), 0, 0.07, 0)); h.position.copy(n.clone().multiplyScalar(1.06)); h.quaternion.setFromUnitVectors(up, n); S6.add(h); });
      for (let i = 0; i < 40; i++) { const n = new THREE.Vector3(Math.sin(i * 2.4) * Math.cos(i * 0.7), Math.cos(i * 1.3), Math.sin(i * 0.9)).normalize(); const t = mesh('tree' + i, new THREE.ConeGeometry(0.018, 0.05, 6), C(K.leafDeep, 'leaf')); t.position.copy(n.clone().multiplyScalar(1.065)); t.quaternion.setFromUnitVectors(up, n); S6.add(t); }
      g.add(S6);
    }
    const ring = grp('cloud_band'); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, y = Math.sin(a * 2) * 0.25; const p = blob('cloud_' + i, 0.06 + (i % 3) * 0.02, C('#FFF8EE', 'cloud'), Math.cos(a) * 1.22, y, Math.sin(a) * 1.22, 1.8, 0.7, 1.1); p.lookAt(0, y, 0); ring.add(p); } g.add(ring);
    g.position.y = 1.2; return grp('planet_root', g);
  }
  function sun() {
    const g = grp('teacher_sun', mesh('core', sph(0.9, 48, 32), mat('sun_core', '#FFC85A', { e: '#F7A93B', ei: 0.85, r: 0.6 })), mesh('glow', sph(1.02, 32, 20), mat('sun_glow', '#FFE7A8', { op: 0.25, e: '#FFD27A', ei: 0.6 })));
    const fl = mat('sun_flare', '#F59E3A', { e: '#F08A2C', ei: 0.9 });
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, y = Math.sin(i * 2.3) * 0.5; const r = Math.sqrt(1 - (y / 0.95) ** 2) * 0.93; if (i % 3 === 0) { const t = mesh('prominence' + i, tor(0.13, 0.035, PI * 1.4, 8, 16), fl, Math.cos(a) * r, y, Math.sin(a) * r); t.lookAt(0, y, 0); t.rotateZ(PI * 0.8); g.add(t); } else g.add(blob('flare' + i, 0.09 + (i % 4) * 0.025, fl, Math.cos(a) * r, y, Math.sin(a) * r, 1, 1, 1)); }
    return g;
  }
  function bandedGeo(stops, r = 1, wob = 0.12, spot) {
    const geo = sph(r, 48, 32), p = geo.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(), cs = stops.map(h => new THREE.Color(h));
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); let t = (y / r + 1) / 2 + Math.sin(Math.atan2(z, x) * 3 + y * 6) * wob * 0.08; t = Math.min(0.999, Math.max(0, t)); const k = t * (cs.length - 1), j = Math.floor(k); c.copy(cs[j]).lerp(cs[Math.min(cs.length - 1, j + 1)], (k - j) > 0.5 ? 1 : (k - j) * 0.6); if (spot && Math.hypot(x - spot[0], y - spot[1], z - spot[2]) < spot[3]) c.set(spot[4]); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); return geo;
  }
  function cratered(name, base, dark, r = 1) { const g = grp(name, mesh('body', new THREE.IcosahedronGeometry(r, 3), C(base, 'rock', {}))); g.children[0].material.flatShading = true; for (let i = 0; i < 9; i++) { const n = new THREE.Vector3(Math.sin(i * 2.4) * Math.cos(i), Math.cos(i * 1.7), Math.sin(i * 1.1)).normalize(); const cr = mesh('crater' + i, cyl(0.12 + (i % 3) * 0.05, 0.08 + (i % 3) * 0.04, 0.04, 14), C(dark, 'rock'), ...n.clone().multiplyScalar(r * 0.985).toArray()); cr.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n); g.add(cr); } return g; }
  function ringOf(r0, r1, colA, colB, n = 4) { const g = grp('rings'); for (let i = 0; i < n; i++) { const r = r0 + (r1 - r0) * i / (n - 1); const m = mesh('ring' + i, new THREE.RingGeometry(r, r + (r1 - r0) / n * 0.85, 96), C(i % 2 ? colA : colB, 'ring', { ds: true })); m.rotation.x = -PI / 2; g.add(m); } return g; }
  function moons(n, dist, seedK = 1) { const g = grp('moons'); for (let i = 0; i < n; i++) { const a = i * 2.2 + seedK, d = dist * (1 + i * 0.25); const m = cratered('moon_' + i, '#C9C4BC', '#A39E96', 0.13 + (i % 2) * 0.05); m.position.set(Math.cos(a) * d, 0.1 * (i - 1), Math.sin(a) * d); g.add(m); } const path = dotted(dist, 40, 0.012, '#8C93A3'); g.add(path); return g; }
  function dotted(r, n = 90, s = 0.03, c = '#3E4A5E') { const g = grp('orbit_dashed'); const geo = rbox(s * 3, s, s, s * 0.45, 1), m = C(c, 'guide'); for (let i = 0; i < n; i++) { if (i % 2) continue; const a = i / n * TAU; const d = mesh('dash', geo, m, Math.cos(a) * r, 0, Math.sin(a) * r); d.rotation.y = -a + PI / 2; g.add(d); } return g; }
  const PLANET_KINDS = {
    earth: () => { const p = planet('orbit', false).children[0]; p.position.set(0, 0, 0); for (let i = 0; i < 5; i++) { const n = new THREE.Vector3(Math.sin(i * 2.1), Math.cos(i * 1.3) * 0.6, Math.cos(i * 2.1)).normalize(); const c = blob('cloud' + i, 0.12, C('#FFFFFF', 'cloud'), ...n.multiplyScalar(1.1).toArray(), 2, 0.4, 1); c.lookAt(0, 0, 0); p.add(c); } return grp('planet_earthlike', p); },
    rocky: () => cratered('planet_rocky', '#D0623E', '#A84A2E'),
    moon: () => cratered('planet_grey', '#9A9893', '#7D7B77'),
    gas: () => grp('planet_gas_giant', mesh('body', bandedGeo(['#B9683A', '#E7A86A', '#C77B47', '#F0C48F', '#C77B47', '#E7A86A', '#B9683A'], 1, 1, [0.55, -0.35, 0.77, 0.22, '#C9432E']), mat('gas_vc', '#FFFFFF', { vc: true, r: 0.9 }))),
    ringed: () => grp('planet_ringed', mesh('body', bandedGeo(['#D9B36A', '#EBCB8B', '#D7AC63', '#F2D9A4', '#D7AC63', '#EBCB8B'], 1, 0.6), mat('gas_vc', '#FFFFFF', { vc: true, r: 0.9 })), (() => { const r = ringOf(1.35, 2.1, '#CDB88E', '#E2D3AE', 5); r.rotation.z = 0.35; return r; })()),
    ice: () => grp('planet_ice', mesh('body', bandedGeo(['#BFE2EE', '#D9F0F6', '#C7E6F0', '#E3F4F8'], 1, 0.4), mat('gas_vc', '#FFFFFF', { vc: true, r: 0.9 })), (() => { const r = ringOf(1.5, 1.8, '#A9C7D6', '#C8DEE8', 2); r.rotation.z = PI / 2 - 0.2; return r; })()),
    ocean: () => grp('planet_deep', mesh('body', bandedGeo(['#2A3E9C', '#3550B8', '#2C44A6', '#4060C8', '#2A3E9C'], 1, 0.5), mat('gas_vc', '#FFFFFF', { vc: true, r: 0.9 }))),
    desert: () => cratered('planet_desert', '#C9A646', '#A88A35'),
  };
  function orbitSystem(variant = 'earths') {
    const g = grp('orbit_class_' + variant, at(sun(), 0, 2.5, 0));
    const kinds = variant === 'earths' ? Array(8).fill('earth') : ['moon', 'rocky', 'desert', 'earth', 'gas', 'ringed', 'ice', 'ocean'];
    const size = variant === 'earths' ? [0.22, 0.3, 0.26, 0.38, 0.55, 0.32, 0.48, 0.42] : [0.18, 0.24, 0.3, 0.28, 0.62, 0.5, 0.38, 0.42];
    const moonN = variant === 'earths' ? [0, 0, 1, 0, 0, 3, 2, 0] : [0, 0, 0, 1, 0, 3, 0, 0];
    kinds.forEach((k, i) => {
      const r = 2.0 + i * 1.15, sys = grp('student_orbit_' + (i + 1)); const tilt = [0.12, -0.18, 0.08, -0.12, 0.2, -0.07, 0.15, -0.22][i]; sys.position.y = 2.5 + [0.1, -0.15, 0.25, -0.05, 0.3, -0.25, 0.05, -0.1][i]; sys.rotation.set(tilt, i * 0.7, tilt * 0.5);
      if (i % 3 === 1) { const d = dotted(r, 140, 0.035); sys.add(d); } else { const ring = mesh('orbit_path', tor(r, i === 7 ? 0.022 : 0.012, TAU, 6, 200), C(i === 7 ? '#3E4A5E' : '#B9A88F', 'guide'), 0, 0, 0); ring.rotation.x = PI / 2; sys.add(ring); }
      const p = PLANET_KINDS[k](); const a = i * 2.39 + 0.6; const h = grp('student_planet_' + (i + 1), p); h.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); h.scale.setScalar(size[i]);
      if (moonN[i]) { const m = moons(moonN[i], 1.6, i); h.add(m); }
      sys.add(h); g.add(sys);
    });
    return g;
  }
  function galaxy(n = 4000) { const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), c = new THREE.Color(); seed = 42; for (let i = 0; i < n; i++) { const arm = i % 3, r = Math.pow(rnd(), 0.6) * 5, a = r * 0.9 + arm * TAU / 3 + (rnd() - 0.5) * 0.6; pos.set([Math.cos(a) * r + (rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.25 * (1 - r / 5) + 2, Math.sin(a) * r + (rnd() - 0.5) * 0.3], i * 3); c.set(r < 1 ? '#FBE3B0' : arm ? '#C6E0E4' : '#E99A8E').lerp(new THREE.Color('#FFFFFF'), rnd() * 0.4); col.set([c.r, c.g, c.b], i * 3); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); const p = new THREE.Points(geo, Object.assign(new THREE.PointsMaterial({ size: 0.05, vertexColors: true }), { name: 'galaxy_points' })); p.name = 'points'; return grp('space_galaxy', p, mesh('core', sph(0.35, 24, 16), mat('star_core', '#FBE3B0', { e: '#F3C877', ei: 0.9 }), 0, 2, 0)); }
  function starfield(n = 1500) { const pos = new Float32Array(n * 3); seed = 9; for (let i = 0; i < n; i++) { const v = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize().multiplyScalar(8 + rnd() * 2); pos.set([v.x, v.y + 2, v.z], i * 3); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const p = new THREE.Points(geo, Object.assign(new THREE.PointsMaterial({ size: 0.06, color: '#FFF3DB' }), { name: 'star_points' })); p.name = 'points'; return grp('space_starfield', p); }
  function symbol3D() {
    const ink = C('#1B2433', 'ink'), paper = C('#FBF8F3', 'paper'), sh = new THREE.Shape(), k = 0.02;
    const P = (x, y) => [(x - 50) * k, (100 - y) * k];
    sh.moveTo(...P(50, 30)); sh.bezierCurveTo(...P(38, 22), ...P(22, 22), ...P(12, 26)); sh.lineTo(...P(12, 76)); sh.bezierCurveTo(...P(22, 72), ...P(38, 72), ...P(50, 80)); sh.bezierCurveTo(...P(62, 72), ...P(78, 72), ...P(88, 76)); sh.lineTo(...P(88, 26)); sh.bezierCurveTo(...P(78, 22), ...P(62, 22), ...P(50, 30));
    const tuft = (pts) => { const t = new THREE.Shape(); t.moveTo(...P(...pts[0])); pts.slice(1).forEach(p => t.lineTo(...P(...p))); t.closePath(); return t; };
    const body = mesh('owl_book', new THREE.ExtrudeGeometry([sh, tuft([[14, 30], [18, 9], [38, 27]]), tuft([[86, 30], [82, 9], [62, 27]])], { depth: 0.16, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 3, curveSegments: 24 }), ink);
    const g = grp('intro_athena_symbol', body, mesh('spine', rbox(0.05, 1.0, 0.04, 0.015), paper, 0, P(0, 55)[1], 0.2));
    for (const x of [33, 67]) { const [ex, ey] = P(x, 46); const e = mesh('eye_white', cyl(0.22, 0.22, 0.06, 40), paper, ex, ey, 0.2); e.rotation.x = PI / 2; const ir = mesh('eye_gold', cyl(0.11, 0.11, 0.06, 32), X.gold(), ex, ey, 0.24); ir.rotation.x = PI / 2; g.add(e, ir); }
    const bk = new THREE.Shape(); bk.moveTo(...P(45, 57)); bk.lineTo(...P(50, 65)); bk.lineTo(...P(55, 57)); bk.closePath(); g.add(mesh('beak', new THREE.ExtrudeGeometry(bk, { depth: 0.06, bevelEnabled: false }), X.gold(), 0, 0, 0.19));
    g.position.y = 0.2; return grp('intro_athena_symbol_root', g);
  }
  function startButton() { return grp('intro_start_button', mesh('base', cyl(0.5, 0.55, 0.12, 48), C(K.stone, 'stone'), 0, 0.06, 0), mesh('ring', tor(0.42, 0.03, TAU, 8, 48), X.brass(), 0, 0.13, 0), mesh('cap', lathe([[0, 0], [0.38, 0], [0.38, 0.06], [0.34, 0.1], [0, 0.11]], 48), C(K.teal, 'button'), 0, 0.12, 0), at(symbol3D(), 0, 0.12, 0, 0, 0.12)); }
  // ---------- emotes ----------
  function emote(kind) {
    const g = grp('emote_' + kind), bub = mesh('bubble', cyl(0.24, 0.24, 0.06, 40), C(K.paper, 'bubble'), 0, 0.3, 0); bub.rotation.x = PI / 2; const tail = mesh('bubble_tail', new THREE.ConeGeometry(0.06, 0.12, 12), C(K.paper, 'bubble'), -0.08, 0.06, 0); tail.rotation.z = PI - 0.4; const rim = mesh('rim', tor(0.24, 0.012, TAU, 6, 40), C(K.ink, 'ink'), 0, 0.3, 0.0); g.add(bub, tail, rim);
    const s = grp('symbol'); s.position.set(0, 0.3, 0.05); g.add(s); const shp = (fn) => { const sh = new THREE.Shape(); fn(sh); return sh; };
    switch (kind) {
      case 'heart': s.add(mesh('heart', extrude(shp(h => { h.moveTo(0, -0.1); h.bezierCurveTo(-0.16, 0.0, -0.1, 0.13, 0, 0.05); h.bezierCurveTo(0.1, 0.13, 0.16, 0.0, 0, -0.1); }), 0.04), C(K.rose, 'emote'))); break;
      case 'star': s.add(mesh('star', extrude(shp(h => { for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.055 : 0.13, a = PI / 2 + i * PI / 5; i ? h.lineTo(Math.cos(a) * r, Math.sin(a) * r) : h.moveTo(Math.cos(a) * r, Math.sin(a) * r); } }), 0.04), X.gold())); break;
      case 'question': s.add(at(mesh('hook', tor(0.06, 0.022, PI * 1.4, 8, 24), C(K.teal, 'emote')), 0, 0.05, 0), mesh('stem', caps(0.022, 0.03), C(K.teal, 'emote'), 0.0, -0.035, 0), mesh('dot', sph(0.026), C(K.teal, 'emote'), 0, -0.11, 0)); s.children[0].rotation.z = -PI * 0.4; break;
      case 'exclaim': s.add(mesh('bar', caps(0.028, 0.1), C(K.roof, 'emote'), 0, 0.04, 0), mesh('dot', sph(0.03), C(K.roof, 'emote'), 0, -0.1, 0)); break;
      case 'idea': s.add(mesh('bulb', sph(0.08, 20, 16), X.gold(), 0, 0.03, 0), mesh('base', cyl(0.04, 0.035, 0.06, 16), X.brass(), 0, -0.07, 0)); for (let i = 0; i < 5; i++) { const a = PI / 2 + (i - 2) * 0.5; const r = mesh('ray' + i, rbox(0.012, 0.04, 0.012, 0.005), X.gold(), Math.cos(a) * 0.14, 0.03 + Math.sin(a) * 0.14, 0); r.rotation.z = a - PI / 2; s.add(r); } break;
      case 'check': { const a = mesh('a', rbox(0.08, 0.035, 0.035, 0.015), C('#2E6B45', 'emote'), -0.05, -0.02, 0); a.rotation.z = -PI / 4; const b = mesh('b', rbox(0.19, 0.035, 0.035, 0.015), C('#2E6B45', 'emote'), 0.035, 0.02, 0); b.rotation.z = PI / 3.4; s.add(a, b); break; }
      case 'music': s.add(blob('head_a', 0.04, C(K.lilac, 'emote'), -0.06, -0.07, 0, 1.3, 1, 0.8), blob('head_b', 0.04, C(K.lilac, 'emote'), 0.07, -0.04, 0, 1.3, 1, 0.8), mesh('stem_a', rbox(0.015, 0.16, 0.015, 0.006), C(K.lilac, 'emote'), -0.025, 0.01, 0), mesh('stem_b', rbox(0.015, 0.16, 0.015, 0.006), C(K.lilac, 'emote'), 0.105, 0.04, 0), mesh('beam', rbox(0.15, 0.03, 0.015, 0.006), C(K.lilac, 'emote'), 0.04, 0.1, 0)); s.getObjectByName('beam').rotation.z = 0.2; break;
      case 'drop': s.add(mesh('drop', lathe([[0, -0.08], [0.05, -0.065], [0.07, -0.02], [0.05, 0.03], [0, 0.11]], 24), C(K.sky, 'emote'))); break;
      case 'sleep': for (let i = 0; i < 3; i++) { const z = grp('z' + i), sc = 1 - i * 0.25, m = C(K.navy, 'emote'); const d = mesh('d', rbox(0.11 * sc, 0.022, 0.022, 0.008), m, 0, 0, 0); d.rotation.z = 0.8; z.add(mesh('t', rbox(0.08 * sc, 0.022, 0.022, 0.008), m, 0, 0.04 * sc, 0), d, mesh('b', rbox(0.08 * sc, 0.022, 0.022, 0.008), m, 0, -0.04 * sc, 0)); z.position.set(-0.07 + i * 0.08, -0.05 + i * 0.07, 0); s.add(z); } break;
      case 'wave': { const h = grp('hand', blob('palm', 0.06, C('#E9C2A2', 'skin'), 0, 0, 0, 1, 1.1, 0.5)); for (let i = 0; i < 4; i++) h.add(mesh('finger' + i, caps(0.014, 0.05, 8), C('#E9C2A2', 'skin'), -0.04 + i * 0.027, 0.08 + (i === 1 || i === 2 ? 0.01 : 0), 0)); h.add(at(mesh('thumb', caps(0.015, 0.04, 8), C('#E9C2A2', 'skin')), 0.07, 0.0, 0)); h.getObjectByName('thumb').rotation.z = -0.8; h.rotation.z = -0.25; s.add(h); for (const x of [-1, 1]) s.add(at(mesh('motion', tor(0.13, 0.008, 0.5, 6, 10), C(K.ink, 'ink')), 0, 0.02, 0)); break; }
    }
    return setClips(g, [mkClip('pop', 1.2, t => ({ 'symbol@s': (() => { const k = t < 0.25 ? 0.6 + 0.6 * ease(t / 0.25) : 1.2 - 0.2 * ease(Math.min(1, (t - 0.25) / 0.25)); return [k, k, k]; })(), symbol: [0, 0.3 * S(t), 0] }), 24)]);
  }
  // ---------- learning objects (delivery slots) ----------
  const deliveries = {
    scroll: () => grp('item_scroll', (() => { const m = mesh('roll', cyl(0.05, 0.05, 0.36, 20), C(K.paper, 'paper')); m.rotation.z = PI / 2; m.position.y = 0.05; return m; })(), ...[-1, 1].map(x => { const k = mesh('knob', sph(0.03, 12, 10), C(K.wood, 'wood'), x * 0.2, 0.05, 0); return k; }), (() => { const r = mesh('ribbon', tor(0.052, 0.01, TAU, 6, 24), C(K.roof, 'ribbon'), 0, 0.05, 0); r.rotation.y = PI / 2; return r; })(), mesh('seal', cyl(0.025, 0.025, 0.01, 16), C('#A85E49', 'seal'), 0, 0.05, 0.055)),
    notebook: () => grp('item_notebook', mesh('cover', rbox(0.24, 0.035, 0.3, 0.01), C(K.teal, 'book'), 0, 0.018, 0), mesh('pages', rbox(0.225, 0.028, 0.285, 0.005), C(K.paper, 'paper'), 0.006, 0.018, 0), mesh('band', rbox(0.015, 0.04, 0.31, 0.004), C(K.butter, 'ribbon'), 0.08, 0.018, 0), mesh('bookmark', rbox(0.02, 0.003, 0.08, 0.002), C(K.roof, 'ribbon'), -0.05, 0.003, -0.18)),
    map: () => { const g = grp('item_folded_map'); for (let i = 0; i < 4; i++) { const p = mesh('panel' + i, rbox(0.1, 0.006, 0.26, 0.003), C(i % 2 ? '#F4EADC' : '#E8DCC6', 'paper'), -0.15 + i * 0.1, 0.04, 0); p.rotation.z = i % 2 ? 0.3 : -0.3; g.add(p); } g.add(mesh('route', rbox(0.3, 0.008, 0.012, 0.003), C(K.roof, 'ink2'), 0, 0.048, 0.03), mesh('pin', sph(0.015, 10, 8), C(K.roof, 'pin'), 0.1, 0.06, 0.03)); return g; },
    seedling: () => grp('item_seedling', mesh('pot', lathe([[0, 0], [0.06, 0], [0.08, 0.1], [0, 0.09]], 20), C(K.roof, 'clay')), mesh('soil', cyl(0.075, 0.075, 0.01, 16), C(K.door, 'soil'), 0, 0.095, 0), mesh('stem', cyl(0.006, 0.008, 0.1, 6), C(K.leafDeep, 'leaf'), 0, 0.15, 0), blob('leaf_l', 0.03, C(K.leaf, 'leaf'), -0.03, 0.19, 0, 1.4, 0.3, 0.8), blob('leaf_r', 0.03, C(K.leaf, 'leaf'), 0.03, 0.2, 0, 1.4, 0.3, 0.8)),
    specimen: () => grp('item_specimen_jar', mesh('jar', cyl(0.07, 0.07, 0.18, 24), X.glass(), 0, 0.09, 0), mesh('lid', cyl(0.075, 0.075, 0.03, 24), C(K.wood, 'wood'), 0, 0.195, 0), mesh('label', new THREE.CylinderGeometry(0.0705, 0.0705, 0.06, 24, 1, true, -0.6, 1.2), C(K.paper, 'paper', { ds: true }), 0, 0.08, 0), blob('leaf', 0.04, C(K.leafDeep, 'leaf'), 0, 0.1, 0, 0.5, 1.5, 0.2), mesh('stone', new THREE.DodecahedronGeometry(0.025), C(K.lilac, 'gem'), 0.02, 0.03, 0.02)),
    scarf: () => grp('item_folded_scarf', mesh('fold_a', rbox(0.3, 0.04, 0.2, 0.018), C(K.teal, 'scarf'), 0, 0.02, 0), mesh('fold_b', rbox(0.28, 0.04, 0.19, 0.018), C(K.rose, 'scarf'), 0, 0.06, 0), mesh('fold_c', rbox(0.26, 0.04, 0.18, 0.018), C(K.butter, 'scarf'), 0, 0.1, 0), mesh('tag', rbox(0.06, 0.004, 0.04, 0.002), C(K.paper, 'paper'), 0.09, 0.122, 0.05)),
  };
  // ---------- showcase ----------
  function vignette() { const g = grp('surface_vignette', at(terrain('plaza', 1), 0, 0, 0)); g.add(at(house('done', 0), -1.6, 0.05, -1.4, 0.3, 0.75), at(house('available', 1), 1.8, 0.1, -1.6, -0.4, 0.7)); const a = avatar(); at(a, 0.2, 0.05, 1.0, -0.3); g.add(a, at(cat(), 0.75, 0.05, 1.2, -0.7), at(person(NPC['young-lady'][1]), -0.6, 0.05, 0.5, 0.6), at(owl(), 2.4, 0.95, 0.6, -1), at(tree(0.9), -3.2, 0.2, 1.2), at(treeSpire(1), 3.2, 0.2, -0.2)); return g; }
  // ---------- registry ----------
  const R = [];
  const add = (group, id, label, slot, build, extra = {}) => R.push({ group, id, label, slot, build, file: 'athena-' + id + '.glb', ...extra });
  add('Showcase', 'surface-vignette', 'Surface vignette', 'composition reference', vignette);
  add('Characters', 'avatar-student', 'Student avatar (builder)', 'geometries.avatar.* + avatar-bones + 7 animations', avatar, { avatar: true });
  add('Characters', 'npc-cat-lumen', 'Lumen · cat guide', 'new: npc.cat', cat);
  Object.entries(NPC).forEach(([slot, [id, o, label]]) => add('NPCs', id.replace(/_/g, '-'), label, 'npcs/present/' + slot, () => person({ ...o, name: id })));
  add('NPCs', 'npc-owl-sage', 'Sage · owl', 'npcs/present/owl', owl);
  add('NPCs', 'npc-hare-pip', 'Pip · hare', 'npcs/present/fox', hare);
  add('NPCs', 'npc-visitor-orbi', 'Orbi · visitor', 'npcs/present/alien', visitor);
  add('NPCs', 'npc-study-trio', 'Study trio', 'npcs/present/threekid', studyTrio);
  ['locked', 'available', 'in_progress', 'done'].forEach(s => add('Topic houses', 'house-' + s.replace('_', '-'), 'House · ' + s.replace('_', ' '), 'topic-anchor.{0..5} status=' + s + ' (6 variants)', (o = {}) => house(s, o.variant ?? 0), { variant: true }));
  add('Topic houses', 'house-row-done', 'All 6 variants · done', 'reference', () => { const g = grp('house_variants_done'); HOUSE_VARIANTS.forEach((v, i) => g.add(at(house('done', i), (i - 2.5) * 3.0, 0, 0))); return g; });
  add('Topic houses', 'house-row-states', 'One street · mixed states', 'reference', () => { const g = grp('house_variants_states'); ['done', 'available', 'in_progress', 'locked', 'available', 'done'].forEach((st, i) => g.add(at(house(st, i), (i - 2.5) * 3.0, 0, 0))); return g; });
  [['library', library, 'Library rotunda'], ['observatory', observatory, 'Observatory'], ['greenhouse', greenhouse, 'Greenhouse'], ['workshop', workshop, 'Workshop'], ['school-hall', schoolHall, 'School hall'], ['cottage', cottage, 'Cottage'], ['bridge', bridge, 'Stone bridge'], ['well', well, 'Well'], ['gate', gate, 'Topic gate'], ['stairs', stairs, 'Stairs'], ['wall-segment', wallSeg, 'Wall segment'], ['market-stall', stall, 'Market stall']].forEach(([id, f, l]) => add('Buildings', 'building-' + id, l, 'terrain batches (buildings)', f));
  Object.keys(TERRAIN).forEach((k, i) => add('Terrain tiles', 'terrain-' + k, 'Tile · ' + k, 'terrain chunk ' + i + ' (lod0–3 + collision)', (o = {}) => terrain(k, o.lod ?? 0), { lod: true }));
  [['tree-round', () => tree(1), 'Tree · round'], ['tree-spire', () => treeSpire(1), 'Tree · spire'], ['tree-birch', () => treeBirch(1), 'Tree · birch'], ['bush', () => bush(1), 'Bush'], ['rock-set', () => rocks(1.2), 'Rock set'], ['flowers', flowers, 'Flower patch'], ['grass-tuft', grassTuft, 'Grass tuft'], ['mushrooms', mushrooms, 'Mushrooms'], ['reeds', reeds, 'Reeds'], ['cloud', () => cloud(1), 'Cloud'], ['butterfly', butterfly, 'Butterfly']].forEach(([id, f, l]) => add('Nature', id, l, id === 'butterfly' ? 'images.butterfly-*' : id === 'cloud' ? 'sky clouds' : 'terrain foliage', f));
  add('Nature', 'bird-swift', 'Bird · swift', 'geometries/birds/1', () => bird('swift')); add('Nature', 'bird-finch', 'Bird · finch', 'geometries/birds/2', () => bird('finch'));
  add('Nature', 'bird-curve-1', 'Flight path 1', 'geometries/birds/curve-1', () => flightCurve(1)); add('Nature', 'bird-curve-2', 'Flight path 2', 'geometries/birds/curve-2', () => flightCurve(2));
  [['lamp-post', lampPost, 'Lamp post'], ['bench', bench, 'Bench'], ['post-box', postBox, 'Post box'], ['fence', () => fence(4), 'Fence'], ['topic-sign', signpost, 'Signpost'], ['crates-books', crates, 'Crates & books'], ['potted-plant', () => plantPot(1.4), 'Potted plant'], ['notice-board', noticeBoard, 'Notice board'], ['barrel', barrel, 'Rain barrel'], ['path-marker', marker, 'Path marker'], ['insight-lantern', insightLantern, 'Insight lantern']].forEach(([id, f, l]) => add('Props', 'prop-' + id, l, 'props', f));
  [['scroll', 'deliveries/letterwet', 'Scroll'], ['notebook', 'deliveries/note', 'Notebook'], ['map', 'deliveries/postcard', 'Folded map'], ['seedling', 'deliveries/offering', 'Seedling'], ['specimen', 'deliveries/samplebox', 'Specimen jar'], ['scarf', 'deliveries/clothes', 'Folded scarves']].forEach(([id, slot, l]) => add('Learning objects', 'item-' + id, l, 'geometries/' + slot, deliveries[id]));
  ['wave', 'heart', 'star', 'idea', 'question', 'exclaim', 'check', 'music', 'drop', 'sleep'].forEach((k, i) => add('Emotes', 'emote-' + k, 'Emote · ' + k, 'images.ui.emojis[' + i + ']', () => emote(k)));
  [['water', waterSurface, 'Water surface', 'planets/present/water'], ['waterfall', waterfallRibbon, 'Waterfall', 'waterfall_vfx'], ['waterfall-splash', waterfallSplash, 'Waterfall splash', 'waterfallsplash_vfx'], ['waterfall-inlet', waterfallInlet, 'Waterfall inlet', 'waterfall_inlet_vfx'], ['beach-foam', () => beachFoam(3), 'Beach foam', 'beachfoam_vfx'], ['smoke', smoke, 'Smoke', 'smoke-1']].forEach(([id, f, l, s]) => add('VFX meshes', 'vfx-' + id, l, s, f));
  add('Space & intro', 'planet-orbit', 'Student planet', 'planets/present/intro/low/planet', () => planet('orbit'));
  add('Space & intro', 'orbit-class', 'Class orbit · earths + moons', 'scenes/orbit.ts', () => orbitSystem('earths'));
  add('Space & intro', 'orbit-class-varied', 'Class orbit · varied planets', 'scenes/orbit.ts (alt)', () => orbitSystem('varied'));
  Object.keys(PLANET_KINDS).forEach(k => add('Space & intro', 'planet-' + k, 'Planet · ' + k, 'student planet type', PLANET_KINDS[k]));
  add('Space & intro', 'teacher-sun', 'Teacher sun', 'scenes/orbit.ts star', () => at(sun(), 0, 1, 0));
  add('Space & intro', 'space-galaxy', 'Galaxy', 'intro/galaxies', () => galaxy());
  add('Space & intro', 'space-starfield', 'Starfield', 'planets/intro/points', () => starfield());
  add('Space & intro', 'intro-symbol', 'Athena symbol 3D', 'intro/title_vertical', symbol3D);
  add('Space & intro', 'intro-start-button', 'Start button', 'intro/button', startButton);
  return { THREE, registry: R, getClips, avatar, AVATAR_PARTS, person, materials: M };
}
