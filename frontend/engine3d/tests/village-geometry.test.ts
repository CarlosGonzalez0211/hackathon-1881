import assert from "node:assert/strict";
import test from "node:test";
import { graphics } from "./helpers/recovered-graphics";
import { bakeVertexColor, displace, lathe, sweep } from "../src/village/geometry";
import type { LegacyContext } from "../src/runtime/legacy-context";

const vase: [number, number][] = [
  [0.3, 0],
  [0.55, 0.3],
  [0.35, 0.7],
  [0.45, 1],
];

const finite = (array: ArrayLike<number>, label: string) => {
  for (let i = 0; i < array.length; i++) assert.ok(Number.isFinite(array[i]), `${label}[${i}]`);
};
const triangle = (geometry: LegacyContext, s: LegacyContext, face: number) => {
  const index = geometry.index.array,
    position = geometry.attributes.position;
  const [a, b, c] = [0, 1, 2].map((k) =>
    new s.Vector3().fromBufferAttribute(position, index[face * 3 + k]),
  );
  return { a, b, c, normal: new s.Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a)) };
};
/** Fraction of triangles whose winding faces away from the Y axis (walls) or the origin. */
const outwardShare = (
  geometry: LegacyContext,
  s: LegacyContext,
  from: (p: LegacyContext) => LegacyContext,
) => {
  let outward = 0;
  const faces = geometry.index.count / 3;
  for (let f = 0; f < faces; f++) {
    const { a, b, c, normal } = triangle(geometry, s, f);
    if (normal.lengthSq() < 1e-14) continue;
    const middle = a
      .clone()
      .add(b)
      .add(c)
      .multiplyScalar(1 / 3);
    if (normal.dot(from(middle)) > 0) outward++;
  }
  return outward / faces;
};

test("lathe revolves a smoothed profile with finite attributes and the expected counts", async () => {
  const s = await graphics();
  const segments = 16,
    smooth = 4;
  const geometry = lathe(s, vase, segments, { smooth });
  const rows = smooth * (vase.length - 1) + 1;
  assert.equal(geometry.attributes.position.count, rows * (segments + 1));
  assert.equal(geometry.attributes.uv.count, geometry.attributes.position.count);
  assert.equal(geometry.index.count, (rows - 1) * segments * 6);
  for (const name of ["position", "normal", "uv"]) finite(geometry.attributes[name].array, name);
  const normal = geometry.attributes.normal;
  for (let i = 0; i < normal.count; i++) {
    const n = new s.Vector3().fromBufferAttribute(normal, i);
    assert.ok(Math.abs(n.length() - 1) < 1e-5, "normals are unit length");
  }
  // The end rings keep the authored profile; the smoothing only adds points in between.
  const position = geometry.attributes.position;
  assert.ok(Math.abs(position.getY(0) - 0) < 1e-6);
  assert.ok(Math.abs(Math.hypot(position.getX(0), position.getZ(0)) - 0.3) < 1e-6);
  const top = (rows - 1) * (segments + 1);
  assert.ok(Math.abs(position.getY(top) - 1) < 1e-6);
  assert.ok(Math.abs(Math.hypot(position.getX(top), position.getZ(top)) - 0.45) < 1e-6);
  // Smoothed: the belly of the vase passes the straight chord between its control points.
  let widest = 0;
  for (let i = 0; i < position.count; i++)
    widest = Math.max(widest, Math.hypot(position.getX(i), position.getZ(i)));
  assert.ok(widest >= 0.55 - 1e-6, "the profile keeps its bulge");
  // Bottom-to-top profiles face outward, and the stored normals agree with the winding.
  assert.equal(
    outwardShare(geometry, s, (p) => new s.Vector3(p.x, 0, p.z)),
    1,
  );
  for (let f = 0; f < geometry.index.count / 3; f++) {
    const { a, normal: face } = triangle(geometry, s, f);
    const i = geometry.index.array[f * 3];
    const stored = new s.Vector3().fromBufferAttribute(normal, i);
    assert.ok(face.dot(stored) > 0, `face ${f} agrees with its vertex normal at ${a.y}`);
  }
});

