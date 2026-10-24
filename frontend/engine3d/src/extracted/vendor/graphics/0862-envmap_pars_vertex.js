/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 352878:353191.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0862(scope) {
scope.envmap_pars_vertex = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`;
}
