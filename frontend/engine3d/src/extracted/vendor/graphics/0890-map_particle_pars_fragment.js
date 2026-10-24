/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 392106:392396.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0890(scope) {
scope.map_particle_pars_fragment = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`;
}