test("lathe normals are continuous across the seam", async () => {
  const s = await graphics();
  const segments = 12,
    geometry = lathe(s, vase, segments);
  const normal = geometry.attributes.normal;
  for (let row = 0; row < 8; row++) {
    const first = new s.Vector3().fromBufferAttribute(normal, row * (segments + 1));
    const last = new s.Vector3().fromBufferAttribute(normal, row * (segments + 1) + segments);
    assert.ok(first.distanceTo(last) < 1e-5, "seam vertices share a normal");
  }
});

test("a scalloped lathe varies its radius around the rim; a plain one does not", async () => {
  const s = await graphics();
  const rimRadii = (geometry: LegacyContext) => {
    const position = geometry.attributes.position,
      columns = 49,
      radii: number[] = [];
    // The last ring is the rim.
    for (let j = 0; j < columns; j++) {
      const i = position.count - columns + j;
      radii.push(Math.hypot(position.getX(i), position.getZ(i)));
    }
    return radii;
  };
  const plain = rimRadii(lathe(s, vase, 48));
  const scalloped = rimRadii(lathe(s, vase, 48, { scallop: { folds: 6, depth: 0.2 } }));
  assert.ok(Math.max(...plain) - Math.min(...plain) < 1e-6);
  assert.ok(Math.abs(Math.max(...scalloped) - 0.45 * 1.2) < 1e-4);
  assert.ok(Math.abs(Math.min(...scalloped) - 0.45 * 0.8) < 1e-4);
  const ring = scalloped.slice(0, 48); // the 49th column repeats the first
  const crests = ring.filter((r, j) => r > ring[(j + 47) % 48]! && r >= ring[(j + 1) % 48]!);
  assert.equal(crests.length, 6, "one crest per fold");
  const geometry = lathe(s, vase, 48, { scallop: { folds: 6, depth: 0.2 } });
  for (const name of ["position", "normal"]) finite(geometry.attributes[name].array, name);
});

test("a closed lathe caps its open ends with flat discs", async () => {
  const s = await graphics();
  const open = lathe(s, vase, 16),
    closed = lathe(s, vase, 16, { closed: true });
  assert.equal(closed.attributes.position.count, open.attributes.position.count + 2 * (1 + 17));
  assert.equal(closed.index.count, open.index.count + 2 * 16 * 3);
  const normal = closed.attributes.normal;
  const bottom = open.attributes.position.count;
  assert.equal(normal.getY(bottom), -1, "the base faces down");
  assert.equal(normal.getY(bottom + 18), 1, "the rim disc faces up");
  finite(closed.attributes.position.array, "closed position");
  // Every triangle faces away from the solid's middle.
  const middle = new s.Vector3(0, 0.5, 0);
  assert.ok(outwardShare(closed, s, (p) => p.clone().sub(middle)) > 0.99);
  // A profile that already reaches the axis needs no cap there.
  const dome = lathe(
    s,
    [
      [0, 1],
      [0.4, 0.8],
      [0.6, 0.2],
      [0.6, 0],
    ],
    12,
    { closed: true },
  );
  assert.equal(dome.attributes.position.count, (3 * 4 + 1) * 13 + 1 + 13);
  finite(dome.attributes.normal.array, "dome normal");
});

const tailPath = () => {
  const path: [number, number, number][] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    path.push([0.08 * Math.sin(t * 2.2), 0.02 + 0.2 * t * t, -0.05 - 0.12 * Math.sin(t * 1.6)]);
  }
  return path;
};

test("sweep rings are centred on the path and follow the radius profile", async () => {
  const s = await graphics();
  const path = tailPath(),
    radial = 10;
  const geometry = sweep(s, path, (t) => 0.026 * (1 - t * 0.35), undefined, radial);
  const position = geometry.attributes.position;
  assert.equal(position.count, path.length * (radial + 1));
  assert.equal(geometry.index.count, (path.length - 1) * radial * 6);
  finite(position.array, "position");
  finite(geometry.attributes.normal.array, "normal");
  path.forEach((point, i) => {
    const centre = new s.Vector3(),
      ring = new s.Vector3();
    for (let j = 0; j < radial; j++)
      centre.add(ring.fromBufferAttribute(position, i * (radial + 1) + j));
    centre.multiplyScalar(1 / radial);
    assert.ok(centre.distanceTo(new s.Vector3(...point)) < 1e-5, `ring ${i} on the path`);
    const expected = 0.026 * (1 - (i / (path.length - 1)) * 0.35);
    assert.ok(
      Math.abs(ring.fromBufferAttribute(position, i * (radial + 1)).distanceTo(centre) - expected) <
        1e-5,
      `ring ${i} radius`,
    );
  });
});

