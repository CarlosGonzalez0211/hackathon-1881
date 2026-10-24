/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 349941:350140.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0854(scope) {
scope.displacementmap_vertex = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`;
}
