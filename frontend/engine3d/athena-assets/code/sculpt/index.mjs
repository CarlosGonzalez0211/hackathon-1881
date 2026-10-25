/**
 * Sculpting toolkit entry point. `createTools(THREE)` binds every module to one THREE
 * instance (the npm `three`, pinned in package.json) and returns what a registry entry's
 * `build(THREE, tools, opts)` receives:
 *
 *   lathe(profile, opts)            sculpt/lathe.mjs
 *   sweep(curve, opts)              sculpt/sweep.mjs
 *   cage(description)  subdivide(geometry, iterations)   sculpt/cage.mjs
 *   sdf, polygonise(scene, opts)    sculpt/sdf.mjs   (polygonise is async)
 *   lcg, createNoise(seed), displace(geometry, fn)       sculpt/noise.mjs
 *   bake: { fill, gradient, direction, occlusion }       sculpt/bake.mjs
 *   smoothNormals(geometry, crease)  degenerateTriangles(geometry)   sculpt/normals.mjs
 *   cards: { fringeRing, crossCards, atlasRect }         sculpt/cards.mjs
 *   paint: { Raster, paintFoliageAtlas }                  sculpt/paint/*
 *   material(name, color, opts)  mesh(name, geometry, material)  group(name, ...children)
 *   weld(geometry)  merge(geometries)  ground(object)
 */
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { bakeDirection, bakeFill, bakeGradient, bakeOcclusion } from "./bake.mjs";
import { cage, subdivide } from "./cage.mjs";
import { atlasRect, crossCards, fringeRing } from "./cards.mjs";
import { lathe } from "./lathe.mjs";
import { createMaterials } from "./materials.mjs";
import { createNoise, displace, lcg } from "./noise.mjs";
import { degenerateTriangles, smoothNormals } from "./normals.mjs";
import { paintFoliageAtlas } from "./paint/foliage.mjs";
import { Raster } from "./paint/raster.mjs";
import { polygonise, sdf } from "./sdf.mjs";
import { sweep } from "./sweep.mjs";

export function createTools(THREE) {
  return {
    THREE,
    lathe: (profile, options) => lathe(THREE, profile, options),
    sweep: (curve, options) => sweep(THREE, curve, options),
    cage: (description) => cage(THREE, description),
    subdivide: (geometry, iterations, params) => subdivide(THREE, geometry, iterations, params),
    sdf,
    polygonise: (scene, options) => polygonise(THREE, scene, options),
    lcg,
    createNoise,
    displace: (geometry, fn) => displace(THREE, geometry, fn),
    bake: {
      fill: (geometry, hex) => bakeFill(THREE, geometry, hex),
      gradient: (geometry, options) => bakeGradient(THREE, geometry, options),
      direction: (geometry, options) => bakeDirection(THREE, geometry, options),
      occlusion: (geometry, options) => bakeOcclusion(THREE, geometry, options),
    },
    smoothNormals,
    degenerateTriangles,
    cards: {
      atlasRect,
      fringeRing: (options) => fringeRing(THREE, options),
      crossCards: (options) => crossCards(THREE, options),
    },
    paint: { Raster, paintFoliageAtlas },
    material: createMaterials(THREE),
    mesh(name, geometry, material) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = name;
      return mesh;
    },
    group(name, ...children) {
      const group = new THREE.Group();
      group.name = name;
      for (const child of children) if (child) group.add(child);
      return group;
    },
    /** Weld coincident vertices by position + all other attributes. */
    weld: (geometry, tolerance = 1e-4) => mergeVertices(geometry, tolerance),
    /** Concatenate geometries that share the same attribute set. */
    merge: (geometries) => mergeGeometries(geometries, false),
    /**
     * Pivot at the base centre (contract): lowest point at y = 0, bounding box centred on XZ.
     * Shifts the root's children (the root itself stays at the origin). Do not use on animated
     * rigs: position tracks would overwrite the shift; model those at the origin instead.
     */
    ground(object) {
      object.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(object);
      const centre = box.getCenter(new THREE.Vector3());
      const shift = new THREE.Vector3(-centre.x, -box.min.y, -centre.z);
      for (const child of object.children) child.position.add(shift);
      object.updateMatrixWorld(true);
      return object;
    },
  };
}