test("sweep with segments resamples the control points through a spline", async () => {
  const s = await graphics();
  const control: [number, number, number][] = [
    [0, 0, 0],
    [1, 1, 0],
    [2, 0, 1],
    [3, 1, 1],
  ];
  const geometry = sweep(s, control, () => 0.05, 20, 6);
  const position = geometry.attributes.position;
  assert.equal(position.count, 21 * 7);
  const ringCentre = (i: number) => {
    const c = new s.Vector3();
    for (let j = 0; j < 6; j++) c.add(new s.Vector3().fromBufferAttribute(position, i * 7 + j));
    return c.multiplyScalar(1 / 6);
  };
  assert.ok(ringCentre(0).distanceTo(new s.Vector3(0, 0, 0)) < 1e-5, "starts at the first point");
  assert.ok(ringCentre(20).distanceTo(new s.Vector3(3, 1, 1)) < 1e-5, "ends at the last point");
  // A Catmull-Rom spline passes through its interior control points too.
  assert.ok(ringCentre(10).distanceTo(new s.Vector3(1.5, 0.5, 0.5)) < 0.6);
  finite(position.array, "position");
});

test("sweep caps close both ends, and a stalled path stays finite", async () => {
  const s = await graphics();
  const open = sweep(s, tailPath(), () => 0.03, undefined, 8);
  const capped = sweep(s, tailPath(), () => 0.03, undefined, 8, { caps: true });
  assert.equal(capped.attributes.position.count, open.attributes.position.count + 2 * (1 + 9));
  assert.equal(capped.index.count, open.index.count + 2 * 8 * 3);
  const stalled = sweep(
    s,
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    () => 0.1,
    undefined,
    6,
    { caps: true },
  );
  for (const name of ["position", "normal", "uv"]) finite(stalled.attributes[name].array, name);
});

test("sweep keeps Lumen's tail winding by default and faces outward on request", async () => {
  const s = await graphics();
  const straight: [number, number, number][] = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 2, 0],
    [0, 3, 0],
  ];
  const radialOf = (p: LegacyContext) => new s.Vector3(p.x, 0, p.z);
  const legacy = sweep(s, straight, () => 0.5, undefined, 12);
  const outward = sweep(s, straight, () => 0.5, undefined, 12, { outward: true });
  assert.equal(outwardShare(legacy, s, radialOf), 0, "legacy winding is inside out");
  assert.equal(outwardShare(outward, s, radialOf), 1);
  const solid = sweep(s, straight, () => 0.5, undefined, 12, { outward: true, caps: true });
  const middle = new s.Vector3(0, 1.5, 0);
  assert.equal(
    outwardShare(solid, s, (p) => p.clone().sub(middle)),
    1,
    "capped tube is closed outward",
  );
});

test("sweep reproduces the tube Lumen's tail was built with", async () => {
  const s = await graphics();
  // The builder that lived in lumen.ts before it moved to geometry.ts.
  function reference(
    points: [number, number, number][],
    radius: (t: number) => number,
    radial = 18,
  ) {
    const positions: number[] = [],
      indices: number[] = [];
    const P = points.map((p) => new s.Vector3(...p));
    let normal = new s.Vector3(1, 0, 0);
    for (let i = 0; i < P.length; i++) {
      const tangent = new s.Vector3()
        .subVectors(P[Math.min(i + 1, P.length - 1)], P[Math.max(i - 1, 0)])
        .normalize();
      normal = new s.Vector3()
        .crossVectors(tangent, new s.Vector3().crossVectors(normal, tangent))
        .normalize();
      const binormal = new s.Vector3().crossVectors(tangent, normal);
      const r = radius(i / (P.length - 1));
      for (let j = 0; j <= radial; j++) {
        const a = (j / radial) * Math.PI * 2;
        const offset = normal
          .clone()
          .multiplyScalar(Math.cos(a) * r)
          .addScaledVector(binormal, Math.sin(a) * r);
        positions.push(P[i].x + offset.x, P[i].y + offset.y, P[i].z + offset.z);
        if (i < P.length - 1 && j < radial) {
          const q = i * (radial + 1) + j;
          indices.push(q, q + radial + 1, q + 1, q + 1, q + radial + 1, q + radial + 2);
        }
      }
    }
    const geometry = new s.BufferGeometry();
    geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }
  const radius = (t: number) => 0.026 * (1 - t * 0.35);
  const before = reference(tailPath(), radius),
    after = sweep(s, tailPath(), radius);
  assert.deepEqual([...after.attributes.position.array], [...before.attributes.position.array]);
  assert.deepEqual([...after.attributes.normal.array], [...before.attributes.normal.array]);
  assert.deepEqual([...after.index.array], [...before.index.array]);
});

