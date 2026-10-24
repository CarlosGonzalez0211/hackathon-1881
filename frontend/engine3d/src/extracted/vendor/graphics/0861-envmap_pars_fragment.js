/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 352536:352877.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0861(scope) {
scope.envmap_pars_fragment = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`;
}
