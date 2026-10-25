/**
 * Profile lathe: revolve a Catmull-Rom profile around +Y.
 *
 *   lathe(THREE, [[r, y], [r, y, 1], ...], { segments, divisions, scallop, phiStart, phiLength })
 *
 * - The profile runs bottom to top along the OUTSIDE surface (so normals face outward). A
 *   third element `1` marks a corner: the spline is cut there and the two runs are separate
 *   strips, so a rim or a step stays crisp while the rest is smooth. Straight profiles are
 *   discouraged by the art direction (every profile wants one bulge or flare).
 * - `divisions`: spline samples per profile interval.
 * - `scallop: { folds, depth, from = 0.8, lift = 0 }` ruffles the rim: the radius of every
 *   vertex above `from` (fraction of the height range) is pulled in by up to `depth` between
 *   `folds` round lobes, with cusps between them. `lift` raises the lobe peaks (upturned
 *   eave corners). `segments` is rounded up to a multiple of `2 * folds` so cusps land on vertices.
 * - `phiStart` / `phiLength` revolve only an arc (glow patches, windows, half domes).
 * - Rings at the axis (r = 0) emit one triangle per segment, never zero-area triangles.
 *
 * Returns an indexed BufferGeometry with position, normal (crease-aware) and uv (u around,
 * v along the profile).
 */
import { smoothNormals } from "./normals.mjs";

const TAU = Math.PI * 2;
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1)));
  return t * t * (3 - 2 * t);
};

/** Sample the profile into runs of [r, y] points (one run per corner-delimited strip). */
function sampleProfile(THREE, profile, divisions) {
  const runs = [];
  let current = [];
  profile.forEach((point, index) => {
    current.push([point[0], point[1]]);
    if (point[2] && index > 0 && index < profile.length - 1) {
      runs.push(current);
      current = [[point[0], point[1]]];
    }
  });
  runs.push(current);
  return runs.map((run) => {
    if (run.length < 2) return run;
    if (run.length === 2) {
      return Array.from({ length: divisions + 1 }, (_, i) => {
        const t = i / divisions;
        return [run[0][0] + (run[1][0] - run[0][0]) * t, run[0][1] + (run[1][1] - run[0][1]) * t];
      });
    }
    const curve = new THREE.SplineCurve(run.map(([r, y]) => new THREE.Vector2(r, y)));
    return curve.getPoints(divisions * (run.length - 1)).map((v) => [v.x, v.y]);
  });
}

/**
 * @param {import("three")} THREE
 * @param {Array<[number, number] | [number, number, number]>} profile
 */
export function lathe(
  THREE,
  profile,
  { segments = 32, divisions = 4, scallop, phiStart = 0, phiLength = TAU, crease = 60 } = {},
) {
  const folds = scallop?.folds ?? 0;
  const ring = folds ? Math.ceil(segments / (2 * folds)) * 2 * folds : segments;
  const runs = sampleProfile(THREE, profile, divisions);
  const ys = runs.flat().map((p) => p[1]);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  // Total arc length drives v so textures do not stretch across runs.
  let total = 0;
  for (const run of runs)
    for (let i = 1; i < run.length; i++)
      total += Math.hypot(run[i][0] - run[i - 1][0], run[i][1] - run[i - 1][1]);
  const positions = [];
  const uvs = [];
  const indices = [];
  let travelled = 0;
  for (const run of runs) {
    const base = positions.length / 3;
    const axis = [];
    for (let j = 0; j < run.length; j++) {
      if (j) travelled += Math.hypot(run[j][0] - run[j - 1][0], run[j][1] - run[j - 1][1]);
      const [r, y] = run[j];
      axis.push(r < 1e-6);
      const weight = scallop
        ? smoothstep(scallop.from ?? 0.8, 1, (y - yMin) / (yMax - yMin || 1))
        : 0;
      for (let i = 0; i <= ring; i++) {
        const theta = phiStart + (phiLength * i) / ring;
        // Lobe profile: 1 at the lobe peak, 0 at the cusp between lobes.
        const lobe = folds ? Math.abs(Math.cos((folds * theta) / 2)) : 1;
        const rr = scallop ? r * (1 - scallop.depth * weight * (1 - lobe)) : r;
        const yy = scallop?.lift ? y + scallop.lift * weight * lobe : y;
        positions.push(rr * Math.sin(theta), yy, rr * Math.cos(theta));
        uvs.push(i / ring, 1 - travelled / (total || 1));
      }
    }
    const stride = ring + 1;
    for (let j = 0; j < run.length - 1; j++)
      for (let i = 0; i < ring; i++) {
        const a = base + j * stride + i;
        const b = a + 1;
        const c = a + stride;
        const d = c + 1;
        if (!axis[j]) indices.push(a, b, c);
        if (!axis[j + 1]) indices.push(b, d, c);
      }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return smoothNormals(geometry, crease);
}