test("displace pushes vertices along their normals and refreshes normals and bounds", async () => {
  const s = await graphics();
  const geometry = new s.SphereGeometry(1, 16, 12);
  const before = Float32Array.from(geometry.attributes.position.array);
  const result = displace(s, geometry, () => 0.25);
  assert.equal(result, geometry, "displaces in place");
  const position = geometry.attributes.position;
  assert.notDeepEqual([...position.array], [...before]);
  for (let i = 0; i < position.count; i++) {
    const radius = new s.Vector3().fromBufferAttribute(position, i).length();
    assert.ok(Math.abs(radius - 1.25) < 1e-4, `vertex ${i} moved out by 0.25`);
  }
  finite(geometry.attributes.normal.array, "normal");
  assert.ok(Math.abs(geometry.boundingSphere.radius - 1.25) < 1e-3);
  // The callback sees the position and normal; non-finite offsets move nothing.
  const seen: number[] = [];
  const flat = new s.SphereGeometry(1, 8, 6);
  const untouched = Float32Array.from(flat.attributes.position.array);
  displace(s, flat, (p: LegacyContext, n: LegacyContext) => {
    seen.push(p.length(), n.length());
    return Number.NaN;
  });
  assert.ok(seen.every((v) => Math.abs(v - 1) < 1e-4));
  for (let i = 0; i < untouched.length; i++)
    assert.ok(Math.abs(flat.attributes.position.array[i] - untouched[i]!) < 1e-6);
});

test("displace builds normals when the geometry has none", async () => {
  const s = await graphics();
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 0, -1], 3));
  displace(s, geometry, (p: LegacyContext) => p.x * 0.5);
  assert.ok(geometry.attributes.normal);
  finite(geometry.attributes.position.array, "position");
  finite(geometry.attributes.normal.array, "normal");
});

test("bakeVertexColor writes and overwrites the colour attribute", async () => {
  const s = await graphics();
  const geometry = lathe(s, vase, 8);
  bakeVertexColor(s, geometry, (p: LegacyContext) => [p.y, 0.5, 1 - p.y]);
  const color = geometry.attributes.color,
    position = geometry.attributes.position;
  assert.equal(color.itemSize, 3);
  assert.equal(color.count, position.count);
  for (let i = 0; i < color.count; i++) {
    assert.ok(Math.abs(color.getX(i) - position.getY(i)) < 1e-5);
    assert.equal(color.getY(i), 0.5);
    assert.ok(Math.abs(color.getZ(i) - (1 - position.getY(i))) < 1e-5);
  }
  // Second bake replaces the first and may use the normal; bad channels become 0.
  bakeVertexColor(s, geometry, (_p: LegacyContext, n: LegacyContext) => [
    n.y * 0.5 + 0.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ]);
  assert.equal(geometry.attributes.color.count, position.count);
  for (let i = 0; i < position.count; i++) {
    const y = geometry.attributes.normal.getY(i);
    assert.ok(Math.abs(geometry.attributes.color.getX(i) - (y * 0.5 + 0.5)) < 1e-5);
    assert.equal(geometry.attributes.color.getY(i), 0);
    assert.equal(geometry.attributes.color.getZ(i), 0);
  }
  // Geometry without normals gets them first.
  const bare = new s.BufferGeometry();
  bare.setAttribute("position", new s.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
  bakeVertexColor(s, bare, (_p: LegacyContext, n: LegacyContext) => [n.x, n.y, n.z]);
  assert.equal(bare.attributes.color.getZ(0), 1);
});
